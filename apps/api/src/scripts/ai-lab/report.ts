/**
 * In và ghi nhật ký của `ai-lab`: từng bước, cảnh hiện ra, từng lượt gọi AI,
 * tổng kết cuối ca. Chỉ định dạng, không quyết định gì.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { shift } from '@datn/game-core';
import { describeStep, type Step } from './playthrough';
import { keyName } from './ports';
import type {
  CallDetail,
  CallLog,
  GatewayCallLog,
  LabObserver,
  RunResult,
} from './runner';

export const rule = (title: string): void =>
  console.log(`\n━━ ${title} ${'━'.repeat(Math.max(0, 66 - title.length))}`);

export const usd = (n: number): string => `${n.toFixed(6)} USD`;

const sum = (logs: GatewayCallLog[], pick: (l: GatewayCallLog) => number) =>
  logs.reduce((n, l) => n + pick(l), 0);

export function tokensOf(detail: CallDetail): {
  input: number;
  cached: number;
  output: number;
} {
  return {
    input: sum(detail.gateway, (l) => l.usage?.input ?? 0),
    cached: sum(detail.gateway, (l) => l.usage?.cachedInput ?? 0),
    output: sum(detail.gateway, (l) => l.usage?.output ?? 0),
  };
}

/** Việc của lượt gọi: loại việc AI-4 hay nguồn của câu kiểm. */
export function callTitle(call: CallLog): string {
  if (call.service === 'narrator') {
    const req = call.request as shift.NarrateRequest;
    return `${req.task}@${req.slot} ≤${req.maxBeats} nhịp`;
  }
  const req = call.request as shift.CheckRequest;
  return `${req.source} (${req.questions.length} câu)`;
}

const modelOf = (call: CallLog): string =>
  call.provenance?.model ??
  (call.adapter === 'fake'
    ? 'giả'
    : (call.detail.gateway.at(-1)?.model ?? '—'));

function printLine(line: shift.TranscriptLine): void {
  if (line.kind === 'player') console.log(`  Bạn: ${line.text}`);
  else if (line.kind === 'npc')
    console.log(
      `  [${line.speaker}${line.expression ? ` · ${line.expression}` : ''}] ${line.text}`,
    );
  else console.log(`  · ${line.text}`);
}

export function printCall(call: CallLog): void {
  const tokens = tokensOf(call.detail);
  const cost = call.provenance?.costUsd ?? 0;
  const head =
    `  ⚙ ${call.service} ${callTitle(call)} → ${call.status === 'ok' ? 'ok' : `KHÔNG DÙNG ĐƯỢC (${call.reason})`}` +
    ` · ${modelOf(call)} · ${call.provenance?.latencyMs ?? call.elapsedMs} ms`;
  const usage =
    call.detail.gateway.length > 0
      ? ` · vào ${tokens.input} (cache ${tokens.cached}) ra ${tokens.output} · ${usd(cost)}`
      : '';
  console.log(head + usage);

  for (const a of call.detail.attempts) {
    const why =
      a.violations.map((v) => `${v.rule}: ${v.detail}`).join('; ') ||
      a.error ||
      '';
    console.log(
      `      lần ${a.attempt} ${a.model} ${a.outcome}${why ? ` — ${why}` : ''}`,
    );
  }
  for (const g of call.detail.gateway)
    if (g.error)
      console.log(`      lỗi ${g.model}: ${g.error.kind} — ${g.error.message}`);

  for (const b of call.beats ?? [])
    console.log(
      `      nhịp [${b.speaker}${b.expression ? ` · ${b.expression}` : ''}] ${b.text}`,
    );
  for (const a of call.answers ?? []) {
    const extra = a.extracted ? ` ${JSON.stringify(a.extracted)}` : '';
    const quote = a.quote ? ` "${a.quote}"` : '';
    console.log(`      ${a.flag}: ${a.answer}${quote}${extra}`);
  }
  if (call.flagsAdded.length > 0)
    console.log(`      cờ bật: ${call.flagsAdded.join(', ')}`);
}

/** In từng bước ngay khi chạy, để chế độ live thấy tiến độ. */
export function printingObserver(displayName: string): LabObserver {
  const present = (l: shift.TranscriptLine): shift.TranscriptLine =>
    l.text.includes('{ten}')
      ? { ...l, text: l.text.replace(/\{ten\}/g, displayName) }
      : l;
  return {
    stepStart: (index: number, step: Step, time: string) =>
      console.log(`\n▶ Bước ${index} · ${time} · ${describeStep(step)}`),
    stepSkipped: (index: number, step: Step, awaiting: string) =>
      console.log(
        `
▷ Bước ${index} bỏ qua (engine đang chờ "${awaiting}") · ${describeStep(step)}`,
      ),
    call: printCall,
    lines: (lines) => lines.map(present).forEach(printLine),
  };
}

export function printTable(result: RunResult): void {
  if (result.calls.length === 0) return;
  console.table(
    result.calls.map((c) => {
      const t = tokensOf(c.detail);
      return {
        '#': c.index,
        bước: c.step,
        dịch_vụ: c.service,
        việc: callTitle(c),
        kết_quả: c.status === 'ok' ? 'ok' : c.reason,
        model: modelOf(c),
        ms: c.provenance?.latencyMs ?? c.elapsedMs,
        vào: t.input || '',
        ra: t.output || '',
        chi_phí: c.provenance?.costUsd ? usd(c.provenance.costUsd) : '',
        cờ_bật: c.flagsAdded.join(',') || '',
      };
    }),
  );
}

/** Tổng kết cuối ca thành từng dòng chữ, cho cả bản in lẫn báo cáo `.md`. */
export function summaryLines(s: shift.ShiftSummary): string[] {
  const out: string[] = [];
  const log = (line: string): void => void out.push(line);
  log(`Ca "${s.title}" kết thúc lúc ${s.endedAt}. Mục tiêu: ${s.goal}`);
  log('Nút:');
  for (const n of s.nodes)
    log(
      `  ${n.id} (${n.kind}) ${n.status}${n.time ? ` lúc ${n.time}` : ''}` +
        `${n.choice ? ` · chọn: ${n.choice}` : ''}` +
        `${n.timedOut ? ' · hết giờ' : ''}` +
        `${n.approved !== undefined ? ` · ${n.approved ? 'được duyệt' : 'bị hoãn'}` : ''}`,
    );
  log('Hành động:');
  for (const a of s.actions)
    log(
      `  ${a.time} ${a.label} (${a.points} điểm${a.cut ? ', bị cắt ngang' : ''})`,
    );
  log(
    `Dữ kiện tìm được: ${s.facts.found.length} (thiếu ${s.facts.requiredMissed} dữ kiện bắt buộc)`,
  );
  for (const f of s.facts.found) log(`  ${f.time} ${f.text}`);
  log('Lời hứa:');
  if (s.promises.length === 0) log('  (không có)');
  for (const p of s.promises) log(`  ${p.label} → ${p.status}`);
  log('Khúc mắc:');
  for (const c of s.concerns)
    log(`  ${c.person}: ${c.text} → ${c.resolved ? 'đã gỡ' : 'chưa gỡ'}`);
  log('Tài liệu đã nộp:');
  for (const a of s.artefacts)
    log(
      `  ${a.title} (${a.status}): ${a.fields.map((f) => `${f.label}: ${f.text}`).join(' | ')}`,
    );
  log('Nhìn lại ca:');
  if (s.review.length === 0) log('  (không có mục nào)');
  for (const r of s.review)
    log(`  ${r.person}: ${r.question} → ${r.answer || '(chưa trả lời)'}`);
  log(`Gợi ý đã dùng: ${s.hintsUsed}`);
  return out;
}

export function printSummary(s: shift.ShiftSummary): void {
  for (const line of summaryLines(s)) console.log(line);
}

export function printResult(result: RunResult): void {
  rule(`${result.playthrough}: ${result.outcome}`);
  if (result.message) console.log(`✘ ${result.message}`);
  printTable(result);
  const total = result.calls.reduce(
    (acc, c) => {
      const t = tokensOf(c.detail);
      acc.input += t.input;
      acc.output += t.output;
      acc.ms += c.provenance?.latencyMs ?? c.elapsedMs;
      return acc;
    },
    { input: 0, output: 0, ms: 0 },
  );
  console.log(
    `Tổng: ${result.calls.length} lượt gọi AI, ${total.ms} ms, vào ${total.input} ra ${total.output} token, ${usd(result.costUsd)}`,
  );
  console.log('\nshiftSummary');
  printSummary(result.summary);
}

/* ── Ghi nhật ký ra thư mục ───────────────────────────────────────────── */

function write(dir: string, name: string, value: unknown): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), JSON.stringify(value, null, 2) + '\n');
}

/**
 * Nhật ký JSON của một kịch bản: mỗi lượt gọi AI một file (yêu cầu của engine,
 * kết quả, request và response nguyên văn gửi nhà cung cấp), cộng `result.json`.
 * Key không có trong file; `Authorization` ghi tên biến môi trường.
 */
export function writeLog(
  outDir: string,
  result: RunResult,
  stages: Array<{ name: string } & Record<string, unknown>> = [],
): string {
  const dir = join(outDir, result.playthrough);
  for (const c of result.calls) {
    const n = String(c.index).padStart(2, '0');
    write(dir, `${n}-${c.service}.json`, {
      step: c.step,
      service: c.service,
      adapter: c.adapter,
      request: c.request,
      status: c.status,
      reason: c.reason,
      beats: c.beats,
      answers: c.answers,
      flagsAdded: c.flagsAdded,
      provenance: c.provenance,
      elapsedMs: c.elapsedMs,
      gateway: c.detail.gateway,
      narratorAttempts: c.detail.attempts,
      http: c.detail.exchanges.map((e) => ({
        request: {
          method: 'POST',
          url: e.url,
          headers: {
            Authorization: `Bearer ${keyName(e.url)}`,
            'Content-Type': 'application/json',
          },
          body: e.body,
        },
        response: { status: e.status, body: e.response },
      })),
    });
  }
  write(dir, 'result.json', {
    playthrough: result.playthrough,
    outcome: result.outcome,
    message: result.message,
    costUsd: result.costUsd,
    steps: result.steps.map((s) => ({
      index: s.index,
      time: s.time,
      step: s.step,
      lines: s.lines,
      calls: s.calls.map((c) => c.index),
      awaitAfter: s.awaitAfter,
    })),
    flags: result.state.flags,
    summary: result.summary,
    stages,
  });
  return dir;
}
