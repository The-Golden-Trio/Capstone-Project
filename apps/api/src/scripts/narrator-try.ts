/**
 * Chạy thử người dẫn truyện (AI-4) trên một lượt chơi mẫu của kịch bản thật.
 *
 *     pnpm exec nx run @datn/api:narrator-try                     # dry: in request, không gọi gì
 *     pnpm exec nx run @datn/api:narrator-try -- --mode=fake      # model giả, xem bậc dự phòng chạy
 *     pnpm exec nx run @datn/api:narrator-try -- --mode=live      # gọi thật, cần QWEN_API_KEY
 *     pnpm exec nx run @datn/api:narrator-try -- --mode=export    # ghi một lượt gọi ra request.json, response.json
 *
 * Tuỳ chọn:
 *     --out=thư/mục   nơi ghi file JSON (export: mặc định docs/project-hub/assets/ai-design/ai-4-api;
 *                     live: ghi nguyên văn từng request và response thật)
 *     --answer=dung_kich_ban|lac_kich_ban|tan_cong|do_rubric|all   (mặc định dung_kich_ban)
 *     --answer="câu tự gõ"
 *     --repeat=2      gọi lại cùng lượt N lần — lần sau phải trúng cache
 *     --no-follow-up  engine không cho hỏi đào sâu ở lượt này
 *
 * Mục đích là biết thiết kế trên giấy có đúng với thực tế không: request gửi
 * đi đúng từng tham số chưa, phần cố định đủ 1.024 token để cache chưa, cache
 * có trúng thật không, mất bao lâu, tốn bao nhiêu, bốn luật bắt được gì.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  hiddenTexts,
  narrationJsonSchema,
  narratorView,
  type Scenario,
} from '@datn/game-core';
import { fixtureData } from '@datn/game-core/testing';
import { aiSettingsFromEnv } from '../ai/ai.module';
import { CircuitBreaker } from '../ai/gateway/circuit-breaker';
import type { ModelSpec, Transport } from '../ai/gateway/gateway.types';
import { ModelGateway, fetchTransport } from '../ai/gateway/model-gateway';
import { deepseekFlash, narratorChain, qwenFlash } from '../ai/gateway/models';
import { NARRATOR_PROFILE } from '../ai/narrator/narrator.profile';
import { buildNarratorMessages } from '../ai/narrator/narrator.prompt';
import { NarratorService, type NarrateResult } from '../ai/narrator/narrator.service';
import { FakeClock, fakeTransport } from '../ai/testing/fake-model';
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

loadEnvFile(join(process.cwd(), 'apps/api/.env'));

const mode = args.get('mode') ?? 'dry';
const repeat = Math.max(1, Number(args.get('repeat') ?? 1));
const followUpAllowed = !args.has('no-follow-up');

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
    console.log(`✔ ${result.line.speaker}: ${result.line.narration}`);
    console.log(`  hỏi đào sâu: ${result.line.follow_up ?? '(không)'}`);
  } else if (result.status === 'blocked') {
    console.log('■ blocked — bộ lọc nội dung của nhà cung cấp chặn');
  } else {
    console.log(`■ unavailable — ${result.reason}`);
  }
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
  ['"max_completion_tokens":', ['Trả về tối đa 300 token, gấp đôi độ dài cần. Bị cắt (finish_reason "length") thì R4 loại.']],
  ['"enable_thinking":', ['Tắt suy nghĩ: Qwen bật sẵn, làm chậm vài giây; bắt buộc tắt khi không stream và khi dùng JSON.']],
  ['"response_format":', ['Khuôn trả về. Qwen ép đúng khuôn ngay khi viết; code vẫn kiểm lại bằng cùng khuôn (R4).']],
  ['"name":', ['Tên đặt cho khuôn (Alibaba bắt buộc có). Không ảnh hưởng câu model viết, chỉ để nhận ra khuôn trong log.']],
  ['"speaker":', ['Người nói: chỉ được là nhân vật có trong kịch bản.']],
  ['"narration":', ['Lời nhân vật đáp lại câu người chơi: tối đa 280 ký tự, vừa một bong bóng chat.']],
  ['"follow_up":', ['Câu hỏi đào sâu, hoặc null nghĩa là không hỏi.']],
  ['"required":', [
    'Ba trường bắt buộc phải có. Không hỏi thì vẫn phải ghi "follow_up": null,',
    'để code phân biệt được "quyết định không hỏi" với "quên viết".',
  ]],
  ['"additionalProperties":', [
    'Không được thêm trường nào ngoài ba trường trên, ví dụ "score": 2 hay "goi_y": "...".',
    'Lý do: AI-4 không được chấm điểm, và R1–R4 chỉ kiểm ba trường này — trường lạ có thể',
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

const keyName = (url: string) => (url.includes('deepseek') ? '{DEEPSEEK_API_KEY}' : '{QWEN_API_KEY}');

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
  const view = narratorView(scenario, SAMPLE_ACTIVITY_ID);
  const messages = buildNarratorMessages({
    view,
    activityId: SAMPLE_ACTIVITY_ID,
    transcript: transcriptBefore(scenario, SAMPLE_ACTIVITY_ID),
    answer,
    followUpAllowed,
  });
  const [system, user] = messages;
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
  console.log(`AI-4 không được thấy ${hiddenTexts(scenario, SAMPLE_ACTIVITY_ID).length} đoạn (rubric, gợi ý, kết cục, hoạt động sau).`);

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
    deepseekFlash(),
  ];
  for (const spec of specs) {
    const { url, body } = gateway.preview({
      model: spec,
      messages,
      temperature: NARRATOR_PROFILE.temperature[spec.provider],
      maxOutputTokens: NARRATOR_PROFILE.maxOutputTokens,
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
        ? { content: JSON.stringify({ speaker: 'an', narration: 'Ok, em sửa trong 15 phút nữa nhé.', follow_up: null }), latencyMs: 1700 }
        : {
            content: JSON.stringify({
              speaker: 'an',
              narration: 'Ừ, anh nghe rồi. 900 đơn mà mỗi đơn một lần chạm DB thì chậm là phải.',
              follow_up: followUpAllowed ? 'Thế nếu sau này có khách còn nhiều đơn hơn nữa thì endpoint này sẽ ra sao?' : null,
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
      activityId: SAMPLE_ACTIVITY_ID,
      transcript: transcriptBefore(scenario, SAMPLE_ACTIVITY_ID),
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
            narration: 'Ừ, anh nghe rồi. 900 đơn mà mỗi đơn một lần chạm DB thì chậm là phải.',
            follow_up: followUpAllowed ? 'Thế nếu sau này có khách còn nhiều đơn hơn nữa thì endpoint này sẽ ra sao?' : null,
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
    activityId: SAMPLE_ACTIVITY_ID,
    transcript: transcriptBefore(scenario, SAMPLE_ACTIVITY_ID),
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
    console.error('\nKhông có model nào dùng được. Đặt QWEN_API_KEY (và QWEN_WORKSPACE_ID) trong apps/api/.env.');
    process.exitCode = 1;
    return;
  }
  console.log(`Chuỗi: ${chain.map((s) => s.key).join(' → ')}`);

  const recorder = recording(fetchTransport);
  const service = new NarratorService(
    new ModelGateway({ qwen: settings.qwen?.apiKey, deepseek: settings.deepseek?.apiKey }, recorder),
    new CircuitBreaker(),
    chain,
  );
  for (const [label, answer] of answers) {
    for (let i = 1; i <= repeat; i++) {
      const result = await service.narrate({
        scenario,
        activityId: SAMPLE_ACTIVITY_ID,
        transcript: transcriptBefore(scenario, SAMPLE_ACTIVITY_ID),
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

async function main(): Promise<void> {
  const scenario = fixtureData().scenarios[SAMPLE_SCENARIO_KEY];
  const answers = answersToRun();
  console.log(`Kịch bản ${SAMPLE_SCENARIO_KEY}, hoạt động ${SAMPLE_ACTIVITY_ID}, chế độ ${mode}, được hỏi đào sâu: ${followUpAllowed ? 'có' : 'không'}`);

  if (mode === 'dry') return dry(scenario, answers[0][1]);
  if (mode === 'fake') return fake(scenario, answers);
  if (mode === 'live') return live(scenario, answers);
  if (mode === 'export') return exportFiles(scenario, answers[0][1]);
  console.error(`--mode phải là dry, fake, live hoặc export (đang là "${mode}")`);
  process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
