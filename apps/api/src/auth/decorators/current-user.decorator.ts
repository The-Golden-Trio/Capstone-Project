import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UserRoleKind } from '../../generated/prisma/enums';

/** Người dùng đã xác thực, do `JwtStrategy.validate` gắn vào request. */
export interface AuthUser {
  id: string;
  /** ERD-01 `user_role`: một người có thể giữ nhiều vai. */
  roles: UserRoleKind[];
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
