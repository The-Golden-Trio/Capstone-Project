/**
 * Luật chấm theo checklist có/không (D-116, spec-checklist-softskill v4.1).
 * Thuần: nhận câu trả lời đã có của judge, trả mức và cờ. Không gọi model.
 *
 * Judge KHÔNG tự cho mức. Với mỗi (mục con, đoạn) nó trả lời ba câu A/B/C,
 * mỗi "có" kèm câu trích; code kiểm câu trích rồi quy ra mức:
 *   không có A → 0 · A → 1 · A và (B hoặc C) → 2 · mục con không xét → null.
 *
 * Thứ tự dùng trong panel (xem `JudgePanelService.gradeChecklist`):
 *   1. `checkOutput`      kiểm câu trích của MỘT judge (luật 6);
 *   2. `normalizeFlags`   mỗi loại cờ một lần, cặp gần nhau chỉ giữ cờ cụ thể;
 *   3. `consensusFlags`   cờ theo đa số các judge;
 *   4. `pairLevels`       mức từng (mục con, đoạn) của một judge, đã ép về 0;
 *   5. (API) gộp mức giữa các judge bằng `combineJudgments`;
 *   6. `subLevels`        mức mục con trong màn = trung bình các đoạn;
 *   7. `groupScores`      điểm nhóm, CHỈ khi caller đưa trần nhóm.
 */
import {
  type FlagCode,
  type SoftGroupNo,
  checklistFlag,
  checklistItem,
  HARD_FLAGS,
  isFlagCode,
} from './library.js';
import {
  findTurn,
  turnsOf,
  verifyQuote,
  type EvidenceSegment,
} from './evidence.js';
import type { ObserveItem } from './observe.js';

export type Level = 0 | 1 | 2;

/* ── Đầu ra thô của judge ─────────────────────────────────────────────── */

export interface RawAnswer {
  yes: boolean;
  quote: string;
  /** Mã lượt nói hoặc hành động chứa câu trích. */
  turn: string;
}

export interface RawItem {
  sub: string;
  /** Id đoạn bằng chứng. */
  segment: string;
  applicable: boolean;
  A: RawAnswer;
  B: RawAnswer;
  C: RawAnswer;
}

export interface RawFlag {
  code: string;
  quote: string;
  turn: string;
}

export interface RawOutput {
  items: RawItem[];
  flags: RawFlag[];
}

/* ── Sau khi code kiểm ────────────────────────────────────────────────── */

export interface CheckedAnswer extends RawAnswer {
  /** `yes` VÀ câu trích khớp đúng lượt nói của đúng đoạn. Chỉ cái này tính. */
  valid: boolean;
}

export interface CheckedItem {
  sub: string;
  segment: string;
  applicable: boolean;
  A: CheckedAnswer;
  B: CheckedAnswer;
  C: CheckedAnswer;
}

export interface CheckedFlag {
  code: FlagCode;
  quote: string;
  turn: string;
  /** Đoạn chứa lượt vi phạm. */
  segment: string;
}

export interface CheckedOutput {
  items: CheckedItem[];
  flags: CheckedFlag[];
  /** Câu "có" hay cờ bị bỏ vì câu trích không khớp (tính là "không", luật 6). */
  rejected: string[];
}

export function checkOutput(
  segments: readonly EvidenceSegment[],
  raw: RawOutput,
): CheckedOutput {
  const rejected: string[] = [];
  const check = (
    segment: EvidenceSegment,
    answer: RawAnswer,
    applicable: boolean,
    label: string,
  ): CheckedAnswer => {
    if (!applicable || !answer.yes) return { ...answer, valid: false };
    const valid = verifyQuote(segment, answer.turn, answer.quote);
    if (!valid)
      rejected.push(
        `${label}: câu trích "${answer.quote}" không khớp lượt ${answer.turn || '(trống)'}`,
      );
    return { ...answer, valid };
  };

  const items = raw.items.flatMap((item): CheckedItem[] => {
    const segment = segments.find((s) => s.id === item.segment);
    if (!segment) return [];
    const where = `${item.sub}@${item.segment}`;
    return [
      {
        sub: item.sub,
        segment: item.segment,
        applicable: item.applicable,
        A: check(segment, item.A, item.applicable, `${where} A`),
        B: check(segment, item.B, item.applicable, `${where} B`),
        C: check(segment, item.C, item.applicable, `${where} C`),
      },
    ];
  });

  const flags = raw.flags.flatMap((flag): CheckedFlag[] => {
    const found = findTurn(segments, flag.turn);
    if (
      !isFlagCode(flag.code) ||
      !found ||
      !verifyQuote(found.segment, flag.turn, flag.quote)
    ) {
      rejected.push(
        `cờ ${flag.code}: câu trích "${flag.quote}" không khớp lượt ${flag.turn || '(trống)'}`,
      );
      return [];
    }
    return [
      {
        code: flag.code,
        quote: flag.quote,
        turn: flag.turn,
        segment: found.segment.id,
      },
    ];
  });

  return { items, flags, rejected };
}

/* ── Mức ──────────────────────────────────────────────────────────────── */

/** Không có A → 0; A → 1; A và (B hoặc C) → 2; mục con không xét → null. */
export function itemLevel(item: CheckedItem): Level | null {
  if (!item.applicable) return null;
  if (!item.A.valid) return 0;
  return item.B.valid || item.C.valid ? 2 : 1;
}

/* ── Cờ ───────────────────────────────────────────────────────────────── */

/** Cặp gần nhau: khi cùng một lượt có cả hai, chỉ giữ cờ cụ thể (spec, "Cách áp dụng cờ"). */
const SPECIFIC_OVER: ReadonlyArray<
  readonly [specific: FlagCode, general: FlagCode]
> = [
  ['C12', 'C1'],
  ['C5', 'C4'],
  ['C8', 'C13'],
  ['C6', 'C8'],
];

/**
 * Cờ của một judge: mỗi loại tối đa một lần mỗi màn (lấy lần đầu), cặp gần
 * nhau trong cùng một lượt nói chỉ giữ cờ cụ thể hơn.
 */
export function normalizeFlags(flags: readonly CheckedFlag[]): CheckedFlag[] {
  const onceEach = flags.filter(
    (f, i) => flags.findIndex((g) => g.code === f.code) === i,
  );
  return onceEach.filter(
    (f) =>
      !SPECIFIC_OVER.some(
        ([specific, general]) =>
          f.code === general &&
          onceEach.some((g) => g.code === specific && g.turn === f.turn),
      ),
  );
}

export interface FlagInstance {
  code: FlagCode;
  /** Nhóm nhận phạt theo bảng đã chốt 5/11. */
  group: SoftGroupNo;
  quote: string;
  turn: string;
  segment: string;
  /** Số judge đã bật cờ này. */
  raisedBy: number;
  panelSize: number;
}

/**
 * Cờ theo đa số: hơn nửa số judge bật cùng một loại cờ (hai judge thì cả
 * hai). Luật tạm của code, chưa phải quyết định (giống `judge-combine`).
 * Câu trích và lượt lấy theo lượt được nhiều judge nêu nhất, hoà thì theo thứ
 * tự ghế.
 */
export function consensusFlags(
  panel: ReadonlyArray<readonly CheckedFlag[]>,
): FlagInstance[] {
  const panelSize = panel.length;
  const out: FlagInstance[] = [];
  for (const code of new Set(panel.flatMap((p) => p.map((f) => f.code)))) {
    const raised = panel.flatMap((p) => p.filter((f) => f.code === code));
    if (raised.length * 2 <= panelSize) continue;
    const votes = new Map<string, number>();
    for (const f of raised) votes.set(f.turn, (votes.get(f.turn) ?? 0) + 1);
    const top = Math.max(...votes.values());
    const pick = raised.find((f) => votes.get(f.turn) === top) ?? raised[0];
    out.push({
      code,
      group: checklistFlag(code)?.group ?? 7,
      quote: pick.quote,
      turn: pick.turn,
      segment: pick.segment,
      raisedBy: raised.length,
      panelSize,
    });
  }
  return out;
}

/* ── Mức từng (mục con, đoạn) của một judge ───────────────────────────── */

export interface PairLevel {
  sub: string;
  segment: string;
  level: Level | null;
  /** Bị ép về 0 bởi cờ nặng C4, C5, C6, C8. */
  forcedZero: boolean;
  /** `timed_out`: hết giờ ở câu đếm giờ, mức 0 không qua judge (D-86). */
  fixed?: 'timed_out';
}

/**
 * Mức của một judge sau luật ép về 0: cờ nặng ép về 0 ở đoạn chứa lượt vi
 * phạm, với (a) mục con mang cờ đó trong cột Cờ, (b) mọi mục con có câu trích
 * nằm trong cùng lượt nói với câu vi phạm.
 *
 * (a) ép cả khi judge nói "không xét": seed đã dựng thì luôn xét (spec, luật 5).
 */
export function pairLevels(
  items: readonly CheckedItem[],
  flags: readonly FlagInstance[],
): PairLevel[] {
  const hard = flags.filter((f) => HARD_FLAGS.includes(f.code));
  return items.map((item) => {
    const level = itemLevel(item);
    const quotedTurns = [item.A, item.B, item.C]
      .filter((a) => a.valid)
      .map((a) => a.turn);
    const forced = hard.some(
      (f) =>
        f.segment === item.segment &&
        (checklistItem(item.sub)?.flags.includes(f.code) ||
          quotedTurns.includes(f.turn)),
    );
    return {
      sub: item.sub,
      segment: item.segment,
      level: forced ? 0 : level,
      forcedZero: forced,
    };
  });
}

/** Đoạn hết giờ ở câu đếm giờ: mức 0, không cờ, không cần judge (D-86). */
export function fixedPairLevels(
  segments: readonly EvidenceSegment[],
): PairLevel[] {
  return segments
    .filter((s) => s.outcome === 'timed_out')
    .flatMap((s) =>
      s.subs.map((sub): PairLevel => ({
        sub,
        segment: s.id,
        level: 0,
        forcedZero: false,
        fixed: 'timed_out',
      })),
    );
}

/** Các (mục con, đoạn) cần judge trả lời: bỏ đoạn hết giờ. */
export function expectedPairs(
  segments: readonly EvidenceSegment[],
): Array<{ sub: string; segment: string }> {
  return segments
    .filter((s) => s.outcome === 'answered' && turnsOf(s).length > 0)
    .flatMap((s) => s.subs.map((sub) => ({ sub, segment: s.id })));
}

/* ── Mục con trong màn, điểm nhóm ─────────────────────────────────────── */

export interface SubResult {
  sub: string;
  group: SoftGroupNo;
  segments: Array<{ segment: string; level: Level | null }>;
  /** Trung bình các đoạn có mức (0–2); `null` nếu mọi đoạn không xét. */
  level: number | null;
}

/** Mức mục con trong màn = trung bình mức các đoạn; "không xét" bỏ khỏi trung bình. */
export function subLevels(
  observes: readonly ObserveItem[],
  pairs: ReadonlyArray<Pick<PairLevel, 'sub' | 'segment' | 'level'>>,
): SubResult[] {
  return observes.map((o) => {
    const own = pairs.filter((p) => p.sub === o.sub);
    const numeric: number[] = own.flatMap((p) =>
      p.level === null ? [] : [p.level],
    );
    return {
      sub: o.sub,
      group: checklistItem(o.sub)?.group ?? 1,
      segments: own.map((p) => ({ segment: p.segment, level: p.level })),
      level:
        numeric.length === 0
          ? null
          : numeric.reduce((a, b) => a + b, 0) / numeric.length,
    };
  });
}

/** Hệ số phạt mỗi cờ theo cấp (D-116): 0,25 (L1–L2) · 0,35 (L3–L5) · 0,5 (L6+). */
export function flagPenalty(band: number): number {
  if (band <= 2) return 0.25;
  if (band <= 5) return 0.35;
  return 0.5;
}

export interface GroupScore {
  group: SoftGroupNo;
  ceiling: number;
  /** Trung bình mức các mục con của nhóm trong màn (0–2), 0 nếu nhóm không có mục con. */
  mean: number;
  flags: number;
  penalty: number;
  score: number;
}

/**
 * Điểm nhóm trong một màn (D-116): trần × (trung bình mức ÷ 2 − hệ số phạt ×
 * số cờ giao cho nhóm). Có thể âm. Chưa nhân buff chòm sao (chỉ phần dương,
 * làm sau cùng ở nơi khác).
 *
 * CHƯA CÓ DỮ LIỆU TRẦN: `point_budgets.json` chỉ có quỹ theo cấp, chưa có trần
 * từng nhóm cho từng màn, và seed/pack bản 4 không khai. Hàm này vì thế nhận
 * `ceilings` từ caller và chưa được gọi ở đâu trong luồng chấm. Không bịa trần.
 *
 * Cờ giao cho nhóm của nó (bảng 5/11); nhóm đó không có trần trong màn thì trừ
 * vào nhóm có trần lớn nhất (hoà thì nhóm số nhỏ hơn).
 */
export function groupScores(
  subs: readonly SubResult[],
  flags: readonly Pick<FlagInstance, 'group'>[],
  opts: {
    ceilings: Partial<Record<SoftGroupNo, number>>;
    /** Số cấp: L3 là 3. */
    band: number;
  },
): GroupScore[] {
  const groups = (Object.keys(opts.ceilings).map(Number) as SoftGroupNo[])
    .filter((g) => (opts.ceilings[g] ?? 0) > 0)
    .sort((a, b) => a - b);
  if (groups.length === 0) return [];
  const largest = groups.reduce((best, g) =>
    (opts.ceilings[g] ?? 0) > (opts.ceilings[best] ?? 0) ? g : best,
  );

  const received = new Map<SoftGroupNo, number>();
  for (const f of flags) {
    const target = groups.includes(f.group) ? f.group : largest;
    received.set(target, (received.get(target) ?? 0) + 1);
  }

  return groups.map((group) => {
    const ceiling = opts.ceilings[group] ?? 0;
    const levels = subs.flatMap((s) =>
      s.group === group && s.level !== null ? [s.level] : [],
    );
    const mean =
      levels.length === 0
        ? 0
        : levels.reduce((a, b) => a + b, 0) / levels.length;
    const count = received.get(group) ?? 0;
    const penalty = flagPenalty(opts.band) * count;
    return {
      group,
      ceiling,
      mean,
      flags: count,
      penalty,
      score: ceiling * (mean / 2 - penalty),
    };
  });
}
