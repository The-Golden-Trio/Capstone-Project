/**
 * Kiểu dữ liệu của AI-5 theo checklist có/không (luồng ca làm).
 *
 * Luật chấm (đoạn bằng chứng, kiểm câu trích, quy ra mức, cờ) nằm ở
 * `shift/grading` của game-core; ở đây chỉ có phần gọi model và gộp panel.
 */
import type { KnownIdentity, shift } from '@datn/game-core';
import type { Deidentified } from '@datn/game-core';
import type { Cost } from '../gateway/cost';
import type { CombineMethod } from './judge-combine';
import type { JudgeCallRecord } from './judge-panel.service';
import type { OneJudgeDownPolicy } from './judge.profile';
import type { JudgeScore } from './judge.types';

export interface ChecklistGradeInput {
  /** Mã job chấm, để nối bản ghi với job ở worker. Không gửi ra ngoài. */
  jobId: string;
  /** Đoạn bằng chứng từ `shift.evidenceSegments`; service tự khử định danh. */
  segments: shift.EvidenceSegment[];
  observes: shift.ObserveItem[];
  identity?: KnownIdentity;
  /** Số tiền còn được tiêu trong phiên (NFR-11). Không truyền thì không chặn. */
  budgetUsd?: number;
  /** Một ghế hỏng thì chờ hay gộp hai judge (D-132). Mặc định theo `JUDGE_PROFILE`. */
  whenOneJudgeDown?: OneJudgeDownPolicy;
  contentVersion?: number;
}

/** Một lần gọi model: như `JudgeCallRecord`, thêm số câu "có" bị bỏ vì câu trích sai. */
export interface ChecklistCallRecord extends JudgeCallRecord {
  quotesRejected: number;
}

/** Kết quả một ghế: câu trả lời đã qua kiểm câu trích. */
export interface ChecklistSlotOutcome {
  slot: number;
  family: string;
  status: 'ok' | 'failed' | 'blocked';
  modelKey: string | null;
  attempts: number;
  checked: shift.CheckedOutput | null;
  error: string | null;
}

/** Mức của một (mục con, đoạn) sau khi gộp panel. */
export interface ChecklistItemGrade {
  sub: string;
  segment: string;
  /** `null`: không xét (từ nửa số judge trở lên nói không xét). */
  level: JudgeScore | null;
  /** `timed_out`: hết giờ ở câu đếm giờ, mức 0 không qua judge (D-86). */
  fixed?: 'timed_out';
  method: CombineMethod | 'fixed';
  highDisagreement: boolean;
  /** Mức của từng judge đã chấm được, theo thứ tự ghế, sau luật ép về 0. */
  judgeLevels: Array<JudgeScore | null>;
  /** Có judge nào bị ép về 0 bởi cờ nặng ở cặp này. */
  forcedZero: boolean;
}

export type ChecklistPanelResult = {
  jobId: string;
  slots: ChecklistSlotOutcome[];
  records: ChecklistCallRecord[];
  cost: Cost;
  redactions: Deidentified['redactions'];
  /** Đoạn đã khử định danh: câu trích được so với chữ này. */
  segmentsSent: shift.EvidenceSegment[];
} & (
  | {
      status: 'graded';
      /** `none`: không có đoạn nào cần judge (mọi đoạn hết giờ), không gọi model. */
      method: CombineMethod | 'none';
      panelSize: number;
      items: ChecklistItemGrade[];
      /** Mức mục con trong màn = trung bình các đoạn, 0–2. */
      subs: shift.SubResult[];
      /** Cờ đã qua đa số, đã giao nhóm nhận phạt. */
      flags: shift.FlagInstance[];
      /**
       * Độ tin câu trích của từng ghế chấm được, theo thứ tự các ghế `ok`
       * trong `slots`. `unreliable` chỉ là cảnh báo, mức giữ nguyên (D-145).
       */
      quoteChecks: shift.QuoteReliability[];
    }
  /** Không đủ judge để chấm theo chính sách; lời người chơi được giữ, chấm lại sau (NFR-04). */
  | {
      status: 'pending';
      panelSize: number;
      reason: 'one_judge_down' | 'too_few_judges';
    }
  | { status: 'unavailable'; reason: 'no_model' | 'budget' }
);
