/**
 * Chỉ số xã hội (social-orientation index, FR-13 / DR-13).
 *
 * Đo một thứ: người chơi thích làm việc QUA CON NGƯỜI hay QUA HỆ THỐNG, CÔNG
 * CỤ, DỮ LIỆU. Đây là trục People–Things trong World-of-Work map của Prediger
 * (1982), vốn suy ra từ RIASEC. Thang 0–100: 0 là hoàn toàn thiên về vật,
 * 100 là hoàn toàn thiên về người.
 *
 * Nguồn:
 *   - bài tự vấn: các câu chọn có `orientation`, cộng câu tự luận AI đọc được
 *   - khi chơi: lựa chọn ở nhiệm vụ phụ, lấy dấu của tín hiệu PEOPLE
 *
 * Chỉ tính người chơi CHỌN gì, không tính họ làm TỐT tới đâu: đây là thiên
 * hướng, không phải năng lực.
 *
 * Trộn: bài tự vấn là "điểm tựa" nặng bằng PRIOR_WEIGHT lựa chọn khi chơi,
 * nên lúc đầu bài tự vấn quyết định, chơi càng nhiều thì lựa chọn thật càng
 * lấn át. Không làm bài thì điểm tựa là 0 (trung tính).
 */
import type { GameIndex } from '../data/indexes.js';
import type { OrientationTally } from './quiz.js';

/** Bài tự vấn nặng bằng chừng này lựa chọn khi chơi. */
export const PRIOR_WEIGHT = 6;
/** Độ dốc của tanh: trung bình ±1 ứng với khoảng 12 / 88. */
const SLOPE = 1;
/** Mỗi lựa chọn đóng góp tối đa ±2, bằng một câu chọn "rất đúng". */
const PLAY_CAP = 2;

export type SocialLabel = 'things' | 'balanced' | 'people';

export const SOCIAL_BANDS: ReadonlyArray<{ label: SocialLabel; min: number }> =
  [
    { label: 'things', min: 0 },
    { label: 'balanced', min: 35 },
    { label: 'people', min: 66 },
  ];

export interface SocialIndex {
  /** 0–100. */
  value: number;
  label: SocialLabel;
  basis: {
    /** Số câu trong bài tự vấn có nói về trục này. */
    quizItems: number;
    /** Số lựa chọn khi chơi có nói về trục này. */
    playChoices: number;
  };
}

export const socialLabel = (value: number): SocialLabel =>
  [...SOCIAL_BANDS].reverse().find((b) => value >= b.min)?.label ?? 'things';

/** Trục Người–Vật từ các nhiệm vụ phụ đã trả lời. */
export function orientationFromEvents(
  answers: ReadonlyArray<{
    roleCode: string;
    eventId: string;
    choiceIndex: number;
  }>,
  index: GameIndex,
): OrientationTally {
  const tally: OrientationTally = { sum: 0, n: 0 };
  for (const answer of answers) {
    const role = index.findRole(answer.roleCode);
    const event = role ? index.findEvent(role, answer.eventId) : undefined;
    const people = event?.choices[answer.choiceIndex]?.signal['PEOPLE'] ?? 0;
    if (people === 0) continue;
    tally.sum += Math.max(-PLAY_CAP, Math.min(PLAY_CAP, people));
    tally.n += 1;
  }
  return tally;
}

/** `null` khi chưa có gì để nói — giao diện nói "chưa có" thay vì hiện 50. */
export function socialIndex(input: {
  quiz: OrientationTally;
  play: OrientationTally;
}): SocialIndex | null {
  const { quiz, play } = input;
  if (quiz.n === 0 && play.n === 0) return null;

  const prior = quiz.n > 0 ? quiz.sum / quiz.n : 0;
  const mean = (PRIOR_WEIGHT * prior + play.sum) / (PRIOR_WEIGHT + play.n);
  const value = Math.round(50 + 50 * Math.tanh(mean / SLOPE));

  return {
    value,
    label: socialLabel(value),
    basis: { quizItems: quiz.n, playChoices: play.n },
  };
}
