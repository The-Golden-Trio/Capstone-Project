import { shift } from '@datn/game-core';
import { CircuitBreaker } from '../gateway/circuit-breaker';
import type { ChatRequest, ChatResult } from '../gateway/gateway.types';
import type { ModelGateway } from '../gateway/model-gateway';
import { deepseekFlash } from '../gateway/models';
import {
  buildCheckerMessages,
  ShiftCheckerService,
  verifyAnswers,
} from './checker.service';
import {
  buildShiftNarratorMessages,
  cleanRequest,
  ShiftNarratorService,
} from './shift-narrator.service';

const request: shift.NarrateRequest = {
  requestId: 'r1',
  task: 'reply',
  slot: 'mentor',
  present: ['mentor'],
  channel: 'chat',
  maxBeats: 2,
  scene: { time: '10:00', channel: 'chat' },
  company: { name: 'Giao Nhanh', profile: 'Startup giao đồ ăn.' },
  profile: {
    name: 'anh An',
    relation: 'mentor',
    want: 'xử lý gọn',
    pressure: 'gấp release',
    stance: 'tin người chơi',
    expertise: 3,
    disclosure_style: 'nói thẳng',
    voice: 'giọng Nam',
    beliefs: [],
    concerns: [],
  },
  knownFacts: [{ id: 'f1', text: 'API chậm hơn 4 giây.' }],
  mayReveal: [],
  confirmOnly: [],
  limits: { not_allowed: [], need_approval: [] },
  flags: [],
  recent: [
    { speaker: 'player', text: 'Em là Trần Văn Nam, email nam@example.com' },
  ],
  playerText: 'Em là Trần Văn Nam, email nam@example.com',
};

const ok = (text: string): ChatResult => ({
  text,
  finishReason: 'stop',
  usage: {
    input: 100,
    cachedInput: 0,
    cacheWrite: 0,
    output: 50,
    reasoning: 0,
  },
  requestId: null,
  latencyMs: 300,
});

function gatewayOf(...replies: string[]) {
  const calls: ChatRequest[] = [];
  const gateway = {
    complete: async (req: ChatRequest) => {
      calls.push(req);
      return ok(replies[Math.min(calls.length - 1, replies.length - 1)]);
    },
  } as unknown as ModelGateway;
  return { gateway, calls };
}

describe('AI-4 bản 2 cho ca làm', () => {
  it('khử định danh câu người chơi và bọc thành dữ liệu', () => {
    const clean = cleanRequest(request, { names: ['Trần Văn Nam'] });
    const text = JSON.stringify(buildShiftNarratorMessages(clean));
    expect(text).not.toContain('nam@example.com');
    expect(text).not.toContain('Trần Văn Nam');
    expect(text).toContain('<cau_nguoi_choi>');
  });

  it('vi phạm luật thì bắt viết lại, qua thì trả nhịp kèm provenance (D-108)', async () => {
    const bad = JSON.stringify({
      beats: [
        {
          speaker: 'mentor',
          text: 'Có 37 khách phàn nàn.',
          expression: 'lo_lang',
        },
      ],
      question_by: null,
    });
    const good = JSON.stringify({
      beats: [
        {
          speaker: 'mentor',
          text: 'Ừ, hơn 4 giây là chậm thật.',
          expression: 'suy_nghi',
        },
      ],
      question_by: null,
    });
    const { gateway, calls } = gatewayOf(bad, good);
    const service = new ShiftNarratorService(gateway, new CircuitBreaker(), [
      deepseekFlash(),
    ]);
    const out = await service.narrate(request);
    expect(out).toMatchObject({
      status: 'ok',
      provenance: { adapter: 'live', model: deepseekFlash().key },
    });
    expect(calls).toHaveLength(2);
    expect(JSON.stringify(calls[1].messages)).toContain('R1');
  });

  it('không có model nào thì unavailable, không có lời thay thế (D-92)', async () => {
    const { gateway } = gatewayOf('{}');
    const service = new ShiftNarratorService(gateway, new CircuitBreaker(), []);
    expect(await service.narrate(request)).toEqual({
      status: 'unavailable',
      reason: 'no_model',
    });
  });
});

describe('bộ phán có/không', () => {
  const req: shift.CheckRequest = {
    requestId: 'r2',
    source: 'conv:c1',
    scope: 'Chị ơi em tìm ra lỗi rồi. 11 rưỡi em gọi báo lại chị nha.',
    questions: [
      { flag: 'support_biet_tim_ra_loi', q: 'Có báo đã thấy lỗi không?' },
      {
        flag: 'hua_bao_lai',
        q: 'Có hẹn báo lại không?',
        extract: {
          fields: ['time', 'event', 'channel'],
          promise_to: 'support',
        },
      },
      { flag: 'hua_chac_trua', q: 'Có hứa trưa xong không?' },
    ],
  };

  it('"có" phải kèm câu trích đúng nguyên văn; trích bịa thì thành không rõ', () => {
    const answers = verifyAnswers(req, req.scope, {
      answers: [
        {
          flag: 'support_biet_tim_ra_loi',
          quote: 'em tìm ra lỗi rồi',
          answer: 'yes',
        },
        {
          flag: 'hua_bao_lai',
          quote: '11 rưỡi em gọi báo lại chị nha',
          answer: 'yes',
          time: '11:30',
          channel: 'call',
        },
        { flag: 'hua_chac_trua', quote: 'trưa là xong', answer: 'yes' },
      ],
    });
    expect(answers).toEqual([
      {
        flag: 'support_biet_tim_ra_loi',
        answer: 'yes',
        quote: 'em tìm ra lỗi rồi',
      },
      {
        flag: 'hua_bao_lai',
        answer: 'yes',
        quote: '11 rưỡi em gọi báo lại chị nha',
        extracted: { time: '11:30', channel: 'call' },
      },
      { flag: 'hua_chac_trua', answer: 'unclear' },
    ]);
  });

  it('dùng họ model khác AI-4 (DC-01); cùng họ thì không có bộ phán', async () => {
    const { gateway } = gatewayOf('{}');
    const only = new ShiftCheckerService(gateway, new CircuitBreaker(), [
      deepseekFlash(),
    ]);
    expect(only.chain()).toEqual([]);
    expect(await only.check(req)).toEqual({
      status: 'unavailable',
      reason: 'no_model',
    });
  });

  it('câu hỏi gửi đi không kèm gì ngoài câu hỏi và lời người chơi', () => {
    const text = JSON.stringify(buildCheckerMessages(req, req.scope));
    expect(text).toContain('<loi_nguoi_choi>');
    expect(text).toContain('hua_bao_lai');
  });
});
