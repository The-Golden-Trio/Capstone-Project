/**
 * Bước sau ca: AI-5 chấm cả ca theo checklist có/không (D-116), qua
 * `JudgePanelService.gradeChecklist`.
 *
 * Rubric là `observes` của seed (khối E1). Seed L3.m2 có bản AI soạn nháp, chờ
 * DE duyệt (`_draft_observes`).
 *
 * Chế độ fake dùng một transport giả trả lời "có" cho câu A của mọi cặp mục
 * con–đoạn, trích câu đầu tiên của người chơi trong đoạn. Mục đích chỉ là cho
 * thấy đường chạy (dựng đoạn, khử định danh, kiểm câu trích, gộp panel); mức
 * in ra KHÔNG phản ánh chất lượng câu trả lời.
 */
import { shift } from '@datn/game-core';
import { ModelGateway } from '../../../ai/gateway/model-gateway';
import type { ChecklistPanelResult } from '../../../ai/judge/checklist.types';
import { fakeChecklistService } from '../../../ai/judge/fake-checklist';
import { JudgePanelService } from '../../../ai/judge/judge-panel.service';
import type { LabStage, LabStageInput, LabStageResult } from '../stages';

const fmtLevel = (level: number | null) =>
  level === null ? 'không xét' : level.toFixed(2);

function describe(result: ChecklistPanelResult, fake: boolean): string[] {
  const lines: string[] = [];
  if (fake)
    lines.push(
      '(judge giả: mức dưới đây chỉ cho thấy đường chạy, không đánh giá câu trả lời)',
    );
  if (result.status === 'unavailable') {
    lines.push(`■ unavailable — ${result.reason}`);
  } else if (result.status === 'pending') {
    lines.push(
      `■ pending — ${result.reason} (panel ${result.panelSize} judge); lời người chơi được giữ, chấm lại sau`,
    );
  } else {
    lines.push(
      `✔ graded — gộp ${result.method}, panel ${result.panelSize} judge`,
    );
    for (const sub of result.subs) {
      const item = shift.checklistItem(sub.sub);
      const perSegment = sub.segments
        .map((s) => `${s.segment}=${s.level === null ? '–' : s.level}`)
        .join(', ');
      lines.push(
        `  ${sub.sub} ${item?.name ?? ''} (nhóm ${sub.group}): ${fmtLevel(sub.level)}  [${perSegment}]`,
      );
    }
    const okSlots = result.slots.filter((s) => s.status === 'ok');
    result.quoteChecks.forEach((q, i) => {
      if (q.unreliable)
        lines.push(
          `  ⚠ ghế ${okSlots[i]?.slot ?? i} ${okSlots[i]?.modelKey ?? ''} trích sai ${q.rejected}/${q.yes} câu "có": không đáng tin (D-145), mức giữ nguyên`,
        );
    });
    for (const item of result.items.filter((i) => i.highDisagreement))
      lines.push(
        `  ⚠ judge lệch nhau ở ${item.sub}/${item.segment}: ${item.judgeLevels.join(' / ')}`,
      );
    if (result.flags.length === 0) lines.push('  cờ: không có');
    for (const flag of result.flags)
      lines.push(
        `  cờ ${flag.code} → nhóm ${flag.group} (${flag.raisedBy}/${flag.panelSize} judge) ở ${flag.turn}: "${flag.quote}"`,
      );
  }
  for (const r of result.records)
    lines.push(
      `  ghế ${r.slot} ${r.modelKey} lần ${r.attempt}: ${r.outcome}, ${r.latencyMs ?? '?'} ms, ` +
        `${r.usage ? `${r.usage.input} vào / ${r.usage.output} ra, ` : ''}` +
        `${r.cost ? `${r.cost.usd.toFixed(6)} USD, ` : ''}${r.quotesRejected} câu trích bị bỏ` +
        (r.error ? `, lỗi ${r.error.kind}: ${r.error.message}` : ''),
    );
  lines.push(
    `  tổng chi phí: ${result.cost.usd.toFixed(6)} USD${result.cost.basis === 'upper_bound' ? ' (cận trên)' : ''}`,
  );
  return lines;
}

export const judgeStage: LabStage = {
  name: 'AI-5 chấm theo checklist',
  async run(input: LabStageInput): Promise<LabStageResult> {
    const observes = input.ctx.seed.observes ?? [];
    if (observes.length === 0)
      return {
        lines: [
          `✘ Seed ${input.ctx.seed.id} chưa có observes (khối E1): không có gì để chấm.`,
        ],
      };
    const segments = shift.evidenceSegments(input.state, input.ctx, observes);
    const { runtime } = input;
    const live =
      runtime.mode === 'live' &&
      runtime.gateway !== null &&
      (input.only === undefined || input.only === 'judge');

    const lines = [
      `Rubric: observes của seed ${input.ctx.seed.id} (nháp, chờ DE duyệt): ${observes.map((o) => `${o.sub}←${o.from.join('+')}`).join(', ')}`,
      `Đoạn bằng chứng: ${segments
        .map((s) => `${s.id} (${shift.turnsOf(s).length} lượt, ${s.outcome})`)
        .join(', ')}`,
    ];

    if (live && runtime.judgeSlots.length === 0) {
      lines.push(
        '✘ Không có ghế judge nào: thiếu OPENROUTER_API_KEY hoặc panel bị tắt (DC-01).',
      );
      return { lines };
    }

    const service = live
      ? new JudgePanelService(
          runtime.gateway as ModelGateway,
          runtime.judgeSlots,
        )
      : fakeChecklistService(segments, input.identity);
    const result = await service.gradeChecklist({
      jobId: `ai-lab:${input.playthrough}`,
      segments,
      observes,
      identity: input.identity,
      budgetUsd: input.budgetUsd,
    });
    return {
      lines: [...lines, ...describe(result, !live)],
      data: { observes, segments, result },
    };
  },
};
