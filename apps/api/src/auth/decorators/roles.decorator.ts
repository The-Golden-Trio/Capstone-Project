import { SetMetadata } from '@nestjs/common';
import type { UserRoleKind } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

/** Giới hạn route cho một số vai (openapi `x-roles`). Xem `RolesGuard`. */
export const Roles = (...roles: UserRoleKind[]) =>
  SetMetadata(ROLES_KEY, roles);
