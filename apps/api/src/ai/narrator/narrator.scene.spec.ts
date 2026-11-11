/**
 * `narrateScene` (D-130) đi qua đúng bậc dự phòng của contract cũ: model giả
 * ở tầng transport, mọi thứ phía trên chạy thật.
 */
import { CircuitBreaker } from '../gateway/circuit-breaker';
import type { ModelSpec } from '../gateway/gateway.types';
import { ModelGateway, fetchTransport } from '../gateway/model-gateway';
import { deepseekFlash, qwenFlash } from '../gateway/models';
import { FakeClock, fakeTransport, type FakeTurn } from '../testing/fake-model';
import { sampleScene } from '../testing/sample-scene';
import {
  okResponse,
  startStrictProvider,
  type StrictProvider,
} from '../testing/strict-provider';
import { NarratorService } from './narrator.service';

const QWEN = qwenFlash({
  apiKey: 'q',
  region: 'eu-central-1',
  workspaceId: 'ws',
  cacheMode: 'implicit',
});
const DEEPSEEK = deepseekFlash();

const beats = (
  list: Array<[string, string, string | null]>,
  question_by: string | null = null,
) =>
  JSON.stringify({
    beats: list.map(([speaker, text, expression]) => ({
      speaker,
      text,
      expression,
    })),
    question_by,
  });

const PROBE_OK = beats(
  [
    ['mentor', 'Ừ, ghi chú gọn đó.', 'binh_thuong'],
    [
      'mentor',
      'Em dựa vào đâu để giữ hay loại một giả thuyết vậy?',
      'suy_nghi',
    ],
  ],
  'mentor',
);

function setup(script: FakeTurn[], chain: ModelSpec[] = [QWEN, DEEPSEEK]) {
  const clock = new FakeClock();
  const transport = fakeTransport(script, clock);
  const service = new NarratorService(
    new ModelGateway({ qwen: 'q', deepseek: 'd' }, transport, clock),
    new CircuitBreaker(clock),
    chain,
    clock,
  );
  return { transport, service };
}

describe('lượt theo nhịp', () => {
  it('probe hợp lệ ngay lần đầu: trả nhịp và người hỏi, ghi bản ghi bản prompt v3', async () => {
    const { service, transport } = setup([{ content: PROBE_OK }]);
    const result = await service.narrateScene({
      turn: sampleScene('n2_probe'),
      contentVersion: 4,
    });

    expect(result).toMatchObject({ status: 'ok', questionBy: 'mentor' });
    if (result.status !== 'ok') return;
    expect(result.beats).toHaveLength(2);
    expect(result.records[0]).toMatchObject({
      promptVersion: 'narrator-v3',
      contentVersion: 4,
      outcome: 'accepted',
    });
    expect(transport.calls[0].body['response_format']).toMatchObject({
      type: 'json_schema',
      json_schema: { name: 'narration_beats' },
    });
  });

  it('probe không hỏi → R2, viết lại kèm lý do', async () => {
    const { service, transport } = setup([
      { content: beats([['mentor', 'Ừ, ghi chú gọn đó.', 'binh_thuong']]) },
      { content: PROBE_OK },
    ]);
    const result = await service.narrateScene({
      turn: sampleScene('n2_probe'),
    });
    expect(result.status).toBe('ok');
    expect(result.records.map((r) => r.outcome)).toEqual([
      'rejected',
      'accepted',
    ]);
    expect(result.records[0].violations.map((v) => v.rule)).toEqual(['R2']);
    const second = transport.calls[1].body['messages'] as Array<{
      content: string;
    }>;
    expect(second[3].content).toContain('R2');
  });

  it('bịa số → R1; lời cảnh hỏi → R2; quá số nhịp → R4: cả ba trong một lần viết lại', async () => {
    const bad = beats([
      ['canh', 'Bạn có thấy anh Sang nhíu mày không?', null],
      ['mentor', 'Anh cho em 30 phút.', 'binh_thuong'],
      ['mentor', 'Làm đi.', 'binh_thuong'],
    ]);
    const ok = beats([
      ['mentor', 'Ừ, em mở log là đúng rồi, có gì nhắn anh.', 'binh_thuong'],
    ]);
    const { service } = setup([{ content: bad }, { content: ok }]);
    const result = await service.narrateScene({ turn: sampleScene('n0') });
    expect(result.status).toBe('ok');
    expect(new Set(result.records[0].violations.map((v) => v.rule))).toEqual(
      new Set(['R1', 'R2', 'R4']),
    );
  });

  it('hết 3 lần trên Qwen thì sang DeepSeek, prompt sạch', async () => {
    const bad = beats([['mentor', 'Anh cho em 30 phút.', 'binh_thuong']]);
    const ok = beats([['mentor', 'Ừ, em mở log trước đi.', 'binh_thuong']]);
    const { service, transport } = setup([
      { content: bad },
      { content: bad },
      { content: bad },
      { content: ok },
    ]);
    const result = await service.narrateScene({ turn: sampleScene('n0') });
    expect(result.status).toBe('ok');
    expect(result.records.map((r) => r.modelKey)).toEqual([
      'qwen3.8-flash@eu-central-1',
      'qwen3.8-flash@eu-central-1',
      'qwen3.8-flash@eu-central-1',
      'deepseek-flash',
    ]);
    expect((transport.calls[3].body['messages'] as unknown[]).length).toBe(2);
  });

  it('khử định danh câu người chơi và các dòng của người chơi trong diễn biến', async () => {
    const { service, transport } = setup([
      { content: beats([['support', 'Để chị coi lại nha.', 'lo_lang']]) },
    ]);
    const turn = sampleScene('pha_support');
    const result = await service.narrateScene({
      turn: {
        ...turn,
        playerLine: 'Chị gọi em số 0901234567 nha.',
        recent: [
          ...turn.recent,
          { speaker: 'nguoi_choi', text: 'Mail em là nhat@example.com' },
        ],
      },
    });
    const sent = JSON.stringify(transport.calls[0].body);
    expect(sent).not.toContain('0901234567');
    expect(sent).not.toContain('nhat@example.com');
    expect(result.redactions).toMatchObject({ phone: 1, email: 1 });
  });

  it('bộ lọc nội dung chặn: dừng, không đẩy sang hãng khác', async () => {
    const { service, transport } = setup([
      {
        status: 400,
        errorCode: 'data_inspection_failed',
        errorMessage: 'Input or output data may contain inappropriate content.',
      },
    ]);
    const result = await service.narrateScene({
      turn: sampleScene('pha_support'),
    });
    expect(result.status).toBe('blocked');
    expect(transport.calls).toHaveLength(1);
  });
});

describe('engine giao sai thì báo ngay, không gọi model', () => {
  it('người được giao không có thẻ trong cảnh', async () => {
    const { service, transport } = setup([{ content: PROBE_OK }]);
    await expect(
      service.narrateScene({ turn: { ...sampleScene('n0'), lead: 'support' } }),
    ).rejects.toThrow(/không có thẻ/);
    expect(transport.calls).toHaveLength(0);
  });

  it('probe thiếu hook', async () => {
    const { service } = setup([{ content: PROBE_OK }]);
    await expect(
      service.narrateScene({
        turn: { ...sampleScene('n2_probe'), hook: undefined },
      }),
    ).rejects.toThrow(/hook/);
  });
});

describe('qua HTTP thật tới máy chủ khắt khe theo tài liệu', () => {
  let server: StrictProvider | undefined;
  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it.each([
    ['Singapore, json_object', 'ap-southeast-1', false],
    ['Frankfurt, JSON Schema strict', 'eu-central-1', true],
  ] as const)(
    '%s: body hợp lệ, đọc được nhịp',
    async (_, region, allowSchema) => {
      server = await startStrictProvider({
        provider: 'qwen',
        apiKey: 'k',
        allowSchema,
        reply: () => ({ json: okResponse('qwen', PROBE_OK) }),
      });
      const spec = qwenFlash({
        apiKey: 'k',
        region,
        workspaceId: 'ws',
        baseUrl: server.url,
        cacheMode: 'implicit',
      });
      const service = new NarratorService(
        new ModelGateway({ qwen: 'k' }, fetchTransport),
        new CircuitBreaker(),
        [spec],
      );
      const result = await service.narrateScene({
        turn: sampleScene('n2_probe'),
      });
      expect(result).toMatchObject({ status: 'ok', questionBy: 'mentor' });
    },
  );
});
