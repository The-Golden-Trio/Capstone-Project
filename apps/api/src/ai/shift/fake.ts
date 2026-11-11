/**
 * Bản giả của hai cổng AI: narrator và bộ phán tất định của game-core.
 * Chỉ bật khi `AI_MODE=fake`, và `loadEnv` cấm chế độ này ở production (D-92).
 */
import { shift } from '@datn/game-core';
import type { AiOutcome, ShiftChecker, ShiftNarrator } from './types';

const provenance = { adapter: 'fake', promptVersion: 'fake' } as const;

export class FakeShiftNarrator implements ShiftNarrator {
  async narrate(req: shift.NarrateRequest): Promise<AiOutcome<shift.Beat[]>> {
    return { status: 'ok', value: shift.fakeNarration(req), provenance };
  }
}

/** Cờ là mã riêng của từng seed, nên gộp cụm từ của mọi seed vào một bảng. */
const RULES: shift.FakeCheckRules = Object.assign(
  {},
  ...Object.values(shift.FAKE_RULES),
);
const EVENTS: shift.FakeEventRules = Object.assign(
  {},
  ...Object.values(shift.FAKE_EVENTS),
);

export class FakeShiftChecker implements ShiftChecker {
  async check(
    req: shift.CheckRequest,
  ): Promise<AiOutcome<shift.CheckAnswer[]>> {
    return {
      status: 'ok',
      value: shift.fakeChecks(req, RULES, EVENTS),
      provenance,
    };
  }
}
