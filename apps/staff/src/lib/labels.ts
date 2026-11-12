/** Nhãn tiếng Việt cho các mã của hợp đồng API. */
import type { LifecycleAction, ScenarioStatus, TaskType } from '../api/types';

export const STATUS_LABEL: Record<ScenarioStatus, string> = {
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Chờ duyệt',
  IN_REVIEW: 'Đang duyệt',
  APPROVED: 'Đã duyệt',
  IN_PLAYTEST: 'Đang chơi thử',
  READY: 'Sẵn sàng',
  PUBLISHED: 'Đã xuất bản',
  RETIRED: 'Đã gỡ',
};

export const STATUS_TONE: Record<
  ScenarioStatus,
  'neutral' | 'brand' | 'warn' | 'good' | 'bad'
> = {
  DRAFT: 'neutral',
  SUBMITTED: 'warn',
  IN_REVIEW: 'warn',
  APPROVED: 'good',
  IN_PLAYTEST: 'brand',
  READY: 'good',
  PUBLISHED: 'good',
  RETIRED: 'bad',
};

export const ACTION_LABEL: Record<LifecycleAction, string> = {
  OPEN: 'Mở scenario',
  SUBMIT: 'Nộp duyệt',
  START_REVIEW: 'Bắt đầu duyệt',
  REQUEST_CHANGES: 'Yêu cầu sửa',
  REJECT: 'Từ chối',
  APPROVE: 'Duyệt',
  BUILD_DRAFT: 'Dựng bản nháp',
  REPORT_DISPLAY_ISSUE: 'Báo lỗi trình bày',
  REPORT_CONTENT_ISSUE: 'Báo lỗi nội dung',
  PASS_PLAYTEST: 'Qua chơi thử',
  PUBLISH: 'Xuất bản',
  DELETE: 'Gỡ',
};

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  FREE_TEXT: 'Tự luận',
  CHOICE: 'Chọn một',
  ORDERING: 'Sắp thứ tự',
  PRIORITIZING: 'Chọn ưu tiên',
};

export const ARCHETYPE_LABEL: Record<string, string> = {
  S_EXEC: 'Thực thi task chuẩn',
  S_AMBIG: 'Yêu cầu mơ hồ',
  S_INCIDENT: 'Sự cố, áp lực thời gian',
  S_CONFLICT: 'Xung đột ưu tiên / con người',
  S_REVIEW: 'Review, mentor người khác',
  S_DECISION: 'Đánh đổi kiến trúc, ngân sách',
};

export const COMPANY_LABEL: Record<string, string> = {
  OUTSOURCING: 'Outsourcing',
  PRODUCT_LOCAL: 'Công ty sản phẩm trong nước',
  ENTERPRISE_BANK: 'Doanh nghiệp lớn / ngân hàng',
  BIGTECH_FDI: 'Big tech / FDI',
};

export const ENDING_LABEL: Record<string, string> = {
  GOOD: 'Tốt',
  PARTIAL: 'Một phần',
  BAD: 'Không tốt',
  SECRET: 'Bí mật',
};

export const NOTIFICATION_LABEL: Record<string, string> = {
  SCENARIO_ASSIGNED: 'Bạn được giao viết scenario',
  REVIEW_ASSIGNED: 'Bạn được giao duyệt scenario',
  SCENARIO_SUBMITTED: 'Có scenario chờ bạn duyệt',
  REVIEW_DECIDED: 'Có kết quả duyệt scenario',
  REVIEW_DUE_SOON: 'Sắp tới hạn duyệt',
  REVIEW_OVERDUE: 'Quá hạn duyệt',
  DRAFT_READY: 'Bản game nháp đã sẵn sàng',
};

export const formatDateTime = (iso: string | null | undefined): string =>
  iso
    ? new Date(iso).toLocaleString('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '—';
