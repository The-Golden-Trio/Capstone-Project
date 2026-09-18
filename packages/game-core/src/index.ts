/**
 * `@datn/game-core` — bộ dữ liệu nghề nghiệp và toàn bộ luật chơi.
 *
 * Thuần TypeScript: không React, không DOM, không truy cập mạng hay đĩa.
 * Cả `apps/web` lẫn `apps/api` đều nhập từ đây, nên luật chơi chỉ tồn tại
 * một bản — máy khách chơi để phản hồi tức thì, máy chủ chạy lại đúng luật
 * đó để quyết định điểm kỹ năng.
 */

/* ── Dữ liệu ── */
export * from './data/schema.js';
export {
  createGameIndex,
  type GameIndex,
  type ScenarioEntry,
  type ConstellationEdge,
  type EdgeKind,
} from './data/indexes.js';

/* ── Luật chơi ── */
export * from './domain/bands.js';
export * from './domain/sideQuests.js';
export * from './domain/sideQuestGrader.js';
export * from './domain/fit.js';
export * from './domain/format.js';
export * from './domain/followups.js';
export * from './domain/rng.js';
export * from './domain/scenarioEngine.js';

/* ── Chấm điểm ── */
export * from './domain/grading/types.js';
export * from './domain/grading/structuredGrading.js';
export { keywordGrader, defaultTextGrader } from './domain/grading/keywordGrader.js';
