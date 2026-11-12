import type { PrismaService } from '../prisma/prisma.service';
import { consentStatus, type ConsentStatus } from '../consent/consent';
import type { UserRoleKind } from '../generated/prisma/enums';

/**
 * openapi `Me` + `username` (07 A22). `points` chưa tính ở đây: sổ điểm của
 * explorer vẫn là bảng prototype.
 */
export interface Me {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string;
  roles: UserRoleKind[];
  hasGoogle: boolean;
  quizDone: boolean;
}

/**
 * Hình dạng người dùng của route prototype `GET /api/auth/me` mà màn Tài
 * khoản của explorer đang đọc (07 A25): như `Me` cộng trạng thái đồng ý.
 */
export interface SessionUser extends Me {
  dateOfBirth: string | null;
  consentStatus: ConsentStatus;
  hasPassword: boolean;
  linkedProviders: string[];
}

export async function loadSessionUser(
  prisma: PrismaService,
  userId: string,
): Promise<SessionUser | null> {
  const user = await prisma.userAccount.findUnique({
    where: { id: userId },
    include: {
      roles: { select: { role: true } },
      googleIdentity: { select: { id: true } },
      gameProfile: { select: { quizDone: true } },
      consent: { select: { id: true } },
    },
  });
  if (!user || user.status === 'DELETED') return null;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName:
      user.displayName ?? user.username ?? user.email?.split('@')[0] ?? '',
    roles: user.roles.map((r) => r.role),
    hasGoogle: Boolean(user.googleIdentity),
    quizDone: user.gameProfile?.quizDone ?? false,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    consentStatus: consentStatus(user.dateOfBirth, Boolean(user.consent)),
    hasPassword: Boolean(user.passwordHash),
    linkedProviders: user.googleIdentity ? ['google'] : [],
  };
}

export function toMe(user: SessionUser): Me {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    roles: user.roles,
    hasGoogle: user.hasGoogle,
    quizDone: user.quizDone,
  };
}
