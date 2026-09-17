import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Role } from '../../generated/prisma/enums';

/** Người dùng đã xác thực, do `JwtStrategy.validate` gắn vào request. */
export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
