/**
 * Đường "live" của `ai-lab` nhưng với transport giả: dựng đúng
 * `ShiftSceneNarrator` và `ShiftCheckerService` như worker, kiểm spy ghi được
 * token, tiền, vết R1–R4 và request nguyên văn, và key không lọt vào nhật ký.
 * Không có lượt gọi mạng nào.
 */
import { fixtureShiftContext } from '@datn/game-core/testing';
import type { AiSettings } from '../../ai/gateway/models';
import {
  FakeClock,
  fakeTransport,
  type FakeCall,
} from '../../ai/testing/fake-model';
import {
  createPorts,
  fakeRuntime,
  keyName,
  liveRuntime,
  liveSetup,
} from './ports';
import { parsePlaythrough } from './playthrough';
import { runPlaythrough } from './runner';

const ctx = fixtureShiftContext('SWE_BACKEND.L3.m2');

const settings: AiSettings = {
  qwen: {
    apiKey: 'qwen-secret-key',
    region: 'eu-central-1',
    workspaceId: 'ws-test',
    cacheMode: 'implicit',
  },
  openrouter: { apiKey: 'sk-or-secret-key' },
  allowUnconfirmedProviders: false,
};

const BEATS = {
  beats: [
    { speaker: 'mentor', text: 'Ừ, mình nghe rồi.', expression: 'binh_thuong' },
  ],
  question_by: null,
};

const textOf = (call: FakeCall): string =>
  (call.body['messages'] as Array<{ content: unknown }>)
    .map((m) =>
      typeof m.content === 'string'
        ? m.content
        : (m.content as Array<{ text: string }>).map((p) => p.text).join('\n'),
    )
    .join('\n');

/** Trả JSON hợp khuôn: bộ phán trả "không" cho mọi câu, AI-4 trả một nhịp. */
function script(call: FakeCall) {
  const text = textOf(call);
  const asked = text.match(/Câu hỏi \(json\):\n(\[.*\])/)?.[1];
  if (asked) {
    const questions = JSON.parse(asked) as Array<{ flag: string }>;
    return {
      content: JSON.stringify({
        answers: questions.map((q) => ({
          flag: q.flag,
          quote: null,
          answer: 'no',
          time: null,
          event: null,
          channel: null,
        })),
      }),
      promptTokens: 400,
      completionTokens: 30,
    };
  }
  return {
    content: JSON.stringify(BEATS),
    promptTokens: 3000,
    cachedTokens: 2048,
    completionTokens: 40,
  };
}

const playthrough = parsePlaythrough(
  {
    name: 'thu',
    seed: 'SWE_BACKEND.L3.m2',
    title: 'Thử',
    intent: 'Thử',
    steps: [
      { do: 'start' },
      { do: 'say', text: 'Dạ em coi log anh nha.' },
      { do: 'action', key: 'talk_mentor' },
      { do: 'say', text: 'Anh ơi em thấy vòng lặp gọi DB 901 lần.' },
      { do: 'end_conversation' },
    ],
  },
  'thu.json',
);

describe('liveSetup', () => {
  it('thiếu key thì nói thiếu gì, không ném lỗi', () => {
    const none = liveSetup({ allowUnconfirmedProviders: false });
    expect(none.chain).toEqual([]);
    expect(none.excluded.map((e) => e.provider)).toEqual(['qwen', 'deepseek']);
    expect(none.slots).toEqual([]);
    expect(none.problems.join()).toMatch(/OPENROUTER_API_KEY/);
  });

  it('đủ key thì có chuỗi dẫn truyện và ba ghế judge khác họ AI-4', () => {
    const ready = liveSetup(settings);
    expect(ready.chain.length).toBeGreaterThan(0);
    expect(ready.slots.map((s) => s.family).sort()).toEqual([
      'anthropic',
      'google',
      'openai',
    ]);
  });
});

describe('createPorts', () => {
  it('bản giả không có gateway và drain trả rỗng', () => {
    const ports = createPorts(fakeRuntime(settings), undefined);
    expect(ports.narratorMode).toBe('fake');
    expect(ports.checkerMode).toBe('fake');
    expect(ports.drain()).toEqual({ gateway: [], attempts: [], exchanges: [] });
  });

  it('--only chỉ đổi một cổng sang thật', () => {
    const transport = fakeTransport(script, new FakeClock());
    const narratorOnly = createPorts(
      liveRuntime(settings, transport),
      'narrator',
    );
    expect(narratorOnly.narratorMode).toBe('live');
    expect(narratorOnly.checkerMode).toBe('fake');
    const checkerOnly = createPorts(
      liveRuntime(settings, transport),
      'checker',
    );
    expect(checkerOnly.narratorMode).toBe('fake');
    expect(checkerOnly.checkerMode).toBe('live');
  });
});

describe('chạy với transport giả qua service thật', () => {
  it('ghi token, tiền, vết R1–R4 và request nguyên văn; không có key trong nhật ký', async () => {
    const transport = fakeTransport(script, new FakeClock());
    const runtime = liveRuntime(settings, transport);
    const ports = createPorts(runtime, undefined);
    const result = await runPlaythrough(playthrough, {
      ctx,
      ports,
      budgetUsd: 0.25,
      identity: { names: ['Nam'], usernames: [], emails: [] },
    });
    expect(result.outcome).toBe('incomplete');
    expect(result.state.pending).toBeNull();

    const narrator = result.calls.filter((c) => c.service === 'narrator');
    const checker = result.calls.filter((c) => c.service === 'checker');
    expect(narrator.length).toBeGreaterThan(0);
    expect(checker.length).toBeGreaterThan(0);

    const first = narrator[0];
    expect(first.adapter).toBe('live');
    expect(first.detail.gateway[0].usage).toMatchObject({
      input: 3000,
      cachedInput: 2048,
      output: 40,
    });
    expect(first.detail.gateway[0].costUsd).toBeGreaterThan(0);
    expect(first.detail.attempts[0]).toMatchObject({
      outcome: 'accepted',
      violations: [],
    });
    expect(first.detail.exchanges[0].url).toContain('chat/completions');
    expect(first.provenance?.costUsd).toBeGreaterThan(0);

    expect(checker[0].adapter).toBe('live');
    expect(checker[0].answers?.every((a) => a.answer === 'no')).toBe(true);
    expect(checker[0].detail.gateway.length).toBeGreaterThan(0);

    const log = JSON.stringify(result.calls);
    expect(log).not.toContain('qwen-secret-key');
    expect(log).not.toContain('sk-or-secret-key');
    expect(result.costUsd).toBeGreaterThan(0);
  });

  it('khử định danh trước khi gửi: tên người chơi không có trong request', async () => {
    const transport = fakeTransport(script, new FakeClock());
    const ports = createPorts(liveRuntime(settings, transport), undefined);
    await runPlaythrough(
      parsePlaythrough(
        {
          name: 'thu',
          seed: 'SWE_BACKEND.L3.m2',
          title: 'Thử',
          intent: 'Thử',
          steps: [
            { do: 'start' },
            { do: 'say', text: 'Dạ em là Nam, em coi log anh nha.' },
          ],
        },
        'thu.json',
      ),
      {
        ctx,
        ports,
        budgetUsd: 0.25,
        identity: { names: ['Nam'], usernames: [], emails: [] },
      },
    );
    expect(JSON.stringify(transport.calls)).not.toMatch(/em là Nam/);
  });

  it('hết ngân sách thì cổng báo unavailable và ca dừng, không gọi thêm', async () => {
    const transport = fakeTransport(script, new FakeClock());
    const ports = createPorts(liveRuntime(settings, transport), undefined);
    const result = await runPlaythrough(playthrough, {
      ctx,
      ports,
      budgetUsd: 0,
    });
    expect(result.outcome).toBe('paused');
    expect(result.message).toMatch(/budget/);
    expect(transport.calls).toHaveLength(0);
  });
});

describe('keyName', () => {
  it('đổi địa chỉ thành tên biến môi trường giữ key', () => {
    expect(keyName('https://openrouter.ai/api/v1/chat/completions')).toBe(
      '{OPENROUTER_API_KEY}',
    );
    expect(keyName('https://api.deepseek.com/chat/completions')).toBe(
      '{DEEPSEEK_API_KEY}',
    );
    expect(keyName('https://ws.eu-central-1.maas.aliyuncs.com/x')).toBe(
      '{QWEN_API_KEY}',
    );
  });
});
