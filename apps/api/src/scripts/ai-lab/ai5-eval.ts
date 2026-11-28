import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { shift, type KnownIdentity } from '@datn/game-core';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { z } from 'zod';
import {
  DecisionsGateway,
  type DecisionsRequest,
} from '../../ai/gateway/decisions-gateway';
import type { Transport } from '../../ai/gateway/gateway.types';
import { CallBudget } from '../../ai/judge/call-budget';
import { rubricText } from '../../ai/judge/checklist.prompt';
import { gradeDecisionChecklist } from '../../ai/judge/decision-checklist';
import {
  decisionSelection,
  gradeDecisionPanel,
} from '../../ai/judge/decision-panel';
import { JudgePanelService } from '../../ai/judge/judge-panel.service';
import { loadPlaythrough } from './playthrough';
import { createPorts, fakeRuntime, type Runtime } from './ports';
import { runPlaythrough } from './runner';
import { fakeService } from './stages/judge';

const segmentSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  kind: z.enum(['node', 'pha', 'review']),
  subs: z.array(z.string()),
  outcome: z.enum(['answered', 'timed_out']),
  entries: z.array(
    z.union([
      z.object({
        role: z.literal('player'),
        turn: z.object({
          code: z.string().min(1),
          kind: z.enum(['say', 'artefact', 'action']),
          at: z.number(),
          time: z.string(),
          text: z.string(),
          parts: z
            .array(z.object({ label: z.string(), text: z.string() }))
            .optional(),
        }),
      }),
      z.object({
        role: z.enum(['npc', 'system']),
        speaker: z.string(),
        at: z.number(),
        time: z.string(),
        text: z.string(),
      }),
    ]),
  ),
  facts: z.array(
    z.object({ id: z.string(), text: z.string(), time: z.string() }),
  ),
  rulesHeard: z.array(z.object({ id: z.string(), text: z.string() })),
  promises: z.array(z.object({ label: z.string(), status: z.string() })),
  brief: z.string(),
});

const snapshotSchema = z
  .object({
    segments: z.array(segmentSchema),
    observes: z.array(shift.ObserveItemSchema).min(1),
  })
  .superRefine(({ segments, observes }, ctx) => {
    const subs = new Set(observes.map((observe) => observe.sub));
    const segmentIds = new Set(segments.map((segment) => segment.id));
    if (
      subs.size !== observes.length ||
      segmentIds.size !== segments.length ||
      observes.some((observe) => !shift.checklistItem(observe.sub)) ||
      segments.some(
        (segment) =>
          new Set(segment.subs).size !== segment.subs.length ||
          segment.subs.some((sub) => !subs.has(sub)),
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Snapshot có ID đoạn hoặc mục checklist không hợp lệ.',
      });
  });

const artifactSchema = z.object({
  playthrough: z.string().min(1),
  outcome: z.literal('ended'),
  summary: z.object({ seedId: z.string().optional() }).optional(),
  stages: z.array(z.object({ data: z.unknown().optional() })),
});

function readSnapshot(path: string) {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  const snapshot = z
    .object({
      caseId: z.string().min(1),
      seedId: z.string().optional(),
      snapshotVersion: z.literal(1),
      input: snapshotSchema,
    })
    .safeParse(raw);
  if (snapshot.success) return snapshot.data;
  const artifact = artifactSchema.parse(raw);
  for (const stage of artifact.stages) {
    const parsed = snapshotSchema.safeParse(stage.data);
    if (parsed.success)
      return {
        caseId: artifact.playthrough,
        seedId: artifact.summary?.seedId,
        input: parsed.data,
      };
  }
  throw new Error(
    'Artifact chưa có đoạn bằng chứng và observes của bước chấm AI-5.',
  );
}

async function fixture(name: string) {
  const playthrough = loadPlaythrough(
    join('apps/api/src/scripts/ai-lab/playthroughs', name + '.json'),
  );
  const ctx = fixtureShiftContext(playthrough.seed);
  const runtime = fakeRuntime({ allowUnconfirmedProviders: false });
  const result = await runPlaythrough(playthrough, {
    ctx,
    ports: createPorts(runtime, undefined),
    budgetUsd: 0.25,
  });
  if (result.outcome !== 'ended')
    throw new Error('Ca fixture chưa kết thúc: ' + result.outcome);
  const observes = ctx.seed.observes ?? [];
  return {
    caseId: playthrough.name,
    seedId: playthrough.seed,
    input: snapshotSchema.parse({
      observes,
      segments: shift.evidenceSegments(result.state, ctx, observes),
    }),
  };
}

const fakeDecisions: Transport = async (_url, init) => {
  const request = JSON.parse(init.body) as DecisionsRequest;
  const answers = Object.fromEntries(
    Object.entries(request.questions).map(([id, question]) => {
      if (question.type === 'noul') {
        return [
          id,
          { type: 'noul', noul: /_(applies|A)$/.test(id) ? 0.9 : 0.1 },
        ];
      }
      const choice =
        Object.keys(question.criteria).find((key) => key !== 'no_evidence') ??
        'no_evidence';
      return [id, { type: 'choice', choice }];
    }),
  );
  return {
    status: 200,
    text: async () =>
      JSON.stringify({
        id: 'fake',
        model: request.model,
        provider: 'fake',
        answers,
        usage: { input_tokens: 0, output_tokens: 0, cost: 0 },
      }),
  };
};

export async function runAi5Eval(
  args: ReadonlyMap<string, string>,
  runtime: Runtime,
  identity: KnownIdentity,
  budgetUsd: number,
) {
  const live = runtime.mode === 'live';
  const openrouterKey = runtime.settings.openrouter?.apiKey;
  if (
    live &&
    (!openrouterKey || !runtime.gateway || runtime.judgeSlots.length === 0)
  )
    throw new Error(
      'Cần cấu hình OPENROUTER_API_KEY và panel LLM để so sánh live.',
    );
  const path = args.get('input');
  if (path && live && args.get('synthetic') !== 'true')
    throw new Error(
      'Chỉ dùng artifact mô phỏng trong thử live. Xác nhận nguồn bằng --synthetic.',
    );
  const fixtureName = args.get('fixture') ?? 'lam-tot';
  if (!/^[a-z0-9-]+$/.test(fixtureName))
    throw new Error('--fixture phải là tên kịch bản lab.');
  const selection = decisionSelection(args.get('decision-model'));
  const threshold = Number(args.get('decision-threshold') ?? 0.5);
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold >= 1)
    throw new Error('--decision-threshold phải nằm giữa 0 và 1.');

  const { caseId, seedId, input } = path
    ? readSnapshot(path)
    : await fixture(fixtureName);
  const llmService =
    live && runtime.gateway
      ? new JudgePanelService(runtime.gateway, runtime.judgeSlots)
      : fakeService(input.segments, identity);
  const started = performance.now();
  const llm = await llmService.gradeChecklist({
    ...input,
    identity,
    jobId: 'ai5-eval:' + caseId,
    budgetUsd,
  });
  const llmLatencyMs = Math.round(performance.now() - started);
  const frozen = { observes: input.observes, segments: llm.segmentsSent };
  const inputSha256 = createHash('sha256')
    .update(JSON.stringify(frozen))
    .digest('hex');
  const rubricSha256 = createHash('sha256')
    .update(rubricText(frozen.segments[0]?.brief ?? '', frozen.observes))
    .digest('hex');
  const gateway = new DecisionsGateway(
    openrouterKey ?? 'fake',
    live ? undefined : fakeDecisions,
  );
  const budget = new CallBudget(
    Math.max(0, budgetUsd - (live ? llm.cost.usd : 0)),
  );
  const options = { threshold, budget };
  const group = selection.panel
    ? await gradeDecisionPanel(frozen, selection.panel, gateway, options)
    : null;
  const decisionPanel = group?.panel ?? null;
  const decisions = [...(group?.slots ?? [])];
  for (const model of selection.probes)
    decisions.push(
      await gradeDecisionChecklist(frozen, model, gateway, options),
    );
  const paired =
    llm.status === 'graded'
      ? llm.items.map(({ sub, segment, level, fixed }) => ({
          sub,
          segment,
          fixed,
          llm: level,
          decisionPanel:
            decisionPanel?.status === 'graded'
              ? decisionPanel.items.find(
                  (item) => item.sub === sub && item.segment === segment,
                )?.level
              : undefined,
          decisions: Object.fromEntries(
            decisions.flatMap((result) => {
              const item = result.items.find(
                (entry) => entry.sub === sub && entry.segment === segment,
              );
              return item ? [[result.model, item.level]] : [];
            }),
          ),
        }))
      : [];
  const out = args.get('out') ?? 'apps/api/dist/ai5-eval';
  mkdirSync(out, { recursive: true });
  const directory = mkdtempSync(join(out, 'case-'));
  const save = (name: string, value: unknown) =>
    writeFileSync(
      join(directory, name),
      JSON.stringify(value, null, 2) + '\n',
      'utf8',
    );
  save('snapshot.json', {
    snapshotVersion: 1,
    caseId,
    seedId,
    inputSha256,
    rubricSha256,
    input: frozen,
  });
  save('comparison.json', {
    mode: runtime.mode,
    caseId,
    seedId,
    inputSha256,
    rubricSha256,
    threshold,
    budgetUsd,
    llmLatencyMs,
    llm,
    decisionPanel,
    decisions,
    paired,
  });
  console.log('LLM panel: ' + llm.status);
  if (decisionPanel) console.log('Decision panel: ' + decisionPanel.status);
  for (const decision of decisions) {
    const reason = 'reason' in decision ? ' · ' + decision.reason : '';
    console.log(decision.model + ': ' + decision.status + reason);
  }
  console.log('Kết quả so sánh: ' + join(directory, 'comparison.json'));
  return (
    llm.status === 'graded' &&
    (!decisionPanel || decisionPanel.status === 'graded') &&
    decisions.every((result) => result.status === 'graded')
  );
}
