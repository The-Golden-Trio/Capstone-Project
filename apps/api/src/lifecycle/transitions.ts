/**
 * SM-01 Scenario lifecycle dưới dạng bảng (CL-05 `LifecycleAction`). Hàm thuần,
 * không phụ thuộc framework, để test được mọi cạnh của sơ đồ.
 *
 * Vòng Draft → Draft (sinh, sửa nội dung, nộp mà kiểm trượt) không có action
 * riêng: chỉ cần trạng thái là DRAFT, và không ghi `lifecycle_log` vì trạng
 * thái không đổi (07 A22+). Vòng Published → Published (kiểm định lại) thuộc P6.
 */
import type { ScenarioStatus, UserRoleKind } from '../generated/prisma/enums';

export const LIFECYCLE_ACTIONS = [
  'OPEN',
  'SUBMIT',
  'START_REVIEW',
  'REQUEST_CHANGES',
  'REJECT',
  'APPROVE',
  'BUILD_DRAFT',
  'REPORT_DISPLAY_ISSUE',
  'REPORT_CONTENT_ISSUE',
  'PASS_PLAYTEST',
  'PUBLISH',
  'DELETE',
] as const;
export type LifecycleAction = (typeof LIFECYCLE_ACTIONS)[number];

export interface Transition {
  /** `null` = chưa có scenario (OPEN). */
  from: ScenarioStatus | null;
  to: ScenarioStatus;
  role: UserRoleKind;
}

/** Cạnh của SM-01; vai lấy từ bảng chuyển trạng thái ở report §5.1 và CL-05. */
export const TRANSITIONS: Record<LifecycleAction, Transition> = {
  OPEN: { from: null, to: 'DRAFT', role: 'CONTENT_ADMIN' },
  SUBMIT: { from: 'DRAFT', to: 'SUBMITTED', role: 'DOMAIN_EXPERT' },
  START_REVIEW: { from: 'SUBMITTED', to: 'IN_REVIEW', role: 'DOMAIN_EXPERT' },
  REQUEST_CHANGES: { from: 'IN_REVIEW', to: 'DRAFT', role: 'DOMAIN_EXPERT' },
  REJECT: { from: 'IN_REVIEW', to: 'RETIRED', role: 'DOMAIN_EXPERT' },
  APPROVE: { from: 'IN_REVIEW', to: 'APPROVED', role: 'DOMAIN_EXPERT' },
  BUILD_DRAFT: { from: 'APPROVED', to: 'IN_PLAYTEST', role: 'CONTENT_ADMIN' },
  REPORT_DISPLAY_ISSUE: {
    from: 'IN_PLAYTEST',
    to: 'APPROVED',
    role: 'DOMAIN_EXPERT',
  },
  REPORT_CONTENT_ISSUE: {
    from: 'IN_PLAYTEST',
    to: 'DRAFT',
    role: 'DOMAIN_EXPERT',
  },
  PASS_PLAYTEST: { from: 'IN_PLAYTEST', to: 'READY', role: 'DOMAIN_EXPERT' },
  PUBLISH: { from: 'READY', to: 'PUBLISHED', role: 'CONTENT_ADMIN' },
  DELETE: { from: 'PUBLISHED', to: 'RETIRED', role: 'CONTENT_ADMIN' },
};

/** Trạng thái đích của `action` từ `status`, hoặc `null` nếu SM-01 không có cạnh đó. */
export function nextStatus(
  status: ScenarioStatus | null,
  action: LifecycleAction,
): ScenarioStatus | null {
  const t = TRANSITIONS[action];
  return t.from === status ? t.to : null;
}

/** Các action một vai có thể làm ở trạng thái này (chưa xét tác giả / người duyệt). */
export function allowedActions(
  status: ScenarioStatus,
  roles: readonly UserRoleKind[],
): LifecycleAction[] {
  return LIFECYCLE_ACTIONS.filter((a) => {
    const t = TRANSITIONS[a];
    return t.from === status && roles.includes(t.role);
  });
}
