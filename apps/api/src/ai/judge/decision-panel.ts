import type { DecisionsGateway } from '../gateway/decisions-gateway';
import { CallBudget } from './call-budget';
import { combineChecklist } from './checklist.combine';
import {
  DECISION_MODELS,
  gradeDecisionChecklist,
  type DecisionChecklistInput,
  type DecisionModel,
} from './decision-checklist';
import { JUDGE_PROFILE } from './judge.profile';

export const DEFAULT_DECISION_PANEL = [
  'typesafe/jev-1.14',
  'liquid/d1-ultra',
  'nace-ai/drex-max',
] as const satisfies readonly DecisionModel[];

export function decisionSelection(selection?: string) {
  if (!selection || selection === 'all')
    return {
      panel: DEFAULT_DECISION_PANEL,
      probes:
        selection === 'all' ? ['perplexity/pplx-decider-v1.2' as const] : [],
    };

  const ids = selection.split(',').map((model) => model.trim());
  for (const id of ids)
    if (!Object.hasOwn(DECISION_MODELS, id))
      throw new Error('Decision model chưa có cấu hình giá: ' + id);
  const models = ids as DecisionModel[];
  if (new Set(models).size !== models.length || models.length > 3)
    throw new Error('--decision-model cần tối đa ba model khác nhau hoặc all.');
  if (models.length < 3) return { panel: null, probes: models };
  if (
    models.includes('nace-ai/drex-max') &&
    models.includes('perplexity/pplx-decider-v1.2')
  )
    throw new Error(
      'Drex Max và Decider V1.2 dùng chung họ Qwen. Chọn một ghế Qwen.',
    );
  return { panel: models, probes: [] };
}

export async function gradeDecisionPanel(
  input: DecisionChecklistInput,
  models: readonly DecisionModel[],
  gateway: DecisionsGateway,
  options: { threshold: number; budget: CallBudget },
) {
  const started = performance.now();
  const slots = await Promise.all(
    models.map((model) =>
      gradeDecisionChecklist(input, model, gateway, options),
    ),
  );
  const panel = slots.flatMap((slot) =>
    slot.status === 'graded' && 'checked' in slot && slot.checked
      ? [slot.checked]
      : [],
  );
  const verdict = combineChecklist({
    ...input,
    panel,
    options: {
      disagreementThreshold: JUDGE_PROFILE.disagreementThreshold,
      whenOneJudgeDown: JUDGE_PROFILE.whenOneJudgeDown,
    },
  });
  return {
    slots,
    panel: {
      ...verdict,
      models,
      latencyMs: Math.round(performance.now() - started),
      costUsd: slots.reduce((total, slot) => total + slot.costUsd, 0),
      estimatedCostUsd: slots.reduce(
        (total, slot) =>
          total +
          ('estimatedCostUsd' in slot ? (slot.estimatedCostUsd ?? 0) : 0),
        0,
      ),
    },
  };
}
