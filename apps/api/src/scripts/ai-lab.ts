/**
 * Chạy ca làm L3.m2 trong bộ nhớ, không UI, không DB, không Redis, để thử
 * riêng các service AI theo game design hiện tại và biết nhà cung cấp nào
 * sẵn sàng.
 *
 *     pnpm exec nx run @datn/api:ai-lab                                  # fake, mọi kịch bản
 *     pnpm exec nx run @datn/api:ai-lab -- --mode=fake --play=lam-tot    # một kịch bản
 *     pnpm exec nx run @datn/api:ai-lab -- --mode=check                  # mỗi model, mỗi ghế judge một lượt nhỏ
 *     pnpm exec nx run @datn/api:ai-lab -- --mode=live --play=lam-tot    # gọi thật, TỐN TIỀN, cần key trong apps/api/.env
 *     pnpm exec nx run @datn/api:ai-lab -- --play=interactive            # tự chơi một ca trong terminal (fake)
 *
 * Chơi tay cần bàn phím của terminal. `nx run` chuyển stdin cho script (đã thử với
 * stdin dạng pipe). Nếu terminal của bạn không nhận được chữ gõ qua nx (ví dụ
 * giao diện TUI của Nx chiếm bàn phím), tắt TUI bằng `NX_TUI=false` hoặc build
 * một lần rồi chạy thẳng bản đã build, cùng các cờ:
 *     pnpm exec nx run @datn/api:ai-lab -- --mode=fake --play=lam-tot   # build ra apps/api/dist/ai-lab.mjs
 *     node apps/api/dist/ai-lab.mjs --play=interactive --out=thư/mục
 *
 * Tuỳ chọn:
 *     --play=<tên>|a,b|all|<file.json>  kịch bản trong `game-core/src/shift/playthroughs/` hoặc đường dẫn file (mặc định all)
 *     --play=interactive      tester tự chơi; thêm --seed=<mã> (mặc định SWE_BACKEND.L3.m2), xem `ai-lab/interactive/play.ts`
 *     --only=narrator|checker|judge  chỉ thử riêng một service; các service còn lại chạy bản giả
 *     --out=thư/mục           ghi nhật ký JSON từng lượt gọi (request, response nguyên văn, không có key);
 *                             chơi tay ghi thêm kịch bản `.json` chạy lại được và báo cáo `.md`
 *     --budget=0.25           trần chi phí AI mỗi kịch bản, USD (NFR-11)
 *
 * Kịch bản người chơi là câu giả do nhóm viết, không phải người chơi thật.
 * Mỗi việc đi qua `shift.step` của game-core rồi vòng giải `pendingRequest`
 * giống `ShiftTurnProcessor`; xem `ai-lab/runner.ts`. Bước chạy sau ca (chấm
 * bằng AI-5) thêm ở `ai-lab/stages.ts`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { aiSettingsFromEnv } from '../ai/ai.module';
import { keyWarnings } from '../ai/gateway/diagnose';
import type { AiSettings } from '../ai/gateway/models';
import { loadAiEnv } from '../config/env';
import { parseBudgetUsd } from './ai-lab/budget';
import { runCheck } from './ai-lab/check';
import {
  createPorts,
  fakeRuntime,
  liveRuntime,
  liveSetup,
  type Only,
  type Runtime,
} from './ai-lab/ports';
import { createLineReader } from './ai-lab/interactive/lineReader';
import { DEFAULT_SEED, playInteractive } from './ai-lab/interactive/play';
import { selectPlaythroughs } from './ai-lab/playthrough';
import { printResult, printingObserver, rule, writeLog } from './ai-lab/report';
import { runPlaythrough, type RunResult } from './ai-lab/runner';
import { LAB_STAGES } from './ai-lab/stages';

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.join('=') || 'true'] as const;
  }),
);

/** Nạp `.env` bằng tay như `narrator-try`: script chạy ngoài Nest. */
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

// Cùng thứ tự với `ConfigModule` trong AppModule: file của API trước, file gốc sau.
loadEnvFile(join(process.cwd(), 'apps/api/.env'));
loadEnvFile(join(process.cwd(), '.env'));

const PLAYTHROUGH_DIR = join(
  process.cwd(),
  'packages/game-core/src/shift/playthroughs',
);
const DISPLAY_NAME = 'Nam';
const IDENTITY = {
  names: [DISPLAY_NAME],
  usernames: ['nam'],
  emails: ['nam@example.com'],
};

/** Đọc cấu hình AI; giá trị sai thì in tên biến thay vì ném lỗi Zod thô. */
function loadSettings(): AiSettings | null {
  try {
    return aiSettingsFromEnv(loadAiEnv());
  } catch (err) {
    const issues =
      (err as { issues?: Array<{ path: unknown[]; message: string }> })
        .issues ?? [];
    console.error('✘ .env có giá trị không hợp lệ:');
    for (const issue of issues)
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    process.exitCode = 1;
    return null;
  }
}

/** Chế độ live: kiểm trước điều thiếu để không chạy nửa chừng rồi mới biết. */
function preflight(settings: AiSettings, only: Only): boolean {
  for (const w of keyWarnings(settings)) console.log(`⚠ ${w}`);
  const setup = liveSetup(settings);
  for (const { provider, reason } of setup.excluded)
    console.log(`– không dùng ${provider}: ${reason}`);
  let ready = true;
  if (only === undefined || only === 'narrator') {
    if (setup.chain.length === 0) {
      ready = false;
      console.error(
        '✘ Không có model dẫn truyện nào dùng được. Đặt QWEN_API_KEY hoặc OPENROUTER_API_KEY trong apps/api/.env.',
      );
    } else
      console.log(
        `Chuỗi dẫn truyện: ${setup.chain.map((s) => s.key).join(' → ')}`,
      );
  }
  if (only !== 'narrator') {
    if (setup.slots.length === 0) {
      ready = false;
      console.error(
        `✘ Bộ phán không có ghế judge nào: ${setup.problems.join('; ')}.`,
      );
    } else
      for (const { slot, chain } of setup.slots)
        console.log(
          `Ghế judge ${slot}: ${chain.map((s) => s.key).join(' → ')}`,
        );
  }
  return ready;
}

async function main(): Promise<void> {
  const mode = args.get('mode') ?? 'fake';
  const only = args.get('only') as Only;
  if (only !== undefined && !['narrator', 'checker', 'judge'].includes(only)) {
    console.error(
      `--only phải là narrator, checker hoặc judge (đang là "${only}")`,
    );
    process.exitCode = 1;
    return;
  }
  if (!['fake', 'live', 'check'].includes(mode)) {
    console.error(`--mode phải là fake, live hoặc check (đang là "${mode}")`);
    process.exitCode = 1;
    return;
  }

  const budgetUsd = parseBudgetUsd(args.get('budget'));
  if (budgetUsd === null) {
    console.error(
      `--budget phải là số USD lớn hơn 0, ví dụ --budget=0.25 (đang là "${args.get('budget')}")`,
    );
    process.exitCode = 1;
    return;
  }

  if (mode === 'check') {
    const settings = loadSettings();
    if (settings && !(await runCheck(settings))) process.exitCode = 1;
    return;
  }

  const play = args.get('play') ?? 'all';
  const interactive = play === 'interactive';
  const playthroughs = interactive
    ? []
    : selectPlaythroughs(PLAYTHROUGH_DIR, play);
  const outDir = args.get('out');

  let runtime: Runtime;
  if (mode === 'live') {
    const settings = loadSettings();
    if (!settings) return;
    if (!preflight(settings, only)) {
      process.exitCode = 1;
      return;
    }
    console.log(
      `\nGọi model thật, tốn tiền. Trần ${budgetUsd} USD mỗi kịch bản.`,
    );
    runtime = liveRuntime(settings);
  } else {
    if (only) console.log('(--only không có tác dụng ở chế độ fake)');
    runtime = fakeRuntime({ allowUnconfirmedProviders: false });
  }
  const ports = createPorts(runtime, only);
  console.log(
    `Chế độ ${mode}: dẫn truyện ${ports.narratorMode}, bộ phán ${ports.checkerMode}.`,
  );

  if (interactive) {
    const reader = createLineReader(process.stdin, process.stdout);
    try {
      await playInteractive({
        seedId: args.get('seed') ?? DEFAULT_SEED,
        mode: mode === 'live' ? 'live' : 'fake',
        only,
        budgetUsd,
        outDir,
        ports,
        runtime,
        identity: IDENTITY,
        displayName: DISPLAY_NAME,
        reader,
        out: (text) =>
          process.stdout.write(`${text}
`),
      });
    } finally {
      reader.close();
    }
    return;
  }

  const results: RunResult[] = [];
  for (const playthrough of playthroughs) {
    rule(`${playthrough.name} · ${playthrough.title}`);
    console.log(playthrough.intent);
    if (playthrough._note) console.log(`(${playthrough._note})`);

    const ctx = fixtureShiftContext(playthrough.seed);
    const result = await runPlaythrough(playthrough, {
      ctx,
      ports,
      identity: IDENTITY,
      budgetUsd,
      observer: printingObserver(DISPLAY_NAME),
    });
    results.push(result);
    printResult(result);

    const stageLogs: Array<{ name: string } & Record<string, unknown>> = [];
    if (result.outcome === 'ended')
      for (const stage of LAB_STAGES) {
        rule(`${playthrough.name} · bước ${stage.name}`);
        const out = await stage.run({
          playthrough: playthrough.name,
          ctx,
          state: result.state,
          summary: result.summary,
          identity: IDENTITY,
          budgetUsd: Math.max(0, budgetUsd - result.costUsd),
          runtime,
          only,
        });
        for (const line of out.lines) console.log(line);
        const detail = ports.drain();
        stageLogs.push({
          name: stage.name,
          data: out.data,
          gateway: detail.gateway,
          exchanges: detail.exchanges,
        });
      }
    if (outDir)
      console.log(
        `\nĐã ghi nhật ký vào ${writeLog(outDir, result, stageLogs)}`,
      );
  }

  rule('Tổng kết');
  console.table(
    results.map((r) => ({
      kịch_bản: r.playthrough,
      kết_quả: r.outcome,
      lượt_gọi_AI: r.calls.length,
      chi_phí: `${r.costUsd.toFixed(6)} USD`,
      ghi_chú: r.message ?? '',
    })),
  );
  if (results.some((r) => r.outcome !== 'ended')) process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
