/**
 * Dựng lại trạng thái từ chuỗi đầu vào đã lưu (CLAUDE.md: state = fold sự
 * kiện qua game-core). Output của model nằm sẵn trong chuỗi, nên fold không
 * gọi lại model và luôn ra đúng một kết quả.
 */
import { initialState, step, type ShiftContext } from './engine.js';
import type { ShiftInput, ShiftState } from './state.js';

export function fold(
  ctx: ShiftContext,
  inputs: readonly ShiftInput[],
): ShiftState {
  let state = initialState(ctx);
  for (const input of inputs) state = step(state, input, ctx).state;
  return state;
}
