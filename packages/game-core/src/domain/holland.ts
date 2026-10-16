/**
 * Mã Holland: chấm bài RIASEC nhiều dạng câu (đặc tả §3–4,
 * `docs/project-hub/assets/jobquest-get-to-know-me.md`).
 *
 * Mỗi dạng câu được quy về thang 0–1 cho từng kiểu, gộp theo dạng trước rồi
 * mới gộp giữa các dạng — để một dạng có nhiều câu (MaxDiff 3 lượt, chọn
 * nhiều 12 thẻ) không nặng hơn dạng chỉ có một câu.
 *
 * Câu kể ngắn không chấm ở đây: cần AI đọc, nên chỉ có khi có máy chủ.
 */
import { workstyleRegion, type WorkstyleRegion } from './workstyle.js';

export const RIASEC = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type RiasecType = (typeof RIASEC)[number];
export type RiasecVector = Record<RiasecType, number>;

/** Góc của từng kiểu trên lục giác (Prediger 1982), khớp `WORKSTYLE_REGIONS`. */
const ANGLE: RiasecVector = { S: 0, E: 60, C: 120, R: 180, I: 240, A: 300 };

export interface HollandOption {
  id: string;
  type: RiasecType;
}

export type HollandQuestion =
  | { id: string; kind: 'stage'; options: { id: string }[] }
  | { id: string; kind: 'multi'; options: HollandOption[] }
  | { id: string; kind: 'likert'; options: HollandOption[] }
  | { id: string; kind: 'rank'; options: HollandOption[] }
  | { id: string; kind: 'maxdiff'; options: HollandOption[] }
  | { id: string; kind: 'allocate'; total: number; options: HollandOption[] }
  | { id: string; kind: 'pick'; count: number; options: HollandOption[] }
  | {
      id: string;
      kind: 'slider';
      pairs: { id: string; left: RiasecType; right: RiasecType }[];
    }
  | { id: string; kind: 'text'; minLength: number; maxLength: number };

export type HollandKind = HollandQuestion['kind'];

/** Câu trả lời theo từng dạng. */
export type HollandAnswer =
  | { kind: 'stage'; optionId: string }
  | { kind: 'multi'; selected: string[] }
  | { kind: 'likert'; ratings: Record<string, number> }
  | { kind: 'rank'; order: string[] }
  | { kind: 'maxdiff'; best: string; worst: string }
  | { kind: 'allocate'; points: Record<string, number> }
  | { kind: 'pick'; selected: string[] }
  | { kind: 'slider'; values: Record<string, number> }
  | { kind: 'text'; text: string };

export type HollandAnswers = Record<string, HollandAnswer>;

export class HollandAnswerError extends Error {}

/** Dạng nào là tuyệt đối (đo được mức hứng thú chung). */
export const NORMATIVE_KINDS: readonly HollandKind[] = ['multi', 'likert'];

export type Differentiation = 'flat' | 'moderate' | 'clear';
export type Consistency = 'high' | 'medium' | 'low';

export interface HollandResult {
  /** 0–100 cho từng kiểu. */
  scores: RiasecVector;
  /** Ba kiểu cao nhất, ví dụ "IRC". */
  code: string;
  /** Như `code` nhưng ghi rõ chỗ ngang nhau, ví dụ "I/R C". */
  codeDisplay: string;
  differentiation: { value: number; level: Differentiation };
  consistency: Consistency;
  /** Mức hứng thú chung 0–100, chỉ từ dạng tuyệt đối. `null` khi chưa có. */
  elevation: number | null;
  /** Vị trí World-of-Work tính từ 6 điểm, để hiển thị. */
  position: {
    x: number;
    y: number;
    peopleThings: number;
    dataIdeas: number;
    region: WorkstyleRegion;
  };
  /** Số dạng câu đã góp vào từng kiểu. */
  observations: RiasecVector;
}

/** Hai điểm chênh nhau dưới chừng này thì coi là ngang nhau. */
export const TIE_MARGIN = 5;
const DIFFERENTIATION_STEPS = { moderate: 20, clear: 40 };

const blank = (): RiasecVector => ({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });

type Observation = { type: RiasecType; value: number };

function fail(question: HollandQuestion, why: string): never {
  throw new HollandAnswerError(`Câu ${question.id}: ${why}`);
}

/** Quy một câu trả lời về các quan sát 0–1. */
function observe(
  question: HollandQuestion,
  answer: HollandAnswer,
): Observation[] {
  if (answer.kind !== question.kind) fail(question, 'sai dạng trả lời');
  const typeOf = (id: string): RiasecType => {
    const options: ReadonlyArray<{ id: string; type?: RiasecType }> =
      'options' in question ? question.options : [];
    const type = options.find((o) => o.id === id)?.type;
    if (!type) fail(question, `lựa chọn lạ ${id}`);
    return type;
  };

  switch (question.kind) {
    case 'stage':
    case 'text':
      return [];

    case 'multi': {
      const selected = new Set((answer as { selected: string[] }).selected);
      for (const id of selected) typeOf(id);
      return question.options.map((o) => ({
        type: o.type,
        value: selected.has(o.id) ? 1 : 0,
      }));
    }

    case 'likert': {
      const { ratings } = answer as { ratings: Record<string, number> };
      return question.options.map((o) => {
        const r = ratings[o.id];
        if (!Number.isInteger(r) || r < 1 || r > 5) fail(question, 'mức 1–5');
        return { type: o.type, value: (r - 1) / 4 };
      });
    }

    case 'rank': {
      const { order } = answer as { order: string[] };
      const n = question.options.length;
      if (order.length !== n || new Set(order).size !== n) {
        fail(question, 'phải xếp đủ mọi lựa chọn');
      }
      return order.map((id, i) => ({
        type: typeOf(id),
        value: (n - 1 - i) / (n - 1),
      }));
    }

    case 'maxdiff': {
      const { best, worst } = answer as { best: string; worst: string };
      typeOf(best);
      typeOf(worst);
      if (best === worst)
        fail(question, 'thích nhất và ít thích nhất phải khác nhau');
      return question.options.map((o) => ({
        type: o.type,
        value: o.id === best ? 1 : o.id === worst ? 0 : 0.5,
      }));
    }

    case 'allocate': {
      const { points } = answer as { points: Record<string, number> };
      let sum = 0;
      const out = question.options.map((o) => {
        const p = points[o.id] ?? 0;
        if (!Number.isInteger(p) || p < 0)
          fail(question, 'điểm phải là số nguyên ≥ 0');
        sum += p;
        return { type: o.type, value: p / question.total };
      });
      if (sum !== question.total)
        fail(question, `phải chia đủ ${question.total} điểm`);
      return out;
    }

    case 'pick': {
      const selected = new Set((answer as { selected: string[] }).selected);
      if (selected.size !== question.count)
        fail(question, `phải chọn đúng ${question.count}`);
      for (const id of selected) typeOf(id);
      return question.options.map((o) => ({
        type: o.type,
        value: selected.has(o.id) ? 1 : 0,
      }));
    }

    case 'slider': {
      const { values } = answer as { values: Record<string, number> };
      return question.pairs.flatMap((pair) => {
        const t = values[pair.id] ?? 0;
        if (!Number.isInteger(t) || t < -3 || t > 3)
          fail(question, 'thanh trượt −3…3');
        const right = (t + 3) / 6;
        return [
          { type: pair.right, value: right },
          { type: pair.left, value: 1 - right },
        ];
      });
    }
  }
}

/** Kiểu cách nhau bao nhiêu bước trên lục giác: 1 kề, 2 cách một, 3 đối diện. */
export function hexagonDistance(a: RiasecType, b: RiasecType): number {
  const d = Math.abs(RIASEC.indexOf(a) - RIASEC.indexOf(b));
  return Math.min(d, 6 - d);
}

export function consistencyOf(a: RiasecType, b: RiasecType): Consistency {
  const d = hexagonDistance(a, b);
  return d <= 1 ? 'high' : d === 2 ? 'medium' : 'low';
}

/**
 * Vị trí World-of-Work từ 6 điểm: trừ trung bình (bỏ mức hứng thú chung) rồi
 * cộng véc-tơ theo góc của từng kiểu. Kết quả bằng đúng một nửa công thức
 * Prediger, chia 100 để một hồ sơ chỉ nhọn ở một kiểu nằm ở bán kính 1.
 */
export function hollandPosition(
  scores: RiasecVector,
): HollandResult['position'] {
  const mean = RIASEC.reduce((s, k) => s + scores[k], 0) / RIASEC.length;
  let x = 0;
  let y = 0;
  for (const k of RIASEC) {
    const rad = (ANGLE[k] * Math.PI) / 180;
    x += (scores[k] - mean) * Math.cos(rad);
    y += (scores[k] - mean) * Math.sin(rad);
  }
  x /= 100;
  y /= 100;
  const toScale = (v: number) =>
    Math.round(50 + 50 * Math.max(-1, Math.min(1, v)));
  return {
    x,
    y,
    peopleThings: toScale(x),
    dataIdeas: toScale(y),
    region: workstyleRegion(x, y),
  };
}

/** `null` khi chưa có câu nào được chấm. */
export function scoreHolland(
  questions: readonly HollandQuestion[],
  answers: HollandAnswers,
): HollandResult | null {
  // kiểu → dạng câu → các giá trị
  const byKind = new Map<HollandKind, Record<RiasecType, number[]>>();

  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) continue;
    for (const { type, value } of observe(question, answer)) {
      const perType =
        byKind.get(question.kind) ??
        ({ R: [], I: [], A: [], S: [], E: [], C: [] } as Record<
          RiasecType,
          number[]
        >);
      perType[type].push(value);
      byKind.set(question.kind, perType);
    }
  }
  if (byKind.size === 0) return null;

  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const scores = blank();
  const observations = blank();
  const normative: number[] = [];

  for (const k of RIASEC) {
    const perKind: number[] = [];
    for (const [kind, perType] of byKind) {
      if (perType[k].length === 0) continue;
      const v = mean(perType[k]);
      perKind.push(v);
      if (NORMATIVE_KINDS.includes(kind)) normative.push(v);
    }
    observations[k] = perKind.length;
    scores[k] = perKind.length ? Math.round(100 * mean(perKind)) : 0;
  }

  // Xếp giảm dần; ngang điểm thì giữ thứ tự RIASEC để kết quả tất định.
  const ranked = [...RIASEC].sort((a, b) => scores[b] - scores[a]);
  const code = ranked.slice(0, 3).join('');
  let codeDisplay = ranked[0] as string;
  for (let i = 1; i < 4; i++) {
    const tied = scores[ranked[i - 1]] - scores[ranked[i]] < TIE_MARGIN;
    if (i === 3) {
      if (tied) codeDisplay += `/${ranked[3]}`;
    } else {
      codeDisplay += (tied ? '/' : ' ') + ranked[i];
    }
  }

  const spread = scores[ranked[0]] - scores[ranked[5]];

  return {
    scores,
    code,
    codeDisplay,
    differentiation: {
      value: spread,
      level:
        spread >= DIFFERENTIATION_STEPS.clear
          ? 'clear'
          : spread >= DIFFERENTIATION_STEPS.moderate
            ? 'moderate'
            : 'flat',
    },
    consistency: consistencyOf(ranked[0], ranked[1]),
    elevation: normative.length ? Math.round(100 * mean(normative)) : null,
    position: hollandPosition(scores),
    observations,
  };
}
