/**
 * Định dạng những gì chơi tay in ra. Thuần: nhận dữ liệu của engine, trả về
 * dòng chữ; việc in nằm ở `play.ts`.
 */
import { shift } from '@datn/game-core';
import { callTitle, usd } from '../report';
import type { CallLog } from '../runner';

/** Màn chơi ở chế độ `ai-lab` thay `{ten}` bằng tên người chơi như `printingObserver`. */
const present = (text: string, displayName: string): string =>
  text.replace(/\{ten\}/g, displayName);

/** Tên, vai, biểu cảm của người nói; `canh` là lời dẫn cảnh. */
export function formatLine(
  line: shift.TranscriptLine,
  ctx: shift.ShiftContext,
  displayName: string,
): string {
  const text = present(line.text, displayName);
  switch (line.kind) {
    case 'player':
      return `  Bạn: ${text}`;
    case 'npc': {
      const cast = ctx.seed.cast.find((c) => c.slot === line.speaker);
      const who = cast ? `${cast.name} · ${cast.relation}` : line.speaker;
      return `  [${who}${line.expression ? ` · ${line.expression}` : ''}] ${text}`;
    }
    case 'system':
      return `  » ${text}`;
    default:
      return `  · ${text}`;
  }
}

/** Một dòng cho mỗi lượt gọi AI: đủ để tester thấy cờ nào vừa bật và tốn bao nhiêu. */
export function formatCall(call: CallLog): string {
  const model =
    call.provenance?.model ??
    (call.adapter === 'fake'
      ? 'giả'
      : (call.detail.gateway.at(-1)?.model ?? '—'));
  const result =
    call.status === 'ok' ? 'ok' : `KHÔNG DÙNG ĐƯỢC (${call.reason})`;
  const cost = call.provenance?.costUsd;
  return (
    `  ⚙ ${call.service} ${callTitle(call)} → ${result} · ${model} · ${call.provenance?.latencyMs ?? call.elapsedMs} ms` +
    `${cost ? ` · ${usd(cost)}` : ''}` +
    `${call.flagsAdded.length > 0 ? ` · cờ bật: ${call.flagsAdded.join(', ')}` : ''}`
  );
}

/** Engine đang chờ gì, nói bằng lời. */
export function describeAwait(
  view: shift.SceneView,
  ctx: shift.ShiftContext,
): string {
  const wait = view.await;
  const nameOf = (slot: string) =>
    ctx.seed.cast.find((c) => c.slot === slot)?.name ?? slot;
  switch (wait.kind) {
    case 'start':
      return 'ca chưa bắt đầu';
    case 'phase':
      return 'bạn chọn việc làm tiếp (/lam <key>)';
    case 'conversation': {
      const who = view.conversation?.people.map((p) => p.name).join(', ');
      const left = view.conversation?.turnsLeftInPoint;
      return `đang trò chuyện với ${who ?? '?'}: gõ chữ để nói, /xong để kết thúc${
        left === undefined ? '' : ` (còn ${left} lượt thì tốn thêm 1 điểm)`
      }`;
    }
    case 'node_reply':
      return `${view.node?.speaker.name ?? '?'} đang chờ bạn trả lời: gõ chữ để nói`;
    case 'node_choice':
      return `${view.node?.speaker.name ?? '?'} chờ bạn chọn một phương án (/chon <phương án>)`;
    case 'node_artefact':
      return `nộp "${view.node?.form?.title ?? wait.artefact}" (/nop)`;
    case 'probe_answer': {
      const slot = wait.review
        ? ctx.seed.review.find((r) => r.id === wait.review)?.by
        : view.node?.speaker.slot;
      return `${slot ? nameOf(slot) : '?'} hỏi thêm${wait.review ? ' (Nhìn lại ca)' : ''}: gõ câu trả lời`;
    }
    case 'confirm_end':
      return 'nộp sớm trước hạn chót, bạn chắc không? /ket để xác nhận, /huy để làm tiếp';
    case 'ai':
      return 'đang chờ AI';
    case 'ended':
      return 'ca đã kết thúc';
  }
}

/** Giờ trong ca, điểm thời gian, và việc engine đang chờ. */
export function formatStatus(
  view: shift.SceneView,
  ctx: shift.ShiftContext,
): string {
  const c = view.clock;
  return `[${c.time}] đã dùng ${c.pointsUsed}/${c.budget} điểm thời gian, còn ${c.remaining} · hạn chót ${c.deadline} · đang chờ: ${describeAwait(view, ctx)}`;
}

export function formatOptions(view: shift.SceneView): string[] {
  const node = view.node;
  if (!node || view.await.kind !== 'node_choice') return [];
  const lines = [
    ...(node.prompt ? [`  ${node.prompt}`] : []),
    ...node.options.map((o) => `  ${o.key}) ${o.text}`),
  ];
  if (node.timeLimitSeconds !== undefined)
    lines.push(
      `  Đồng hồ: ${node.timeLimitSeconds} giây, chạy từ lúc phương án hiện ra. Chọn trễ hơn là hết giờ.`,
    );
  return lines;
}

export function formatForm(form: shift.ArtefactForm): string[] {
  return [
    `  Tài liệu "${form.title}":`,
    ...form.fields.map((f) => `    - ${f.label} (${f.id})`),
    ...form.ticks.map((t) => `    [ ] ${t.label} (${t.id})`),
  ];
}

/** Hành động dùng được lúc này, rồi những hành động chưa dùng được kèm lý do. */
export function formatActions(view: shift.SceneView): string[] {
  if (view.await.kind !== 'phase' && view.await.kind !== 'conversation')
    return [];
  const usable = view.actions.filter((a) => a.enabled);
  const blocked = view.actions.filter((a) => !a.enabled);
  const lines = ['  Hành động dùng được:'];
  if (usable.length === 0) lines.push('    (không có)');
  for (const a of usable)
    lines.push(
      `    /lam ${a.key} — ${a.label} (${a.points} điểm${a.form ? ', có form' : ''})`,
    );
  if (blocked.length > 0) {
    lines.push('  Chưa dùng được:');
    for (const a of blocked)
      lines.push(`    ${a.key} — ${a.label}: ${a.reason ?? '?'}`);
  }
  return lines;
}

/** Khối in sau mỗi lượt: dòng trạng thái, rồi những gì người chơi cần để làm tiếp. */
export function formatPrompt(
  view: shift.SceneView,
  ctx: shift.ShiftContext,
): string[] {
  const lines = ['', formatStatus(view, ctx)];
  lines.push(...formatOptions(view));
  if (view.await.kind === 'node_artefact' && view.node?.form)
    lines.push(...formatForm(view.node.form));
  lines.push(...formatActions(view));
  return lines;
}

/** `/tt`: điều người chơi không thấy, cho tester soi seed và cơ chế. */
export function formatDebug(
  state: shift.ShiftState,
  ctx: shift.ShiftContext,
): string[] {
  const { seed, pack } = ctx;
  const mpp = pack.minutes_per_point;
  const at = (p: number) => shift.clockAt(p, seed.clock.start, mpp);
  const summary = shift.shiftSummary(state, ctx);
  const lines = ['Trạng thái nội bộ (tester):'];

  lines.push(`Cờ đã bật (${state.flags.length}):`);
  lines.push(`  ${state.flags.join(', ') || '(chưa có)'}`);

  lines.push(`Dữ kiện đã mở (${state.facts.length}):`);
  for (const f of state.facts) {
    const fact = seed.facts.find((x) => x.id === f.id);
    lines.push(
      `  ${at(f.at)} ${f.id}: ${fact ? (state.factText[f.id] ?? fact.text) : '?'}`,
    );
  }
  if (state.facts.length === 0) lines.push('  (chưa có)');

  lines.push('Lời hứa:');
  for (const p of state.promises)
    lines.push(
      `  ${p.id} "${p.label}" với ${p.to} → ${p.status}${
        p.dueAt === undefined ? '' : `, hạn ${at(p.dueAt)}`
      }${p.event ? `, sự kiện ${p.event}` : ''}`,
    );
  if (state.promises.length === 0) lines.push('  (chưa có)');

  lines.push('Khúc mắc của NPC:');
  for (const c of summary.concerns)
    lines.push(
      `  ${c.person}: ${c.text} → ${c.resolved ? 'đã gỡ' : 'chưa gỡ'}`,
    );

  lines.push('Nút:');
  for (const n of seed.nodes) {
    const p = state.nodes[n.id];
    lines.push(
      `  ${n.id} (${n.kind}) ${p.status}${p.choice ? `, chọn ${p.choice}` : ''}${
        p.timedOut ? ', hết giờ' : ''
      }${p.approved === undefined ? '' : p.approved ? ', được duyệt' : ', bị hoãn'}`,
    );
  }

  const pending = shift.pendingRequest(state, ctx);
  lines.push(
    pending
      ? `Yêu cầu AI đang chờ: ${pending.request.requestId} (${
          pending.type === 'narrate'
            ? `dẫn truyện ${pending.request.task}@${pending.request.slot}`
            : `bộ phán ${pending.request.source}`
        })`
      : 'Yêu cầu AI đang chờ: không',
  );
  return lines;
}

/** Tên file theo giờ chơi, hợp lệ với `PlaythroughSchema.name`. */
export function playName(now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `choi-thu-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
}
