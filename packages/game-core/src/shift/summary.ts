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
  actions: Array<{
    time: string;
    label: string;
    points: number;
    cut: boolean;
  }>;
  /**
   * Bảng điểm thời gian theo dòng thời gian của ca: việc đã làm, các nút tình
   * huống và lượt báo tin cuối ca. Nút chen vào giữa một việc dở được gộp vào
   * dòng của việc đó.
   */
  timeline: Array<{
    /** Giờ trong truyện: khoảng `10:10–10:35`, hoặc một mốc nếu không tốn điểm. */
    time: string;
    label: string;
    /** Mã nút (n0, n1…) nếu là dòng của một nút. */
    ref?: string;
    kind: 'action' | 'node' | 'last_word';
    points: number;
    /** Điểm thời gian còn lại ngay khi dòng này xong. */
    remaining: number;
    /** Nút chen ngang việc này, đã tính trong `points`. */
    interrupts: Array<{ ref: string; label: string; points: number }>;
  }>;
  pointsUsed: number;
  budget: number;
  facts: {
    found: Array<{ text: string; time: string }>;
    /** Dữ kiện người chơi thấy được nhưng chưa mở tới. */
    notOpened: Array<{ text: string; required: boolean }>;
    requiredMissed: number;
  };
  /** Cờ hành vi đã bật (cờ mở câu hỏi nhìn lại ca của seed); rỗng là ca không vướng cờ nào. */
  flags: string[];
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

type Row = Omit<ShiftSummary['timeline'][number], 'time' | 'remaining'> & {
  start: number;
  end: number;
};

/** Dòng thời gian suy ra từ nhật ký hành động, mốc mở và xong của các nút, và lượt báo tin cuối ca. */
function timelineRows(s: ShiftState, ctx: ShiftContext): Row[] {
  const { seed } = ctx;
  const spans = s.actionLog.map((e) => ({
    start: e.at,
    end: e.completedAt ?? e.at + e.points,
  }));
  const nodes = seed.nodes.flatMap((n) => {
    const p = s.nodes[n.id];
    if (p?.openedAt === undefined) return [];
    return [
      {
        ref: n.id,
        label: n.core,
        start: p.openedAt,
        end: p.doneAt ?? p.openedAt,
      },
    ];
  });
  const inside = (node: { start: number }, span: (typeof spans)[number]) =>
    node.start > span.start && node.start < span.end;

  const rows: Row[] = s.actionLog.map((e, i) => {
    const interrupts = nodes
      .filter((n) => inside(n, spans[i]))
      .map((n) => ({ ref: n.ref, label: n.label, points: n.end - n.start }));
    return {
      kind: 'action',
      label: seed.actions.find((a) => a.key === e.key)?.label ?? e.key,
      ...spans[i],
      points: spans[i].end - spans[i].start,
      interrupts,
    };
  });
  for (const n of nodes) {
    if (spans.some((span) => inside(n, span))) continue;
    rows.push({
      kind: 'node',
      ref: n.ref,
      label: n.label,
      start: n.start,
      end: n.end,
      points: n.end - n.start,
      interrupts: [],
    });
  }
  const lastWord = s.transcript.find(
    (l) => l.kind === 'player' && l.context === 'last_word',
  );
  if (lastWord && seed.last_word)
    rows.push({
      kind: 'last_word',
      label: seed.last_word.prompt,
      start: lastWord.at,
      end: lastWord.at,
      points: 0,
      interrupts: [],
    });
  return rows.sort((a, b) => a.start - b.start || a.end - b.end);
}

export function shiftSummary(s: ShiftState, ctx: ShiftContext): ShiftSummary {
  const { seed, pack } = ctx;
  const at = (p: number) =>
    clockAt(p, seed.clock.start, pack.minutes_per_point);
  const flags = new Set(s.flags);
  // Cờ hành vi: những cờ làm mở một câu hỏi "Nhìn lại ca" (tự đưa lên, hứa chắc, trễ hẹn…).
  const reviewFlags = new Set(
    seed.review.flatMap((r) => [...(r.if.all ?? []), ...(r.if.any ?? [])]),
  );

  const rows = timelineRows(s, ctx);

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
    timeline: rows.map(({ start, end, ...row }) => ({
      ...row,
      time: start === end ? at(start) : `${at(start)}–${at(end)}`,
      remaining: Math.max(0, seed.clock.budget - end),
    })),
    pointsUsed: rows.reduce((end, row) => Math.max(end, row.end), 0),
    budget: seed.clock.budget,
    facts: {
      found: s.facts.flatMap((f) => {
        const fact = seed.facts.find((x) => x.id === f.id);
        return fact ? [{ text: factText(s, fact), time: at(f.at) }] : [];
      }),
      notOpened: seed.facts
        .filter(
          (f) =>
            f.visibility !== 'ai_only' && !s.facts.some((x) => x.id === f.id),
        )
        .map((f) => ({ text: factText(s, f), required: Boolean(f.required) })),
      requiredMissed: seed.facts.filter(
        (f) =>
          f.required &&
          f.visibility !== 'ai_only' &&
          !s.facts.some((x) => x.id === f.id),
      ).length,
    },
    flags: [...reviewFlags].filter((flag) => flags.has(flag)),
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
