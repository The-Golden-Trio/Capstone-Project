/**
 * Tổng kết cuối ca, kể theo truyện. Chưa chấm điểm: seed mẫu bản 4 chưa có
 * `observes`/`signs`, kết cục chưa chốt, AI-5 chưa có. Bằng chứng (lời người
 * chơi, artefact, nhật ký hành động) nằm trong chuỗi sự kiện để chấm sau.
 */
import { factText, slotOf, type ShiftContext } from './context.js';
import { resolvedFlag } from './flags.js';
import { clockAt } from './time.js';
import type { ShiftState } from './state.js';

export interface ShiftSummary {
  seedId: string;
  title: string;
  goal: string;
  endedAt: string;
  graded: false;
  nodes: Array<{
    id: string;
    kind: string;
    status: string;
    time?: string;
    choice?: string;
    timedOut?: boolean;
    approved?: boolean;
  }>;
  actions: Array<{ time: string; label: string; points: number; cut: boolean }>;
  facts: {
    found: Array<{ text: string; time: string }>;
    requiredMissed: number;
  };
  promises: Array<{ label: string; status: string }>;
  concerns: Array<{ person: string; text: string; resolved: boolean }>;
  artefacts: Array<{
    title: string;
    fields: Array<{ label: string; text: string }>;
    status: string;
  }>;
  review: Array<{ person: string; question: string; answer: string }>;
  hintsUsed: number;
}

export function shiftSummary(s: ShiftState, ctx: ShiftContext): ShiftSummary {
  const { seed, pack } = ctx;
  const at = (p: number) =>
    clockAt(p, seed.clock.start, pack.minutes_per_point);
  const flags = new Set(s.flags);

  const review = s.reviewAsked.map((id) => {
    const item = seed.review.find((r) => r.id === id);
    const lines = s.transcript.filter((l) => l.context === `review:${id}`);
    return {
      person: item ? slotOf(ctx, item.by).name : id,
      question: lines
        .filter((l) => l.kind === 'npc')
        .map((l) => l.text)
        .join(' '),
      answer: lines
        .filter((l) => l.kind === 'player')
        .map((l) => l.text)
        .join('\n'),
    };
  });

  return {
    seedId: seed.id,
    title: seed.title,
    goal: seed.goal,
    endedAt: at(s.points),
    graded: false,
    nodes: seed.nodes.map((n) => {
      const p = s.nodes[n.id];
      return {
        id: n.id,
        kind: n.kind,
        status: p.status,
        ...(p.openedAt !== undefined ? { time: at(p.openedAt) } : {}),
        ...(p.choice
          ? { choice: n.options.find((o) => o.key === p.choice)?.text }
          : {}),
        ...(p.timedOut ? { timedOut: true } : {}),
        ...(p.approved !== undefined ? { approved: p.approved } : {}),
      };
    }),
    actions: s.actionLog.map((e) => ({
      time: at(e.at),
      label: seed.actions.find((a) => a.key === e.key)?.label ?? e.key,
      points: e.points,
      cut: Boolean(e.cut),
    })),
    facts: {
      found: s.facts.flatMap((f) => {
        const fact = seed.facts.find((x) => x.id === f.id);
        return fact ? [{ text: factText(s, fact), time: at(f.at) }] : [];
      }),
      requiredMissed: seed.facts.filter(
        (f) =>
          f.required &&
          f.visibility !== 'ai_only' &&
          !s.facts.some((x) => x.id === f.id),
      ).length,
    },
    promises: s.promises.map((p) => ({ label: p.label, status: p.status })),
    concerns: seed.cast.flatMap((c) =>
      c.concerns.map((k) => ({
        person: c.name,
        text: k.text,
        resolved: flags.has(resolvedFlag(k.id)),
      })),
    ),
    artefacts: seed.artefacts
      .filter((a) => a.kind === 'form' && s.artefacts[a.id])
      .map((a) => ({
        title: a.title,
        status: s.artefacts[a.id].status,
        fields: (a.fields ?? []).map((f) => ({
          label: f.label,
          text: s.artefacts[a.id].fields[f.id] ?? '',
        })),
      })),
    review,
    hintsUsed: s.hints.length,
  };
}
