import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixtureShiftContext } from '@datn/game-core/testing';
import type { ChecklistPanelResult } from '../../ai/judge/checklist.types';
import { parseBudgetUsd } from './budget';
import { DEFAULT_SEED } from './interactive/play';
import { loadCohort, PLAY_POLICIES, type PolicyId } from './persona-cohort';
import { livePersona, limitGateway, personaModel } from './persona-model';
import { PERSONA_PROMPT_VERSION, runPersona, scriptedPersona } from './persona';
import { loadPlaythrough, type Playthrough } from './playthrough';
import { createPorts, liveRuntime, type Only, type Runtime } from './ports';
import { writeLog } from './report';
import { LAB_STAGES, type LabStageInput } from './stages';

const PERSONA_DIR = 'apps/api/src/scripts/ai-lab/personas';
const SCRIPT_DIR = 'apps/api/src/scripts/ai-lab/playthroughs';

const hash = (text: string) => createHash('sha256').update(text).digest('hex');

function integer(
  raw: string | undefined,
  fallback: number,
  flag: string,
  max: number,
) {
  const n = raw === undefined ? fallback : Number(raw);
  if (!Number.isSafeInteger(n) || n < 1 || n > max)
    throw new Error(
      'Giá trị ' + flag + ' phải là số nguyên từ 1 đến ' + max + '.',
    );
  return n;
}

function save(path: string, value: unknown) {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function commit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

export async function runPersonaBatch(
  args: ReadonlyMap<string, string>,
  options: {
    runtime: Runtime;
    only: Only;
    budgetUsd: number;
    identity: LabStageInput['identity'];
  },
) {
  const { runtime, only, budgetUsd, identity } = options;
  const live = runtime.mode === 'live';
  const batchBudget = parseBudgetUsd(args.get('batch-budget'));
  if (batchBudget === null || (live && !args.has('batch-budget')))
    throw new Error('Đặt --batch-budget theo số USD được cấp cho cả batch.');
  const seed = args.get('seed') ?? DEFAULT_SEED;
  const ctx = fixtureShiftContext(seed);
  const dataset = loadCohort(
    args.get('cohort') ?? join(PERSONA_DIR, 'nemotron-vietnam.json'),
  );
  const persona = args.get('persona');
  const profiles = persona
    ? dataset.profiles.filter((profile) => profile.id === persona)
    : dataset.profiles;
  if (!profiles.length) throw new Error('Persona không có trong cohort.');
  const selection = args.get('policy') ?? 'all';
  const policyIds = (Object.keys(PLAY_POLICIES) as PolicyId[]).filter(
    (id) => selection === 'all' || id === selection,
  );
  if (!policyIds.length)
    throw new Error(
      '--policy phải là all hoặc một trong ' +
        Object.keys(PLAY_POLICIES).join(', ') +
        '.',
    );
  const baseline = args.has('baseline');
  const trials = profiles
    .flatMap((profile) =>
      policyIds.flatMap((policy) => [
        { profile, policy, control: false },
        ...(baseline ? [{ profile, policy, control: true }] : []),
      ]),
    )
    .slice(0, integer(args.get('limit'), live ? 2 : 600, '--limit', 600));
  const limits = {
    turns: integer(args.get('max-turns'), 50, '--max-turns', 200),
    timeoutMs: integer(
      args.get('timeout-ms'),
      240_000,
      '--timeout-ms',
      900_000,
    ),
  };
  const auditSeed = args.get('audit-seed') ?? 'jobquest-persona-v1';
  const model = live
    ? personaModel(runtime, args.get('persona-family'))
    : undefined;
  const scripts = live
    ? undefined
    : new Map(
        policyIds.map((id) => {
          const path =
            args.get('persona-script') ??
            join(
              SCRIPT_DIR,
              id === 'lam-voi' ? 'lam-nhanh-quen-hen.json' : 'lam-tot.json',
            );
          const script = loadPlaythrough(path);
          if (script.seed !== seed)
            throw new Error(
              'Chọn --persona-script có cùng seed với ca cần thử.',
            );
          return [id, script] as const;
        }),
      );

  const root = args.get('out') ?? 'apps/api/dist/persona';
  mkdirSync(root, { recursive: true });
  const out = mkdtempSync(join(root, 'batch-'));
  const meta = {
    source: 'synthetic_persona',
    startedAt: new Date().toISOString(),
    mode: runtime.mode,
    dataset: dataset.source,
    cohortSha256: dataset.sha256,
    commit: commit(),
    seed,
    contentSha256: hash(JSON.stringify(ctx)),
    rubricSha256: hash(JSON.stringify(ctx.seed.observes ?? [])),
    promptVersion: PERSONA_PROMPT_VERSION,
    personaModel: model?.key ?? 'scripted',
    only: only ?? null,
    budgetUsd,
    batchBudgetUsd: batchBudget,
    limits,
    auditSeed,
  };

  const outcomes: Array<{
    id: string;
    profile: string;
    policy: PolicyId;
    control: boolean;
    status: string;
    judgeStatus?: string;
    flags: string[];
    costUsd: number;
    coverage?: Awaited<ReturnType<typeof runPersona>>['coverage'];
  }> = [];
  let spent = 0;
  for (const trial of trials) {
    const { profile, policy: policyId, control } = trial;
    const id =
      'persona-' + profile.id + '-' + policyId + (control ? '-control' : '');
    const record = { id, profile: profile.id, policy: policyId, control };
    const allowance = Math.min(budgetUsd, batchBudget - spent);
    if (allowance <= 0) {
      outcomes.push({
        ...record,
        status: 'not_run_budget',
        costUsd: 0,
        flags: [],
      });
      continue;
    }

    const env = live ? liveRuntime(runtime.settings) : runtime;
    const ports = createPorts(env, only);
    const ledger = env.gateway && limitGateway(env.gateway, allowance);
    const policy = PLAY_POLICIES[policyId];
    const actor =
      env.gateway && model && ledger
        ? livePersona(
            env.gateway,
            model,
            ledger,
            policy,
            control ? undefined : profile,
          )
        : undefined;
    const fakeScript = scripts?.get(policyId);
    const decide = actor?.decide ?? scriptedPersona(fakeScript?.steps ?? []);
    const started = Date.now();

    try {
      const { status, result, coverage } = await runPersona(
        { ctx, identity, ports, budgetUsd: allowance, playthroughName: id },
        decide,
        { ...limits, hints: policy.hints },
      );
      const stages: Parameters<typeof writeLog>[2] = [];
      let judge: ChecklistPanelResult | undefined;
      if (status === 'ended') {
        for (const stage of LAB_STAGES) {
          const stageResult = await stage.run({
            playthrough: id,
            ctx,
            state: result.state,
            summary: result.summary,
            identity,
            budgetUsd: ledger ? ledger.remaining : allowance,
            runtime: env,
            only,
          });
          const detail = ports.drain();
          stages.push({
            name: stage.name,
            ...stageResult,
            gateway: detail.gateway,
            exchanges: detail.exchanges,
          });
          judge =
            (stageResult.data as { result?: ChecklistPanelResult } | undefined)
              ?.result ?? judge;
        }
      }
      const stop =
        status === 'paused' && ledger && ledger.denied > 0 ? 'budget' : status;
      const flags: string[] = [];
      if (stop !== 'ended') flags.push(stop);
      if (
        result.calls.some((call) =>
          call.detail.attempts.some((attempt) => attempt.violations.length),
        )
      )
        flags.push('narrator_rule_violation');
      if (judge?.status === 'graded') {
        if (judge.items.some((item) => item.highDisagreement))
          flags.push('judge_disagreement');
        if (judge.quoteChecks.some((check) => check.unreliable))
          flags.push('quote_unreliable');
      } else if (status === 'ended') flags.push('judge_incomplete');

      const costUsd = ledger ? ledger.spent : 0;
      const outcome = {
        ...record,
        status: stop,
        judgeStatus: judge?.status,
        flags,
        coverage,
        costUsd,
      };
      const dir = writeLog(out, result, stages);
      const replay: Playthrough = {
        _note: 'Lượt mô phỏng từ persona agent, dùng để chạy lại.',
        name: id,
        seed,
        title: ctx.seed.title,
        intent: policy.instruction,
        steps: result.steps
          .filter((step) => !step.skipped)
          .map((step) => step.step),
      };
      save(join(dir, 'replay.json'), replay);
      save(join(dir, 'trial.json'), {
        ...outcome,
        profileSourceUuid: profile.sourceUuid ?? null,
        durationMs: Date.now() - started,
        personaCalls: actor?.calls ?? [],
        fakeScript: fakeScript?.name,
        narratorMode: ports.narratorMode,
        checkerMode: ports.checkerMode,
        judgeMode: live && (!only || only === 'judge') ? 'live' : 'fake',
      });
      outcomes.push(outcome);
      console.log(
        id + ' · ' + outcome.status + ' · ' + (judge?.status ?? 'chưa chấm'),
      );
    } catch (error) {
      const outcome = {
        ...record,
        status: 'run_error',
        flags: ['run_error'],
        costUsd: ledger ? ledger.spent : 0,
      };
      const dir = join(out, id);
      mkdirSync(dir, { recursive: true });
      save(join(dir, 'trial.json'), { ...outcome, error: String(error) });
      outcomes.push(outcome);
      console.error(id + ' · ' + outcome.status + ' · ' + String(error));
    } finally {
      spent += ledger ? ledger.spent : 0;
    }
  }

  const flagged = outcomes
    .filter((item) => item.flags.length > 0)
    .sort((a, b) => b.flags.length - a.flags.length);
  const unflagged = outcomes.filter(
    (item) => item.status === 'ended' && item.flags.length === 0,
  );
  const audit = unflagged
    .map((item) => ({ id: item.id, order: hash(auditSeed + '/' + item.id) }))
    .sort((a, b) => a.order.localeCompare(b.order))
    .slice(0, Math.ceil(unflagged.length * 0.2));
  const reviewCases = [...flagged, ...audit].map(({ id }) => ({
    id,
    caseId: hash(meta.startedAt + '/' + id).slice(0, 20),
  }));
  const reviewDir = join(out, 'review');
  mkdirSync(reviewDir, { recursive: true });
  for (const { id, caseId } of reviewCases) {
    const outcome = outcomes.find((item) => item.id === id);
    if (!outcome?.coverage) continue;
    const result = JSON.parse(
      readFileSync(join(out, id, 'result.json'), 'utf8'),
    ) as {
      steps: Array<{ time: string; step: unknown; lines: unknown }>;
    };
    save(join(reviewDir, caseId + '.json'), {
      caseId,
      seed,
      steps: result.steps.map(({ time, step, lines }) => ({
        time,
        step,
        lines,
      })),
    });
  }
  save(join(out, 'batch.json'), {
    ...meta,
    trials,
    costUsd: spent,
    outcomes,
    review: {
      flagged: flagged.map((item) => ({ id: item.id, reasons: item.flags })),
      blindAudit: audit.map((item) => item.id),
      cases: reviewCases,
    },
  });
  console.log('Báo cáo persona: ' + join(out, 'batch.json'));
  return outcomes.every(
    (outcome) => outcome.status === 'ended' && outcome.judgeStatus === 'graded',
  );
}
