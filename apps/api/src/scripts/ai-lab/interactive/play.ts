/**
 * Chơi tay một ca làm trong terminal, để tester đánh giá seed, rubric và cơ
 * chế màn chơi. Đây là công cụ test, không phải UI của game.
 *
 * Mỗi lệnh của tester đi qua `LabSession` (cùng đường với kịch bản: engine,
 * rồi vòng giải yêu cầu AI), nên bản chơi xuất ra chạy lại được bằng runner.
 * Sau ca chạy các bước trong `LAB_STAGES` (AI-5 chấm theo checklist).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { shift } from '@datn/game-core';
import type { KnownIdentity } from '@datn/game-core';
import { fixtureShiftContext, fixtureShiftData } from '@datn/game-core/testing';
import type { Only, Runtime } from '../ports';
import { summaryLines, usd, writeLog } from '../report';
import {
  LabSession,
  type CallLog,
  type LabPorts,
  type RunResult,
} from '../runner';
import { LAB_STAGES, type LabStage } from '../stages';
import type { Step } from '../playthrough';
import {
  ABORT_FORM,
  HELP_LINES,
  isEngineCommand,
  parseCommand,
  planCommand,
} from './commands';
import {
  buildReportMd,
  toPlaythrough,
  type PlayMeta,
  type StageOutput,
  type TesterNote,
} from './export';
import {
  formatCall,
  formatDebug,
  formatLine,
  formatPrompt,
  playName,
} from './format';
import type { LineReader } from './lineReader';

export const DEFAULT_SEED = 'SWE_BACKEND.L3.m2';

export interface PlayOptions {
  seedId: string;
  mode: 'fake' | 'live';
  only: Only;
  budgetUsd: number;
  outDir?: string;
  ports: LabPorts;
  runtime: Runtime;
  identity: KnownIdentity;
  displayName: string;
  reader: LineReader;
  /** In một dòng. */
  out: (text: string) => void;
  /** Đồng hồ thật, mili giây; thay được trong test. */
  now?: () => number;
  stages?: readonly LabStage[];
}

export interface PlayResult {
  name: string;
  quit: boolean;
  notes: TesterNote[];
  files: string[];
  result: RunResult;
}

function loadContext(seedId: string): shift.ShiftContext {
  try {
    return fixtureShiftContext(seedId);
  } catch (err) {
    const known = Object.keys(fixtureShiftData().seeds).join(', ');
    throw new Error(
      `${err instanceof Error ? err.message : String(err)}. Seed có: ${known}`,
    );
  }
}

const YES = new Set(['c', 'co', 'có', 'y', 'yes']);

export async function playInteractive(
  options: PlayOptions,
): Promise<PlayResult> {
  const { reader, out, displayName } = options;
  const now = options.now ?? Date.now;
  const ctx = loadContext(options.seedId);
  const startedAt = new Date(now());
  const name = playName(startedAt);
  const session = new LabSession({
    ctx,
    ports: options.ports,
    identity: options.identity,
    budgetUsd: options.budgetUsd,
    playthroughName: name,
  });
  const notes: TesterNote[] = [];
  const view = () => shift.sceneView(session.state, ctx);
  const appliedSteps = () => session.steps.filter((s) => !s.skipped).length;

  const rule = (title: string): void =>
    out(`\n━━ ${title} ${'━'.repeat(Math.max(0, 66 - title.length))}`);

  /** Đồng hồ chọn phương án chạy từ lúc phương án hiện ra, không reset khi in lại. */
  let timer = null as { node: string; since: number } | null;
  const showPrompt = (): void => {
    const v = view();
    if (v.await.kind === 'node_choice') {
      if (timer?.node !== v.await.node)
        timer = { node: v.await.node, since: now() };
    } else timer = null;
    for (const line of formatPrompt(v, ctx)) out(line);
  };

  const printOutput = (
    lines: shift.TranscriptLine[],
    calls: CallLog[],
  ): void => {
    for (const line of lines) out(formatLine(line, ctx, displayName));
    for (const call of calls) out(formatCall(call));
  };

  const pausedHint = (reason: string): void => {
    out(
      `✘ Hết model dùng được: ${reason}. Ca tạm dừng, giữ tiến độ (D-92). /lai để thử lại, /thoat để dừng.`,
    );
  };

  /** Đưa một bước vào engine; `true` nếu engine nhận. */
  const apply = async (step: Step, notice?: string): Promise<boolean> => {
    if (notice) out(`! ${notice}`);
    const done = await session.apply(step);
    if (done.status === 'rejected') {
      out(`✘ Engine từ chối: ${done.message}.`);
      return false;
    }
    if (done.status === 'skipped') {
      out('✘ Bước này không áp dụng lúc này.');
      return false;
    }
    printOutput(done.log.lines, done.log.calls);
    if (done.pausedBecause) pausedHint(done.pausedBecause);
    return true;
  };

  /** Hỏi từng ô của form. `null` khi bỏ form hoặc hết đầu vào. */
  const fillForm = async (
    form: shift.ArtefactForm,
  ): Promise<{ fields: Record<string, string>; ticks: string[] } | null> => {
    const fields: Record<string, string> = {};
    for (const f of form.fields) {
      const saved = form.prefill?.fields[f.id];
      const line = await reader.read(
        `  ${f.label}${saved ? ' (Enter giữ bản đã lưu)' : ''}: `,
      );
      if (line === null || line.trim() === ABORT_FORM) return null;
      fields[f.id] = line.trim() === '' && saved ? saved : line.trim();
    }
    const ticks: string[] = [];
    for (const t of form.ticks) {
      const saved = form.prefill?.ticks.includes(t.id) ?? false;
      const line = await reader.read(
        `  ${t.label} (c/k${saved ? ', Enter = có' : ''}): `,
      );
      if (line === null || line.trim() === ABORT_FORM) return null;
      const answer = line.trim().toLowerCase();
      if (YES.has(answer) || (answer === '' && saved)) ticks.push(t.id);
    }
    for (const select of form.selects) {
      const options = select.options.map(({ id, label }) => `${id} = ${label}`);
      const saved = select.options.find(({ id }) =>
        form.prefill?.ticks.includes(`${select.id}=${id}`),
      )?.id;
      while (true) {
        const line = await reader.read(
          `  ${select.label} (${options.join(' / ')}${saved ? `, Enter giữ ${saved}` : ''}): `,
        );
        if (line === null || line.trim() === ABORT_FORM) return null;
        const answer = line.trim() || saved;
        if (!answer) break;
        if (select.options.some(({ id }) => id === answer)) {
          ticks.push(`${select.id}=${answer}`);
          break;
        }
        out(
          `✘ Chọn một trong các mã ${select.options.map(({ id }) => id).join(', ')}.`,
        );
      }
      if (select.reason) {
        const id = `${select.id}__why`;
        const line = await reader.read(`  Vì sao (${select.label}): `);
        if (line === null || line.trim() === ABORT_FORM) return null;
        fields[id] = line.trim() || form.prefill?.fields[id] || '';
      }
    }
    return { fields, ticks };
  };

  const v0 = view();
  out(`Chơi thử ca "${v0.title}" (${v0.seedId}), chế độ ${options.mode}.`);
  out(`Mục tiêu: ${v0.goal}`);
  out(
    `Nhân vật: ${v0.cast.map((c) => `${c.name} (${c.relation})`).join(', ')}.`,
  );
  if (options.mode === 'fake')
    out(
      'AI giả: lời NPC là câu mẫu và bộ phán trả lời theo luật cứng, chỉ để thấy cơ chế chạy, không đánh giá chất lượng dẫn truyện.',
    );
  out('Gõ /giup để xem lệnh, /tt để xem cờ và trạng thái nội bộ.');

  let quit = false;
  if (await apply({ do: 'start' })) showPrompt();

  while (!session.state.ended) {
    const line = await reader.read('› ');
    if (line === null) {
      quit = true;
      break;
    }
    const command = parseCommand(line);

    if (command.kind === 'empty') continue;
    if (command.kind === 'error') {
      out(`✘ ${command.message}`);
      continue;
    }
    if (command.kind === 'thoat') {
      quit = true;
      break;
    }
    if (command.kind === 'giup') {
      for (const l of HELP_LINES) out(l);
      continue;
    }
    if (command.kind === 'tt') {
      for (const l of formatDebug(session.state, ctx)) out(l);
      continue;
    }
    if (command.kind === 'ghichu') {
      notes.push({
        at: new Date(now()).toISOString(),
        afterStep: appliedSteps(),
        time: session.time,
        awaiting: session.state.await.kind,
        text: command.text,
      });
      out(
        `✔ Đã ghi nhận xét ${notes.length} (sau bước ${appliedSteps()}, giờ ${session.time}).`,
      );
      continue;
    }
    if (command.kind === 'lai') {
      if (!session.state.pending) {
        out('Không có yêu cầu AI nào đang treo.');
        continue;
      }
      const resumed = await session.resume();
      printOutput(resumed.lines, resumed.calls);
      if (resumed.pausedBecause) pausedHint(resumed.pausedBecause);
      else showPrompt();
      continue;
    }
    if (!isEngineCommand(command)) continue;

    const plan = planCommand(
      command,
      view(),
      timer ? now() - timer.since : null,
    );
    if (plan.kind === 'error') {
      out(`✘ ${plan.message}`);
      showPrompt();
      continue;
    }

    let step: Step;
    let notice: string | undefined;
    if (plan.kind === 'form') {
      out(`Điền "${plan.title}" (một dòng mỗi ô, ${ABORT_FORM} để bỏ):`);
      const filled = await fillForm(plan.form);
      if (!filled) {
        out('Đã bỏ form, chưa gửi gì cho engine.');
        continue;
      }
      step = plan.build(filled.fields, filled.ticks);
    } else {
      step = plan.step;
      notice = plan.notice;
    }

    if (await apply(step, notice)) {
      if (!session.state.ended) showPrompt();
    } else showPrompt();
  }

  /* ── Hết ca hoặc thoát ── */

  const ended = session.state.ended;
  const result = session.result(
    ended ? 'ended' : 'incomplete',
    ended ? undefined : 'Tester thoát giữa ca.',
  );
  const stageOutputs: StageOutput[] = [];
  const stageLogs: Array<{ name: string } & Record<string, unknown>> = [];

  if (ended) {
    rule('Tóm tắt ca');
    for (const l of summaryLines(result.summary)) out(l);
    for (const stage of options.stages ?? LAB_STAGES) {
      rule(`Bước ${stage.name}`);
      const done = await stage.run({
        playthrough: name,
        ctx,
        state: result.state,
        summary: result.summary,
        identity: options.identity,
        budgetUsd: Math.max(0, options.budgetUsd - result.costUsd),
        runtime: options.runtime,
        only: options.only,
      });
      for (const l of done.lines) out(l);
      const detail = options.ports.drain();
      stageOutputs.push({ name: stage.name, lines: done.lines });
      stageLogs.push({
        name: stage.name,
        data: done.data,
        gateway: detail.gateway,
        exchanges: detail.exchanges,
      });
    }
  } else
    out('\nĐã thoát giữa ca: chưa kết thúc nên chưa tóm tắt và chưa chấm.');

  out(
    `\nTổng: ${result.calls.length} lượt gọi AI, ${usd(result.costUsd)}, ${notes.length} nhận xét.`,
  );

  const files: string[] = [];
  if (options.outDir) {
    const meta: PlayMeta = {
      name,
      seed: options.seedId,
      title: v0.title,
      mode: options.mode,
      startedAt: startedAt.toISOString(),
      displayName,
    };
    mkdirSync(options.outDir, { recursive: true });
    const scriptPath = join(options.outDir, `${name}.json`);
    const reportPath = join(options.outDir, `${name}.md`);
    writeFileSync(
      scriptPath,
      JSON.stringify(toPlaythrough(meta, result), null, 2) + '\n',
    );
    writeFileSync(
      reportPath,
      buildReportMd({
        meta,
        result,
        ctx,
        notes,
        stages: stageOutputs,
      }) + '\n',
    );
    const logDir = writeLog(options.outDir, result, stageLogs);
    files.push(scriptPath, reportPath);
    out(`Đã ghi kịch bản ${scriptPath}`);
    out(`Đã ghi báo cáo ${reportPath}`);
    out(`Đã ghi nhật ký từng lượt gọi AI vào ${logDir}`);
    out(`Chạy lại: --play=${scriptPath}`);
  }

  return { name, quit, notes, files, result };
}
