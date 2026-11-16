import { ApiError, type FeedbackService } from '../port';
import type { RatingForm } from '../types';
import { criteria } from './content';
import { loadProfile } from './data';
import { completed } from './rules';
import { db, player, save, service } from './store';
export function ratingSummary(code: string): RatingForm['summary'] {
  const responses = db.players.flatMap((p) =>
    p.ratings[code] ? [p.ratings[code]] : [],
  );
  const withheld = responses.length < 5;
  return {
    responseCount: responses.length,
    withheld,
    averages: withheld
      ? {}
      : Object.fromEntries(
          criteria.map((c) => [
            c.code,
            responses.reduce((sum, r) => sum + r[c.code], 0) / responses.length,
          ]),
        ),
  };
}
async function form(code: string): Promise<RatingForm> {
  const p = player(),
    o = await loadProfile(code);
  const locked = !o.levels.every((l) => completed(p, code, l.band));
  return {
    occupationCode: code,
    occupationName: o.name,
    locked,
    lockedReason: locked
      ? 'Bạn cần hoàn thành tất cả cấp của nghề trước khi đánh giá.'
      : null,
    criteria,
    mine: p.ratings[code] ?? null,
    summary: ratingSummary(code),
  };
}
export const feedback: FeedbackService = {
  ratingForm: service(form),
  rate: service(async (code, scores, comment) => {
    const f = await form(code);
    if (f.locked) throw new ApiError(403, 'RATING_LOCKED', f.lockedReason!);
    if (
      criteria.some(
        (c) =>
          !Number.isInteger(scores[c.code]) ||
          scores[c.code] < 1 ||
          scores[c.code] > 5,
      ) ||
      Object.keys(scores).length !== criteria.length
    )
      throw new ApiError(
        400,
        'INVALID_RATING',
        'Hãy chọn đủ năm tiêu chí, mỗi tiêu chí từ 1 đến 5.',
      );
    const p = player();
    p.ratings[code] = { ...scores };
    if (comment !== undefined) p.ratingComments[code] = comment.trim();
    save();
  }),
  sendAppFeedback: service((input) => {
    if (!input.message.trim())
      throw new ApiError(
        400,
        'EMPTY_FEEDBACK',
        'Bạn chưa nhập nội dung góp ý.',
      );
    player().feedback.push(input);
    save();
  }),
};
