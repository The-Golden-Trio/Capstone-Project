/**
 * Workstyle của người chơi (FR-13 / DR-13): cách họ thích làm việc, đo bằng
 * vị trí trên World-of-Work Map.
 *
 * Prediger (1982) chỉ ra rằng sáu nhóm sở thích RIASEC của Holland nằm trên
 * hai trục độc lập, và ACT dùng hai trục đó để vẽ World-of-Work Map:
 *
 *   - People ↔ Things: làm việc qua con người (giúp đỡ, thuyết phục, điều
 *     phối) hay qua vật (máy móc, công cụ, hệ thống, code)
 *   - Data ↔ Ideas: làm với dữ kiện, số liệu, quy trình có hệ thống, hay với
 *     trừu tượng, lý thuyết, cách làm mới
 *
 * Mỗi trục thang 0–100 (100 = People, 100 = Data). Hai trục cùng nhau đặt
 * người chơi vào một trong sáu kiểu workstyle, ứng với sáu loại RIASEC và đặt
 * tên theo biệt danh thường dùng của Holland: Doer (R), Thinker (I), Creator
 * (A), Helper (S), Persuader (E), Organizer (C). Kiểu nằm giữa hai loại thì
 * góc cũng nằm giữa, đúng như hình lục giác của Holland.
 *
 * Nguồn tín hiệu, mỗi tín hiệu trong −2…+2:
 *   - bài tự vấn: câu chọn có giá trị trục, cộng câu kể AI đọc được (kèm trích
 *     dẫn)
 *   - khi chơi: lựa chọn ở nhiệm vụ phụ, quy từ tín hiệu 8 chiều của lựa chọn
 *     đó (xem `playAxes`)
 *
 * Chỉ tính người chơi CHỌN gì, không tính họ làm TỐT tới đâu: đây là thiên
 * hướng, không phải năng lực. Không vùng nào "tốt hơn".
 */
import type { GameIndex } from '../data/indexes.js';
import type { Signal } from '../data/schema.js';

export type WorkstyleAxis = 'peopleThings' | 'dataIdeas';
export const WORKSTYLE_AXES: readonly WorkstyleAxis[] = [
  'peopleThings',
  'dataIdeas',
];

/** Tổng tín hiệu và số câu/lựa chọn đã nói về một trục. */
export interface AxisTally {
  sum: number;
  n: number;
}
export type AxisTallies = Record<WorkstyleAxis, AxisTally>;

export const blankTallies = (): AxisTallies => ({
  peopleThings: { sum: 0, n: 0 },
  dataIdeas: { sum: 0, n: 0 },
});

/**
 * Sáu kiểu workstyle, đặt theo hệ số của Prediger (1982):
 *   Data/Ideas    = 1.73E + 1.73C − 1.73I − 1.73A
 *   People/Things = 2S + E + A − 2R − I − C
 * Tức là S nằm hẳn về People, R hẳn về Things, E/C phía Data, I/A phía Ideas.
 * `angle` là góc (độ) trên mặt phẳng x = People–Things, y = Data–Ideas.
 * `style` là biệt danh của Holland; tên tiếng Việt nằm ở giao diện.
 */
export const WORKSTYLE_REGIONS = [
  { code: 'S', style: 'helper', angle: 0 },
  { code: 'E', style: 'persuader', angle: 60 },
  { code: 'C', style: 'organizer', angle: 120 },
  { code: 'R', style: 'doer', angle: 180 },
  { code: 'I', style: 'thinker', angle: 240 },
  { code: 'A', style: 'creator', angle: 300 },
] as const;

export type WorkstyleRegionCode = (typeof WORKSTYLE_REGIONS)[number]['code'];
/** `center`: hai trục đều gần giữa, chưa nghiêng hẳn về vùng nào. */
export type WorkstyleRegion = WorkstyleRegionCode | 'center';

/** Bài tự vấn nặng bằng chừng này lựa chọn khi chơi, trên mỗi trục. */
export const PRIOR_WEIGHT = 6;
/** Mỗi tín hiệu tối đa ±2, bằng một câu chọn "rất giống". */
const SIGNAL_CAP = 2;
/** Gần tâm hơn bán kính này (thang −1…1) thì coi là chưa nghiêng về vùng nào. */
const CENTER_RADIUS = 0.25;

export interface Workstyle {
  /** 0–100, 100 = thiên về con người. */
  peopleThings: number;
  /** 0–100, 100 = thiên về dữ kiện, quy trình. */
  dataIdeas: number;
  region: WorkstyleRegion;
  basis: Record<WorkstyleAxis, { quizItems: number; playChoices: number }>;
}

const clamp = (v: number) => Math.max(-SIGNAL_CAP, Math.min(SIGNAL_CAP, v));

/** Quy tín hiệu 8 chiều của một lựa chọn khi chơi ra hai trục. */
export function playAxes(signal: Signal): Record<WorkstyleAxis, number> {
  return {
    // PEOPLE là chiều duy nhất nói thẳng về làm việc với người.
    peopleThings: clamp(signal['PEOPLE'] ?? 0),
    // Data = chính xác, có hệ thống, theo quy trình; Ideas = chấp nhận mơ hồ
    // để tự tìm cách làm. Ánh xạ của nhóm, không phải của Prediger.
    dataIdeas: clamp(
      (signal['DETAIL'] ?? 0) +
        (signal['REPETITION'] ?? 0) -
        (signal['AMBIGUITY'] ?? 0),
    ),
  };
}

/** Hai trục từ các nhiệm vụ phụ đã trả lời. */
export function tallyEvents(
  answers: ReadonlyArray<{
    roleCode: string;
    eventId: string;
    choiceIndex: number;
  }>,
  index: GameIndex,
): AxisTallies {
  const tallies = blankTallies();
  for (const answer of answers) {
    const role = index.findRole(answer.roleCode);
    const event = role ? index.findEvent(role, answer.eventId) : undefined;
    const signal = event?.choices[answer.choiceIndex]?.signal;
    if (!signal) continue;
    const axes = playAxes(signal);
    for (const axis of WORKSTYLE_AXES) {
      if (axes[axis] === 0) continue;
      tallies[axis].sum += axes[axis];
      tallies[axis].n += 1;
    }
  }
  return tallies;
}

/** Cộng hai bộ tổng — ví dụ câu chọn và câu kể của bài tự vấn. */
export function addTallies(a: AxisTallies, b: AxisTallies): AxisTallies {
  const out = blankTallies();
  for (const axis of WORKSTYLE_AXES) {
    out[axis] = { sum: a[axis].sum + b[axis].sum, n: a[axis].n + b[axis].n };
  }
  return out;
}

/** Trung bình có trọng số của một trục, −2…+2. Bài tự vấn là điểm tựa. */
function axisMean(quiz: AxisTally, play: AxisTally): number {
  const prior = quiz.n > 0 ? quiz.sum / quiz.n : 0;
  return (PRIOR_WEIGHT * prior + play.sum) / (PRIOR_WEIGHT + play.n);
}

/** Vùng gần nhất theo góc. `x`, `y` trong −1…1. */
export function workstyleRegion(x: number, y: number): WorkstyleRegion {
  if (Math.hypot(x, y) < CENTER_RADIUS) return 'center';
  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  const distance = (a: number) => {
    const d = Math.abs(((angle - a) % 360) + 360) % 360;
    return Math.min(d, 360 - d);
  };
  return [...WORKSTYLE_REGIONS].sort(
    (a, b) => distance(a.angle) - distance(b.angle),
  )[0].code;
}

/** `null` khi chưa có gì để nói — giao diện nói "chưa có" thay vì vẽ ở tâm. */
export function workstyle(input: {
  quiz: AxisTallies;
  play: AxisTallies;
}): Workstyle | null {
  const { quiz, play } = input;
  if (
    WORKSTYLE_AXES.every((axis) => quiz[axis].n === 0 && play[axis].n === 0)
  ) {
    return null;
  }

  const x = Math.tanh(axisMean(quiz.peopleThings, play.peopleThings));
  const y = Math.tanh(axisMean(quiz.dataIdeas, play.dataIdeas));
  const toScale = (v: number) => Math.round(50 + 50 * v);

  return {
    peopleThings: toScale(x),
    dataIdeas: toScale(y),
    region: workstyleRegion(x, y),
    basis: {
      peopleThings: {
        quizItems: quiz.peopleThings.n,
        playChoices: play.peopleThings.n,
      },
      dataIdeas: { quizItems: quiz.dataIdeas.n, playChoices: play.dataIdeas.n },
    },
  };
}
