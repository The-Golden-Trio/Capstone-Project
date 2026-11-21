/**
 * Hai file `--out` của chế độ chơi tay: kịch bản `.json` chạy lại được bằng
 * `--play=<đường dẫn>`, và báo cáo `.md` cho tester đọc lại. Thuần: nhận dữ
 * liệu, trả về chuỗi hoặc đối tượng; việc ghi đĩa nằm ở `play.ts`.
 */
import type { shift } from '@datn/game-core';
import { callTitle, summaryLines, tokensOf, usd } from '../report';
import type { Playthrough } from '../playthrough';
import type { RunResult } from '../runner';
import { formatLine } from './format';

/** Một nhận xét của tester, gắn với lượt đang chơi lúc gõ. */
export interface TesterNote {
  /** ISO giờ máy lúc ghi. */
  at: string;
  /** Số bước đã làm xong lúc ghi (0 = trước bước đầu). */
  afterStep: number;
  /** Giờ trong ca. */
  time: string;
  awaiting: string;
  text: string;
}

export interface StageOutput {
  name: string;
  lines: string[];
}

export interface PlayMeta {
  name: string;
  seed: string;
  title: string;
  mode: 'fake' | 'live';
  startedAt: string;
  displayName: string;
}

/** Kịch bản đúng khuôn `playthroughs/*.json`: chỉ các bước engine đã nhận. */
export function toPlaythrough(meta: PlayMeta, result: RunResult): Playthrough {
  return {
    _note: `Do tester chơi tay lúc ${meta.startedAt} (chế độ ${meta.mode}); câu trong kịch bản là lời tester gõ, không phải kịch bản soạn sẵn.`,
    name: meta.name,
    seed: meta.seed,
    title: meta.title,
    intent: `Lượt chơi tay của tester trên ${meta.seed}, xuất để chạy lại bằng --play=<đường dẫn>.`,
    steps: result.steps.filter((s) => !s.skipped).map((s) => s.step),
  };
}

const fence = (lines: string[]): string[] => ['```', ...lines, '```'];

/** Ô trong bảng markdown không được chứa `|` hay xuống dòng. */
const cell = (text: string): string =>
  text.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');

export function buildReportMd(input: {
  meta: PlayMeta;
  result: RunResult;
  ctx: shift.ShiftContext;
  notes: readonly TesterNote[];
  stages: readonly StageOutput[];
}): string {
  const { meta, result, ctx, notes, stages } = input;
  const out: string[] = [];

  out.push(`# Lượt chơi thử ${meta.name}`, '');
  out.push(`- Seed: \`${meta.seed}\` · ${meta.title}`);
  out.push(`- Bắt đầu: ${meta.startedAt}`);
  out.push(`- Chế độ AI: ${meta.mode}`);
  out.push(
    `- Kết quả: ${result.outcome}${result.message ? ` — ${result.message}` : ''}`,
  );
  out.push(
    `- Số bước: ${result.steps.filter((s) => !s.skipped).length} · lượt gọi AI: ${result.calls.length} · chi phí AI: ${usd(result.costUsd)}`,
    '',
  );

  out.push('## Ghi nhận của tester', '');
  if (notes.length === 0) out.push('(không có)', '');
  for (const n of notes)
    out.push(
      `- ${n.at} · sau bước ${n.afterStep} · giờ trong ca ${n.time} · đang chờ \`${n.awaiting}\`: ${n.text}`,
    );
  if (notes.length > 0) out.push('');

  out.push('## Sổ lời', '');
  for (const step of result.steps) {
    if (step.skipped) continue;
    out.push(`### Bước ${step.index} · ${step.time}`, '');
    out.push(
      ...fence(step.lines.map((l) => formatLine(l, ctx, meta.displayName))),
      '',
    );
  }

  out.push('## Lượt gọi AI', '');
  if (result.calls.length === 0) out.push('(không có)', '');
  else {
    out.push(
      '| # | bước | dịch vụ | việc | kết quả | model | ms | token vào/ra | chi phí | cờ bật |',
      '|---|---|---|---|---|---|---|---|---|---|',
    );
    for (const c of result.calls) {
      const t = tokensOf(c.detail);
      out.push(
        `| ${c.index} | ${c.step} | ${c.service} | ${cell(callTitle(c))} | ${cell(c.status === 'ok' ? 'ok' : (c.reason ?? '?'))} | ${cell(
          c.provenance?.model ?? c.adapter,
        )} | ${c.provenance?.latencyMs ?? c.elapsedMs} | ${t.input || '–'}/${t.output || '–'} | ${c.provenance?.costUsd ? usd(c.provenance.costUsd) : ''} | ${cell(c.flagsAdded.join(', '))} |`,
      );
    }
    out.push('');
  }

  out.push('## Cờ lúc kết thúc', '');
  out.push(result.state.flags.join(', ') || '(không có)', '');

  out.push('## Tóm tắt ca', '', ...fence(summaryLines(result.summary)), '');

  out.push('## Kết quả chấm', '');
  if (stages.length === 0)
    out.push(
      result.outcome === 'ended'
        ? '(không có bước chấm nào)'
        : '(ca chưa kết thúc nên chưa chấm)',
      '',
    );
  for (const stage of stages)
    out.push(`### ${stage.name}`, '', ...fence(stage.lines), '');

  return out.join('\n');
}
