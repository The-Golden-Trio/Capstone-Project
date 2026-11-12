import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Problem } from '../../core/problem';
import type { StaffRoleKind, UserRoleKind } from '../../generated/prisma/enums';
import {
  AccessPolicyService,
  type ResourceRef,
} from '../access-policy.service';
import type { AuthUser } from '../decorators/current-user.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

const STAFF_ROLES: StaffRoleKind[] = ['CONTENT_ADMIN', 'DOMAIN_EXPERT'];

/**
 * CL-01 `OccupationAccessGuard`, gắn trên mọi controller `/staff`: tìm nghề
 * của tài nguyên trong route (`occupationId`, `scenarioId`, `buildId`,
 * `assignmentId`, hoặc query `occupationId`) và đòi người gọi đang được giao
 * nghề đó với một vai mà route cho phép (FR-41). Không có thì 403
 * `NOT_ASSIGNED`. Route không trỏ tới nghề nào (danh sách, asset…) chỉ xét
 * vai; service tự lọc theo nghề được giao.
 */
@Injectable()
export class OccupationAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: AccessPolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const user = req.user;
    if (!user) throw new Problem(401, 'UNAUTHENTICATED', 'Chưa đăng nhập');

    const ref = refOf(req);
    if (!ref) return true;

    const occupationId = await this.access.occupationOf(ref);
    if (!occupationId)
      throw new Problem(404, 'NOT_FOUND', 'Không tìm thấy tài nguyên');

    const routeRoles =
      this.reflector.getAllAndOverride<UserRoleKind[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? STAFF_ROLES;
    const roles = STAFF_ROLES.filter(
      (r) => routeRoles.includes(r) && user.roles.includes(r),
    );
    if (
      !roles.length ||
      !(await this.access.isAssigned(user.id, occupationId, roles))
    )
      throw new Problem(403, 'NOT_ASSIGNED', 'Bạn không được giao nghề này');
    return true;
  }
}

function refOf(req: Request): ResourceRef | null {
  const p = (req.params ?? {}) as Record<string, string | undefined>;
  if (p['scenarioId']) return { kind: 'scenario', id: p['scenarioId'] };
  if (p['buildId']) return { kind: 'build', id: p['buildId'] };
  if (p['assignmentId']) return { kind: 'assignment', id: p['assignmentId'] };
  if (p['occupationId']) return { kind: 'occupation', id: p['occupationId'] };
  const q = req.query?.['occupationId'];
  if (typeof q === 'string' && q) return { kind: 'occupation', id: q };
  return null;
}
