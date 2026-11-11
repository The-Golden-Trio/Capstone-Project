/**
 * Engine ca làm (Phần B của bộ luật dẫn truyện, E1–E8).
 *
 * Engine là một trình thông dịch có hàng việc (`agenda`). Mỗi đầu vào của
 * người chơi đẩy vài bước việc vào hàng, engine chạy lần lượt cho tới khi:
 *   - cần AI (viết lời hay trả lời câu kiểm): dừng, phát `narrate`/`check`,
 *     chờ kết quả quay về như một đầu vào;
 *   - cần người chơi (chọn phương án, viết artefact, trả lời probe): dừng;
 *   - hết việc: chờ hành động kế ở pha xử lý hoặc trong cuộc trò chuyện.
 *
 * Trạng thái và hàng việc đều là dữ liệu thuần, nên `fold` chuỗi đầu vào
 * từ trạng thái đầu luôn ra đúng một kết quả. Engine không đọc giờ thật,
 * không random: giờ chỉ đến từ điểm đã dùng.
 *
 * Engine quyết mọi luồng; AI-4 chỉ viết chữ, bộ phán chỉ trả lời câu
 * có/không đã soạn sẵn (D-129).
 */
import {
  actionAvailability,
  actionOf,
  buildNarrateRequest,
  detectReveal,
  flagSet,
  nextAmbient,
  nodeOf,
  pointOf,
  previousDone,
  slotOf,
  type ShiftContext,
} from './context.js';
import { matches, resolvedFlag } from './flags.js';
import { clockAt } from './time.js';
import {
  EXPRESSIONS,
  SCENE_SPEAKER,
  type Beat,
  type Channel,
  type CheckQuestion,
} from './schema.js';
import type {
  AiInput,
  AwaitState,
  CheckAnswer,
  CheckRequest,
  NarrateRequest,
  Effect,
  NodeStep,
  Op,
  PlayerInput,
  ShiftInput,
  ShiftState,
  TranscriptLine,
} from './state.js';

export type { ShiftContext } from './context.js';

/** Lượt mỗi điểm của một cuộc trò chuyện (A1). */
export const TURNS_PER_POINT = 3;
/** Cửa sổ giữ lời hứa theo giờ: từ 2 điểm trước tới 1 điểm sau mốc (A1b). */
export const PROMISE_WINDOW = { before: 2, after: 1 } as const;

export type ShiftErrorCode = 'TURN_INVALID' | 'TURN_IN_PROGRESS' | 'RUN_ENDED';

/** Đầu vào không hợp luật lúc này. API trả 409/422 theo `code`. */
export class ShiftRuleError extends Error {
  constructor(
    readonly code: ShiftErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ShiftRuleError';
  }
}

export interface StepResult {
  state: ShiftState;
  effects: Effect[];
}

export function initialState(ctx: ShiftContext): ShiftState {
  const { seed } = ctx;
  return {
    seedId: seed.id,
    seedVersion: seed.version,
    points: 0,
    flags: [],
    facts: [],
    factText: {},
    opened: [],
    artefacts: {},
    conversation: null,
    conversationCount: 0,
    nodes: Object.fromEntries(
      seed.nodes.map((n) => [n.id, { status: 'pending' as const }]),
    ),
    activeNode: null,
    shiftOver: false,
    timelineDone: [],
    ambientUsed: [],
    warned: false,
    promises: [],
    events: [],
    contacts: [],
    channelMessages: [],
    transcript: [],
    actionLog: [],
    suspended: null,
    hints: [],
    reviewAsked: [],
    realtime: {},
    agenda: [],
    await: { kind: 'start' },
    pending: null,
    nextRequest: 1,
    ended: false,
  };
}

/** Áp một đầu vào. Không đổi `state` truyền vào. */
export function step(
  state: ShiftState,
  input: ShiftInput,
  ctx: ShiftContext,
): StepResult {
  const runner = new Runner(
    JSON.parse(JSON.stringify(state)) as ShiftState,
    ctx,
  );
  runner.apply(input);
  return { state: runner.s, effects: runner.effects };
}

/**
 * Dựng lại yêu cầu AI đang chờ từ trạng thái (đã fold). Worker chết giữa
 * chừng thì job chạy lại vẫn hỏi đúng câu cũ, không cần lưu yêu cầu riêng.
 */
export function pendingRequest(
  state: ShiftState,
  ctx: ShiftContext,
):
  | { type: 'narrate'; request: NarrateRequest }
  | { type: 'check'; request: CheckRequest }
  | null {
  const pending = state.pending;
  if (!pending) return null;
  const op = pending.op;
  if (op.op === 'narrate')
    return {
      type: 'narrate',
      request: buildNarrateRequest(state, ctx, {
        requestId: pending.requestId,
        task: op.task,
        slot: op.slot,
        maxBeats: op.maxBeats,
        channel: op.channel ?? slotOf(ctx, op.slot).default_channel,
        hook: op.hook,
        guidance: op.guidance,
      }),
    };
  if (op.op === 'check')
    return {
      type: 'check',
      request: {
        requestId: pending.requestId,
        questions: op.questions.map((q) =>
          q.extract?.fields.includes('event')
            ? { ...q, events: ctx.seed.promise_events }
            : q,
        ),
        scope: op.scope,
        source: op.source,
      },
    };
  return null;
}

/* ── Trình chạy ──────────────────────────────────────────────────────── */

class Runner {
  readonly effects: Effect[] = [];
  private shown: TranscriptLine[] = [];

  constructor(
    readonly s: ShiftState,
    private readonly ctx: ShiftContext,
  ) {}

  apply(input: ShiftInput): void {
    if (input.type === 'NARRATION' || input.type === 'CHECKS')
      this.applyAi(input);
    else this.applyPlayer(input);
    this.drain();
    this.flushShown();
    this.effects.push({ type: 'await', await: this.s.await });
  }

  /* ── Đầu vào ── */

  private applyPlayer(input: PlayerInput): void {
    const { s } = this;
    if (s.ended) throw new ShiftRuleError('RUN_ENDED', 'Ca đã kết thúc');
    if (s.pending)
      throw new ShiftRuleError('TURN_IN_PROGRESS', 'Đang chờ lượt trước xong');

    if (input.type === 'HINT') return this.hint();

    const wait = s.await;
    const invalid = (why: string) => new ShiftRuleError('TURN_INVALID', why);

    switch (wait.kind) {
      case 'start':
        if (input.type !== 'START') throw invalid('Ca chưa bắt đầu');
        return this.start();

      case 'phase':
      case 'conversation':
        if (input.type === 'ACTION') return this.action(input);
        if (input.type === 'SAY') {
          if (wait.kind !== 'conversation')
            throw invalid('Hãy chọn người để trò chuyện trước');
          return this.say(input.text);
        }
        if (input.type === 'END_CONVERSATION') {
          if (wait.kind !== 'conversation')
            throw invalid('Không có cuộc trò chuyện nào');
          this.push({ op: 'close_conversation' });
          return;
        }
        throw invalid('Thao tác này không dùng được lúc này');

      case 'node_reply':
        if (input.type !== 'SAY') throw invalid('Hãy trả lời');
        this.playerLine(input.text, `node:${wait.node}`);
        return this.front(
          {
            op: 'narrate',
            task: 'reply',
            slot: nodeOf(this.ctx, wait.node).speaker,
            maxBeats: 2,
            context: `node:${wait.node}`,
            channel: nodeOf(this.ctx, wait.node).channel,
          },
          { op: 'node', node: wait.node, step: 'checks' },
          { op: 'node', node: wait.node, step: 'finish' },
        );

      case 'node_choice':
        if (input.type === 'CHOOSE')
          return this.choose(wait.node, input.option, input.elapsedMs);
        if (input.type === 'TIMEOUT') return this.choose(wait.node, null);
        throw invalid('Hãy chọn một phương án');

      case 'node_artefact':
        if (input.type !== 'SAVE_ARTEFACT' || input.artefact !== wait.artefact)
          throw invalid('Hãy hoàn thành tài liệu của bước này');
        return this.nodeArtefact(wait.node, input.fields, input.ticks ?? []);

      case 'probe_answer':
        if (input.type !== 'SAY') throw invalid('Hãy trả lời câu hỏi');
        if (wait.review) {
          const item = this.ctx.seed.review.find((r) => r.id === wait.review);
          this.playerLine(input.text, `review:${wait.review}`);
          if (item)
            this.front({
              op: 'narrate',
              task: 'reply',
              slot: item.by,
              maxBeats: 2,
              context: `review:${item.id}`,
              channel: item.channel,
            });
          return;
        }
        if (!wait.node) throw invalid('Không có câu hỏi nào đang chờ');
        this.playerLine(input.text, `node:${wait.node}`);
        return this.front(
          { op: 'node', node: wait.node, step: 'checks' },
          { op: 'node', node: wait.node, step: 'closing' },
          { op: 'node', node: wait.node, step: 'finish' },
        );

      case 'confirm_end':
        if (input.type === 'CONFIRM_END')
          return this.front({
            op: 'open_node',
            node: wait.node,
            via: 'player',
          });
        if (input.type === 'CANCEL_END') return; // về lại pha, hàng việc rỗng
        throw invalid('Hãy xác nhận hoặc huỷ');

      default:
        throw invalid('Không nhận thao tác lúc này');
    }
  }

  private applyAi(input: AiInput): void {
    const { s } = this;
    const pending = s.pending;
    if (!pending || pending.requestId !== input.requestId)
      throw new ShiftRuleError(
        'TURN_INVALID',
        `Không có yêu cầu ${input.requestId}`,
      );
    s.pending = null;

    if (input.type === 'NARRATION' && pending.op.op === 'narrate') {
      const op = pending.op;
      const slot = op.slot;
      const present = new Set([
        ...(s.conversation?.slots ?? []),
        slot,
        SCENE_SPEAKER,
      ]);
      const beats = input.beats
        .filter((b) => b.text.trim().length > 0)
        .slice(0, op.maxBeats)
        .map((b) => ({
          speaker: present.has(b.speaker) ? b.speaker : slot,
          text: b.text.trim(),
          expression: (EXPRESSIONS as readonly string[]).includes(b.expression)
            ? b.expression
            : 'binh_thuong',
        }));
      this.showBeats(beats, op.context, op.channel);
      if (op.after) this.showBeats(op.after, op.context, op.channel);
      return;
    }
    if (input.type === 'CHECKS' && pending.op.op === 'check') {
      this.applyChecks(
        pending.op.questions,
        pending.op.source,
        input.answers,
        pending.op.channel,
      );
      return;
    }
    throw new ShiftRuleError('TURN_INVALID', 'Kết quả AI không khớp yêu cầu');
  }

  /* ── Hàng việc ── */

  private push(...ops: Op[]) {
    this.s.agenda.push(...ops);
  }

  private front(...ops: Op[]) {
    this.s.agenda.unshift(...ops);
  }

  private drain(): void {
    const { s } = this;
    for (let guard = 0; guard < 10_000; guard++) {
      if (s.pending) {
        s.await = { kind: 'ai' };
        return;
      }
      const op = s.agenda.shift();
      if (!op) {
        s.await = this.idleAwait();
        return;
      }
      if (op.op === 'await') {
        s.await = op.await;
        return;
      }
      this.exec(op);
    }
    throw new Error('Engine lặp quá nhiều bước');
  }

  private idleAwait(): AwaitState {
    const { s } = this;
    if (s.ended) return { kind: 'ended' };
    if (s.conversation)
      return { kind: 'conversation', conversation: s.conversation.id };
    return { kind: 'phase' };
  }

  private exec(op: Exclude<Op, { op: 'await' }>): void {
    switch (op.op) {
      case 'show':
        return this.showBeats(op.beats, op.context, op.channel);
      case 'scene':
        return this.line('scene', SCENE_SPEAKER, op.text, op.context);
      case 'narrate':
        return this.requestNarration(op);
      case 'check':
        return this.requestChecks(op);
      case 'advance':
        return this.advance(op.points, op.key, op.resume);
      case 'due':
        return this.due();
      case 'open_conversation':
        return this.openConversation(op.slots, op.channel, op.byNpc);
      case 'close_conversation':
        return this.closeConversation();
      case 'complete_action':
        return this.completeAction(op.key);
      case 'open_node':
        return this.openNode(op.node, op.via);
      case 'node':
        return this.nodeStep(op.node, op.step);
      case 'review':
        return this.review(op.index, op.picked);
      case 'refresh':
        return this.refreshConcerns();
      case 'end':
        return this.end();
    }
  }

  /* ── Bắt đầu, hành động ── */

  private start(): void {
    const { s, ctx } = this;
    for (const fact of ctx.seed.facts)
      if (fact.visibility === 'shown') s.facts.push({ id: fact.id, at: 0 });
    // E6: `situation` thành một câu cảnh; `stakes` không hiện.
    this.line('scene', SCENE_SPEAKER, ctx.seed.situation, 'intro');
    const first =
      ctx.seed.nodes.find((n) => n.trigger.by === 'start') ?? ctx.seed.nodes[0];
    this.push({ op: 'open_node', node: first.id, via: 'start' });
  }

  private action(input: Extract<PlayerInput, { type: 'ACTION' }>): void {
    const { s, ctx } = this;
    const action = actionOf(ctx, input.key);
    if (!action)
      throw new ShiftRuleError('TURN_INVALID', 'Không có hành động này');
    const availability = actionAvailability(s, ctx, action);
    if (!availability.ok)
      throw new ShiftRuleError('TURN_INVALID', availability.reason);
    const points = availability.points;

    // Làm việc khác thì cuộc trò chuyện đang mở đóng lại (A1, bản 3).
    const close: Op[] =
      s.conversation && action.kind !== 'trigger'
        ? [{ op: 'close_conversation' }]
        : [];

    switch (action.kind) {
      case 'talk': {
        const slot = slotOf(ctx, action.target ?? '');
        return this.push(
          ...close,
          { op: 'advance', points, key: action.key },
          {
            op: 'open_conversation',
            slots: [slot.slot],
            channel: slot.default_channel,
            byNpc: false,
          },
          { op: 'complete_action', key: action.key },
          { op: 'due' },
        );
      }
      case 'meeting':
        return this.push(
          ...close,
          { op: 'advance', points, key: action.key },
          {
            op: 'open_conversation',
            slots: action.slots ?? [],
            channel: 'meet',
            byNpc: false,
          },
          { op: 'complete_action', key: action.key },
          { op: 'due' },
        );
      case 'trigger': {
        const node = nodeOf(ctx, action.target ?? '');
        const budget = ctx.seed.clock.budget;
        const ops: Op[] = s.conversation ? [{ op: 'close_conversation' }] : [];
        // E7: nộp nút kết trước hạn chót thì hỏi xác nhận bằng giao diện.
        if (node.kind === 'end' && s.points < budget)
          return this.push(...ops, {
            op: 'await',
            await: { kind: 'confirm_end', node: node.id },
          });
        return this.push(...ops, {
          op: 'open_node',
          node: node.id,
          via: 'player',
        });
      }
      case 'write':
      case 'rewrite':
      case 'message': {
        const artefact = this.artefact(action.target ?? '');
        const fields = this.requireFields(artefact.fields ?? [], input.fields);
        // Chữ người chơi gõ lúc bắt đầu hành động; xong mới lưu (A1b).
        s.artefacts[artefact.id] = {
          fields,
          ticks: input.ticks ?? [],
          status: 'draft',
          flags: s.artefacts[artefact.id]?.flags ?? [],
        };
        break;
      }
      default:
        break;
    }
    this.push(
      ...close,
      { op: 'advance', points, key: action.key },
      { op: 'complete_action', key: action.key },
      { op: 'due' },
    );
  }

  private requireFields(
    fields: Array<{ id: string; label: string }>,
    given: Record<string, string> | undefined,
  ): Record<string, string> {
    const out: Record<string, string> = {};
    for (const field of fields)
      out[field.id] = (given?.[field.id] ?? '').trim().slice(0, 4000);
    if (fields.length > 0 && Object.values(out).every((v) => v.length === 0))
      throw new ShiftRuleError('TURN_INVALID', 'Tài liệu còn trống');
    return out;
  }

  private artefact(id: string) {
    const found = this.ctx.seed.artefacts.find((a) => a.id === id);
    if (!found) throw new Error(`Seed không có tài liệu ${id}`);
    return found;
  }

  private completeAction(key: string): void {
    const { s, ctx } = this;
    const action = actionOf(ctx, key);
    if (!action) return;
    const entry = [...s.actionLog]
      .reverse()
      .find((e) => e.key === key && e.points >= 0);
    const points = entry?.points ?? action.points;
    const context = `action:${key}`;

    switch (action.kind) {
      case 'talk':
      case 'meeting':
        break;
      case 'open': {
        const artefact = this.artefact(action.target ?? '');
        const again = s.opened.includes(artefact.id);
        if (!again) s.opened.push(artefact.id);
        this.line(
          'scene',
          SCENE_SPEAKER,
          `${again ? 'Bạn xem lại' : 'Bạn mở'} ${artefact.title}.`,
          context,
        );
        const fact = artefact.unlocks.find(
          (id) => !s.facts.some((f) => f.id === id),
        );
        if (fact) s.facts.push({ id: fact, at: s.points });
        break;
      }
      case 'write':
      case 'rewrite': {
        const artefact = this.artefact(action.target ?? '');
        const saved = s.artefacts[artefact.id];
        if (!saved) break;
        // Sửa lại thì cờ của tài liệu tính lại từ bản mới (A12).
        if (action.kind === 'rewrite') this.dropFlags(saved.flags);
        saved.status = 'saved';
        saved.savedAt = s.points;
        saved.flags = [];
        this.line(
          'scene',
          SCENE_SPEAKER,
          `Bạn lưu ${artefact.title}.`,
          context,
        );
        if (artefact.checks.length > 0)
          this.front({
            op: 'check',
            questions: artefact.checks,
            scope: Object.values(saved.fields).join('\n'),
            source: `artefact:${artefact.id}`,
          });
        break;
      }
      case 'message': {
        const artefact = this.artefact(action.target ?? '');
        const saved = s.artefacts[artefact.id];
        if (!saved) break;
        saved.status = 'saved';
        saved.savedAt = s.points;
        s.channelMessages.push(s.points);
        const text = Object.values(saved.fields).join('\n');
        this.playerLine(text, context, 'group');
        // Kênh chung: như nói với từng người trong kênh (A12, D4).
        const members = artefact.channel_members ?? [];
        const questions = this.dedupe(
          ctx.seed.conversation_checks.filter(
            (c) =>
              c.in_channel &&
              !c.realtime &&
              c.slots.some((sl) => members.includes(sl)),
          ),
        );
        if (questions.length > 0)
          this.front({
            op: 'check',
            questions,
            scope: text,
            source: `channel:${artefact.id}`,
          });
        break;
      }
      case 'run': {
        const artefact = this.artefact(action.target ?? '');
        const flags = flagSet(s);
        const branch = (artefact.branches ?? []).find((b) =>
          matches(b.if, flags),
        );
        if (!branch) break;
        s.artefacts[artefact.id] = {
          fields: {},
          ticks: [],
          status: 'saved',
          savedAt: s.points,
          flags: [],
          lines: branch.lines,
        };
        if (!s.opened.includes(artefact.id)) s.opened.push(artefact.id);
        this.line(
          'scene',
          SCENE_SPEAKER,
          `Bạn chạy thử, kết quả hiện trong ${artefact.title}.`,
          context,
        );
        for (const l of branch.lines) this.line('system', 'system', l, context);
        if (branch.emits && !s.events.some((e) => e.name === branch.emits))
          this.emitEvent(branch.emits);
        break;
      }
      case 'wait':
        this.line('scene', SCENE_SPEAKER, 'Bạn tạm làm việc khác.', context);
        break;
      default:
        break;
    }

    this.addFlags(action.sets);
    if (
      points >= ctx.seed.ambient_min_points &&
      action.kind !== 'talk' &&
      action.kind !== 'meeting'
    ) {
      const ambient = nextAmbient(s, ctx);
      if (ambient) {
        s.ambientUsed.push(ambient.id);
        this.line('scene', SCENE_SPEAKER, ambient.text, 'ambient');
      }
    }
  }

  /* ── Đồng hồ ── */

  /**
   * Cho đồng hồ chạy. Gặp mốc có giờ ở giữa hành động thì cắt đôi: xử lý
   * mốc trước, rồi chạy tiếp phần còn lại (A1b). Đang trong nút thì giữ lại.
   */
  private advance(points: number, key?: string, resume = false): void {
    const { s } = this;
    if (key && !resume) s.actionLog.push({ at: s.points, key, points });
    const end = s.points + points;
    for (let t = s.points + 1; t < end; t++) {
      s.points = t;
      if (!s.activeNode && this.hasInterrupt()) {
        s.suspended = key ? { key, remaining: end - t } : null;
        const entry = [...s.actionLog].reverse().find((e) => e.key === key);
        if (entry) entry.cut = true;
        this.front(
          { op: 'due' },
          { op: 'advance', points: end - t, key, resume: true },
        );
        return;
      }
    }
    s.points = end;
    if (key) s.suspended = null;
  }

  /** Có mốc nào (không phải mốc im) tới hạn ở giờ hiện tại không. */
  private hasInterrupt(): boolean {
    const { s, ctx } = this;
    if (this.dueNode()) return true;
    if (
      !s.shiftOver &&
      ctx.seed.timeline.some(
        (item, i) =>
          item.kind === 'scene' &&
          !s.timelineDone.includes(i) &&
          pointOf(item.at, ctx) <= s.points,
      )
    )
      return true;
    if (this.duePromise()) return true;
    return (
      !s.warned &&
      !s.shiftOver &&
      ctx.seed.clock.budget - s.points <= ctx.seed.clock.warn_remaining
    );
  }

  /** Nút tới hạn: hạn chót, nút theo giờ, hay giờ dự phòng của nút do người chơi bật. */
  private dueNode(): { node: string; via: 'time' | 'fallback' } | null {
    const { s, ctx } = this;
    if (s.shiftOver) return null;
    const end = ctx.seed.nodes.find((n) => n.kind === 'end');
    if (
      end &&
      s.nodes[end.id].status === 'pending' &&
      s.points >= ctx.seed.clock.budget
    )
      return { node: end.id, via: 'fallback' };
    for (const node of ctx.seed.nodes) {
      if (s.nodes[node.id].status !== 'pending') continue;
      if (!previousDone(s, ctx, node.id)) return null;
      const t = node.trigger;
      if (t.by === 'time' && t.at && pointOf(t.at, ctx) <= s.points)
        return { node: node.id, via: 'time' };
      if (
        t.by === 'player' &&
        t.fallback_at &&
        pointOf(t.fallback_at, ctx) <= s.points
      )
        return { node: node.id, via: 'fallback' };
      return null;
    }
    return null;
  }

  private duePromise() {
    const { s } = this;
    return s.promises.find((p) => {
      if (p.status !== 'open') return false;
      const base = p.dueAt ?? s.events.find((e) => e.name === p.event)?.at;
      return base !== undefined && base + PROMISE_WINDOW.after <= s.points;
    });
  }

  /**
   * Xử lý các mốc đã tới hạn, đúng thứ tự khi trùng giờ (A1b): mốc im →
   * nút / sự kiện theo giờ → nhắc lời hứa → báo sắp hết giờ.
   */
  private due(): void {
    const { s, ctx } = this;
    if (s.ended || s.activeNode) return;

    ctx.seed.timeline.forEach((item, i) => {
      if (
        item.kind !== 'silent' ||
        s.timelineDone.includes(i) ||
        pointOf(item.at, ctx) > s.points
      )
        return;
      s.timelineDone.push(i);
      if (item.fact_update)
        s.factText[item.fact_update.fact] = item.fact_update.text;
    });

    const node = this.dueNode();
    if (node) {
      if (node.via === 'fallback' && nodeOf(ctx, node.node).kind === 'end')
        this.skipUnreached(node.node);
      const close: Op[] = s.conversation ? [{ op: 'close_conversation' }] : [];
      this.front(
        ...close,
        { op: 'open_node', node: node.node, via: node.via },
        { op: 'due' },
      );
      return;
    }

    if (!s.shiftOver) {
      ctx.seed.timeline.forEach((item, i) => {
        if (
          item.kind !== 'scene' ||
          s.timelineDone.includes(i) ||
          pointOf(item.at, ctx) > s.points
        )
          return;
        s.timelineDone.push(i);
        if (item.text) this.line('scene', SCENE_SPEAKER, item.text, 'timeline');
      });
    }

    const promise = this.duePromise();
    if (promise) {
      const base =
        promise.dueAt ??
        s.events.find((e) => e.name === promise.event)?.at ??
        s.points;
      const kept = s.contacts.some(
        (c) =>
          c.slot === promise.to &&
          c.at >=
            base - (promise.dueAt !== undefined ? PROMISE_WINDOW.before : 0) &&
          c.at <= base + PROMISE_WINDOW.after &&
          c.at >= promise.madeAt,
      );
      if (kept) {
        promise.status = 'kept';
        this.front({ op: 'due' });
        return;
      }
      // Chưa giữ lời: người được hứa nhắc qua đúng kênh đã hứa, bật `tre_hen`.
      promise.status = 'late';
      promise.remindedAt = s.points;
      this.addFlags(['tre_hen']);
      const reminder =
        ctx.seed.promise_reminders.find(
          (r) => r.to === promise.to && r.channel === promise.channel,
        ) ?? ctx.seed.promise_reminders.find((r) => r.to === promise.to);
      const sawChannel = s.channelMessages.some((t) => t >= promise.madeAt);
      const beats =
        (sawChannel ? reminder?.after_channel_message : undefined) ??
        reminder?.beats ??
        [];
      const close: Op[] = s.conversation ? [{ op: 'close_conversation' }] : [];
      this.front(
        ...close,
        { op: 'advance', points: 1 },
        {
          op: 'open_conversation',
          slots: [promise.to],
          channel: promise.channel,
          byNpc: true,
        },
        { op: 'show', beats, context: 'promise', channel: promise.channel },
        { op: 'due' },
      );
      return;
    }

    if (
      !s.warned &&
      !s.shiftOver &&
      ctx.seed.clock.budget - s.points <= ctx.seed.clock.warn_remaining
    ) {
      s.warned = true;
      this.showBeats([ctx.seed.clock.warning], 'timeline');
    }
  }

  /** Hết giờ: nút giữa chưa tới thì không xét (D2). */
  private skipUnreached(endNode: string): void {
    for (const node of this.ctx.seed.nodes) {
      if (node.id === endNode) break;
      if (this.s.nodes[node.id].status === 'pending')
        this.s.nodes[node.id].status = 'skipped';
    }
  }

  /* ── Hội thoại ── */

  private openConversation(
    slots: string[],
    channel: Channel,
    byNpc: boolean,
  ): void {
    const { s } = this;
    s.conversationCount += 1;
    s.conversation = {
      id: `c${s.conversationCount}`,
      slots,
      channel,
      openedAt: s.points,
      byNpc,
      turns: 0,
    };
    if (!byNpc)
      for (const slot of slots) {
        s.contacts.push({ slot, at: s.points, channel });
        this.keepPromises(slot);
      }
    const names = slots.map((sl) => slotOf(this.ctx, sl).name).join(', ');
    const verb = byNpc
      ? `${names} liên lạc với bạn`
      : channel === 'call'
        ? `Bạn gọi ${names}`
        : channel === 'meet'
          ? `Bạn gọi họp nhanh với ${names}`
          : `Bạn nhắn ${names}`;
    this.line('scene', SCENE_SPEAKER, `${verb}.`, `conv:${s.conversation.id}`);
  }

  private say(text: string): void {
    const { s, ctx } = this;
    const conv = s.conversation;
    if (!conv)
      throw new ShiftRuleError('TURN_INVALID', 'Không có cuộc trò chuyện nào');
    const clean = text.trim();
    if (!clean) throw new ShiftRuleError('TURN_INVALID', 'Câu trả lời trống');
    conv.turns += 1;
    // Mỗi 3 lượt tốn 1 điểm; cuộc đã trả điểm lúc mở (A1).
    if (
      conv.turns > TURNS_PER_POINT &&
      (conv.turns - 1) % TURNS_PER_POINT === 0
    )
      s.points += 1;
    this.playerLine(clean, `conv:${conv.id}`, conv.channel);

    const realtime = ctx.seed.conversation_checks.filter(
      (c) => c.realtime && c.slots.some((sl) => conv.slots.includes(sl)),
    );
    s.realtime = {};
    const ops: Op[] = [];
    if (realtime.length > 0)
      ops.push({
        op: 'check',
        questions: this.dedupe(realtime),
        scope: clean,
        source: `realtime:${conv.id}`,
        channel: conv.channel,
      });
    const approval = realtime.find((c) => c.on_yes === 'approval_line');
    ops.push(
      {
        op: 'narrate',
        task: 'reply',
        slot: conv.slots[0],
        maxBeats: 3,
        context: `conv:${conv.id}`,
        channel: conv.channel,
        approvalFlag: approval?.flag,
      },
      { op: 'due' },
    );
    this.push(...ops);
  }

  private closeConversation(): void {
    const { s, ctx } = this;
    const conv = s.conversation;
    if (!conv) return;
    s.conversation = null;
    if (conv.turns === 0) return;
    const scope = s.transcript
      .filter((l) => l.kind === 'player' && l.context === `conv:${conv.id}`)
      .map((l) => l.text)
      .join('\n');
    const questions = this.dedupe(
      ctx.seed.conversation_checks.filter(
        (c) => !c.realtime && c.slots.some((sl) => conv.slots.includes(sl)),
      ),
    );
    if (questions.length > 0)
      this.front({
        op: 'check',
        questions,
        scope,
        source: `conv:${conv.id}`,
        channel: conv.channel,
      });
  }

  private dedupe(checks: CheckQuestion[]): CheckQuestion[] {
    const seen = new Set<string>();
    return checks
      .filter((c) => (seen.has(c.flag) ? false : (seen.add(c.flag), true)))
      .map((c) => ({
        flag: c.flag,
        q: c.q,
        ...(c.extract ? { extract: c.extract } : {}),
      }));
  }

  /* ── Nút ── */

  private openNode(
    id: string,
    via: 'start' | 'time' | 'player' | 'fallback',
  ): void {
    const { s } = this;
    const node = nodeOf(this.ctx, id);
    if (s.nodes[id].status !== 'pending') return;
    s.nodes[id] = { status: 'active', via, openedAt: s.points };
    s.activeNode = id;
    // Nút tốn điểm; mốc nào rơi vào lúc đang trong nút thì giữ lại tới khi xong.
    s.points += node.points;
    this.front({ op: 'node', node: id, step: 'lead' });
  }

  private nodeStep(id: string, stepName: NodeStep): void {
    const { s, ctx } = this;
    const node = nodeOf(ctx, id);
    const progress = s.nodes[id];
    const context = `node:${id}`;

    switch (stepName) {
      case 'lead': {
        const flags = flagSet(s);
        const lead = node.adapt.find(
          (a) =>
            (a.when === 'any' || a.when === progress.via) &&
            matches(a.if, flags),
        );
        if (lead)
          this.showBeats(lead.beats, context, node.channel, node.speaker);
        if (node.format === 'free_reply')
          return this.front({
            op: 'await',
            await: { kind: 'node_reply', node: id },
          });
        if (node.format === 'artefact')
          return this.front({
            op: 'await',
            await: {
              kind: 'node_artefact',
              node: id,
              artefact: node.artefact ?? '',
            },
          });
        return this.front({
          op: 'await',
          await: { kind: 'node_choice', node: id },
        });
      }

      case 'probe': {
        // Hook theo nhánh; hook đã được trả lời trong pha thì bỏ qua (A7).
        const probe = node.probe;
        const flags = flagSet(s);
        const hook =
          probe && this.ctx.pack.followup_cap > 0
            ? probe.hooks.find(
                (h) =>
                  matches(h.if, flags) &&
                  !(h.answered_if && flags.has(h.answered_if)),
              )
            : undefined;
        if (!probe || !hook) {
          return this.front(
            { op: 'node', node: id, step: 'checks' },
            { op: 'node', node: id, step: 'closing' },
            { op: 'node', node: id, step: 'finish' },
          );
        }
        progress.hookUsed = hook.text;
        return this.front(
          {
            op: 'narrate',
            task: 'probe',
            slot: probe.by,
            maxBeats: 2,
            context,
            hook: hook.text,
            guidance: probe.direction,
            channel: node.channel,
          },
          { op: 'await', await: { kind: 'probe_answer', node: id } },
        );
      }

      case 'checks': {
        // Sau lượt cuối của người chơi trong nút, trước nhịp chốt (A12, D5).
        const recheck = ctx.seed.conversation_checks.filter(
          (c) =>
            !c.realtime &&
            c.slots.some((sl) => node.recheck_conversation_of.includes(sl)),
        );
        const questions = this.dedupe([...node.node_checks, ...recheck]);
        if (questions.length === 0) return;
        const artefactText = node.artefact
          ? Object.values(s.artefacts[node.artefact]?.fields ?? {}).join('\n')
          : '';
        const said = s.transcript
          .filter((l) => l.kind === 'player' && l.context === context)
          .map((l) => l.text);
        const scope = [artefactText, ...said].filter(Boolean).join('\n');
        if (!scope) return;
        return this.front({ op: 'check', questions, scope, source: context });
      }

      case 'closing': {
        const closing = node.closing;
        if (!closing) {
          // Nút giữa có probe: nhịp đáp của chính người đã hỏi (E4).
          if (progress.hookUsed && node.probe)
            this.front({
              op: 'narrate',
              task: 'reply',
              slot: node.probe.by,
              maxBeats: 2,
              context,
              channel: node.channel,
            });
          return;
        }
        // Chốt nút kết theo khúc mắc: gỡ thì duyệt, chưa gỡ thì hoãn, không dặn (A13).
        const concern = this.findConcern(closing.concern);
        const flags = flagSet(s);
        if (concern?.resolve_when && matches(concern.resolve_when, flags)) {
          this.addFlags([resolvedFlag(concern.id)]);
          progress.approved = true;
          this.showBeats(
            closing.approve_beats,
            context,
            node.channel,
            node.speaker,
          );
          if (closing.approve_event) this.emitEvent(closing.approve_event);
        } else {
          progress.approved = false;
          this.front({
            op: 'narrate',
            task: 'reply',
            slot: node.speaker,
            maxBeats: 2,
            context,
            guidance: closing.defer_hint,
            channel: node.channel,
          });
        }
        return;
      }

      case 'finish': {
        progress.status = 'done';
        progress.doneAt = s.points;
        s.activeNode = null;
        this.refreshConcerns();
        if (node.kind === 'end') {
          s.shiftOver = true;
          for (const p of s.promises)
            if (p.status === 'open') p.status = 'carried';
          return this.front({ op: 'review', index: 0, picked: [] });
        }
        return this.front({ op: 'due' });
      }
    }
  }

  private choose(id: string, option: string | null, elapsedMs?: number): void {
    const { s, ctx } = this;
    const node = nodeOf(ctx, id);
    const progress = s.nodes[id];
    const context = `node:${id}`;
    let reaction: Beat[];
    let sets: string[];

    if (option === null) {
      // Hết giờ = không trả lời: mức 0, không cờ (D-86).
      progress.timedOut = true;
      this.line('scene', SCENE_SPEAKER, 'Bạn chưa kịp trả lời.', context);
      reaction = node.timeout?.reaction ?? [];
      sets = node.timeout?.sets ?? [];
    } else {
      const chosen = node.options.find((o) => o.key === option);
      if (!chosen)
        throw new ShiftRuleError('TURN_INVALID', 'Không có phương án này');
      progress.choice = chosen.key;
      progress.elapsedMs = elapsedMs;
      this.playerLine(chosen.text, context, node.channel);
      reaction = chosen.reaction;
      sets = chosen.sets;
      if (chosen.promise) {
        this.addPromise({
          to: chosen.promise.to,
          channel: chosen.promise.channel,
          dueAt: chosen.promise.at
            ? pointOf(chosen.promise.at, ctx)
            : undefined,
          event: chosen.promise.event,
        });
      }
    }
    this.addFlags(sets);

    const ops: Op[] = [
      { op: 'show', beats: reaction, context, channel: node.channel },
    ];
    if (node.reaction_ai_beats > 0)
      ops.push({
        op: 'narrate',
        task: 'reaction',
        slot: node.speaker,
        maxBeats: node.reaction_ai_beats,
        context,
        channel: node.channel,
      });
    if (node.free_turn_after_reaction)
      ops.push({ op: 'await', await: { kind: 'node_reply', node: id } });
    else
      ops.push(
        { op: 'node', node: id, step: 'checks' },
        { op: 'node', node: id, step: 'finish' },
      );
    this.front(...ops);
  }

  private nodeArtefact(
    id: string,
    fields: Record<string, string>,
    ticks: string[],
  ): void {
    const { s, ctx } = this;
    const node = nodeOf(ctx, id);
    const artefact = this.artefact(node.artefact ?? '');
    const clean = this.requireFields(artefact.fields ?? [], fields);
    const validTicks = ticks.filter((t) =>
      (artefact.ticks ?? []).some((x) => x.id === t),
    );
    const previous = s.artefacts[artefact.id];
    if (previous) this.dropFlags(previous.flags);
    s.artefacts[artefact.id] = {
      fields: clean,
      ticks: validTicks,
      status: 'saved',
      savedAt: s.points,
      flags: [],
    };
    const tickFlags = validTicks
      .map((t) => artefact.tick_flags[t])
      .filter((f): f is string => Boolean(f));
    s.artefacts[artefact.id].flags.push(...tickFlags);
    this.addFlags(tickFlags);
    this.line(
      'scene',
      SCENE_SPEAKER,
      `Bạn gửi ${artefact.title}.`,
      `node:${id}`,
    );

    const ops: Op[] = [];
    if (artefact.checks.length > 0)
      ops.push({
        op: 'check',
        questions: artefact.checks,
        scope: Object.values(clean).join('\n'),
        source: `artefact:${artefact.id}`,
      });
    if (node.reaction_beats.length > 0)
      ops.push({
        op: 'show',
        beats: node.reaction_beats,
        context: `node:${id}`,
        channel: node.channel,
      });
    if (node.reaction_ai_beats > 0)
      ops.push({
        op: 'narrate',
        task: 'reaction',
        slot: node.speaker,
        maxBeats: node.reaction_ai_beats,
        context: `node:${id}`,
        channel: node.channel,
      });
    ops.push({ op: 'node', node: id, step: 'probe' });
    this.front(...ops);
  }

  /* ── Nhìn lại ca và kết ── */

  private review(index: number, picked: string[]): void {
    const { s, ctx } = this;
    const items = ctx.seed.review;
    if (picked.length >= ctx.seed.review_max || index >= items.length)
      return this.front({ op: 'end' });
    const item = items[index];
    const flags = flagSet(s);
    const promiseOpen = s.promises.some(
      (p) => p.status === 'carried' || p.status === 'open',
    );
    const applies =
      matches(item.if, flags) && (!item.when_promise_open || promiseOpen);
    if (!applies) return this.front({ op: 'review', index: index + 1, picked });
    s.reviewAsked.push(item.id);
    if (picked.length === 0)
      this.line(
        'scene',
        SCENE_SPEAKER,
        'Ca làm xong. Có người muốn hỏi lại vài chuyện trong ca.',
        'review',
      );
    this.front(
      {
        op: 'narrate',
        task: 'probe',
        slot: item.by,
        maxBeats: 2,
        context: `review:${item.id}`,
        hook: item.hook,
        channel: item.channel,
      },
      { op: 'await', await: { kind: 'probe_answer', review: item.id } },
      { op: 'review', index: index + 1, picked: [...picked, item.id] },
    );
  }

  private end(): void {
    const { s } = this;
    s.ended = true;
    s.agenda = [];
    s.conversation = null;
    this.line('system', 'system', 'Hết ca.', 'end');
  }

  /* ── AI ── */

  private nextRequestId(): string {
    return `r${this.s.nextRequest++}`;
  }

  private requestNarration(op: Extract<Op, { op: 'narrate' }>): void {
    const { s, ctx } = this;
    let maxBeats = op.maxBeats;
    let after = op.after;
    // Xin duyệt giữa pha: tối đa 1 nhịp nội dung, rồi câu duyệt của seed (A13).
    if (op.approvalFlag && s.realtime[op.approvalFlag] === 'yes') {
      const line = slotOf(ctx, op.slot).approval_line;
      if (line) {
        maxBeats = 1;
        after = [line];
      }
    }
    const requestId = this.nextRequestId();
    const channel =
      op.channel ??
      s.conversation?.channel ??
      slotOf(ctx, op.slot).default_channel;
    const resolved: Op = { ...op, maxBeats, after, channel };
    s.pending = { requestId, kind: 'narrate', op: resolved };
    this.flushShown();
    this.effects.push({
      type: 'narrate',
      request: buildNarrateRequest(s, ctx, {
        requestId,
        task: op.task,
        slot: op.slot,
        maxBeats,
        channel,
        hook: op.hook,
        guidance: op.guidance,
      }),
    });
  }

  private requestChecks(op: Extract<Op, { op: 'check' }>): void {
    const { s, ctx } = this;
    if (op.questions.length === 0 || !op.scope.trim()) return;
    const requestId = this.nextRequestId();
    s.pending = { requestId, kind: 'check', op };
    this.flushShown();
    this.effects.push({
      type: 'check',
      request: {
        requestId,
        questions: op.questions.map((q) =>
          q.extract?.fields.includes('event')
            ? { ...q, events: ctx.seed.promise_events }
            : q,
        ),
        scope: op.scope,
        source: op.source,
      },
    });
  }

  private applyChecks(
    questions: CheckQuestion[],
    source: string,
    answers: CheckAnswer[],
    channel?: Channel,
  ): void {
    const { s, ctx } = this;
    const set: string[] = [];
    for (const answer of answers) {
      const question = questions.find((q) => q.flag === answer.flag);
      if (!question) continue;
      if (source.startsWith('realtime:'))
        s.realtime[answer.flag] = answer.answer;
      // "Không rõ" tính là không (A12).
      if (answer.answer !== 'yes') continue;
      set.push(question.flag);
      const extract = question.extract;
      if (extract?.promise_to) {
        const time = answer.extracted?.time;
        const event = answer.extracted?.event;
        const knownEvent =
          event && ctx.seed.promise_events.some((e) => e.id === event)
            ? event
            : undefined;
        if (time || knownEvent)
          this.addPromise({
            to: extract.promise_to,
            channel:
              answer.extracted?.channel ??
              channel ??
              slotOf(ctx, extract.promise_to).default_channel,
            dueAt: time ? pointOf(time, ctx) : undefined,
            event: time ? undefined : knownEvent,
          });
      }
    }
    if (source.startsWith('artefact:')) {
      const saved = s.artefacts[source.slice('artefact:'.length)];
      if (saved)
        saved.flags.push(...set.filter((f) => !saved.flags.includes(f)));
    }
    this.addFlags(set);
  }

  /* ── Cờ, lời hứa, sự kiện ── */

  private addFlags(flags: string[]): void {
    const { s } = this;
    let changed = false;
    for (const flag of flags)
      if (!s.flags.includes(flag)) {
        s.flags.push(flag);
        changed = true;
      }
    if (changed) {
      s.flags.sort();
      this.refreshConcerns();
    }
  }

  /** Chỉ dùng khi tài liệu được sửa lại: cờ của bản cũ tính lại (A12). */
  private dropFlags(flags: string[]): void {
    this.s.flags = this.s.flags.filter((f) => !flags.includes(f));
  }

  /** Khúc mắc không giấu tới nút nào thì gỡ ngay khi điều kiện đạt (A9). */
  private refreshConcerns(): void {
    const { s, ctx } = this;
    const flags = flagSet(s);
    for (const slot of ctx.seed.cast)
      for (const concern of slot.concerns) {
        if (concern.hold_until || !concern.resolve_when) continue;
        const flag = resolvedFlag(concern.id);
        if (!flags.has(flag) && matches(concern.resolve_when, flags)) {
          s.flags.push(flag);
          flags.add(flag);
        }
      }
    s.flags.sort();
  }

  private findConcern(id: string) {
    for (const slot of this.ctx.seed.cast) {
      const found = slot.concerns.find((c) => c.id === id);
      if (found) return found;
    }
    return undefined;
  }

  /** Hứa mới với cùng một người thì thay lời hứa cũ (A12). */
  private addPromise(p: {
    to: string;
    channel: Channel;
    dueAt?: number;
    event?: string;
  }): void {
    const { s, ctx } = this;
    if (p.dueAt === undefined && !p.event) return;
    s.promises = s.promises.filter(
      (old) => !(old.to === p.to && old.status === 'open'),
    );
    const name = slotOf(ctx, p.to).name;
    const when =
      p.dueAt !== undefined
        ? clockAt(p.dueAt, ctx.seed.clock.start, ctx.pack.minutes_per_point)
        : (ctx.seed.promise_events.find((e) => e.id === p.event)?.text ??
          p.event ??
          '');
    s.promises.push({
      id: `p${s.promises.length + 1}`,
      to: p.to,
      channel: p.channel,
      dueAt: p.dueAt,
      event: p.event,
      madeAt: s.points,
      status: 'open',
      label: `${when}: báo ${name}`,
    });
  }

  /**
   * Giữ lời = nhắn hoặc gọi thẳng người được hứa trong cửa sổ quanh mốc:
   * hứa theo giờ từ 2 điểm trước tới 1 điểm sau; hứa theo sự kiện trong 1
   * điểm sau khi sự kiện xảy ra (A1b).
   */
  private keepPromises(slot: string): void {
    const { s } = this;
    for (const p of s.promises) {
      if (p.status !== 'open' || p.to !== slot) continue;
      if (p.dueAt !== undefined) {
        if (
          s.points >= p.dueAt - PROMISE_WINDOW.before &&
          s.points <= p.dueAt + PROMISE_WINDOW.after
        )
          p.status = 'kept';
      } else {
        const at = s.events.find((e) => e.name === p.event)?.at;
        if (
          at !== undefined &&
          s.points >= at &&
          s.points <= at + PROMISE_WINDOW.after
        )
          p.status = 'kept';
      }
    }
  }

  private emitEvent(name: string): void {
    this.s.events.push({ name, at: this.s.points });
  }

  /* ── Lời và nhịp ── */

  private line(
    kind: TranscriptLine['kind'],
    speaker: string,
    text: string,
    context: string,
    extra: Partial<Pick<TranscriptLine, 'expression' | 'channel'>> = {},
  ): void {
    const { s } = this;
    const entry: TranscriptLine = {
      seq: s.transcript.length,
      at: s.points,
      kind,
      speaker,
      text,
      context,
      ...extra,
    };
    s.transcript.push(entry);
    this.shown.push(entry);
  }

  private playerLine(text: string, context: string, channel?: Channel): void {
    this.line(
      'player',
      'player',
      text.trim(),
      context,
      channel ? { channel } : {},
    );
  }

  /** Hiện nhịp NPC. NPC nói ra một dữ kiện chưa lộ thì sổ tay tự ghi (khối M). */
  private showBeats(
    beats: Beat[],
    context: string,
    channel?: Channel,
    defaultSpeaker?: string,
  ): void {
    const { s, ctx } = this;
    for (const beat of beats) {
      const speaker = beat.speaker || defaultSpeaker || SCENE_SPEAKER;
      const isScene = speaker === SCENE_SPEAKER;
      this.line(isScene ? 'scene' : 'npc', speaker, beat.text, context, {
        expression: beat.expression,
        ...(channel ? { channel } : {}),
      });
      if (!isScene) {
        const fact = detectReveal(s, ctx, speaker, beat.text);
        if (fact) s.facts.push({ id: fact.id, at: s.points });
      }
    }
  }

  private flushShown(): void {
    if (this.shown.length === 0) return;
    this.effects.push({ type: 'show', lines: this.shown });
    this.shown = [];
  }

  /* ── Hint (D4) ── */

  private hint(): void {
    const { s, ctx } = this;
    if (s.await.kind === 'ended' || s.await.kind === 'start')
      throw new ShiftRuleError('TURN_INVALID', 'Không có gợi ý lúc này');
    // Bậc 1: nguồn chưa xem. Bậc 2: dữ kiện đã mở mà chưa dùng. Không có bậc nói đáp án.
    const unopened = ctx.seed.artefacts.find(
      (a) =>
        a.kind === 'document' &&
        !s.opened.includes(a.id) &&
        ctx.seed.actions.some((x) => x.kind === 'open' && x.target === a.id),
    );
    let tier: 1 | 2;
    let text: string;
    if (unopened) {
      tier = 1;
      text = `Bạn chưa xem ${unopened.title}.`;
    } else {
      const said = s.transcript
        .filter((l) => l.kind === 'player')
        .map((l) => l.text.toLowerCase())
        .join('\n');
      const unused = s.facts
        .map((f) => ctx.seed.facts.find((x) => x.id === f.id))
        .find(
          (f) =>
            f !== undefined &&
            f.values.length > 0 &&
            !f.values.some((v) => said.includes(v.toLowerCase())),
        );
      tier = 2;
      text = unused
        ? `Bạn đã biết: ${s.factText[unused.id] ?? unused.text}. Bạn đã dùng điều này chưa?`
        : 'Bạn đã xem đủ các nguồn. Thử đối chiếu lại những gì đã biết trong sổ tay.';
    }
    s.hints.push({ at: s.points, tier, text });
    this.line('system', 'hint', text, 'hint');
    // Không đổi lượt chờ hiện tại.
    this.s.agenda.unshift({ op: 'await', await: s.await });
  }
}
