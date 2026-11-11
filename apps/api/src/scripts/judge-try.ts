/**
 * Chạy thử panel ba judge (AI-5) trên một câu trả lời mẫu.
 *
 *     pnpm exec nx run @datn/api:judge-try                     # dry: in request sẽ gửi, không gọi gì
 *     pnpm exec nx run @datn/api:judge-try -- --mode=fake      # model giả: xem panel, thử lại, gộp điểm chạy
 *     pnpm exec nx run @datn/api:judge-try -- --mode=live      # gọi thật qua OpenRouter, cần OPENROUTER_API_KEY
 *
 * Tuỳ chọn:
 *     --answer=dung_kich_ban|lac_kich_ban|tan_cong|do_rubric|all   (mặc định dung_kich_ban)
 *     --answer="câu tự gõ"
 *     --tier=small|mid     bậc làm chính của mỗi họ (mặc định small; bậc kia làm dự phòng)
 *     --out=thư/mục        live: ghi nguyên văn từng request và response ra file JSON
 *     --scenario=KEY --activity=a2   (mặc định SWE_BACKEND_L3_S_INCIDENT, a2)
 *
 * Mục đích: thấy từng lượt gọi gửi gì, nhận gì, judge nào cho mức nào, câu
 * trích có đúng nguyên văn không, gộp ra sao, mất bao lâu, tốn bao nhiêu.
 * Câu trả lời mẫu là câu giả do nhóm viết — không phải câu của người chơi thật.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixtureData } from '@datn/game-core/testing';
import { aiSettingsFromEnv } from '../ai/ai.module';
import type { Transport } from '../ai/gateway/gateway.types';
import { ModelGateway, fetchTransport } from '../ai/gateway/model-gateway';
import {
  gatewayKeys,
  judgePanel,
  narratorChain,
  type JudgeTier,
} from '../ai/gateway/models';
import {
  JudgePanelService,
  type GradeInput,
  type PanelResult,
} from '../ai/judge/judge-panel.service';
import { JUDGE_PROFILE } from '../ai/judge/judge.profile';
import { buildJudgeMessages, judgeJsonSchema } from '../ai/judge/judge.prompt';
import { criteriaFromActivity } from '../ai/judge/judge.types';
import {
  FakeClock,
  fakeTransport,
  type FakeCall,
  type FakeTurn,
} from '../ai/testing/fake-model';
import {
  SAMPLE_ACTIVITY_ID,
  SAMPLE_ANSWERS,
  SAMPLE_SCENARIO_KEY,
  type AnswerClass,
} from '../ai/testing/sample-turn';
import { loadAiEnv } from '../config/env';

/* ── Tham số dòng lệnh, .env ───────────────────────────────────────── */

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.join('=') || 'true'] as const;
  }),
);

/** Nạp `.env` bằng tay như `narrator-try` — script chạy ngoài Nest. */
function loadEnvFile(path: string): void {
  let text: string;
  try {
    text = readFileSync(path, 'utf-8');
  } catch {
    return;
  }
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const at = trimmed.indexOf('=');
    if (at < 0) continue;
    const key = trimmed.slice(0, at).trim();
    if (process.env[key] !== undefined) continue;
    process.env[key] = trimmed
      .slice(at + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
}

loadEnvFile(join(process.cwd(), 'apps/api/.env'));
loadEnvFile(join(process.cwd(), '.env'));

const mode = args.get('mode') ?? 'dry';
const tier = (args.get('tier') ?? 'small') as JudgeTier;
const SCENARIO_KEY = args.get('scenario') ?? SAMPLE_SCENARIO_KEY;
const ACTIVITY_ID = args.get('activity') ?? SAMPLE_ACTIVITY_ID;

function answersToRun(): Array<[string, string]> {
  const chosen = args.get('answer') ?? 'dung_kich_ban';
  if (chosen === 'all') return Object.entries(SAMPLE_ANSWERS);
  if (chosen in SAMPLE_ANSWERS)
    return [[chosen, SAMPLE_ANSWERS[chosen as AnswerClass]]];
  return [['tu_go', chosen]];
}

/* ── Đề chấm từ kịch bản mẫu ───────────────────────────────────────── */

function findActivity() {
  const scenario = fixtureData().scenarios[SCENARIO_KEY];
  if (!scenario) throw new Error(`Không có kịch bản ${SCENARIO_KEY}`);
  const found = scenario.activities.find((a) => a.activity_id === ACTIVITY_ID);
  if (!found)
    throw new Error(`Không có hoạt động ${ACTIVITY_ID} trong ${SCENARIO_KEY}`);
  return found;
}
const activity = findActivity();

const turn = (answer: string): GradeInput => ({
  answer,
  criteria: criteriaFromActivity(activity),
  situation: [activity.setup, activity.npc_line].filter(Boolean).join('\n'),
  question: activity.input_prompt ?? undefined,
});

/* ── In ────────────────────────────────────────────────────────────── */

const rule = (title: string) =>
  console.log(`\n━━ ${title} ${'━'.repeat(Math.max(0, 66 - title.length))}`);
const usd = (n: number) => `${n.toFixed(6)} USD`;

function printResult(label: string, r: PanelResult): void {
  rule(label);
  console.log(`Câu đã gửi (sau khử định danh): ${r.answerSent}`);
  if (Object.keys(r.redactions).length > 0)
    console.log(`Đã khử: ${JSON.stringify(r.redactions)}`);

  for (const s of r.slots) {
    console.log(
      `\nGhế ${s.slot} · ${s.family} · ${s.status} · ${s.modelKey ?? '—'} · ${s.attempts} lượt gọi`,
    );
    if (s.error) console.log(`  lỗi cuối: ${s.error}`);
    for (const j of s.judgments)
      console.log(
        `  ${j.criterionId}: mức ${j.score ?? 'không xét'}${j.counterproductive ? ' · PHẢN TÁC DỤNG' : ''}\n` +
          `    trích: "${j.quote}"\n    lý do: ${j.rationale}`,
      );
  }

  console.log('');
  if (r.status === 'graded') {
    console.log(`✔ Đã chấm (${r.method}, ${r.panelSize} judge):`);
    for (const g of r.grades)
      console.log(
        `  ${g.criterionId}: ${g.score ?? 'không xét'} ← [${g.judgeScores.map((s) => s ?? '–').join(', ')}]` +
          `${g.highDisagreement ? '  ⚑ lệch, cần chuyên gia' : ''}${g.counterproductive ? '  ⚠ phản tác dụng' : ''}`,
      );
  } else if (r.status === 'pending') {
    console.log(
      `■ Chờ — ${r.reason}, ${r.panelSize} judge chấm được. Câu trả lời được giữ để chấm lại.`,
    );
  } else {
    console.log(`■ Không chấm — ${r.reason}`);
  }

  console.log('\nTừng lượt gọi:');
  for (const c of r.records)
    console.log(
      `  ghế ${c.slot} lô ${c.batch} lần ${c.attempt} · ${c.modelKey} · ${c.outcome}` +
        ` · ${c.latencyMs ?? '—'} ms · temp ${c.temperature ?? 'mặc định'}` +
        (c.usage
          ? ` · vào ${c.usage.input} (cache ${c.usage.cachedInput}) ra ${c.usage.output} suy nghĩ ${c.usage.reasoning}`
          : '') +
        (c.cost ? ` · ${usd(c.cost.usd)}` : '') +
        (c.error ? `\n      ${c.error.kind}: ${c.error.message}` : '') +
        (c.problems.length > 0
          ? `\n      ${c.problems.map((p) => `${p.rule} ${p.detail}`).join('\n      ')}`
          : ''),
    );
  console.log(
    `Tổng: ${usd(r.cost.usd)}${r.cost.basis === 'upper_bound' ? ' (cận trên)' : ''}`,
  );
}

/* ── Các chế độ ────────────────────────────────────────────────────── */

const env = loadAiEnv();
const settings = aiSettingsFromEnv(env);

function dry(): void {
  const { slots } = judgePanel(
    {
      ...settings,
      openrouter: settings.openrouter ?? { apiKey: 'chua-co-key' },
    },
    { primaryTier: tier },
  );
  const gateway = new ModelGateway({});
  const t = turn(answersToRun()[0][1]);
  const criteria = t.criteria.slice(0, JUDGE_PROFILE.maxCriteriaPerCall);
  for (const { slot, chain } of slots) {
    const spec = chain[0];
    const { url, body } = gateway.preview({
      model: spec,
      messages: buildJudgeMessages({ ...t, criteria }),
      temperature: JUDGE_PROFILE.temperature,
      maxOutputTokens: JUDGE_PROFILE.maxOutputTokens,
      json: {
        name: 'judgment',
        schema: judgeJsonSchema(criteria.map((c) => c.id)),
      },
      timeoutMs: JUDGE_PROFILE.attemptTimeoutMs,
    });
    rule(`Ghế ${slot}: ${spec.key} → POST ${url}`);
    if (slot === 1) console.log(JSON.stringify(body, null, 2));
    else
      console.log(
        JSON.stringify({ ...body, messages: '(như ghế 1)' }, null, 2),
      );
  }
}

async function fake(): Promise<void> {
  const clock = new FakeClock();
  const { slots } = judgePanel(
    { ...settings, openrouter: { apiKey: 'fake' } },
    { primaryTier: tier },
  );
  const ids = criteriaFromActivity(activity).map((c) => c.id);
  const answer = answersToRun()[0][1];
  const quote = answer.slice(0, Math.min(40, answer.length));
  const out = (level: string, q = quote): FakeTurn => ({
    content: JSON.stringify({
      criteria: ids.map((criterion_id) => ({
        criterion_id,
        quote: q,
        rationale: '(model giả)',
        level,
        counterproductive: false,
      })),
    }),
  });
  // Claude cho 2; GPT lần đầu trích bịa rồi cho 1; Gemini bậc rẻ quá tải nên sang bậc trên, cho 0.
  let gpt = 0;
  const script = (call: FakeCall): FakeTurn => {
    const model = String(call.body['model']);
    if (model.startsWith('anthropic/')) return out('2');
    if (model.startsWith('openai/'))
      return gpt++ === 0
        ? out('1', 'câu không hề có trong câu trả lời')
        : out('1');
    if (model === 'google/gemini-3.5-flash-lite')
      return { status: 503, errorMessage: 'overloaded (giả)' };
    return out('0');
  };
  const service = new JudgePanelService(
    new ModelGateway(
      { openrouter: 'fake' },
      fakeTransport(script, clock),
      clock,
    ),
    slots,
    clock,
  );
  printResult('Model giả', await service.grade(turn(answer)));
}

async function live(): Promise<void> {
  if (!settings.openrouter) {
    console.error(
      'Chưa có OPENROUTER_API_KEY trong .env.' +
        (process.env['OPEN_ROUTER_API_KEY']
          ? ' Thấy biến OPEN_ROUTER_API_KEY — code đọc tên OPENROUTER_API_KEY (không có gạch dưới giữa OPEN và ROUTER); đổi tên biến trong .env.'
          : ''),
    );
    process.exitCode = 1;
    return;
  }
  const narratorFamilies = [
    'qwen',
    'deepseek',
    ...narratorChain(settings).chain.map((s) => s.family),
  ];
  const { slots, problems } = judgePanel(settings, {
    primaryTier: tier,
    narratorFamilies,
  });
  if (problems.length > 0) throw new Error(problems.join('; '));

  const outDir = args.get('out');
  if (outDir) mkdirSync(outDir, { recursive: true });
  let n = 0;
  // Bọc transport thật để ghi nguyên văn request và response — không ghi header (có key).
  const recording: Transport = async (url, init) => {
    const response = await fetchTransport(url, init);
    const raw = await response.text();
    n++;
    if (outDir) {
      const body = JSON.parse(init.body) as { model: string };
      const name = `${String(n).padStart(2, '0')}-${body.model.replace('/', '_')}`;
      writeFileSync(
        join(outDir, `${name}.request.json`),
        JSON.stringify({ url, body }, null, 2),
      );
      let parsed: unknown = raw;
      try {
        parsed = JSON.parse(raw);
      } catch {
        /* giữ nguyên văn */
      }
      writeFileSync(
        join(outDir, `${name}.response.json`),
        JSON.stringify({ status: response.status, body: parsed }, null, 2),
      );
    }
    return { status: response.status, text: async () => raw };
  };

  const service = new JudgePanelService(
    new ModelGateway(gatewayKeys(settings), recording),
    slots,
  );
  for (const [label, answer] of answersToRun())
    printResult(`Gọi thật · ${label}`, await service.grade(turn(answer)));
  if (outDir) console.log(`\nĐã ghi ${n} cặp request/response vào ${outDir}`);
}

console.log(
  `AI-5 · ${SCENARIO_KEY} ${ACTIVITY_ID} · ${criteriaFromActivity(activity).length} tiêu chí · bậc chính ${tier} · chế độ ${mode}`,
);
async function main(): Promise<void> {
  if (mode === 'dry') dry();
  else if (mode === 'fake') await fake();
  else if (mode === 'live') await live();
  else throw new Error(`Không có chế độ ${mode}: dry | fake | live`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
