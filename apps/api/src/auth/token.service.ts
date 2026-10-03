import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL_DAYS,
  type Env,
} from '../config/env';
import type { Role } from '../generated/prisma/enums';

export interface AccessTokenPayload {
  sub: string;
  username: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

/**
 * Cấp và xoay vòng token.
 *
 * Refresh token được lưu dạng băm SHA-256, không bao giờ lưu nguyên văn: đọc
 * được cả bảng cũng không mạo danh được ai. Mỗi lần dùng là sinh token mới và
 * thu hồi token cũ.
 *
 * Phát hiện dùng lại: nếu một token đã thu hồi lại được đem ra dùng, chỉ có
 * hai khả năng — token bị đánh cắp, hoặc máy khách chạy đua với chính nó.
 * Cả hai đều xử lý giống nhau: thu hồi toàn bộ token của người đó, buộc đăng
 * nhập lại. Thà phiền một lần còn hơn để phiên bị chiếm.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private signAccessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwt.verifyAsync<AccessTokenPayload>(token, {
      secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  /** Cấp cặp token mới cho một phiên mới (đăng ký, đăng nhập). */
  async issuePair(
    user: { id: string; username: string; role: Role },
    userAgent?: string,
  ): Promise<TokenPair> {
    const accessToken = await this.signAccessToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshToken = randomBytes(48).toString('base64url');
    const refreshExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hash(refreshToken),
        expiresAt: refreshExpiresAt,
        userAgent: userAgent?.slice(0, 255),
      },
    });

    return { accessToken, refreshToken, refreshExpiresAt };
  }

  /**
   * Đổi một refresh token lấy cặp mới, thu hồi token vừa dùng.
   *
   * Ném `UnauthorizedException` nếu token không tồn tại, đã hết hạn, hoặc đã
   * bị thu hồi — trường hợp cuối kéo theo thu hồi cả chuỗi.
   */
  async rotate(presented: string, userAgent?: string): Promise<TokenPair> {
    const tokenHash = this.hash(presented);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing) throw new UnauthorizedException('Phiên không hợp lệ');

    if (existing.revokedAt) {
      // Token đã thu hồi mà vẫn được dùng: coi như đã lộ.
      await this.revokeAllForUser(existing.userId);
      throw new UnauthorizedException(
        'Phiên đã bị thu hồi. Vui lòng đăng nhập lại.',
      );
    }

    if (existing.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Phiên đã hết hạn');
    }

    const next = await this.issuePair(existing.user, userAgent);

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: {
        revokedAt: new Date(),
        replacedById: this.hash(next.refreshToken),
      },
    });

    return next;
  }

  /** Đăng xuất: thu hồi đúng token đang dùng. Token hỏng thì im lặng bỏ qua. */
  async revoke(presented: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hash(presented), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Thu hồi mọi phiên của một người — dùng khi nghi token bị lộ. */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
