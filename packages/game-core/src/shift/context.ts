/**
 * Phần tra cứu trên seed và trạng thái, dùng chung cho engine, giao diện
 * và hồ sơ gửi AI-4.
 *
 * Luật lọc ngữ cảnh theo NPC (C2) nằm ở đây: AI-4 chỉ nhận điều slot đang
 * nói biết, cộng những gì người chơi đã thấy. Câu kiểm, `observes`, `signs`
 * và dữ kiện `ai_only` của slot khác không bao giờ vào hồ sơ.
 */
import { normalizeVi } from '../domain/format.js';
import { matches } from './flags.js';
import type {
  Action,
  CastSlot,
  Fact,
  LevelPack,
  ShiftNode,
  ShiftSeed,
} from './schema.js';
import { clockAt, pointAt } from './time.js';
import type { NarrateRequest, NarrateTask, ShiftState } from './state.js';

export interface ShiftContext {
  seed: ShiftSeed;
  pack: LevelPack;
}

export const nowOf = (s: ShiftState, ctx: ShiftContext): string =>
  clockAt(s.points, ctx.seed.clock.start, ctx.pack.minutes_per_point);

export const pointOf = (clock: string, ctx: ShiftContext): number =>
  pointAt(clock, ctx.seed.clock.start, ctx.pack.minutes_per_point);

export function slotOf(ctx: ShiftContext, slot: string): CastSlot {
  const found = ctx.seed.cast.find((c) => c.slot === slot);
  if (!found) throw new Error(`Seed không có slot ${slot}`);
  return found;
}

export function nodeOf(ctx: ShiftContext, id: string): ShiftNode {
  const found = ctx.seed.nodes.find((n) => n.id === id);
  if (!found) throw new Error(`Seed không có nút ${id}`);
  return found;
}

export function actionOf(ctx: ShiftContext, key: string): Action | undefined {
  return ctx.seed.actions.find((a) => a.key === key);
}

export const flagSet = (s: ShiftState): Set<string> => new Set(s.flags);

/** Mọi nút đứng trước nút này trong lõi đã xong (A1b: lõi đi đúng thứ tự). */
export function previousDone(
  s: ShiftState,
  ctx: ShiftContext,
  id: string,
): boolean {
  for (const node of ctx.seed.nodes) {
    if (node.id === id) return true;
    const status = s.nodes[node.id]?.status;
    if (status !== 'done' && status !== 'skipped') return false;
  }
  return true;
}

/** Nút lõi kế tiếp chưa xảy ra. */
export function nextCoreNode(
  s: ShiftState,
  ctx: ShiftContext,
): ShiftNode | undefined {
  return ctx.seed.nodes.find((n) => s.nodes[n.id]?.status === 'pending');
}

export const isRevealed = (s: ShiftState, factId: string): boolean =>
  s.facts.some((f) => f.id === factId);

export const factText = (s: ShiftState, fact: Fact): string =>
  s.factText[fact.id] ?? fact.text;

/** Dữ kiện giữ cho một nút chỉ được lộ từ lúc nút đó mở. */
function reservedOk(s: ShiftState, fact: Fact): boolean {
  if (!fact.reserved_for) return true;
  const status = s.nodes[fact.reserved_for]?.status;
  return status === 'active' || status === 'done';
}

/** Dữ kiện slot này có thể lộ qua lời nói, theo thứ tự fact sheet. */
export function revealCandidates(
  s: ShiftState,
  ctx: ShiftContext,
  slot: string,
): Fact[] {
  return ctx.seed.facts.filter(
    (f) =>
      !isRevealed(s, f.id) &&
      f.known_by.includes(slot) &&
      reservedOk(s, f) &&
      (f.visibility === 'ai_only' ||
        (f.visibility === 'on_ask' &&
          f.unlock?.by === 'ask' &&
          (f.unlock.slots ?? []).includes(slot))),
  );
}

/**
 * NPC vừa nói ra một dữ kiện chưa lộ? Nhận ra bằng số và tên riêng
 * (`values`) có trong lời, cùng cơ chế máy kiểm R1. Mỗi lượt lộ tối đa một
 * dữ kiện (B2).
 */
export function detectReveal(
  s: ShiftState,
  ctx: ShiftContext,
  slot: string,
  text: string,
): Fact | undefined {
  const said = normalizeVi(text);
  return revealCandidates(s, ctx, slot).find(
    (f) =>
      f.values.length > 0 &&
      f.values.some((v) => said.includes(normalizeVi(v))),
  );
}

export function beliefsOf(s: ShiftState, slot: CastSlot): string[] {
  const flags = flagSet(s);
  return slot.beliefs.filter((b) => !flags.has(b.drop_when)).map((b) => b.text);
}

/** Khúc mắc còn lại mà AI-4 được thấy: chưa gỡ, không bị giấu tới nút sau (A13). */
export function openConcerns(s: ShiftState, slot: CastSlot): string[] {
  const flags = flagSet(s);
  return slot.concerns
    .filter((c) => !flags.has(`resolved_${c.id}`))
    .filter((c) => !c.hold_until || s.activeNode === c.hold_until)
    .map((c) => c.text);
}

/** Ambient còn dùng được ở giờ hiện tại (A10, `before`/`after`). */
export function nextAmbient(s: ShiftState, ctx: ShiftContext) {
  return ctx.seed.ambient.find(
    (a) =>
      !s.ambientUsed.includes(a.id) &&
      (!a.before || s.points < pointOf(a.before, ctx)) &&
      (!a.after || s.points >= pointOf(a.after, ctx)),
  );
}

export function buildNarrateRequest(
  s: ShiftState,
  ctx: ShiftContext,
  args: {
    requestId: string;
    task: NarrateTask;
    slot: string;
    maxBeats: number;
    channel: NarrateRequest['channel'];
    hook?: string;
    guidance?: string;
  },
): NarrateRequest {
  const slot = slotOf(ctx, args.slot);
  const present = s.conversation?.slots ?? [args.slot];
  const seen = new Set(s.facts.map((f) => f.id));

  const knownFacts = ctx.seed.facts
    .filter(
      (f) =>
        f.visibility !== 'ai_only' &&
        (seen.has(f.id) ||
          (f.known_by.includes(args.slot) && f.visibility === 'shown')),
    )
    .map((f) => ({ id: f.id, text: factText(s, f) }));

  const candidates = revealCandidates(s, ctx, args.slot);
  const mayReveal =
    args.task === 'reply'
      ? candidates
          .filter((f) => f.visibility === 'on_ask')
          .slice(0, 1)
          .map((f) => ({ id: f.id, text: factText(s, f) }))
      : [];
  const confirmOnly = ctx.seed.facts
    .filter((f) => f.visibility === 'ai_only' && f.known_by.includes(args.slot))
    .map((f) => ({ id: f.id, text: f.text }));

  const lastPlayer = [...s.transcript]
    .reverse()
    .find((l) => l.kind === 'player');
  const recent = s.transcript
    .filter((l) => l.kind !== 'system')
    .slice(-8)
    .map((l) => ({ speaker: l.speaker, text: l.text }));

  return {
    requestId: args.requestId,
    task: args.task,
    slot: args.slot,
    present,
    channel: args.channel,
    maxBeats: args.maxBeats,
    hook: args.hook,
    guidance: args.guidance,
    scene: { time: nowOf(s, ctx), channel: args.channel },
    company: ctx.pack.company,
    profile: {
      name: slot.name,
      relation: slot.relation,
      want: slot.want,
      pressure: slot.pressure,
      stance: slot.stance,
      expertise: slot.expertise,
      disclosure_style: slot.disclosure_style,
      voice: slot.voice,
      beliefs: beliefsOf(s, slot),
      concerns: openConcerns(s, slot),
    },
    knownFacts,
    mayReveal,
    confirmOnly,
    limits: {
      not_allowed: ctx.seed.limits.not_allowed.map((l) => l.action),
      need_approval: ctx.seed.limits.need_approval.map((l) => l.action),
    },
    flags: [...s.flags],
    recent,
    ambient: nextAmbient(s, ctx)?.text,
    playerText: lastPlayer?.text,
  };
}

/** Một hành động có làm được lúc này không, và vì sao không. */
export function actionAvailability(
  s: ShiftState,
  ctx: ShiftContext,
  action: Action,
):
  { ok: true; points: number } | { ok: false; reason: string; points: number } {
  const flags = flagSet(s);
  const no = (reason: string, points = action.points) => ({
    ok: false as const,
    reason,
    points,
  });

  if (s.ended || s.shiftOver) return no('Ca đã kết thúc');
  if (s.await.kind !== 'phase' && s.await.kind !== 'conversation')
    return no('Đang ở giữa một tình huống');
  if (!matches(action.requires, flags)) return no('Chưa làm được lúc này');

  switch (action.kind) {
    case 'talk':
      if (
        s.conversation?.slots.length === 1 &&
        s.conversation.slots[0] === action.target
      )
        return no('Đang trò chuyện với người này');
      return { ok: true, points: action.points };
    case 'open':
      return {
        ok: true,
        points:
          action.free_on_repeat && s.opened.includes(action.target ?? '')
            ? 0
            : action.points,
      };
    case 'wait': {
      const next = nextCoreNode(s, ctx);
      if (!next || next.trigger.by !== 'time' || !next.trigger.at)
        return no('Không có việc theo giờ sắp tới', 0);
      const gap = pointOf(next.trigger.at, ctx) - s.points;
      if (gap <= 0 || gap > ctx.seed.wait_window) return no('Chưa tới lúc', 0);
      return {
        ok: true,
        points: waitPoints(s, ctx, pointOf(next.trigger.at, ctx)),
      };
    }
    case 'trigger': {
      const target = action.target ?? '';
      if (s.nodes[target]?.status !== 'pending') return no('Đã xong');
      if (!previousDone(s, ctx, target)) return no('Chưa tới lúc');
      return { ok: true, points: action.points };
    }
    default:
      return { ok: true, points: action.points };
  }
}

/** "Tạm làm việc khác": chạy tới mốc kế, mốc nào tới trước (A1b). */
export function waitPoints(
  s: ShiftState,
  ctx: ShiftContext,
  nodePoint: number,
): number {
  let target = nodePoint;
  ctx.seed.timeline.forEach((item, i) => {
    if (item.kind !== 'scene' || s.timelineDone.includes(i)) return;
    const p = pointOf(item.at, ctx);
    if (p > s.points && p < target) target = p;
  });
  return target - s.points;
}
