/**
 * Chỗ nối các bước chạy sau khi ca kết thúc, ví dụ chấm bằng AI-5
 * (`JudgePanelService.gradeChecklist`).
 *
 * Thêm một bước = viết một file `stages/<tên>.ts` xuất một `LabStage`, rồi
 * thêm nó vào `LAB_STAGES`. Runner không phải sửa. Bước nhận trạng thái cuối
 * của ca và môi trường gọi model (`runtime`); mọi lượt gọi gateway của bước
 * được tính vào chi phí và nhật ký như các lượt khác.
 */
import type { shift } from '@datn/game-core';
import type { KnownIdentity } from '@datn/game-core';
import type { ModelGateway } from '../../ai/gateway/model-gateway';
import type { AiSettings, JudgeSlot } from '../../ai/gateway/models';
import { judgeStage } from './stages/judge';

/** Môi trường gọi model của một lần chạy. `gateway` là `null` khi chạy bản giả. */
export interface LabRuntime {
  mode: 'fake' | 'live';
  settings: AiSettings;
  gateway: ModelGateway | null;
  /** Ghế judge của AI-5, rỗng nếu thiếu key hay panel bị tắt. */
  judgeSlots: JudgeSlot[];
}

export interface LabStageInput {
  playthrough: string;
  ctx: shift.ShiftContext;
  state: shift.ShiftState;
  summary: shift.ShiftSummary;
  identity: KnownIdentity;
  /** Số tiền còn được tiêu sau các lượt dẫn truyện và bộ phán. */
  budgetUsd: number;
  runtime: LabRuntime;
  /** `--only`: chỉ service này gọi thật ở chế độ live; không có = mọi service. */
  only: 'narrator' | 'checker' | 'judge' | undefined;
}

export interface LabStageResult {
  /** Các dòng in ra, đã định dạng. */
  lines: string[];
  /** Dữ liệu thô, ghi vào nhật ký `--out`. */
  data?: unknown;
}

export interface LabStage {
  name: string;
  run(input: LabStageInput): Promise<LabStageResult>;
}

export const LAB_STAGES: readonly LabStage[] = [judgeStage];
