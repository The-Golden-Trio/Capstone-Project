import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

/** Giới hạn route cho một số vai trò. Xem `RolesGuard`. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
