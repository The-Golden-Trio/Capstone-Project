/**
 * Những gì màn chơi được thấy ở một thời điểm. Không có câu kiểm, khúc mắc,
 * niềm tin, dữ kiện chưa lộ hay phần chấm: chỉ điều người chơi thật sự biết.
 */
import {
  actionAvailability,
  factText,
  nodeOf,
  nowOf,
  slotOf,
  type ShiftContext,
} from './context.js';
import type { Channel } from './schema.js';
import { clockAt } from './time.js';
import type { AwaitState, ShiftState } from './state.js';
import { TURNS_PER_POINT } from './engine.js';

export interface ArtefactForm {
  id: string;
  title: string;
  fields: Array<{ id: string; label: string }>;
  ticks: Array<{ id: string; label: string }>;
  prefill?: { fields: Record<string, string>; ticks: string[] };
}

export interface SceneView {
  seedId: string;
  title: string;
  goal: string;
  clock: {
    time: string;
    start: string;
    deadline: string;
    pointsUsed: number;
    budget: number;
    remaining: number;
    minutesPerPoint: number;
  };
  mode:
    | 'start'
    | 'phase'
    | 'conversation'
    | 'node'
    | 'review'
    | 'confirm_end'
    | 'waiting'
    | 'ended';
  await: AwaitState;
  conversation: {
    id: string;
    people: Array<{ slot: string; name: string }>;
    channel: Channel;
    turns: number;
    turnsLeftInPoint: number;
  } | null;
  node: {
    id: string;
    kind: 'open' | 'mid' | 'end';
    format: string;
    speaker: { slot: string; name: string };
    channel: Channel;
    prompt?: string;
    options: Array<{ key: string; text: string }>;
    timeLimitSeconds?: number;
    form?: ArtefactForm;
  } | null;
  actions: Array<{
    key: string;
    label: string;
    kind: string;
    points: number;
    enabled: boolean;
    reason?: string;
    target?: string;
    form?: ArtefactForm;
  }>;
  documents: Array<{
    id: string;
    title: string;
    kind: string;
    body?: string[];
    lines?: string[];
    saved?: { fields: Record<string, string>; ticks: string[]; status: string };
  }>;
  notebook: {
    facts: Array<{ id: string; text: string; time: string }>;
    promises: Array<{ id: string; label: string; status: string }>;
  };
  cast: Array<{ slot: string; name: string; relation: string }>;
  glossary: Array<{ term: string; plain: string }>;
  suspended: { key: string; label: string; remaining: number } | null;
  hintsUsed: number;
  ended: boolean;
}

function formOf(
  ctx: ShiftContext,
  s: ShiftState,
  id: string,
): ArtefactForm | undefined {
  const artefact = ctx.seed.artefacts.find((a) => a.id === id);
  if (!artefact || artefact.kind !== 'form') return undefined;
  const saved = s.artefacts[id];
  return {
    id,
    title: artefact.title,
    fields: artefact.fields ?? [],
    ticks: artefact.ticks ?? [],
    ...(saved ? { prefill: { fields: saved.fields, ticks: saved.ticks } } : {}),
  };
}

function modeOf(s: ShiftState): SceneView['mode'] {
  switch (s.await.kind) {
    case 'start':
      return 'start';
    case 'phase':
      return 'phase';
    case 'conversation':
      return 'conversation';
    case 'confirm_end':
      return 'confirm_end';
    case 'ai':
      return 'waiting';
    case 'ended':
      return 'ended';
    case 'probe_answer':
      return s.await.review ? 'review' : 'node';
    default:
      return 'node';
  }
}

export function sceneView(s: ShiftState, ctx: ShiftContext): SceneView {
  const { seed, pack } = ctx;
  const mpp = pack.minutes_per_point;
  const nameOf = (slot: string) => ({ slot, name: slotOf(ctx, slot).name });

  const node = s.activeNode ? nodeOf(ctx, s.activeNode) : null;
  const awaitingChoice = s.await.kind === 'node_choice';

  return {
    seedId: seed.id,
    title: seed.title,
    goal: seed.goal,
    clock: {
      time: nowOf(s, ctx),
      start: seed.clock.start,
      deadline: seed.clock.deadline,
      pointsUsed: s.points,
      budget: seed.clock.budget,
      remaining: Math.max(0, seed.clock.budget - s.points),
      minutesPerPoint: mpp,
    },
    mode: modeOf(s),
    await: s.await,
    conversation: s.conversation
      ? {
          id: s.conversation.id,
          people: s.conversation.slots.map(nameOf),
          channel: s.conversation.channel,
          turns: s.conversation.turns,
          turnsLeftInPoint:
            TURNS_PER_POINT - (s.conversation.turns % TURNS_PER_POINT),
        }
      : null,
    node: node
      ? {
          id: node.id,
          kind: node.kind,
          format: node.format,
          speaker: nameOf(node.speaker),
          channel: node.channel,
          prompt: node.prompt,
          options: awaitingChoice
            ? node.options.map((o) => ({ key: o.key, text: o.text }))
            : [],
          timeLimitSeconds: awaitingChoice
            ? node.time_limit_seconds
            : undefined,
          form: node.artefact ? formOf(ctx, s, node.artefact) : undefined,
        }
      : null,
    actions: seed.actions.map((action) => {
      const availability = actionAvailability(s, ctx, action);
      return {
        key: action.key,
        label: action.label,
        kind: action.kind,
        points: availability.points,
        enabled: availability.ok,
        ...(availability.ok ? {} : { reason: availability.reason }),
        ...(action.target ? { target: action.target } : {}),
        ...(action.target &&
        ['write', 'rewrite', 'message'].includes(action.kind)
          ? { form: formOf(ctx, s, action.target) }
          : {}),
      };
    }),
    documents: seed.artefacts
      .filter((a) => s.opened.includes(a.id) || s.artefacts[a.id])
      .map((a) => {
        const saved = s.artefacts[a.id];
        return {
          id: a.id,
          title: a.title,
          kind: a.kind,
          ...(a.kind === 'document' ? { body: a.body ?? [] } : {}),
          ...(saved?.lines ? { lines: saved.lines } : {}),
          ...(saved && a.kind === 'form'
            ? {
                saved: {
                  fields: saved.fields,
                  ticks: saved.ticks,
                  status: saved.status,
                },
              }
            : {}),
        };
      }),
    notebook: {
      facts: s.facts.flatMap((f) => {
        const fact = seed.facts.find((x) => x.id === f.id);
        return fact
          ? [
              {
                id: f.id,
                text: factText(s, fact),
                time: clockAt(f.at, seed.clock.start, mpp),
              },
            ]
          : [];
      }),
      promises: s.promises.map((p) => ({
        id: p.id,
        label: p.label,
        status: p.status,
      })),
    },
    cast: seed.cast.map((c) => ({
      slot: c.slot,
      name: c.name,
      relation: c.relation,
    })),
    glossary: seed.glossary,
    suspended: suspendedOf(s, ctx),
    hintsUsed: s.hints.length,
    ended: s.ended,
  };
}

function suspendedOf(s: ShiftState, ctx: ShiftContext): SceneView['suspended'] {
  const suspended = s.suspended;
  if (!suspended) return null;
  const label =
    ctx.seed.actions.find((a) => a.key === suspended.key)?.label ??
    suspended.key;
  return { key: suspended.key, label, remaining: suspended.remaining };
}
