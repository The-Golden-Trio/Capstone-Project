/**
 * Cổng AI của luồng chơi ca làm. `AssessmentModule` gọi qua hai cổng này;
 * bản thật (`live`) đi qua model gateway, bản giả (`fake`) chỉ cho dev.
 */
import type { KnownIdentity, shift } from '@datn/game-core';

export const SHIFT_NARRATOR = Symbol('SHIFT_NARRATOR');
export const SHIFT_CHECKER = Symbol('SHIFT_CHECKER');

export interface AiCallOptions {
  /** Những gì nền tảng biết về người chơi, để xoá trước khi gửi đi (DC-03). */
  identity?: KnownIdentity;
  /** Số tiền còn được tiêu trong lượt chơi (NFR-11). */
  budgetUsd?: number;
  /** Tên hiển thị của các nhân vật trong ca, là nguồn hợp lệ cho R1. */
  castNames?: readonly string[];
  /** Seed và gói cấp đã ghim của lượt chơi (AI-4 cần để dựng cảnh). */
  ctx?: shift.ShiftContext;
  contentVersion?: number;
}

export type AiOutcome<T> =
  | { status: 'ok'; value: T; provenance: shift.Provenance }
  | {
      status: 'unavailable';
      /** `no_model` · `exhausted` · `deadline` · `budget` · `blocked`. */
      reason: string;
      provenance?: shift.Provenance;
    };

export interface ShiftNarrator {
  narrate(
    req: shift.NarrateRequest,
    opts?: AiCallOptions,
  ): Promise<AiOutcome<shift.Beat[]>>;
}

export interface ShiftChecker {
  check(
    req: shift.CheckRequest,
    opts?: AiCallOptions,
  ): Promise<AiOutcome<shift.CheckAnswer[]>>;
}
