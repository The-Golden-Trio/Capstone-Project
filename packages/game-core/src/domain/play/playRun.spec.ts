import { describe, expect, it } from 'vitest';
import { fixtureData } from '../../testing/fixture.js';
import {
  activityResults,
  findActivity,
  foldPlay,
  followUpAllowed,
  orderingShuffle,
  pickPlayEnding,
  scoreClosed,
  ungraded,
  type GradedCriterion,
  type PlayEvent,
} from './playRun.js';

const data = fixtureData();
const L1 = data.scenarios['SWE_BACKEND_L1_S_EXEC'];
const L3 = data.scenarios['SWE_BACKEND_L3_S_INCIDENT'];

const start = (band = 'L1', key = 'SWE_BACKEND_L1_S_EXEC'): PlayEvent => ({
  type: 'RUN_STARTED',
  scenarioKey: key,
  contentVersion: 3,
  band,
});

const criterion = (
  key: string,
  score: 0 | 1 | 2 | null,
  over: Partial<GradedCriterion> = {},
): GradedCriterion => ({
  key,
  skill: 'Giải quyết vấn đề',
  skillType: 'hard',
  score,
  counterproductive: false,
  highDisagreement: false,
  rationale: 'r',
  quote: 'q',
  ...over,
});

describe('foldPlay', () => {
  it('mở ở hoạt động gốc, chờ câu chính', () => {
    const s = foldPlay([start()], L1);
    expect(s).toMatchObject({
      activityKey: 'a1',
      stage: 'answering',
      followupNo: 0,
      band: 'L1',
    });
  });

  it('đóng hoạt động thì sang hoạt động kế; đóng hoạt động cuối thì hết màn', () => {
    const s = foldPlay(
      [
        start(),
        {
          type: 'CLOSED_ANSWERED',
          activityKey: 'a1',
          answerId: 'x1',
          score: 2,
          why: 'w',
          quote: 'q',
        },
        { type: 'ACTIVITY_CLOSED', activityKey: 'a1', nextActivityKey: 'a2' },
      ],
      L1,
    );
    expect(s).toMatchObject({
      activityKey: 'a2',
      stage: 'answering',
      closed: ['a1'],
    });

    const end = foldPlay(
      [
        start(),
        { type: 'ACTIVITY_CLOSED', activityKey: 'a1', nextActivityKey: null },
      ],
      L1,
    );
    expect(end).toMatchObject({ activityKey: null, stage: 'ended' });
  });

  it('câu tự luận: chờ quyết hỏi vặn; hỏi vặn thì đợi câu trả lời mang followupNo mới', () => {
    const s = foldPlay(
      [
        start(),
        {
          type: 'TEXT_SUBMITTED',
          activityKey: 'a1',
          answerId: 't1',
          followupNo: 0,
          followUpAllowed: true,
        },
      ],
      L1,
    );
    expect(s.stage).toBe('awaiting');
    expect(ungraded(s).map((a) => a.answerId)).toEqual(['t1']);

    const asked = foldPlay(
      [
        start(),
        {
          type: 'TEXT_SUBMITTED',
          activityKey: 'a1',
          answerId: 't1',
          followupNo: 0,
          followUpAllowed: true,
        },
        {
          type: 'FOLLOWUP_ASKED',
          activityKey: 'a1',
          followupNo: 1,
          npcKey: 'an',
          name: 'An',
          question: 'Vì sao?',
          source: 'ai',
          provenance: null,
        },
      ],
      L1,
    );
    expect(asked).toMatchObject({
      stage: 'followup',
      followupNo: 1,
      followupsInActivity: 1,
      followupTotal: 1,
    });
    expect(asked.pendingFollowup?.question).toBe('Vì sao?');
  });

  it('điểm tới sau, không đổi vị trí trong màn', () => {
    const s = foldPlay(
      [
        start(),
        {
          type: 'TEXT_SUBMITTED',
          activityKey: 'a1',
          answerId: 't1',
          followupNo: 0,
          followUpAllowed: false,
        },
        { type: 'ACTIVITY_CLOSED', activityKey: 'a1', nextActivityKey: 'a2' },
        {
          type: 'ANSWER_GRADED',
          activityKey: 'a1',
          answerId: 't1',
          followupNo: 0,
          score: 1,
          counterproductive: false,
          criteria: [criterion('a1-k1', 1)],
          method: 'median_of_3',
          panelSize: 3,
          costUsd: 0.001,
        },
      ],
      L1,
    );
    expect(s.activityKey).toBe('a2');
    expect(ungraded(s)).toEqual([]);
    expect(s.answers[0]).toMatchObject({ graded: true, score: 1 });
  });
});

describe('followUpAllowed — bốn điều kiện của AI-4 §4.1', () => {
  const a4 = findActivity(L1, 'a4');
  const a1 = findActivity(L1, 'a1');
  const fresh = foldPlay([start()], L1);

  it('có mục tiêu, còn lượt, còn trần, là câu chính → hỏi', () => {
    expect(followUpAllowed(a4, fresh, 0)).toBe(true);
  });
  it('không có mục tiêu đào sâu → không hỏi', () => {
    expect(followUpAllowed(a1, fresh, 0)).toBe(false);
  });
  it('đang trả lời câu đào sâu → không hỏi nối tiếp', () => {
    expect(followUpAllowed(a4, fresh, 1)).toBe(false);
  });
  it('hết lượt của hoạt động hoặc hết trần của màn → không hỏi', () => {
    expect(
      followUpAllowed(
        a4,
        { ...fresh, followupsInActivity: a4.limitFollowup },
        0,
      ),
    ).toBe(false);
    expect(followUpAllowed(a4, { ...fresh, followupTotal: 2 }, 0)).toBe(false);
  });
});

describe('scoreClosed', () => {
  it('CHOICE theo khoá chuyên gia, sai dạng thì từ chối', () => {
    const a2 = findActivity(L1, 'a2');
    const best = a2.optionGrade?.findIndex((g) => g === '+2') ?? -1;
    expect(scoreClosed(a2, String(best))).toMatchObject({ ok: true, score: 2 });
    expect(scoreClosed(a2, '99')).toMatchObject({ ok: false });
    expect(scoreClosed(a2, ['0'])).toMatchObject({ ok: false });
  });

  it('ORDERING: đúng thứ tự là mức 2, phải đủ mọi bước', () => {
    const a3 = findActivity(L1, 'a3');
    expect(scoreClosed(a3, a3.correct_order)).toMatchObject({
      ok: true,
      score: 2,
    });
    expect(scoreClosed(a3, a3.correct_order?.slice(1))).toMatchObject({
      ok: false,
    });
    expect(orderingShuffle(a3)).toHaveLength(a3.items?.length ?? 0);
  });

  it('PRIORITIZING: đúng số mục, không trùng', () => {
    const a1 = findActivity(L1, 'a1');
    const picks = [...(a1.must_pick ?? []), ...(a1.should_pick ?? [])].slice(
      0,
      a1.pick_count ?? 0,
    );
    expect(scoreClosed(a1, picks)).toMatchObject({ ok: true, score: 2 });
    expect(scoreClosed(a1, [picks[0], picks[0]])).toMatchObject({ ok: false });
  });

  it('FREETEXT không chấm ở đây', () => {
    expect(scoreClosed(findActivity(L1, 'a4'), 'x')).toMatchObject({
      ok: false,
    });
  });
});

describe('activityResults và kết cục', () => {
  const graded = (
    answerId: string,
    followupNo: number,
    scores: Array<0 | 1 | 2 | null>,
    cp = false,
  ): PlayEvent => ({
    type: 'ANSWER_GRADED',
    activityKey: 'a2',
    answerId,
    followupNo,
    score: 0,
    counterproductive: cp,
    criteria: scores.map((s, i) =>
      criterion(`a2-k${i + 1}`, s, { counterproductive: cp && i === 0 }),
    ),
    method: 'median_of_3',
    panelSize: 3,
    costUsd: 0,
  });

  it('mỗi tiêu chí lấy mức cao nhất qua câu chính và câu hỏi vặn; hoạt động lấy mức thấp nhất', () => {
    const s = foldPlay(
      [
        start('L3', 'SWE_BACKEND_L3_S_INCIDENT'),
        {
          type: 'CLOSED_ANSWERED',
          activityKey: 'a1',
          answerId: 'c1',
          score: 2,
          why: 'w',
          quote: 'q',
        },
        { type: 'ACTIVITY_CLOSED', activityKey: 'a1', nextActivityKey: 'a2' },
        {
          type: 'TEXT_SUBMITTED',
          activityKey: 'a2',
          answerId: 't1',
          followupNo: 0,
          followUpAllowed: true,
        },
        graded('t1', 0, [0, 2], true),
        {
          type: 'TEXT_SUBMITTED',
          activityKey: 'a2',
          answerId: 't2',
          followupNo: 1,
          followUpAllowed: false,
        },
        graded('t2', 1, [1, 1]),
        { type: 'ACTIVITY_CLOSED', activityKey: 'a2', nextActivityKey: 'a3' },
      ],
      L3,
    );
    const [r1, r2] = activityResults(s, L3);
    expect(r1).toMatchObject({ activityKey: 'a1', score: 2 });
    expect(r2).toMatchObject({
      activityKey: 'a2',
      score: 1,
      counterproductiveCount: 1,
    });
    expect(r2.evidence.map((e) => e.score)).toEqual([1, 2]);
  });

  it('tiêu chí "không xét" bỏ khỏi mức; mọi tiêu chí không xét thì chưa có mức', () => {
    const s = foldPlay(
      [
        start('L3', 'SWE_BACKEND_L3_S_INCIDENT'),
        { type: 'ACTIVITY_CLOSED', activityKey: 'a1', nextActivityKey: 'a2' },
        graded('t1', 0, [null, null]),
        { type: 'ACTIVITY_CLOSED', activityKey: 'a2', nextActivityKey: 'a3' },
      ],
      L3,
    );
    expect(
      activityResults(s, L3).find((r) => r.activityKey === 'a2')?.score,
    ).toBeNull();
  });

  it('kết cục theo số bằng chứng mức 2 và mức 0, không bao giờ là SECRET', () => {
    const results = L1.activities.map((a) => ({
      activityKey: a.activity_id,
      score: 2 as const,
      counterproductiveCount: 0,
      hintUsed: false,
      evidence: [
        {
          activityKey: a.activity_id,
          skill: 's',
          skillType: 'hard' as const,
          score: 2 as const,
          counterproductive: false,
          why: '',
          quote: null,
          highDisagreement: false,
        },
      ],
    }));
    const ending = pickPlayEnding(L1, results);
    expect(ending.type).not.toBe('SECRET');
    expect(ending.condition.extra ?? null).toBeNull();
  });
});
