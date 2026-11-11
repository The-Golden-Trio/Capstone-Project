/**
 * Chạy thử người dẫn truyện (AI-4) trên một lượt chơi mẫu.
 *
 * Mặc định là contract theo nhịp (D-130) trên các cảnh của seed Back-end L3 m2
 * (`ai/testing/sample-scene.ts`). Contract cũ, một câu follow-up trên kịch bản
 * dạng activity: thêm `--contract=legacy`.
 *
 *     pnpm exec nx run @datn/api:narrator-try                     # dry: in request, không gọi gì
 *     pnpm exec nx run @datn/api:narrator-try -- --mode=fake      # model giả, xem bậc dự phòng chạy
 *     pnpm exec nx run @datn/api:narrator-try -- --mode=check     # vừa gắn key: gọi thử, nói rõ sai ở đâu
 *     pnpm exec nx run @datn/api:narrator-try -- --mode=live      # gọi thật, cần QWEN_API_KEY hoặc OPENROUTER_API_KEY
 *     pnpm exec nx run @datn/api:narrator-try -- --mode=export    # ghi một lượt gọi ra request.json, response.json
 *
 * Tuỳ chọn của contract theo nhịp:
 *     --scene=n0|pha_support|bridge_n1|n2_reaction|n2_probe|n2_after|all   (mặc định: check và export
 *                     dùng n2_probe, các chế độ khác chạy all)
 *     --player="câu tự gõ"   thay câu người chơi của cảnh
 *     --choice=anh|chi       người chơi chọn xưng hô (mặc định chi)
 *
 * Tuỳ chọn của contract cũ (--contract=legacy):
 *     --out=thư/mục   nơi ghi file JSON (export: mặc định docs/project-hub/assets/ai-design/ai-4-api;
 *                     live: ghi nguyên văn từng request và response thật)
 *     --answer=dung_kich_ban|lac_kich_ban|tan_cong|do_rubric|all   (mặc định dung_kich_ban)
 *     --answer="câu tự gõ"
 *     --repeat=2      gọi lại cùng lượt N lần — lần sau phải trúng cache
 *     --scenario=KEY --activity=a3   chạy hoạt động khác (mặc định SWE_BACKEND_L3_S_INCIDENT, a2);
 *                     câu trả lời mẫu viết cho a2, nên với hoạt động khác hãy dùng --answer="…"
 *     --no-follow-up  engine không cho hỏi đào sâu ở lượt này
 *
 * Mục đích là biết thiết kế trên giấy có đúng với thực tế không: request gửi
 * đi đúng từng tham số chưa, phần cố định đủ 1.024 token để cache chưa, cache
 * có trúng thật không, mất bao lâu, tốn bao nhiêu, bốn luật bắt được gì.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  FOLLOW_UP_MAX_CHARS,
  beatsJsonSchema,
  checkBeats,
  checkNarration,
  sceneTurnTexts,
  type SceneTurn,
  hiddenTexts,
  narrationJsonSchema,
  narratorView,
  textsOf,
  type Scenario,
} from '@datn/game-core';
import { fixtureData } from '@datn/game-core/testing';
import { aiSettingsFromEnv } from '../ai/ai.module';
import { CircuitBreaker } from '../ai/gateway/circuit-breaker';
import { explainGatewayError, keyWarnings } from '../ai/gateway/diagnose';
import { GatewayError, type ModelSpec, type Transport } from '../ai/gateway/gateway.types';
import { ModelGateway, fetchTransport } from '../ai/gateway/model-gateway';
import { deepseekFlash, gatewayKeys, narratorChain, openRouterQwenFlash, qwenFlash } from '../ai/gateway/models';
import { NARRATOR_PROFILE } from '../ai/narrator/narrator.profile';
import { buildNarratorMessages } from '../ai/narrator/narrator.prompt';
import { NarratorService, type NarrateResult, type NarrateSceneResult } from '../ai/narrator/narrator.service';
import { buildSceneMessages } from '../ai/narrator/scene.prompt';
import { FakeClock, fakeTransport } from '../ai/testing/fake-model';
import { SAMPLE_SCENE_IDS, SAMPLE_SEED, sampleScene, type SampleSceneId } from '../ai/testing/sample-scene';
import {
  SAMPLE_ACTIVITY_ID,
  SAMPLE_ANSWERS,
  SAMPLE_SCENARIO_KEY,
  transcriptBefore,
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

/** Nạp `.env` bằng tay, như `seed-content` — script chạy ngoài Nest. */
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
    process.env[key] = trimmed.slice(at + 1).trim().replace(/^["']|["']$/g, '');
  }
}

// Cùng thứ tự với `ConfigModule` trong AppModule: file của API trước, file gốc sau.
loadEnvFile(join(process.cwd(), 'apps/api/.env'));
loadEnvFile(join(process.cwd(), '.env'));

const mode = args.get('mode') ?? 'dry';
const repeat = Math.max(1, Number(args.get('repeat') ?? 1));
const followUpAllowed = !args.has('no-follow-up');
const contract = args.get('contract') ?? 'scene';
const SCENARIO_KEY = args.get('scenario') ?? SAMPLE_SCENARIO_KEY;
const ACTIVITY_ID = args.get('activity') ?? SAMPLE_ACTIVITY_ID;

function answersToRun(): Array<[string, string]> {
  const chosen = args.get('answer') ?? 'dung_kich_ban';
  if (chosen === 'all') return Object.entries(SAMPLE_ANSWERS);
  if (chosen in SAMPLE_ANSWERS) return [[chosen, SAMPLE_ANSWERS[chosen as AnswerClass]]];
  return [['tu_go', chosen]];
}

/* ── In ────────────────────────────────────────────────────────────── */

const rule = (title: string) => console.log(`\n━━ ${title} ${'━'.repeat(Math.max(0, 66 - title.length))}`);
const usd = (n: number) => `${n.toFixed(6)} USD`;
/** Ước thô, chỉ để biết cỡ — số thật lấy từ `usage` khi gọi thật. */
const roughTokens = (chars: number) => Math.round(chars / 2.5);

function printResult(label: string, result: NarrateResult): void {
  rule(label);
  if (result.status === 'ok') {
    console.log(`✔ ${result.line.speaker}: ${result.line.follow_up}`);
  } else if (result.status === 'skipped') {
    console.log('■ skipped — engine không cho hỏi đào sâu, không gọi model');
  } else if (result.status === 'blocked') {
    console.log('■ blocked — bộ lọc nội dung của nhà cung cấp chặn');
  } else {
    console.log(`■ unavailable — ${result.reason}`);
  }
  printRecords(result);
}

function printRecords(result: NarrateResult | NarrateSceneResult): void {
  if (Object.keys(result.redactions).length > 0)
    console.log(`  đã khử định danh: ${JSON.stringify(result.redactions)}`);

  console.table(
    result.records.map((r) => ({
      lần: r.attempt,
      model: r.modelKey,
      kết_quả: r.outcome,
      'ms': r.latencyMs,
      vào: r.usage?.input ?? '',
      trúng_cache: r.usage?.cachedInput ?? '',
      ra: r.usage?.output ?? '',
      chi_phí: r.cost ? usd(r.cost.usd) + (r.cost.basis === 'upper_bound' ? ' (cận trên)' : '') : '',
      vi_phạm: r.violations.map((v) => v.rule).join(',') || (r.error ? r.error.kind : ''),
    })),
  );
  for (const r of result.records) {
    for (const v of r.violations) console.log(`  lần ${r.attempt} ${v.rule}: ${v.detail}`);
    if (r.error) console.log(`  lần ${r.attempt} lỗi: ${r.error.message}`);
    if (r.outcome !== 'accepted' && r.output) console.log(`  lần ${r.attempt} model trả: ${r.output}`);
  }
  console.log(`  tổng chi phí: ${usd(result.cost.usd)}${result.cost.basis === 'upper_bound' ? ' (cận trên)' : ''}`);
}

/* ── Ghi file JSON ─────────────────────────────────────────────────── */

const outDir = args.get('out');

function save(dir: string, name: string, value: unknown): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), JSON.stringify(value, null, 2) + '\n');
  console.log(`  đã ghi ${join(dir, name)}`);
}

/**
 * Chú thích cho `request.jsonc`: chèn ngay trên dòng bắt đầu bằng khoá tương
 * ứng, cùng thụt lề. JSON chuẩn không cho comment, nên file có đuôi `.jsonc`.
 */
const REQUEST_NOTES: Array<[string, string[]]> = [
  ['"url":', ['Qwen ở Frankfurt (eu-central-1): có JSON Schema strict. Singapore gần Việt Nam hơn nhưng chưa có.']],
  ['"Authorization":', ['Key nằm ở máy chủ JobQuest, không bao giờ xuống trình duyệt.']],
  ['"model":', ['Model dẫn truyện tạm chọn (D-107): tiếng Việt tốt, rẻ. Dự phòng: deepseek-flash.']],
  ['"messages":', [
    'Prompt. Không dùng phiên lưu bên Qwen: mỗi lượt gửi lại đủ ngữ cảnh,',
    'để đổi sang model dự phòng giữa chừng vẫn chạy và câu bị luật loại không lọt vào lịch sử.',
  ]],
  ['"role": "system"', [
    'PHẦN 1. Luật cho AI-4 (system prompt): giống hệt nhau cho mọi người chơi, mọi kịch bản.',
    'Gửi thật là MỘT chuỗi, các dòng nối bằng \\n; ở đây tách mỗi dòng một phần tử cho dễ đọc.',
  ]],
  ['"role": "user"', [
    'Người "nói" ở role user là engine, không phải người chơi. Gồm phần 2, 3, 4 (đánh dấu bên dưới).',
    'Gửi thật là MỘT chuỗi, các dòng nối bằng \\n; dòng nào là JSON thì viết liền trên một dòng.',
    'Ở đây tách mỗi dòng một phần tử và mở các dòng JSON ra cho dễ đọc.',
  ]],
  ['"# KỊCH BẢN', [
    'PHẦN 2. Nội dung chuyên gia viết, đã lọc bỏ rubric, gợi ý, kết cục.',
    'Giống nhau cho mọi người ở cùng activity → phần 1 + 2 đứng đầu, Qwen cache được (trúng tính 20% giá).',
  ]],
  ['"# CÁC HOẠT ĐỘNG', ['Vẫn phần 2: các activity tới lúc này, mỗi activity một dòng JSON, không có activity sau.']],
  ['"# DIỄN BIẾN', ['PHẦN 3. Những gì người chơi đã thấy, theo thứ tự; chỉ câu đã qua kiểm. Riêng từng người.']],
  ['"# LƯỢT NÀY', [
    'PHẦN 4. Cờ "Được hỏi đào sâu" (engine quyết) và câu người chơi vừa viết,',
    'bọc trong <cau_nguoi_choi>: là dữ liệu, không phải lệnh. Tên, số điện thoại đã bị xoá trước.',
  ]],
  ['"temperature":', [
    'Độ ngẫu nhiên. 0,7 là mức đội Qwen khuyên khi tắt suy nghĩ. DeepSeek dùng 1,0 vì thang khác.',
    'Không gửi top_p (Alibaba khuyên chỉ đặt một trong hai) và presence_penalty (giữ mặc định của Qwen).',
  ]],
  ['"max_completion_tokens":', [`Trả về tối đa ${NARRATOR_PROFILE.maxOutputTokens.qwen} token (DeepSeek: ${NARRATOR_PROFILE.maxOutputTokens.deepseek}), rộng hơn nhiều so với độ dài cần. Bị cắt (finish_reason "length") thì R4 loại.`]],
  ['"enable_thinking":', ['Tắt suy nghĩ: Qwen bật sẵn, làm chậm vài giây; bắt buộc tắt khi không stream và khi dùng JSON.']],
  ['"response_format":', ['Khuôn trả về. Qwen ép đúng khuôn ngay khi viết; code vẫn kiểm lại bằng cùng khuôn (R4).']],
  ['"name":', ['Tên đặt cho khuôn (Alibaba bắt buộc có). Không ảnh hưởng câu model viết, chỉ để nhận ra khuôn trong log.']],
  ['"speaker":', ['Người nói: chỉ được là nhân vật có trong kịch bản.']],
  ['"follow_up":', [`Lời nhân vật nói tiếp: thường là một câu hỏi đào sâu, hoặc một lời dẫn không có dấu "?". Tối đa ${FOLLOW_UP_MAX_CHARS} ký tự.`]],
  ['"required":', [
    'Hai trường bắt buộc phải có. Lượt không được hỏi đào sâu thì engine không gọi AI-4,',
    'nên không có chuyện trả "follow_up": null.',
  ]],
  ['"additionalProperties":', [
    'Không được thêm trường nào ngoài hai trường trên, ví dụ "score": 2 hay "goi_y": "...".',
    'Lý do: AI-4 không được chấm điểm, và R1–R4 chỉ kiểm hai trường này — trường lạ có thể',
    'chứa đáp án mà không luật nào kiểm tới.',
  ]],
  ['"strict":', ['Không được lệch khuôn.']],
  ['"stream":', ['Nhận cả câu một lần: phải kiểm 4 luật xong mới hiện cho người chơi.']],
];

/**
 * Bản dễ đọc của body: `content` của mỗi message tách thành mảng từng dòng,
 * dòng nào là JSON thì mở ra thành object. Chỉ để người đọc — gửi thật vẫn
 * là một chuỗi (bản nguyên dạng: chế độ live với --out).
 */
function readableBody(body: Record<string, unknown>): Record<string, unknown> {
  const messages = body['messages'] as Array<{ role: string; content: unknown }>;
  return {
    ...body,
    messages: messages.map((m) => ({
      ...m,
      content:
        typeof m.content === 'string'
          ? m.content.split('\n').map((line) => {
              if (!line.startsWith('{')) return line;
              try {
                return JSON.parse(line) as unknown;
              } catch {
                return line;
              }
            })
          : m.content,
    })),
  };
}

function annotate(json: string, header: string[], notes: Array<[string, string[]]>): string {
  const used = new Set<string>();
  const lines = json.split('\n').flatMap((line) => {
    const trimmed = line.trimStart();
    const indent = line.slice(0, line.length - trimmed.length);
    const hit = notes.find(([prefix]) => !used.has(prefix) && trimmed.startsWith(prefix));
    if (!hit) return [line];
    used.add(hit[0]);
    return [...hit[1].map((note) => `${indent}// ${note}`), line];
  });
  return [...header.map((h) => `// ${h}`), ...lines].join('\n') + '\n';
}

const keyName = (url: string) => {
  if (url.includes('deepseek')) return '{DEEPSEEK_API_KEY}';
  return url.includes('openrouter') ? '{OPENROUTER_API_KEY}' : '{QWEN_API_KEY}';
};

/** Request đúng như gửi đi, key thay bằng tên biến môi trường. */
const asRequest = (url: string, body: unknown) => ({
  method: 'POST',
  url,
  headers: { Authorization: `Bearer ${keyName(url)}`, 'Content-Type': 'application/json' },
  body,
});

interface Exchange {
  url: string;
  body: unknown;
  status: number;
  response: unknown;
}

/**
 * Bọc ngoài một transport để ghi lại nguyên văn từng request và response —
 * chính thứ đi qua mạng, không phải thứ code đã đọc lại.
 */
function recording(inner: Transport): Transport & { log: Exchange[] } {
  const log: Exchange[] = [];
  const transport: Transport = async (url, init) => {
    const res = await inner(url, init);
    const text = await res.text();
    let response: unknown = text;
    try {
      response = JSON.parse(text);
    } catch {
      // Giữ nguyên chuỗi nếu không phải JSON.
    }
    log.push({ url, body: JSON.parse(init.body), status: res.status, response });
    return { status: res.status, text: async () => text };
  };
  return Object.assign(transport, { log });
}

/* ── Ba chế độ ─────────────────────────────────────────────────────── */

function dry(scenario: Scenario, answer: string): void {
  const view = narratorView(scenario, ACTIVITY_ID);
  const turn = {
    view,
    activityId: ACTIVITY_ID,
    transcript: transcriptBefore(scenario, ACTIVITY_ID),
    answer,
  };
  const [system, user] = buildNarratorMessages(turn, 'qwen');
  const fixed = system.parts[0].text.length + user.parts[0].text.length;
  const dynamic = user.parts[1].text.length;

  rule('Kích thước prompt (token ước, chưa đo)');
  console.log(`phần cố định (system + kịch bản, trước điểm cache): ${fixed} ký tự ≈ ${roughTokens(fixed)} token`);
  console.log(`phần riêng lượt này: ${dynamic} ký tự ≈ ${roughTokens(dynamic)} token`);
  console.log(
    roughTokens(fixed) >= 1024
      ? '→ phần cố định có vẻ đủ 1.024 token để Qwen cache. Xác nhận bằng --mode=live --repeat=2.'
      : '→ phần cố định CÓ THỂ dưới 1.024 token: Qwen sẽ không cache. Xác nhận bằng --mode=live.',
  );
  console.log(`AI-4 không được thấy ${hiddenTexts(scenario, ACTIVITY_ID).length} đoạn (rubric, gợi ý, kết cục, hoạt động sau).`);

  rule('System prompt');
  console.log(system.parts[0].text);
  rule('Kịch bản AI-4 thấy (phần được cache)');
  console.log(user.parts[0].text);
  rule('Phần riêng lượt này');
  console.log(user.parts[1].text);

  const gateway = new ModelGateway({});
  const schema = narrationJsonSchema(view.cast.map((c) => c.npc_id));
  const specs: ModelSpec[] = [
    qwenFlash({ apiKey: '-', region: 'eu-central-1', workspaceId: '{WorkspaceId}', cacheMode: 'implicit' }),
    qwenFlash({ apiKey: '-', region: 'eu-central-1', workspaceId: '{WorkspaceId}', cacheMode: 'explicit' }),
    qwenFlash({ apiKey: '-', region: 'ap-southeast-1', cacheMode: 'implicit' }),
    openRouterQwenFlash({ apiKey: '-' }, { allowDataCollection: false }),
    deepseekFlash(),
  ];
  for (const spec of specs) {
    const messages = buildNarratorMessages(turn, spec.provider);
    const { url, body } = gateway.preview({
      model: spec,
      messages,
      temperature: NARRATOR_PROFILE.temperature[spec.provider],
      maxOutputTokens: NARRATOR_PROFILE.maxOutputTokens[spec.provider],
      json: { name: 'narration', schema },
      timeoutMs: NARRATOR_PROFILE.attemptTimeoutMs,
    });
    // In tham số, rút gọn nội dung message cho dễ đọc.
    const shown = {
      ...body,
      messages: (body['messages'] as Array<{ role: string; content: unknown }>).map((m) => ({
        role: m.role,
        content:
          typeof m.content === 'string'
            ? `‹${m.content.length} ký tự›`
            : (m.content as Array<Record<string, unknown>>).map((p) => ({
                ...p,
                text: `‹${String(p['text']).length} ký tự›`,
              })),
      })),
    };
    rule(`Request — ${spec.key}, cache ${spec.cacheMode}`);
    console.log(`POST ${url}`);
    console.log(JSON.stringify(shown, null, 2));
  }
}

async function fake(scenario: Scenario, answers: Array<[string, string]>): Promise<void> {
  // Lượt 1 bịa số → R1 loại; lượt 2 hợp lệ. Đủ để thấy bậc dự phòng chạy
  // thật qua adapter, luật và bản ghi — chỉ câu trả lời là giả.
  const clock = new FakeClock();
  const transport = fakeTransport(
    (_, i) =>
      i % 2 === 0
        ? { content: JSON.stringify({ speaker: 'an', follow_up: 'Ok, em sửa trong 15 phút nữa nhé.' }), latencyMs: 1700 }
        : {
            content: JSON.stringify({
              speaker: 'an',
              follow_up:
                'Ừ, anh nghe rồi. 900 đơn mà mỗi đơn một lần chạm DB thì chậm là phải. Thế nếu sau này có khách còn nhiều đơn hơn nữa thì endpoint này sẽ ra sao?',
            }),
            latencyMs: 1300,
            cachedTokens: 1024,
          },
    clock,
  );
  const chain = [qwenFlash({ apiKey: '-', region: 'eu-central-1', workspaceId: 'fake', cacheMode: 'implicit' })];
  const service = new NarratorService(
    new ModelGateway({ qwen: 'fake' }, transport, clock),
    new CircuitBreaker(clock),
    chain,
    clock,
  );
  for (const [label, answer] of answers) {
    const result = await service.narrate({
      scenario,
      activityId: ACTIVITY_ID,
      transcript: transcriptBefore(scenario, ACTIVITY_ID),
      answer,
      followUpAllowed,
    });
    printResult(`[model giả] ${label}`, result);
  }
}

/**
 * Ghi một lượt gọi API ra hai file: `request.json` (đúng thứ gửi đi) và
 * `response.json` (đúng thứ nhận về). Đi qua NarratorService thật, chỉ chỗ
 * trả lời là model giả — nên request khớp từng ký tự với request thật.
 */
async function exportFiles(scenario: Scenario, answer: string): Promise<void> {
  const dir = outDir ?? join(process.cwd(), 'docs/project-hub/assets/ai-design/ai-4-api');
  const clock = new FakeClock();
  const recorder = recording(
    fakeTransport(
      [
        {
          content: JSON.stringify({
            speaker: 'an',
            follow_up:
              'Ừ, anh nghe rồi. 900 đơn mà mỗi đơn một lần chạm DB thì chậm là phải. Thế nếu sau này có khách còn nhiều đơn hơn nữa thì endpoint này sẽ ra sao?',
          }),
          latencyMs: 1300,
          promptTokens: 2267,
          cachedTokens: 1024,
          completionTokens: 76,
        },
      ],
      clock,
    ),
  );
  const qwen = qwenFlash({ apiKey: '-', region: 'eu-central-1', workspaceId: '{WorkspaceId}', cacheMode: 'implicit' });
  const service = new NarratorService(new ModelGateway({ qwen: '-' }, recorder, clock), new CircuitBreaker(clock), [qwen], clock);
  await service.narrate({
    scenario,
    activityId: ACTIVITY_ID,
    transcript: transcriptBefore(scenario, ACTIVITY_ID),
    answer,
    followUpAllowed,
  });

  const [call] = recorder.log;
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'request.jsonc'),
    annotate(
      JSON.stringify(asRequest(call.url, readableBody(call.body as Record<string, unknown>)), null, 2),
      [
        'Một lượt gọi AI-4: máy chủ JobQuest gửi Qwen. Activity a2, người chơi vừa trả lời anh An.',
        'Sinh từ code bằng: pnpm exec nx run @datn/api:narrator-try -- --mode=export',
      ],
      REQUEST_NOTES,
    ),
  );
  console.log(`  đã ghi ${join(dir, 'request.jsonc')}`);
  save(dir, 'response.json', { status: call.status, body: call.response });
}

async function live(scenario: Scenario, answers: Array<[string, string]>): Promise<void> {
  const settings = aiSettingsFromEnv(loadAiEnv());
  const { chain, excluded } = narratorChain(settings);
  for (const { provider, reason } of excluded) console.log(`(không dùng ${provider}: ${reason})`);
  if (chain.length === 0) {
    console.error('\nKhông có model nào dùng được. Đặt QWEN_API_KEY hoặc OPENROUTER_API_KEY trong apps/api/.env.');
    process.exitCode = 1;
    return;
  }
  console.log(`Chuỗi: ${chain.map((s) => s.key).join(' → ')}`);

  const recorder = recording(fetchTransport);
  const service = new NarratorService(
    new ModelGateway(gatewayKeys(settings), recorder),
    new CircuitBreaker(),
    chain,
  );
  for (const [label, answer] of answers) {
    for (let i = 1; i <= repeat; i++) {
      const result = await service.narrate({
        scenario,
        activityId: ACTIVITY_ID,
        transcript: transcriptBefore(scenario, ACTIVITY_ID),
        answer,
        followUpAllowed,
      });
      printResult(`${label} — lần ${i}/${repeat}`, result);
    }
  }

  // Ghi nguyên văn từng request và response thật — key đã thay bằng tên biến.
  if (outDir) {
    recorder.log.forEach((exchange, i) => {
      const n = String(i + 1).padStart(2, '0');
      save(outDir, `live-${n}-request.json`, asRequest(exchange.url, exchange.body));
      save(outDir, `live-${n}-response.json`, { status: exchange.status, body: exchange.response });
    });
  }
}

/**
 * Chờ lâu hơn hẳn 4,5 s của lúc chơi: model chậm thì phải báo là chậm, chứ
 * không báo là hỏng. Vẫn có trần, để mạng treo không làm lệnh treo theo.
 */
const CHECK_TIMEOUT_MS = 30_000;

/** Đọc cấu hình AI; giá trị sai thì in tên biến và trả null thay vì ném lỗi Zod thô. */
function loadSettingsForCheck(): ReturnType<typeof aiSettingsFromEnv> | null {
  try {
    return aiSettingsFromEnv(loadAiEnv());
  } catch (err) {
    const issues = (err as { issues?: Array<{ path: unknown[]; message: string }> }).issues ?? [];
    console.error('✘ .env có giá trị không hợp lệ:');
    for (const issue of issues) console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    process.exitCode = 1;
    return null;
  }
}

/**
 * Lệnh chạy đầu tiên sau khi gắn key. Mỗi model gọi một lượt thật với prompt
 * thật, rồi chạy cả AI-4 một lượt. Tốn cỡ vài nghìn token.
 *
 * Tách hai loại kết quả: FAIL là request không chạy được, phải sửa cấu hình
 * hay code. Cảnh báo là chạy được nhưng cần xem lại, ví dụ model chậm hay câu
 * viết chưa qua luật.
 */
async function check(scenario: Scenario, answer: string): Promise<void> {
  const settings = loadSettingsForCheck();
  if (!settings) return;
  const { chain, excluded } = narratorChain(settings);
  let failed = false;

  rule('1. Cấu hình');
  for (const warning of keyWarnings(settings)) console.log(`⚠ ${warning}`);
  for (const { provider, reason } of excluded) console.log(`– không dùng ${provider}: ${reason}`);
  if (chain.length === 0) {
    console.error('✘ Không có model nào dùng được. Đặt QWEN_API_KEY hoặc OPENROUTER_API_KEY trong apps/api/.env.');
    process.exitCode = 1;
    return;
  }
  console.log(`Chuỗi: ${chain.map((s) => s.key).join(' → ')}`);

  const view = narratorView(scenario, ACTIVITY_ID);
  const transcript = transcriptBefore(scenario, ACTIVITY_ID);
  const castIds = view.cast.map((c) => c.npc_id);
  const turn = { view, activityId: ACTIVITY_ID, transcript, answer };
  const gateway = new ModelGateway(gatewayKeys(settings));

  for (const spec of chain) {
    rule(`2. Gọi thử ${spec.key}`);
    console.log(`POST ${spec.baseUrl}/chat/completions`);
    console.log(`khuôn trả về: ${spec.supports.jsonSchema ? 'JSON Schema strict' : 'json_object (R4 kiểm khuôn bằng code)'}`);

    try {
      const result = await gateway.complete({
        model: spec,
        messages: buildNarratorMessages(turn, spec.provider),
        temperature: NARRATOR_PROFILE.temperature[spec.provider],
        maxOutputTokens: NARRATOR_PROFILE.maxOutputTokens[spec.provider],
        json: { name: 'narration', schema: narrationJsonSchema(castIds) },
        timeoutMs: CHECK_TIMEOUT_MS,
      });
      console.log(`✔ request được nhận: ${result.latencyMs} ms, finish_reason ${result.finishReason}, id ${result.requestId ?? '(không có)'}`);
      console.log(`  token: vào ${result.usage.input}, trúng cache ${result.usage.cachedInput}, ra ${result.usage.output}, suy nghĩ ${result.usage.reasoning}`);
      console.log(`  model trả: ${result.text}`);

      if (result.usage.reasoning > 0) console.log('⚠ Model vẫn sinh token suy nghĩ: tham số tắt thinking không có tác dụng ở đường gọi này.');
      if (result.latencyMs > NARRATOR_PROFILE.attemptTimeoutMs)
        console.log(`⚠ Chậm hơn ${NARRATOR_PROFILE.attemptTimeoutMs} ms của lúc chơi: lượt thật sẽ hết giờ. Thử lại vài lần, hoặc đổi region.`);

      const { output, violations } = checkNarration(result.text, {
        visibleTexts: [...textsOf(view), ...transcript.map((l) => l.text), answer],
        hiddenTexts: hiddenTexts(scenario, ACTIVITY_ID),
        castIds,
        finishReason: result.finishReason,
      });
      if (!output) {
        failed = true;
        console.log(`✘ Không đọc được kết quả: ${violations.map((v) => v.detail).join('; ')}`);
      } else if (violations.length > 0) {
        console.log(`⚠ Đọc được nhưng chưa qua luật, lúc chơi sẽ viết lại: ${violations.map((v) => `${v.rule} ${v.detail}`).join('; ')}`);
      } else {
        console.log('✔ qua cả R1–R4');
      }
    } catch (err) {
      failed = true;
      const error = err instanceof GatewayError ? err : new GatewayError('network', String(err), spec.provider);
      console.log(`✘ ${error.kind}: ${error.message}`);
      console.log(`  → ${explainGatewayError(error)}`);
    }
  }

  rule('3. Chạy cả AI-4, đúng giới hạn thời gian lúc chơi');
  const service = new NarratorService(gateway, new CircuitBreaker(), chain);
  const result = await service.narrate({
    scenario,
    activityId: ACTIVITY_ID,
    transcript,
    answer,
    followUpAllowed: true,
  });
  printResult('kết quả', result);
  if (result.status !== 'ok') {
    failed = true;
    console.log(
      result.status === 'blocked'
        ? '✘ Bộ lọc nội dung của nhà cung cấp chặn câu mẫu, thử --answer=dung_kich_ban.'
        : `✘ AI-4 chưa ra được câu nào trong ${NARRATOR_PROFILE.attemptTimeoutMs} ms mỗi lần gọi và ${NARRATOR_PROFILE.deadlineMs} ms cả lượt. Xem dòng lỗi và các cảnh báo ở trên.`,
    );
  }

  rule(failed ? '✘ CHƯA CHẠY ĐƯỢC: sửa các dòng ✘ ở trên rồi chạy lại' : '✔ AI-4 CHẠY ĐƯỢC');
  if (failed) process.exitCode = 1;
}


/* ── Contract theo nhịp (D-130) ────────────────────────────────────── */

function scenesToRun(fallback: 'all' | SampleSceneId): Array<[SampleSceneId, SceneTurn]> {
  const chosen = args.get('scene') ?? fallback;
  const ids = chosen === 'all' ? SAMPLE_SCENE_IDS : [chosen as SampleSceneId];
  for (const id of ids)
    if (!SAMPLE_SCENE_IDS.includes(id)) throw new Error(`--scene phải là ${SAMPLE_SCENE_IDS.join(', ')} hoặc all (đang là "${id}")`);
  const choice = args.get('choice') === 'anh' ? 'anh' : 'chi';
  const player = args.get('player');
  return ids.map((id) => {
    const turn = sampleScene(id, { choice });
    return [id, player === undefined ? turn : { ...turn, playerLine: player }];
  });
}

function describeTurn(id: string, turn: SceneTurn): string {
  return `${id} · task ${turn.task} · ${turn.lead} · tối đa ${turn.maxBeats ?? 5} nhịp · hỏi: ${turn.task === 'probe' || turn.questionAllowed !== false ? 'có' : 'không'}`;
}

function printScene(label: string, result: NarrateSceneResult): void {
  rule(label);
  if (result.status === 'ok') {
    for (const b of result.beats) console.log(`✔ [${b.speaker}${b.expression ? ` · ${b.expression}` : ''}] ${b.text}`);
    console.log(`  question_by: ${result.questionBy ?? 'null'}`);
  } else if (result.status === 'blocked') {
    console.log('■ blocked — bộ lọc nội dung của nhà cung cấp chặn');
  } else {
    console.log(`■ unavailable — ${result.reason}`);
  }
  printRecords(result);
}

function sceneService(transport: Transport, keys: Parameters<typeof gatewayKeys>[0] | null, chain: ModelSpec[], clock?: FakeClock) {
  return new NarratorService(
    new ModelGateway(keys ? gatewayKeys(keys) : { qwen: '-' }, transport, clock),
    new CircuitBreaker(clock),
    chain,
    clock,
  );
}

function drySceneAll(): void {
  for (const [id, turn] of scenesToRun('all')) {
    const [system, user] = buildSceneMessages(turn);
    rule(describeTurn(id, turn));
    const fixed = system.parts[0].text.length + user.parts[0].text.length;
    console.log(`phần cố định (system + màn + công ty + thẻ): ${fixed} ký tự ≈ ${roughTokens(fixed)} token`);
    console.log(`phần riêng lượt này: ${user.parts[1].text.length} ký tự ≈ ${roughTokens(user.parts[1].text.length)} token`);
    if (args.has('full')) {
      rule('System prompt');
      console.log(system.parts[0].text);
      rule('Phần cố định của cảnh');
      console.log(user.parts[0].text);
    }
    rule('Phần riêng lượt này');
    console.log(user.parts[1].text);
  }
}

/** Câu trả lời mẫu hợp luật cho từng cảnh: model giả trả câu này. */
const FAKE_SCENE_REPLY: Record<SampleSceneId, object> = {
  n0: { beats: [{ speaker: 'mentor', text: 'Ừ, em coi log trước đi, có gì nhắn anh.', expression: 'binh_thuong' }], question_by: null },
  pha_support: {
    beats: [
      { speaker: 'support', text: 'Khách sỉ Minh Phát đó em, gọi chị nãy giờ.', expression: 'lo_lang' },
      { speaker: 'support', text: 'Họ có tới 900 đơn trong lịch sử luôn.', expression: 'lo_lang' },
      { speaker: 'support', text: 'Bên em có coi được chưa?', expression: 'lo_lang' },
    ],
    question_by: 'support',
  },
  bridge_n1: { beats: [{ speaker: 'canh', text: 'Điện thoại bàn reo, màn hình hiện số của bộ phận hỗ trợ.', expression: null }], question_by: null },
  n2_reaction: {
    beats: [
      { speaker: 'mentor', text: 'Anh coi ghi chú rồi nè.', expression: 'suy_nghi' },
      { speaker: 'mentor', text: 'Ừ, 901 lần hỏi cơ sở dữ liệu thì đúng là vòng lặp lấy từng đơn rồi.', expression: 'binh_thuong' },
    ],
    question_by: null,
  },
  n2_probe: {
    beats: [
      { speaker: 'mentor', text: 'Ừ, anh đọc tới chỗ 901 lần rồi.', expression: 'binh_thuong' },
      { speaker: 'mentor', text: 'Anh phải ghi vào báo cáo: em lấy gì để loại khả năng DB quá tải?', expression: 'suy_nghi' },
    ],
    question_by: 'mentor',
  },
  n2_after: { beats: [{ speaker: 'mentor', text: 'Ừ, anh hiểu rồi. Em làm tiếp đi.', expression: 'binh_thuong' }], question_by: null },
};

async function fakeSceneAll(): Promise<void> {
  // Lượt 1 bịa số → R1 loại; lượt 2 là câu mẫu hợp luật của cảnh đó.
  for (const [id, turn] of scenesToRun('all')) {
    const clock = new FakeClock();
    const transport = fakeTransport(
      (_, i) =>
        i === 0
          ? { content: JSON.stringify({ beats: [{ speaker: turn.lead, text: 'Cho anh 30 phút nha.', expression: 'binh_thuong' }], question_by: null }), latencyMs: 1700 }
          : { content: JSON.stringify(FAKE_SCENE_REPLY[id]), latencyMs: 1300, cachedTokens: 1024 },
      clock,
    );
    const qwen = qwenFlash({ apiKey: '-', region: 'eu-central-1', workspaceId: 'fake', cacheMode: 'implicit' });
    printScene(`[model giả] ${describeTurn(id, turn)}`, await sceneService(transport, null, [qwen], clock).narrateScene({ turn }));
  }
}

const SCENE_NOTES: Array<[string, string[]]> = [
  ['"url":', ['Qwen ở Frankfurt (eu-central-1): có JSON Schema strict. Singapore và Token Plan dùng json_object, R4 kiểm khuôn bằng code.']],
  ['"Authorization":', ['Key nằm ở máy chủ JobQuest, không bao giờ xuống trình duyệt.']],
  ['"model":', ['Model dẫn truyện (D-107).']],
  ['"messages":', ['Prompt. Không dùng phiên lưu bên Qwen: mỗi lượt gửi lại đủ ngữ cảnh (cảnh, thẻ, 8 lượt gần nhất).']],
  ['"role": "system"', [
    'PHẦN 1. Luật cho AI-4 (narrator.v3, D-130): bốn việc, khuôn nhịp, R1–R4, 13 luật cách viết. Giống nhau mọi màn.',
    'Gửi thật là MỘT chuỗi, các dòng nối bằng \\n; ở đây tách mỗi dòng một phần tử cho dễ đọc.',
  ]],
  ['"role": "user"', ['Người "nói" ở role user là engine. Gồm phần 2 (cố định trong cảnh, được cache) và phần 3 (riêng lượt này).']],
  ['"# MÀN"', ['PHẦN 2. Màn, hồ sơ công ty và thẻ nhân vật có mặt. Giống nhau suốt cảnh → Qwen cache được.']],
  ['"# THẺ NHÂN VẬT', [
    'Thẻ dựng theo Hồ sơ NPC mục 6.1: phần người (từ lá tarot, ở đây XVIII Sang) + phần slot (từ seed).',
    'Chỉ có dữ kiện slot biết (Seed C2). Khúc mắc giấu tới nút kết và câu kiểm của bộ phán không có ở đây.',
  ]],
  ['"# CẢNH HIỆN TẠI"', ['PHẦN 3. Riêng lượt này: cảnh, cờ truyện, 8 lượt gần nhất, việc engine giao. Câu người chơi bọc trong <cau_nguoi_choi>.']],
  ['"# LƯỢT NÀY"', ['Việc engine giao (D-128): task, ai nói, có được hỏi không, tối đa mấy nhịp, hook. AI-4 không tự quyết những điều này.']],
  ['"temperature":', ['Độ ngẫu nhiên. 0,7 là mức đội Qwen khuyên khi tắt suy nghĩ.']],
  ['"max_completion_tokens":', [`Trả về tối đa ${NARRATOR_PROFILE.maxOutputTokens.qwen} token: lượt dài nhất 5 nhịp × 120 ký tự khoảng 300–450 token. Bị cắt thì R4 loại.`]],
  ['"enable_thinking":', ['Tắt suy nghĩ: Qwen bật sẵn, làm chậm vài giây; bắt buộc tắt khi không stream.']],
  ['"response_format":', ['Khuôn trả về. Code vẫn kiểm lại bằng cùng khuôn (R4).']],
  ['"name":', ['Tên đặt cho khuôn (Alibaba bắt buộc có).']],
  ['"beats":', ['Các nhịp, tối đa số engine giao. Mỗi nhịp một ý, ≤ 120 ký tự; app hiện từng nhịp.']],
  ['"speaker":', ['Người nói: chỉ slot có mặt, hoặc "canh" (lời cảnh, ngôi thứ hai, không hỏi).']],
  ['"expression":', ['Biểu cảm theo bộ 8 mã có asset; null với lời cảnh.']],
  ['"question_by":', ['Ai đang chờ người chơi trả lời: slot của người hỏi ở nhịp cuối, hoặc null. Engine đọc trường này.']],
  ['"additionalProperties":', ['Không được thêm trường nào: AI-4 không chấm điểm, không gợi ý.']],
  ['"stream":', ['Nhận cả lượt một lần: phải kiểm 4 luật xong mới hiện.']],
];

async function exportScene(): Promise<void> {
  const dir = outDir ?? join(process.cwd(), 'docs/project-hub/assets/ai-design/ai-4-api');
  const [[id, turn]] = scenesToRun('n2_probe');
  const clock = new FakeClock();
  const recorder = recording(
    fakeTransport([{ content: JSON.stringify(FAKE_SCENE_REPLY[id]), latencyMs: 1300, promptTokens: 3100, cachedTokens: 2048, completionTokens: 70 }], clock),
  );
  const qwen = qwenFlash({ apiKey: '-', region: 'eu-central-1', workspaceId: '{WorkspaceId}', cacheMode: 'implicit' });
  await sceneService(recorder, null, [qwen], clock).narrateScene({ turn });

  const [call] = recorder.log;
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'request.jsonc'),
    annotate(
      JSON.stringify(asRequest(call.url, readableBody(call.body as Record<string, unknown>)), null, 2),
      [
        `Một lượt gọi AI-4 theo nhịp (D-130): seed ${SAMPLE_SEED}, nút n2, task probe. Người chơi vừa lưu ghi chú sự cố; mentor hỏi theo hook.`,
        'Sinh từ code bằng: pnpm exec nx run @datn/api:narrator-try -- --mode=export',
      ],
      SCENE_NOTES,
    ),
  );
  console.log(`  đã ghi ${join(dir, 'request.jsonc')}`);
  save(dir, 'response.json', { status: call.status, body: call.response });
}

async function liveSceneAll(): Promise<void> {
  const settings = aiSettingsFromEnv(loadAiEnv());
  const { chain, excluded } = narratorChain(settings);
  for (const { provider, reason } of excluded) console.log(`(không dùng ${provider}: ${reason})`);
  if (chain.length === 0) {
    console.error('\nKhông có model nào dùng được. Đặt QWEN_API_KEY hoặc OPENROUTER_API_KEY trong apps/api/.env hoặc .env.');
    process.exitCode = 1;
    return;
  }
  console.log(`Chuỗi: ${chain.map((s) => s.key).join(' → ')}`);
  const recorder = recording(fetchTransport);
  const service = sceneService(recorder, settings, chain);
  for (const [id, turn] of scenesToRun('all'))
    for (let i = 1; i <= repeat; i++)
      printScene(`${describeTurn(id, turn)} — lần ${i}/${repeat}`, await service.narrateScene({ turn, contentVersion: 4 }));
  if (outDir)
    recorder.log.forEach((exchange, i) => {
      const n = String(i + 1).padStart(2, '0');
      save(outDir, `live-${n}-request.json`, asRequest(exchange.url, exchange.body));
      save(outDir, `live-${n}-response.json`, { status: exchange.status, body: exchange.response });
    });
}

/** Như `check` của contract cũ: gọi thô một lượt với thời gian rộng, rồi chạy cả AI-4 đúng giới hạn lúc chơi. */
async function checkScene(): Promise<void> {
  const settings = loadSettingsForCheck();
  if (!settings) return;
  const { chain, excluded } = narratorChain(settings);
  let failed = false;

  rule('1. Cấu hình');
  for (const warning of keyWarnings(settings)) console.log(`⚠ ${warning}`);
  for (const { provider, reason } of excluded) console.log(`– không dùng ${provider}: ${reason}`);
  if (chain.length === 0) {
    console.error('✘ Không có model nào dùng được. Đặt QWEN_API_KEY hoặc OPENROUTER_API_KEY trong apps/api/.env hoặc .env.');
    process.exitCode = 1;
    return;
  }
  console.log(`Chuỗi: ${chain.map((s) => s.key).join(' → ')}`);

  const [[id, turn]] = scenesToRun('n2_probe');
  const speakers = turn.cards.map((c) => c.slot);
  const maxBeats = turn.maxBeats ?? 5;
  const gateway = new ModelGateway(gatewayKeys(settings));
  console.log(`Cảnh: ${describeTurn(id, turn)}`);

  for (const spec of chain) {
    rule(`2. Gọi thử ${spec.key}`);
    console.log(`POST ${spec.baseUrl}/chat/completions`);
    console.log(`khuôn trả về: ${spec.supports.jsonSchema ? 'JSON Schema strict' : 'json_object (R4 kiểm khuôn bằng code)'}`);
    try {
      const result = await gateway.complete({
        model: spec,
        messages: buildSceneMessages(turn),
        temperature: NARRATOR_PROFILE.temperature[spec.provider],
        maxOutputTokens: NARRATOR_PROFILE.maxOutputTokens[spec.provider],
        json: { name: 'narration_beats', schema: beatsJsonSchema(speakers, maxBeats) },
        timeoutMs: CHECK_TIMEOUT_MS,
      });
      console.log(`✔ request được nhận: ${result.latencyMs} ms, finish_reason ${result.finishReason}, id ${result.requestId ?? '(không có)'}`);
      console.log(`  token: vào ${result.usage.input}, trúng cache ${result.usage.cachedInput}, ra ${result.usage.output}, suy nghĩ ${result.usage.reasoning}`);
      console.log(`  model trả: ${result.text}`);
      if (result.usage.reasoning > 0) console.log('⚠ Model vẫn sinh token suy nghĩ: tham số tắt thinking không có tác dụng ở đường gọi này.');
      if (result.latencyMs > NARRATOR_PROFILE.attemptTimeoutMs)
        console.log(`⚠ Chậm hơn ${NARRATOR_PROFILE.attemptTimeoutMs} ms của lúc chơi: lượt thật sẽ hết giờ.`);
      const { output, violations } = checkBeats(result.text, {
        task: turn.task,
        lead: turn.lead,
        speakers,
        questionAllowed: turn.questionAllowed !== false,
        maxBeats,
        visibleTexts: sceneTurnTexts(turn),
        hiddenTexts: turn.hidden,
        finishReason: result.finishReason,
      });
      if (!output) {
        failed = true;
        console.log(`✘ Không đọc được kết quả: ${violations.map((v) => v.detail).join('; ')}`);
      } else if (violations.length > 0) {
        console.log(`⚠ Đọc được nhưng chưa qua luật, lúc chơi sẽ viết lại: ${violations.map((v) => `${v.rule} ${v.detail}`).join('; ')}`);
      } else console.log('✔ qua cả R1–R4');
    } catch (err) {
      failed = true;
      const error = err instanceof GatewayError ? err : new GatewayError('network', String(err), spec.provider);
      console.log(`✘ ${error.kind}: ${error.message}`);
      console.log(`  → ${explainGatewayError(error)}`);
    }
  }

  rule('3. Chạy cả AI-4, đúng giới hạn thời gian lúc chơi');
  const result = await sceneService(fetchTransport, settings, chain).narrateScene({ turn });
  printScene('kết quả', result);
  if (result.status !== 'ok') {
    failed = true;
    console.log(
      result.status === 'blocked'
        ? '✘ Bộ lọc nội dung của nhà cung cấp chặn câu mẫu.'
        : `✘ AI-4 chưa ra được lượt nào trong ${NARRATOR_PROFILE.attemptTimeoutMs} ms mỗi lần gọi và ${NARRATOR_PROFILE.deadlineMs} ms cả lượt. Xem dòng lỗi và các cảnh báo ở trên.`,
    );
  }
  rule(failed ? '✘ CHƯA CHẠY ĐƯỢC: sửa các dòng ✘ ở trên rồi chạy lại' : '✔ AI-4 CHẠY ĐƯỢC');
  if (failed) process.exitCode = 1;
}

async function main(): Promise<void> {
  if (contract === 'scene') {
    console.log(`Contract theo nhịp (D-130), seed ${SAMPLE_SEED}, chế độ ${mode}`);
    if (mode === 'dry') return drySceneAll();
    if (mode === 'fake') return fakeSceneAll();
    if (mode === 'check') return checkScene();
    if (mode === 'live') return liveSceneAll();
    if (mode === 'export') return exportScene();
    console.error(`--mode phải là dry, fake, check, live hoặc export (đang là "${mode}")`);
    process.exitCode = 1;
    return;
  }
  if (contract !== 'legacy') {
    console.error(`--contract phải là scene hoặc legacy (đang là "${contract}")`);
    process.exitCode = 1;
    return;
  }
  const scenarios = fixtureData().scenarios;
  const scenario = scenarios[SCENARIO_KEY];
  if (!scenario) {
    console.error(`Không có kịch bản ${SCENARIO_KEY}. Có: ${Object.keys(scenarios).join(', ')}`);
    process.exitCode = 1;
    return;
  }
  if (!scenario.activities.some((a) => a.activity_id === ACTIVITY_ID)) {
    console.error(`Kịch bản ${SCENARIO_KEY} không có hoạt động ${ACTIVITY_ID}.`);
    process.exitCode = 1;
    return;
  }
  const answers = answersToRun();
  if (ACTIVITY_ID !== SAMPLE_ACTIVITY_ID && !answers.some(([label]) => label === 'tu_go'))
    console.log(`⚠ Câu trả lời mẫu viết cho ${SAMPLE_ACTIVITY_ID}; với ${ACTIVITY_ID} nên dùng --answer="…".`);
  console.log(`Kịch bản ${SCENARIO_KEY}, hoạt động ${ACTIVITY_ID}, chế độ ${mode}, được hỏi đào sâu: ${followUpAllowed ? 'có' : 'không'}`);

  if (mode === 'dry') return dry(scenario, answers[0][1]);
  if (mode === 'fake') return fake(scenario, answers);
  if (mode === 'check') return check(scenario, answers[0][1]);
  if (mode === 'live') return live(scenario, answers);
  if (mode === 'export') return exportFiles(scenario, answers[0][1]);
  console.error(`--mode phải là dry, fake, check, live hoặc export (đang là "${mode}")`);
  process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
