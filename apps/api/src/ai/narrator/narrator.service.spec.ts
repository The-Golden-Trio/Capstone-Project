/**
 * Cả bậc dự phòng của AI-4, trên kịch bản thật, với model giả trả lời đúng
 * định dạng của từng hãng. Đồng hồ giả: test về hạn chót 9 s chạy trong vài
 * mili giây mà vẫn đúng từng mili giây.
 */
import { fixtureData } from '@datn/game-core/testing';
import { CircuitBreaker } from '../gateway/circuit-breaker';
import { ModelGateway } from '../gateway/model-gateway';
import { deepseekFlash, qwenFlash } from '../gateway/models';
import type { ModelSpec } from '../gateway/gateway.types';
import { FakeClock, fakeTransport, type FakeTurn } from '../testing/fake-model';
import {
  SAMPLE_ACTIVITY_ID,
  SAMPLE_ANSWERS,
  SAMPLE_SCENARIO_KEY,
  transcriptBefore,
} from '../testing/sample-turn';
import { NarratorService, type NarrateInput } from './narrator.service';

const scenario = fixtureData().scenarios[SAMPLE_SCENARIO_KEY];

const QWEN = qwenFlash({ apiKey: 'q', region: 'eu-central-1', workspaceId: 'ws', cacheMode: 'implicit' });
const DEEPSEEK = deepseekFlash();

const line = (o: { narration: string; follow_up?: string | null; speaker?: string }) =>
  JSON.stringify({ speaker: o.speaker ?? 'an', narration: o.narration, follow_up: o.follow_up ?? null });

const GOOD = line({
  narration: 'Ừ, anh nghe rồi. 900 đơn mà mỗi đơn một lần chạm DB thì chậm là phải.',
  follow_up: 'Thế nếu sau này có khách còn nhiều đơn hơn nữa thì endpoint này sẽ ra sao?',
});
const INVENTS_NUMBER = line({ narration: 'Ok, em sửa trong 15 phút nữa nhé.' });

function setup(script: FakeTurn[] | Parameters<typeof fakeTransport>[0], chain: ModelSpec[] = [QWEN, DEEPSEEK]) {
  const clock = new FakeClock();
  const transport = fakeTransport(script, clock);
  const breaker = new CircuitBreaker(clock);
  const gateway = new ModelGateway({ qwen: 'q', deepseek: 'd' }, transport, clock);
  const service = new NarratorService(gateway, breaker, chain, clock);
  return { clock, transport, breaker, service };
}

const input = (over: Partial<NarrateInput> = {}): NarrateInput => ({
  scenario,
  contentVersion: 7,
  activityId: SAMPLE_ACTIVITY_ID,
  transcript: transcriptBefore(scenario, SAMPLE_ACTIVITY_ID),
  answer: SAMPLE_ANSWERS.dung_kich_ban,
  followUpAllowed: true,
  ...over,
});

describe('lượt bình thường', () => {
  it('câu hợp lệ ngay lần đầu: trả về, ghi đủ bản ghi', async () => {
    const { service, transport } = setup([{ content: GOOD, latencyMs: 1400, promptTokens: 3200, cachedTokens: 2048, completionTokens: 110 }]);
    const result = await service.narrate(input());

    expect(result.status).toBe('ok');
    expect(transport.calls).toHaveLength(1);
    expect(result.records).toEqual([
      expect.objectContaining({
        attempt: 1,
        modelKey: 'qwen3.8-flash@eu-central-1',
        family: 'qwen',
        promptVersion: 'narrator-v1',
        profileVersion: 'narrator-profile-1',
        contentVersion: 7,
        temperature: 0.7,
        outcome: 'accepted',
        latencyMs: 1400,
        usage: { input: 3200, cachedInput: 2048, cacheWrite: 0, output: 110, reasoning: 0 },
      }),
    ]);
    expect(result.cost.usd).toBeGreaterThan(0);
  });

  it('gửi đúng call profile cho Qwen', async () => {
    const { service, transport } = setup([{ content: GOOD }]);
    await service.narrate(input());
    expect(transport.calls[0].body).toMatchObject({
      temperature: 0.7,
      max_completion_tokens: 300,
      enable_thinking: false,
      response_format: { type: 'json_schema', json_schema: { strict: true } },
    });
  });
});

describe('sinh lại khi phạm luật', () => {
  it('R1 hỏng → viết lại, kèm lý do; phần đầu prompt giữ nguyên', async () => {
    const { service, transport } = setup([{ content: INVENTS_NUMBER }, { content: GOOD }]);
    const result = await service.narrate(input());

    expect(result.status).toBe('ok');
    expect(result.records.map((r) => r.outcome)).toEqual(['rejected', 'accepted']);
    expect(result.records[0].violations).toEqual([expect.objectContaining({ rule: 'R1' })]);

    const [first, second] = transport.calls.map((c) => c.body['messages'] as Array<{ role: string; content: string }>);
    expect(second.slice(0, 2)).toEqual(first);
    expect(second[2]).toEqual({ role: 'assistant', content: INVENTS_NUMBER });
    expect(second[3].content).toContain('R1');
    expect(second[3].content).toContain('15');
  });

  it('được hỏi đào sâu là do engine quyết: không được hỏi mà vẫn hỏi → R2, viết lại', async () => {
    const { service } = setup([{ content: GOOD }, { content: line({ narration: 'Ừ, làm đi em.' }) }]);
    const result = await service.narrate(input({ followUpAllowed: false }));
    expect(result.status).toBe('ok');
    expect(result.records[0].violations.map((v) => v.rule)).toEqual(['R2']);
  });

  it('sau 3 lần hỏng trên Qwen (1 + 2 lần viết lại) thì sang DeepSeek, bắt đầu từ prompt sạch', async () => {
    const { service, transport } = setup([
      { content: INVENTS_NUMBER },
      { content: INVENTS_NUMBER },
      { content: INVENTS_NUMBER },
      { content: GOOD },
    ]);
    const result = await service.narrate(input());

    expect(result.status).toBe('ok');
    expect(transport.calls.map((c) => c.url.includes('deepseek'))).toEqual([false, false, false, true]);
    // Model mới không thấy câu bị loại của model cũ.
    expect(transport.calls[3].body['messages']).toHaveLength(2);
    expect(transport.calls[3].body).toMatchObject({ temperature: 1, thinking: { type: 'disabled' } });
  });
});

describe('lỗi hạ tầng', () => {
  it('Qwen quá giờ → sang DeepSeek ngay, không chờ thử lại Qwen', async () => {
    const { service, transport } = setup([{ latencyMs: 10_000 }, { content: GOOD, latencyMs: 1200 }]);
    const result = await service.narrate(input());

    expect(result.status).toBe('ok');
    expect(result.records.map((r) => [r.provider, r.outcome, r.error?.kind ?? null])).toEqual([
      ['qwen', 'error', 'timeout'],
      ['deepseek', 'accepted', null],
    ]);
    expect(transport.calls).toHaveLength(2);
  });

  it('Qwen lỗi liên tục → breaker ngắt, người chơi sau đi thẳng sang DeepSeek', async () => {
    const { service, transport } = setup((call) =>
      call.url.includes('deepseek') ? { content: GOOD } : { status: 500, errorCode: 'internal_error' },
    );
    for (let i = 0; i < 3; i++) await service.narrate(input());
    const before = transport.calls.length;

    const result = await service.narrate(input());
    expect(result.status).toBe('ok');
    expect(transport.calls.slice(before).map((c) => c.url.includes('deepseek'))).toEqual([true]);
  });
});

describe('dừng hẳn', () => {
  it('nội dung bị bộ lọc chặn → blocked; không thử lại, không đẩy sang hãng khác', async () => {
    const { service, transport } = setup([{ status: 400, errorCode: 'data_inspection_failed' }, { content: GOOD }]);
    const result = await service.narrate(input());
    expect(result.status).toBe('blocked');
    expect(transport.calls).toHaveLength(1);
  });

  it('hết hạn chót 9 s → unavailable, kèm bản ghi từng lần thử', async () => {
    // Mỗi lần 4 s và đều phạm luật: sau 2 lần còn 1 s < 1,5 s tối thiểu.
    const { service, transport } = setup([{ content: INVENTS_NUMBER, latencyMs: 4000 }]);
    const result = await service.narrate(input());
    expect(result).toMatchObject({ status: 'unavailable', reason: 'deadline' });
    expect(transport.calls).toHaveLength(2);
    expect(result.records).toHaveLength(2);
  });

  it('lượt gọi nào cũng chờ không quá phần thời gian còn lại, cả bậc xong trong 9 s', async () => {
    const { service, clock } = setup([{ content: INVENTS_NUMBER, latencyMs: 4000 }, { latencyMs: 60_000 }]);
    const started = clock.now();
    const result = await service.narrate(input());

    expect(result).toMatchObject({ status: 'unavailable', reason: 'deadline' });
    // Lần 2 còn 5 s nhưng chỉ được chờ 4,5 s (trần một lượt gọi), rồi bị cắt.
    expect(result.records.map((r) => r.latencyMs)).toEqual([4000, 4500]);
    expect(clock.now() - started).toBeLessThanOrEqual(9000);
  });

  it('không có model nào → no_model, không gọi gì', async () => {
    const { service, transport } = setup([{ content: GOOD }], []);
    expect(await service.narrate(input())).toMatchObject({ status: 'unavailable', reason: 'no_model' });
    expect(transport.calls).toHaveLength(0);
  });

  it('lượt gọi kế có thể vượt trần chi phí phiên → dừng trước khi gọi (NFR-11)', async () => {
    const { service, transport } = setup([{ content: GOOD }]);
    expect(await service.narrate(input({ budgetUsd: 0.00001 }))).toMatchObject({
      status: 'unavailable',
      reason: 'budget',
    });
    expect(transport.calls).toHaveLength(0);
  });
});

describe('khử định danh trước khi gửi', () => {
  it('tên, số điện thoại người chơi không rời khỏi máy chủ', async () => {
    const { service, transport } = setup([{ content: GOOD }]);
    const result = await service.narrate(
      input({
        answer: 'Em là Nguyễn Văn Đức, có gì anh gọi 0912 345 678. Em nghĩ là lỗi N+1.',
        identity: { names: ['Nguyễn Văn Đức'] },
      }),
    );
    const sent = JSON.stringify(transport.calls[0].body);
    expect(sent).not.toContain('Nguyễn Văn Đức');
    expect(sent).not.toContain('0912');
    expect(result.redactions).toEqual({ known_name: 1, phone: 1 });
  });
});
