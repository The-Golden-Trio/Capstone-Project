import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRoleKind } from '../../generated/prisma/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthUser } from '../decorators/current-user.decorator';

/** Cho qua khi người dùng giữ ít nhất một vai mà route yêu cầu (CL-01). */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRoleKind[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!user || !required.some((role) => user.roles.includes(role))) {
      throw new ForbiddenException('Tài khoản của bạn không có quyền này');
    }
    return true;
  }
}
