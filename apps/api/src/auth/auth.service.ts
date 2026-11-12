import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { blankFit } from '@datn/game-core';
import { PrismaService } from '../prisma/prisma.service';
import type { Env } from '../config/env';
import { Problem } from '../core/problem';
import { NotificationService } from '../notification/notification.service';
import { ActivityLogService } from './activity-log.service';
import type { AuthUser } from './decorators/current-user.decorator';
import type {
  ConfirmPasswordResetInput,
  GoogleSignInInput,
  RegisterInput,
  RequestPasswordResetInput,
  SignInInput,
  SignOutInput,
} from './dto/auth.dto';
import { GoogleOAuthService } from './google-oauth.service';
import { loadSessionUser, toMe, type Me } from './me';
import { PasswordService } from './password.service';
import { sha256, TokenService, type TokenSet } from './token.service';

/** openapi `Session`. */
export interface Session extends TokenSet {
  user: Me;
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** CL-01 `AuthService`: các lối vào phiên đăng nhập (SD-04). */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly passwords: PasswordService,
    private readonly google: GoogleOAuthService,
    private readonly notifications: NotificationService,
    private readonly activity: ActivityLogService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private async session(userId: string, tokens?: TokenSet): Promise<Session> {
    const set = tokens ?? (await this.tokens.issue(userId));
    const user = await loadSessionUser(this.prisma, userId);
    if (!user) throw new UnauthorizedException('Không tìm thấy tài khoản');
    return { ...set, user: toMe(user) };
  }

  /* ── Đăng ký ─────────────────────────────────────────────────────── */

  async register(dto: RegisterInput): Promise<Session> {
    const clash = await this.prisma.userAccount.findFirst({
      where: {
        OR: [
          { email: dto.email },
          ...(dto.username ? [{ username: dto.username }] : []),
        ],
      },
      select: { username: true, email: true },
    });
    if (clash) {
      throw new ConflictException(
        clash.email === dto.email
          ? 'Email này đã được đăng ký'
          : 'Tên đăng nhập này đã có người dùng',
      );
    }

    const user = await this.prisma.userAccount.create({
      data: {
        email: dto.email,
        username: dto.username ?? null,
        displayName: dto.displayName,
        passwordHash: await this.passwords.hash(dto.password),
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        roles: { create: { role: 'EXPLORER' } },
        // Hồ sơ chơi tạo cùng lúc, nên không bao giờ có tài khoản không hồ sơ.
        gameProfile: { create: { quizFit: blankFit() } },
      },
    });
    await this.activity.log(user.id, 'REGISTER', {
      type: 'user_account',
      id: user.id,
    });
    return this.session(user.id);
  }

  /* ── Đăng nhập bằng mật khẩu ─────────────────────────────────────── */

  async signIn(dto: SignInInput): Promise<Session> {
    const identifier = dto.email.trim();
    const user = await this.prisma.userAccount.findFirst({
      where: {
        status: { not: 'DELETED' },
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
    });
    // Tài khoản chỉ đăng nhập bằng Google thì không có băm để so.
    const ok =
      user?.passwordHash &&
      (await this.passwords.verify(dto.password, user.passwordHash));
    if (!user || !ok)
      throw new Problem(
        401,
        'INVALID_CREDENTIALS',
        'Sai email, tên đăng nhập hoặc mật khẩu',
      );
    if (user.status === 'DISABLED')
      throw new Problem(403, 'ACCOUNT_DISABLED', 'Tài khoản đã bị khoá');

    await this.prisma.userAccount.update({
      where: { id: user.id },
      data: { lastSignInAt: new Date() },
    });
    await this.activity.log(user.id, 'SIGN_IN', {
      type: 'user_account',
      id: user.id,
    });
    return this.session(user.id);
  }

  /* ── Đăng nhập bằng Google ───────────────────────────────────────── */

  /**
   * Ba đường, theo đúng thứ tự này:
   *   1. Đã có liên kết Google → chính là người đó.
   *   2. Email đã xác minh trùng một tài khoản sẵn có → nối thêm liên kết.
   *   3. Còn lại → tạo tài khoản explorer mới.
   *
   * Bước 2 bắt buộc `email_verified`: thiếu điều kiện đó thì bất kỳ ai tạo
   * được một tài khoản Google mang email của người khác cũng chiếm được
   * tài khoản của họ.
   */
  async signInWithGoogle(dto: GoogleSignInInput): Promise<Session> {
    const profile = await this.google.verify(dto.credential);

    const linked = await this.prisma.googleIdentity.findUnique({
      where: { googleSub: profile.providerAccountId },
    });
    let userId = linked?.userId;

    if (!userId && profile.emailVerified) {
      const byEmail = await this.prisma.userAccount.findUnique({
        where: { email: profile.email },
        include: { googleIdentity: true },
      });
      if (byEmail && !byEmail.googleIdentity) {
        await this.prisma.googleIdentity.create({
          data: { userId: byEmail.id, googleSub: profile.providerAccountId },
        });
        userId = byEmail.id;
      }
    }

    if (!userId) {
      const created = await this.prisma.userAccount.create({
        data: {
          username: await this.uniqueUsernameFrom(profile.email),
          email: profile.email,
          displayName: (profile.name ?? profile.email.split('@')[0]).slice(
            0,
            80,
          ),
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          roles: { create: { role: 'EXPLORER' } },
          gameProfile: { create: { quizFit: blankFit() } },
          googleIdentity: {
            create: { googleSub: profile.providerAccountId },
          },
        },
      });
      userId = created.id;
    }

    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { lastSignInAt: new Date() },
    });
    await this.activity.log(userId, 'SIGN_IN_GOOGLE', {
      type: 'user_account',
      id: userId,
    });
    return this.session(userId);
  }

  /** Lấy phần trước @ làm tên đăng nhập, thêm hậu tố nếu đã có người dùng. */
  private async uniqueUsernameFrom(email: string): Promise<string> {
    const base =
      email
        .split('@')[0]
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 20) || 'nguoidung';

    for (let attempt = 0; attempt < 50; attempt++) {
      const candidate = attempt === 0 ? base : `${base}${attempt}`;
      const taken = await this.prisma.userAccount.findUnique({
        where: { username: candidate },
        select: { id: true },
      });
      if (!taken) return candidate;
    }
    return `${base}${Date.now().toString(36)}`.slice(0, 32);
  }

  /* ── Phiên ───────────────────────────────────────────────────────── */

  async refresh(refreshToken: string): Promise<Session> {
    const { userId, ...set } = await this.tokens.rotate(refreshToken);
    return this.session(userId, set);
  }

  async signOut(user: AuthUser, dto: SignOutInput): Promise<void> {
    if (dto.refreshToken) await this.tokens.revoke(dto.refreshToken, user.id);
    else await this.tokens.revokeAll(user.id);
    await this.activity.log(user.id, 'SIGN_OUT');
  }

  /* ── Đặt lại mật khẩu ────────────────────────────────────────────── */

  /** Luôn trả như nhau dù email có tồn tại hay không (openapi: luôn 202). */
  async requestPasswordReset(dto: RequestPasswordResetInput): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({
      where: { email: dto.email },
      include: { roles: true },
    });
    if (!user || user.status !== 'ACTIVE') return;

    const token = randomBytes(32).toString('base64url');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });
    // Màn đặt lại mật khẩu hiện chỉ có ở staff app (T01). Explorer chưa có
    // màn tương ứng ở web; link vẫn mở được trang của staff app.
    const origin = this.config.get('STAFF_ORIGIN', { infer: true });
    const link = `${origin}/staff/reset-password?token=${encodeURIComponent(token)}`;
    await this.notifications.notify(
      user.id,
      'PASSWORD_RESET',
      {},
      { channels: ['EMAIL'], secret: { link } },
    );
    await this.activity.log(user.id, 'PASSWORD_RESET_REQUESTED');
  }

  async confirmPasswordReset(dto: ConfirmPasswordResetInput): Promise<void> {
    const row = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: sha256(dto.token) },
    });
    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now())
      throw new Problem(
        410,
        'RESET_TOKEN_EXPIRED',
        'Link đặt lại mật khẩu đã hết hạn hoặc đã dùng',
      );
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.userAccount.update({
        where: { id: row.userId },
        data: { passwordHash: await this.passwords.hash(dto.newPassword) },
      }),
    ]);
    await this.tokens.revokeAll(row.userId);
    await this.activity.log(row.userId, 'PASSWORD_RESET');
  }
}
