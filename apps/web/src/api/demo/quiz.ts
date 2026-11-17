import { profile } from '@datn/game-core';
import { ApiError, type QuizService } from '../port';
import type { QuizResult, RiasecAxis, RegionId } from '../types';
import { baseCatalogue } from './data';
import riasecJson from './fixtures/riasec.json';
import { quizForm, reasons } from './content';
import { clone, player, save, service } from './store';
const scores = riasecJson as Record<string, Record<RiasecAxis, number>>;
export function pearson(a: number[], b: number[]): number {
  const meanA = a.reduce((s, n) => s + n, 0) / a.length,
    meanB = b.reduce((s, n) => s + n, 0) / b.length;
  const numerator = a.reduce((s, n, i) => s + (n - meanA) * (b[i] - meanB), 0);
  const denom = Math.sqrt(
    a.reduce((s, n) => s + (n - meanA) ** 2, 0) *
      b.reduce((s, n) => s + (n - meanB) ** 2, 0),
  );
  return denom ? numerator / denom : 0;
}
export const quiz: QuizService = {
  form: service(() => quizForm),
  submit: service((answers) => {
    const p = player();
    if (Object.values(answers.cards).some((t) => ![1, 2, 3].includes(t)))
      throw new ApiError(
        400,
        'INVALID_TAP',
        'Mỗi thẻ cần chọn một trong ba mức.',
      );
    const axes = profile.RIASEC_AXES;
    const selfReported = Object.fromEntries(
      axes.map((axis) => [
        axis,
        profile.axisMean(
          quizForm.cards
            .filter((c) => c.axis === axis)
            .flatMap((c) => (answers.cards[c.id] ? [answers.cards[c.id]] : [])),
        ) ?? 2,
      ]),
    ) as Record<RiasecAxis, number>;
    const vector = axes.map((a) => selfReported[a]);
    const flat = profile.isFlatProfile(vector);
    const ranked = baseCatalogue.occupations
      .map((o) => ({
        ...o,
        fit: pearson(
          vector,
          axes.map((a) => scores[o.code][a]),
        ),
      }))
      .sort((a, b) => b.fit - a.fit || a.code.localeCompare(b.code));
    const regions: readonly RegionId[] = flat
      ? (['ky_thuat', 'sang_tao', 'suc_khoe'] as const)
      : [...baseCatalogue.regions]
          .sort(
            (a, b) =>
              (answers.cards[`c3-${b.id}`] ?? 2) -
                (answers.cards[`c3-${a.id}`] ?? 2) ||
              Math.max(
                ...ranked.filter((o) => o.regionId === b.id).map((o) => o.fit),
              ) -
                Math.max(
                  ...ranked
                    .filter((o) => o.regionId === a.id)
                    .map((o) => o.fit),
                ),
          )
          .slice(0, 3)
          .map((r) => r.id);
    const topAxis = [...axes].sort(
      (a, b) => selfReported[b] - selfReported[a],
    )[0];
    const chosen = flat
      ? regions
          .map((id) => ranked.find((o) => o.regionId === id)!)
          .filter(Boolean)
      : ranked.filter((o) => regions.includes(o.regionId)).slice(0, 3);
    const result: QuizResult = {
      selfReported,
      flat,
      regions: [...regions],
      goals: clone(answers.goals),
      interests: answers.interests
        .filter((i) => quizForm.interests.includes(i))
        .slice(0, 5),
      suggestions: chosen.map((o) => ({
        code: o.code,
        name: o.name,
        group: o.group,
        regionId: o.regionId,
        playable: o.playable,
        reason: flat
          ? 'Bạn chưa nghiêng rõ về hướng nào, thử vài kiểu khác nhau nhé'
          : reasons[topAxis],
      })),
    };
    p.quiz = result;
    p.goals = result.goals;
    p.interests = result.interests;
    p.me.quizDone = true;
    save();
    return result;
  }),
  current: service(() => player().quiz),
  deleteAboutMe: service(() => {
    const p = player();
    p.interests = [];
    p.goals = null;
    if (p.quiz) {
      p.quiz.interests = [];
      p.quiz.goals = {};
    }
    save();
  }),
};
