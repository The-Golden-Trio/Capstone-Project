import { combineJudgments, type CombineOptions } from './judge-combine';
import type { JudgeScore, Judgment } from './judge.types';

const j = (
  score: JudgeScore | null,
  counterproductive = false,
  criterionId = 'k1',
): Judgment => ({
  criterionId,
  score,
  counterproductive,
  quote: score === null ? '' : 'deploy luôn',
  rationale: '',
});

const PENDING: CombineOptions = {
  disagreementThreshold: 1,
  whenOneJudgeDown: 'pending',
};
const LOWER: CombineOptions = {
  disagreementThreshold: 1,
  whenOneJudgeDown: 'lower_of_2',
};

const one = (panel: Array<JudgeScore | null>, options = PENDING) =>
  combineJudgments(
    ['k1'],
    panel.map((s) => [j(s)]),
    options,
  );

describe('combineJudgments', () => {
  it('ba judge: lấy trung vị, lệch 1 mức không gắn cờ', () => {
    const v = one([0, 1, 0]);
    expect(v).toMatchObject({
      status: 'graded',
      method: 'median_of_3',
      panelSize: 3,
    });
    if (v.status !== 'graded') throw new Error();
    expect(v.grades[0]).toMatchObject({
      score: 0,
      highDisagreement: false,
      judgeScores: [0, 1, 0],
    });
  });

  it('lệch hơn 1 mức thì gắn cờ cho chuyên gia', () => {
    const v = one([0, 2, 2]);
    if (v.status !== 'graded') throw new Error();
    expect(v.grades[0]).toMatchObject({ score: 2, highDisagreement: true });
  });

  it('một ghế hỏng, theo D-108: điểm chờ, không lấy trung vị của hai', () => {
    expect(one([1, 2])).toEqual({
      status: 'pending',
      panelSize: 2,
      reason: 'one_judge_down',
    });
  });

  it('một ghế hỏng, theo SD-01: lấy mức thấp hơn của hai', () => {
    const v = one([1, 2], LOWER);
    expect(v).toMatchObject({
      status: 'graded',
      method: 'lower_of_2',
      panelSize: 2,
    });
    if (v.status !== 'graded') throw new Error();
    expect(v.grades[0].score).toBe(1);
  });

  it('chỉ còn một judge thì luôn chờ', () => {
    expect(one([2], LOWER)).toMatchObject({
      status: 'pending',
      reason: 'too_few_judges',
    });
  });

  it('không xét khi đa số judge nói không xét', () => {
    const v = one([null, null, 2]);
    if (v.status !== 'graded') throw new Error();
    expect(v.grades[0]).toMatchObject({ score: null, highDisagreement: true });
  });

  it('một judge nói không xét: lấy mức thấp hơn của hai judge còn lại và gắn cờ', () => {
    const v = one([null, 1, 2]);
    if (v.status !== 'graded') throw new Error();
    expect(v.grades[0]).toMatchObject({ score: 1, highDisagreement: true });
  });

  it('cờ phản tác dụng theo đa số', () => {
    const v = combineJudgments(
      ['k1'],
      [[j(1, true)], [j(1, true)], [j(1, false)]],
      PENDING,
    );
    if (v.status !== 'graded') throw new Error();
    expect(v.grades[0].counterproductive).toBe(true);

    const w = combineJudgments(
      ['k1'],
      [[j(1, true)], [j(1, false)], [j(1, false)]],
      PENDING,
    );
    if (w.status !== 'graded') throw new Error();
    expect(w.grades[0].counterproductive).toBe(false);
  });

  it('gộp từng tiêu chí riêng', () => {
    const judge = (a: JudgeScore, b: JudgeScore) => [
      j(a, false, 'k1'),
      j(b, false, 'k2'),
    ];
    const v = combineJudgments(
      ['k1', 'k2'],
      [judge(2, 0), judge(2, 1), judge(1, 1)],
      PENDING,
    );
    if (v.status !== 'graded') throw new Error();
    expect(v.grades.map((g) => [g.criterionId, g.score])).toEqual([
      ['k1', 2],
      ['k2', 1],
    ]);
  });
});
