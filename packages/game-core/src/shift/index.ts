/**
 * Ca làm (seed v2, Game Design W45): khuôn seed, engine, giao diện, tổng kết.
 * Nhập qua namespace: `import { shift } from '@datn/game-core'`.
 */
export * from './schema.js';
export * from './state.js';
export {
  initialState,
  step,
  pendingRequest,
  ShiftRuleError,
  TURNS_PER_POINT,
  PROMISE_WINDOW,
  type StepResult,
  type ShiftErrorCode,
} from './engine.js';
export {
  buildNarrateRequest,
  actionAvailability,
  type ShiftContext,
} from './context.js';
export { fold } from './fold.js';
export { sceneView, type SceneView, type ArtefactForm } from './view.js';
export { shiftSummary, type ShiftSummary } from './summary.js';
export { lintSeed } from './lint.js';
export { matches, resolvedFlag } from './flags.js';
export { clockAt, pointAt, toMinutes, fromMinutes } from './time.js';
export {
  fakeNarration,
  fakeChecks,
  type FakeCheckRules,
  type FakeEventRules,
  type FakeScript,
} from './testing/fakes.js';
export { FAKE_RULES, FAKE_EVENTS, FAKE_SCRIPTS } from './testing/fakeRules.js';

/* ── Chấm theo checklist có/không (D-116; AI-5 trả lời câu hỏi, code quy ra mức) ── */
export * from './grading/library.js';
export * from './grading/observe.js';
export * from './grading/evidence.js';
export * from './grading/scoring.js';
