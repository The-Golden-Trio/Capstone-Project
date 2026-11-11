import { PLAYER_SPEAKER, shift } from '@datn/game-core';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { CircuitBreaker } from '../gateway/circuit-breaker';
import type { ModelGateway } from '../gateway/model-gateway';
import { toSceneTurn } from '../../assessment/shift-scene';
import {
  buildCheckerMessages,
  ShiftCheckerService,
  verifyAnswers,
} from './checker.service';

const ctx = fixtureShiftContext('SWE_BACKEND.L3.m2');

const request: shift.NarrateRequest = {
  requestId: 'r1',
  task: 'reply',
  slot: 'mentor',
  present: ['mentor'],
  channel: 'chat',
  maxBeats: 2,
  scene: { time: '10:00', channel: 'chat' },
  company: ctx.pack.company,
  profile: {
    name: 'anh An',
    relation: 'mentor',
    want: 'xử lý gọn',
    pressure: 'gấp release',
    stance: 'tin người chơi',
    expertise: 3,
    disclosure_style: 'nói thẳng',
    voice: 'giọng Nam',
    beliefs: ['Chắc DB quá tải giờ cao điểm.'],
    concerns: ['Muốn chắc nguyên nhân trước khi cho sửa.'],
  },
  knownFacts: [{ id: 'f1', text: 'API chậm hơn 4 giây.' }],
  mayReveal: [{ id: 'f10', text: 'App bản cũ không gửi số trang.' }],
  confirmOnly: [
    {
      id: 'f7',
      text: 'Nguyên nhân: lấy chi tiết từng đơn trong một vòng lặp.',
    },
  ],
  limits: { not_allowed: ['Hứa giờ xong với khách'], need_approval: [] },
  flags: ['da_mo_log'],
  recent: [{ speaker: 'player', text: 'Anh ơi API chậm quá.' }],
  playerText: 'Anh ơi API chậm quá.',
  guidance: 'Anh An chưa duyệt.',
};

describe('ca làm → AI-4 theo nhịp (SceneTurn)', () => {
  const turn = toSceneTurn(request, ctx);

  it('thẻ của người được giao mang dữ kiện đã lọc, hướng của lượt và cách lộ dữ kiện', () => {
    expect(turn.lead).toBe('mentor');
    expect(turn.cards.map((c) => c.slot)).toEqual(['mentor']);
    const card = turn.cards[0].text;
    expect(card).toContain('API chậm hơn 4 giây.');
    expect(card).toContain('Được nói ra ở lượt này');
    expect(card).toContain('Chỉ xác nhận khi người chơi tự nói ra');
    expect(card).toContain('Anh An chưa duyệt.');
  });

  it('người chơi đổi sang người nói của contract nhịp; câu kiểm của seed nằm trong chữ bị cấm (R3)', () => {
    expect(turn.recent[0].speaker).toBe(PLAYER_SPEAKER);
    expect(turn.hidden).toContain(ctx.seed.conversation_checks[0].q);
    // Dữ kiện slot không biết cũng bị cấm, dữ kiện được giao thì không.
    expect(turn.hidden).toContain(
      ctx.seed.facts.find((f) => f.id === 'f9')?.text,
    );
    expect(turn.hidden).not.toContain(
      ctx.seed.facts.find((f) => f.id === 'f1')?.text,
    );
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

  it('dùng ghế judge của AI-5; không có ghế nào thì unavailable, không thay bằng cách khác (D-92)', async () => {
    const gateway = { complete: async () => ({}) } as unknown as ModelGateway;
    const none = new ShiftCheckerService(gateway, new CircuitBreaker(), []);
    expect(none.chain()).toEqual([]);
    expect(await none.check(req)).toEqual({
      status: 'unavailable',
      reason: 'no_model',
    });
  });

  it('chỉ gửi câu hỏi và lời người chơi', () => {
    const text = JSON.stringify(buildCheckerMessages(req, req.scope));
    expect(text).toContain('<loi_nguoi_choi>');
    expect(text).toContain('hua_bao_lai');
  });
});
