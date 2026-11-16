import { shift } from '@datn/game-core';
import { ApiError, type PlayEvent, type PlayService } from '../port';
import type { RunSummary, ShiftRun, TurnInput } from '../types';
import { context, loadProfile } from './data';
import { stateOf } from './rules';
import {
  clone,
  now,
  player,
  save,
  service,
  uid,
  wait,
  type Player,
  type SavedRun,
} from './store';
import { sampleGrade } from './grade-sample';
const listeners = new Map<string, Set<(e: PlayEvent) => void>>();
const jobs = new Map<string, Promise<void>>();
const getRun = (id: string) => {
  const p = player(),
    r = p.runs.find((r) => r.id === id);
  if (!r)
    throw new ApiError(404, 'RUN_NOT_FOUND', 'Không tìm thấy lượt chơi này.');
  return r;
};
function emit(id: string, event: PlayEvent) {
  for (const listener of listeners.get(id) ?? []) {
    try {
      listener(clone(event));
    } catch {
      /* Lỗi của một subscriber không làm mất lượt chơi. */
    }
  }
}
function apply(r: SavedRun, input: shift.ShiftInput) {
  try {
    const before = stateOf(r);
    const next = shift.step(before, input, context(r.taskId)).state;
    r.events.push(input);
    save();
    return {
      state: next,
      lines: next.transcript.slice(before.transcript.length),
    };
  } catch (e) {
    if (e instanceof shift.ShiftRuleError)
      throw new ApiError(409, e.code, e.message);
    throw e;
  }
}
function drive(p: Player, r: SavedRun): Promise<void> {
  const existing = jobs.get(r.id);
  if (existing) return existing;
  const job = (async () => {
    try {
      for (let i = 0; i < 80; i++) {
        if (!p.runs.includes(r)) return;
        const pending = shift.pendingRequest(stateOf(r), context(r.taskId));
        if (!pending) {
          r.paused = false;
          save();
          const scene = shift.sceneView(stateOf(r), context(r.taskId));
          emit(r.id, {
            type: 'done',
            turnId: r.turnId,
            scene,
            ended: scene.ended,
          });
          return;
        }
        await wait(true);
        if (!p.runs.includes(r)) return;
        const input: shift.AiInput =
          pending.type === 'narrate'
            ? {
                type: 'NARRATION',
                requestId: pending.request.requestId,
                beats: shift.fakeNarration(pending.request),
                provenance: { adapter: 'fake' },
              }
            : {
                type: 'CHECKS',
                requestId: pending.request.requestId,
                answers: shift.fakeChecks(
                  pending.request,
                  shift.FAKE_RULES[r.taskId] ?? {},
                  shift.FAKE_EVENTS[r.taskId] ?? {},
                ),
                provenance: { adapter: 'fake' },
              };
        const result = apply(r, input);
        if (result.lines.length)
          emit(r.id, { type: 'lines', turnId: r.turnId, lines: result.lines });
      }
      throw new Error('Vượt giới hạn xử lý lượt demo.');
    } catch (e) {
      r.paused = true;
      save();
      emit(r.id, {
        type: 'paused',
        turnId: r.turnId,
        reason:
          e instanceof Error
            ? e.message
            : 'Lượt demo tạm dừng; hãy thử tiếp tục.',
      });
    }
  })();
  jobs.set(r.id, job);
  void job.finally(() => jobs.delete(r.id));
  return job;
}
function playerInput(input: TurnInput): shift.PlayerInput {
  switch (input.kind) {
    case 'action':
      return {
        type: 'ACTION',
        key: input.key,
        fields: input.fields,
        ticks: input.ticks,
      };
    case 'say':
      return { type: 'SAY', text: input.text };
    case 'end_conversation':
      return { type: 'END_CONVERSATION' };
    case 'choose':
      return {
        type: 'CHOOSE',
        option: input.option,
        elapsedMs: input.elapsedMs,
      };
    case 'timeout':
      return { type: 'TIMEOUT' };
    case 'save_artefact':
      return {
        type: 'SAVE_ARTEFACT',
        artefact: input.artefact,
        fields: input.fields,
        ticks: input.ticks,
      };
    case 'confirm_end':
      return { type: 'CONFIRM_END' };
    case 'cancel_end':
      return { type: 'CANCEL_END' };
    case 'hint':
      return { type: 'HINT' };
  }
}
async function runView(r: SavedRun): Promise<ShiftRun> {
  const ctx = context(r.taskId);
  const code = ctx.seed.level_ref.slice(0, ctx.seed.level_ref.lastIndexOf('.'));
  const occupation = await loadProfile(code);
  return {
    runId: r.id,
    taskId: r.taskId,
    title: ctx.seed.title,
    goal: ctx.seed.goal,
    role: ctx.seed.player_role,
    scene: ctx.seed.situation,
    cast: ctx.seed.cast.map(({ slot, name, relation }) => ({
      slot,
      name,
      relation,
    })),
    glossary: ctx.seed.glossary,
    paused: r.paused,
    ended: stateOf(r).ended,
    occupationCode: code,
    levelNo:
      occupation.levels.find((l) => `${code}.${l.band}` === ctx.seed.level_ref)
        ?.levelNo ?? null,
    enrolmentId: r.enrolmentId,
  };
}
export async function summaryOf(p: Player, r: SavedRun): Promise<RunSummary> {
  const view = await runView(r);
  const state = stateOf(r);
  if (!state.ended)
    throw new ApiError(
      409,
      'RUN_NOT_ENDED',
      'Bạn cần khép ca trước khi xem tổng kết.',
    );
  const occupation = await loadProfile(view.occupationCode!);
  const story = shift.shiftSummary(state, context(r.taskId));
  const seed = context(r.taskId).seed;
  const prompts = [
    ...story.nodes
      .filter((n) => n.status === 'done')
      .map((n) => ({
        key: `node:${n.id}`,
        recap: `Bạn đã xử lý: ${seed.nodes.find((x) => x.id === n.id)?.core ?? n.id}`,
      })),
    ...story.actions
      .filter((a) => !a.cut)
      .map((a, i) => ({
        key: `action:${i}`,
        recap: `Bạn đã ${a.label.toLocaleLowerCase('vi-VN')}.`,
      })),
  ].slice(0, 3);
  return {
    runId: r.id,
    title: view.title,
    occupationCode: occupation.code,
    occupationName: occupation.name,
    levelNo: view.levelNo,
    enrolmentId: r.enrolmentId,
    story,
    reflection: { prompts, answered: r.reflection !== null },
    grade: sampleGrade(p, r, occupation, view.levelNo!),
  };
}
export const play: PlayService = {
  start: service(async (taskId, enrolmentId) => {
    const p = player(),
      ctx = context(taskId);
    if (enrolmentId) {
      const e = p.enrolments.find((e) => e.id === enrolmentId);
      if (!e)
        throw new ApiError(
          404,
          'ENROLMENT_NOT_FOUND',
          'Không tìm thấy lần vào nghề này.',
        );
      if (`${e.code}.${e.band}` !== ctx.seed.level_ref)
        throw new ApiError(
          409,
          'TASK_LEVEL_MISMATCH',
          'Nhiệm vụ không thuộc cấp bạn đã vào.',
        );
    }
    let r = p.runs.find(
      (r) =>
        r.taskId === taskId &&
        r.enrolmentId === enrolmentId &&
        !stateOf(r).ended,
    );
    if (!r) {
      r = {
        id: uid(),
        taskId,
        enrolmentId,
        events: [],
        notes: [],
        flags: [],
        reflection: null,
        realism: null,
        grade: null,
        at: now(),
        turnId: uid(),
        paused: false,
      };
      p.runs.push(r);
      apply(r, { type: 'START' });
    }
    if (shift.pendingRequest(stateOf(r), ctx)) void drive(p, r);
    return runView(r);
  }),
  run: service((id) => {
    const r = getRun(id);
    // Khi nạp lại trang, tiếp tục yêu cầu AI còn dang dở từ event log.
    if (!r.paused && shift.pendingRequest(stateOf(r), context(r.taskId)))
      void drive(player(), r);
    return runView(r);
  }),
  scene: service((id) => {
    const r = getRun(id);
    if (!r.paused && shift.pendingRequest(stateOf(r), context(r.taskId)))
      void drive(player(), r);
    return shift.sceneView(stateOf(r), context(r.taskId));
  }),
  transcript: service((id, after) =>
    stateOf(getRun(id)).transcript.filter(
      (l) => after === undefined || l.seq > after,
    ),
  ),
  turn: service((id, input) => {
    const p = player(),
      r = getRun(id);
    if (jobs.has(id) || shift.pendingRequest(stateOf(r), context(r.taskId)))
      throw new ApiError(409, 'TURN_PENDING', 'Lượt trước đang được xử lý.');
    if (r.paused)
      throw new ApiError(409, 'RUN_PAUSED', 'Hãy tiếp tục lượt đang tạm dừng.');
    r.turnId = uid();
    const result = apply(r, playerInput(input));
    const pending =
      shift.pendingRequest(result.state, context(r.taskId)) !== null;
    if (pending) void drive(p, r);
    const scene = pending
      ? null
      : shift.sceneView(result.state, context(r.taskId));
    return { turnId: r.turnId, lines: result.lines, scene, pending };
  }),
  resume: service((id) => {
    const r = getRun(id);
    r.paused = false;
    save();
    void drive(player(), r);
  }),
  addNote: service((id, text) => {
    if (text.trim()) {
      getRun(id).notes.push({ text: text.trim(), at: now() });
      save();
    }
  }),
  notes: service((id) => getRun(id).notes),
  flag: service((id, activityKey, reason) => {
    getRun(id).flags.push({ activityKey, reason });
    save();
  }),
  subscribe: (id, onEvent) => {
    getRun(id);
    const set = listeners.get(id) ?? new Set();
    set.add(onEvent);
    listeners.set(id, set);
    return () => {
      set.delete(onEvent);
      if (!set.size) listeners.delete(id);
    };
  },
  reflect: service(async (id, answers, realism) => {
    const r = getRun(id),
      p = player();
    const summary = await summaryOf(p, r);
    if (
      Object.entries(answers).some(
        ([key, value]) =>
          !summary.reflection.prompts.some((q) => q.key === key) ||
          ![1, 2, 3].includes(value),
      )
    )
      throw new ApiError(
        400,
        'INVALID_REFLECTION',
        'Câu trả lời tự soi không hợp lệ.',
      );
    if (
      realism !== null &&
      (!Number.isFinite(realism) || realism < 1 || realism > 5)
    )
      throw new ApiError(
        400,
        'INVALID_REALISM',
        'Mức chân thực cần từ 1 đến 5.',
      );
    r.reflection = answers;
    r.realism = realism;
    save();
  }),
  summary: service((id) => summaryOf(player(), getRun(id))),
};
