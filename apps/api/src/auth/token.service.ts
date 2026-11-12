import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_DAYS,
  type Env,
} from '../config/env';
import type { UserRoleKind } from '../generated/prisma/enums';
import { Problem } from '../core/problem';
import type { AuthUser } from './decorators/current-user.decorator';

export interface AccessTokenPayload {
  sub: string;
  roles: UserRoleKind[];
}

/** Phần token của openapi `Session`; `user` do `AuthService` ghép vào. */
export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  /** Giây. */
  expiresIn: number;
}

export const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

/**
 * Cấp và xoay vòng token (CL-01 `TokenService`, ERD-01 `auth_session`).
 *
 * Mỗi phiên đăng nhập là một dòng `auth_session` giữ băm SHA-256 của refresh
 * token hiện hành, không bao giờ giữ nguyên văn. Mỗi lần refresh sinh token
 * mới và thay băm tại chỗ, nên token cũ chết ngay. Phiên hết hạn khi quá
 * `expires_at` hoặc rảnh quá `IDLE_TIMEOUT_MINUTES` (NFR-17).
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {}

  private signAccess(payload: AccessTokenPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  async verifyAccess(token: string): Promise<AuthUser> {
    const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
      secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
    });
    return { id: payload.sub, roles: payload.roles };
  }

  private async rolesOf(userId: string): Promise<UserRoleKind[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      select: { role: true },
    });
    return rows.map((r) => r.role);
  }

  private async accountOrFail(userId: string): Promise<void> {
    const account = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      select: { status: true },
    });
    if (!account || account.status === 'DELETED')
      throw new UnauthorizedException('Phiên không hợp lệ');
    if (account.status === 'DISABLED')
      throw new Problem(403, 'ACCOUNT_DISABLED', 'Tài khoản đã bị khoá');
  }

  /** Mở phiên mới (đăng ký, đăng nhập). */
  async issue(userId: string): Promise<TokenSet> {
    await this.accountOrFail(userId);
    const refreshToken = randomBytes(48).toString('base64url');
    await this.prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash: sha256(refreshToken),
        expiresAt: new Date(
          Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    });
    return {
      accessToken: await this.signAccess({
        sub: userId,
        roles: await this.rolesOf(userId),
      }),
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  /** Đổi refresh token lấy bộ mới; token vừa dùng hết hiệu lực ngay. */
  async rotate(presented: string): Promise<TokenSet & { userId: string }> {
    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash: sha256(presented) },
    });
    if (!session || session.revokedAt)
      throw new UnauthorizedException('Phiên không hợp lệ');

    const now = Date.now();
    const idleMs =
      this.config.get('IDLE_TIMEOUT_MINUTES', { infer: true }) * 60 * 1000;
    if (
      session.expiresAt.getTime() < now ||
      now - session.lastSeenAt.getTime() > idleMs
    ) {
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Phiên đã hết hạn');
    }
    await this.accountOrFail(session.userId);

    const refreshToken = randomBytes(48).toString('base64url');
    // Điều kiện trên băm cũ: hai yêu cầu refresh chạy đua thì chỉ một thắng.
    const updated = await this.prisma.authSession.updateMany({
      where: { id: session.id, refreshTokenHash: session.refreshTokenHash },
      data: { refreshTokenHash: sha256(refreshToken), lastSeenAt: new Date() },
    });
    if (updated.count !== 1)
      throw new UnauthorizedException('Phiên không hợp lệ');

    return {
      userId: session.userId,
      accessToken: await this.signAccess({
        sub: session.userId,
        roles: await this.rolesOf(session.userId),
      }),
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  /** Đăng xuất một phiên. Token lạ thì im lặng bỏ qua. */
  async revoke(presented: string, userId?: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: {
        refreshTokenHash: sha256(presented),
        revokedAt: null,
        ...(userId ? { userId } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }

  /** Thu hồi mọi phiên của một người (đổi mật khẩu, đặt lại mật khẩu). */
  async revokeAll(userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
