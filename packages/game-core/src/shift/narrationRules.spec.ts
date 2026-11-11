import { describe, expect, it } from 'vitest';
import { fixtureShiftContext } from '../testing/fixture.js';
import { initialState, pendingRequest, step } from './engine.js';
import { checkShiftNarration } from './narrationRules.js';
import type { NarrateRequest, ShiftState } from './state.js';

const ctx = fixtureShiftContext('SWE_BACKEND.L3.m2');

/** Tới lượt anh An cần trả lời trong cuộc trò chuyện. */
function awaitingNarration(): { state: ShiftState; request: NarrateRequest } {
  let state = initialState(ctx);
  const send = (input: Parameters<typeof step>[1]) => {
    const r = step(state, input, ctx);
    state = r.state;
    return r.effects;
  };
  send({ type: 'START' });
  const effects = send({ type: 'SAY', text: 'Dạ.' });
  const n0 = effects.find((e) => e.type === 'narrate');
  if (n0?.type !== 'narrate') throw new Error('thiếu yêu cầu');
  send({
    type: 'NARRATION',
    requestId: n0.request.requestId,
    beats: [{ speaker: 'mentor', text: 'Ừ.', expression: 'binh_thuong' }],
  });
  send({ type: 'ACTION', key: 'talk_mentor' });
  const ask = send({ type: 'SAY', text: 'Anh ơi API chậm 4 giây là sao?' });
  // Câu kiểm theo lượt (xin duyệt) chạy trước lời đáp.
  const realtime = ask.find((e) => e.type === 'check');
  if (realtime?.type !== 'check') throw new Error('thiếu câu kiểm theo lượt');
  const after = send({
    type: 'CHECKS',
    requestId: realtime.request.requestId,
    answers: [{ flag: 'xin_duyet', answer: 'no' }],
  });
  const req = after.find((e) => e.type === 'narrate');
  if (req?.type !== 'narrate') throw new Error('thiếu yêu cầu');
  return { state, request: req.request };
}

const json = (beats: unknown[], question_by: string | null = null) =>
  JSON.stringify({ beats, question_by });

describe('pendingRequest', () => {
  it('dựng lại đúng yêu cầu đang chờ từ trạng thái', () => {
    const { state, request } = awaitingNarration();
    expect(pendingRequest(state, ctx)).toEqual({ type: 'narrate', request });
  });
});

describe('checkShiftNarration (C2)', () => {
  const { request } = awaitingNarration();

  it('nhận lời đúng khuôn, số có nguồn', () => {
    const out = checkShiftNarration(
      json([
        {
          speaker: 'mentor',
          text: 'Ừ, từ 8 giờ là hơn 4 giây rồi.',
          expression: 'lo_lang',
        },
        { speaker: 'mentor', text: 'Em coi log chưa?', expression: 'suy_nghi' },
      ]),
      request,
      'stop',
    );
    expect(out.violations).toEqual([]);
    expect(out.beats).toHaveLength(2);
  });

  it('R1: bắt số bịa', () => {
    const out = checkShiftNarration(
      json([
        {
          speaker: 'mentor',
          text: 'Có 37 khách phàn nàn rồi đó.',
          expression: 'lo_lang',
        },
      ]),
      request,
      'stop',
    );
    expect(out.violations.map((x) => x.rule)).toContain('R1');
  });

  it('R2: câu hỏi phải ở nhịp cuối, do chính người đang nói hỏi, lời cảnh không hỏi', () => {
    const notLast = checkShiftNarration(
      json([
        { speaker: 'mentor', text: 'Em coi log chưa?', expression: 'suy_nghi' },
        { speaker: 'mentor', text: 'Anh đang bận.', expression: 'binh_thuong' },
      ]),
      request,
      'stop',
    );
    expect(notLast.violations.map((x) => x.rule)).toContain('R2');
    const scene = checkShiftNarration(
      json([
        { speaker: 'canh', text: 'Ai đó hỏi gì?', expression: 'binh_thuong' },
      ]),
      request,
      'stop',
    );
    expect(scene.violations.map((x) => x.rule)).toContain('R2');
  });

  it('R4: sai khuôn, người nói vắng mặt, biểu cảm ngoài bộ, bị cắt', () => {
    expect(
      checkShiftNarration('xin chào', request, 'stop').violations[0].rule,
    ).toBe('R4');
    const absent = checkShiftNarration(
      json([{ speaker: 'support', text: 'Chị nè.', expression: 'gian_du' }]),
      request,
      'stop',
    );
    expect(absent.violations.filter((x) => x.rule === 'R4')).toHaveLength(2);
    expect(
      checkShiftNarration('{', request, 'length').violations[0].detail,
    ).toContain('cắt');
  });

  it('việc probe phải có đúng một câu hỏi', () => {
    const probe: NarrateRequest = {
      ...request,
      task: 'probe',
      hook: 'hỏi em dựa vào đâu',
    };
    const out = checkShiftNarration(
      json([{ speaker: 'mentor', text: 'Ừ.', expression: 'binh_thuong' }]),
      probe,
      'stop',
    );
    expect(out.violations.map((x) => x.rule)).toContain('R2');
  });
});
