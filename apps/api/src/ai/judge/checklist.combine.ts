/**
 * Gộp kết quả các judge theo checklist thành mức từng (mục con, đoạn), mức
 * mục con trong màn và cờ. Hàm thuần, không gọi mạng.
 *
 * Mỗi judge trả lời câu có/không; code (game-core) kiểm câu trích và quy ra
 * mức TRƯỚC khi gộp, nên gộp ở đây là gộp các mức, không gộp câu trả lời:
 *
 *   1. Cờ của mỗi judge: mỗi loại một lần, cặp gần nhau chỉ giữ cờ cụ thể.
 *   2. Cờ của panel: theo đa số.
 *   3. Mức của mỗi judge, đã ép về 0 theo cờ của PANEL (một cờ chỉ có một
 *      judge nêu thì không ép ai).
 *   4. Gộp mức giữa các judge bằng `combineJudgments`: trung vị của ba, mức
 *      thấp hơn của hai (D-132).
 *   5. Mức mục con trong màn = trung bình các đoạn.
 *   6. Cảnh báo ghế trích sai nhiều (D-145): mức giữ nguyên.
 *
 * TẠM, thiết kế chưa nói, chốt cùng nhóm (cùng chỗ với `judge-combine.ts`):
 *   - "Không xét": cặp là không xét khi ít nhất nửa số judge nói không xét.
 *   - Cờ theo đa số: hơn nửa số judge nêu cùng loại cờ (hai judge thì cả hai).
 */
import { shift } from '@datn/game-core';
import {
  combineJudgments,
  type CombineOptions,
  type PanelVerdict,
} from './judge-combine';
import type { ChecklistItemGrade } from './checklist.types';
import type { JudgeScore, Judgment } from './judge.types';

const pairKey = (p: { sub: string; segment: string }): string =>
  `${p.sub}@${p.segment}`;

export type ChecklistVerdict =
  | {
      status: 'graded';
      method: Extract<PanelVerdict, { status: 'graded' }>['method'] | 'none';
      panelSize: number;
      items: ChecklistItemGrade[];
      subs: shift.SubResult[];
      flags: shift.FlagInstance[];
      /** Theo thứ tự `panel` (các ghế chấm được). */
      quoteChecks: shift.QuoteReliability[];
    }
  | Extract<PanelVerdict, { status: 'pending' }>;

export function combineChecklist(args: {
  segments: readonly shift.EvidenceSegment[];
  observes: readonly shift.ObserveItem[];
  /** Mỗi phần tử là câu trả lời đã kiểm của một ghế chấm được. */
  panel: ReadonlyArray<shift.CheckedOutput>;
  options: CombineOptions;
}): ChecklistVerdict {
  const { segments, observes, panel, options } = args;
  const pairs = shift.expectedPairs(segments);
  const fixed = shift.fixedPairLevels(segments);

  const fixedItems: ChecklistItemGrade[] = fixed.map((p) => ({
    sub: p.sub,
    segment: p.segment,
    level: p.level as JudgeScore | null,
    fixed: p.fixed,
    method: 'fixed',
    highDisagreement: false,
    judgeLevels: [],
    forcedZero: false,
  }));
  const finish = (
    method: 'none' | Extract<PanelVerdict, { status: 'graded' }>['method'],
    panelSize: number,
    items: ChecklistItemGrade[],
    flags: shift.FlagInstance[],
  ): ChecklistVerdict => ({
    status: 'graded',
    method,
    panelSize,
    items,
    subs: shift.subLevels(observes, items),
    flags,
    quoteChecks: panel.map(shift.quoteReliability),
  });

  // Mọi đoạn là hết giờ: không có gì để hỏi judge.
  if (pairs.length === 0) return finish('none', 0, fixedItems, []);

  const flags = shift.consensusFlags(
    panel.map((p) => shift.normalizeFlags(p.flags)),
  );
  const perJudge = panel.map((p) => shift.pairLevels(p.items, flags));

  const ids = pairs.map(pairKey);
  const verdict = combineJudgments(
    ids,
    perJudge.map((levels) =>
      levels.map((p): Judgment => ({
        criterionId: pairKey(p),
        score: p.level,
        counterproductive: false,
        quote: '',
        rationale: '',
      })),
    ),
    options,
  );
  if (verdict.status === 'pending') return verdict;

  const graded: ChecklistItemGrade[] = verdict.grades.map((g) => {
    const [sub, segment] = g.criterionId.split('@');
    return {
      sub,
      segment,
      level: g.score,
      method: g.method,
      highDisagreement: g.highDisagreement,
      judgeLevels: g.judgeScores,
      forcedZero: perJudge.some((levels) =>
        levels.some((p) => pairKey(p) === g.criterionId && p.forcedZero),
      ),
    };
  });
  return finish(
    verdict.method,
    verdict.panelSize,
    [...graded, ...fixedItems],
    flags,
  );
}
