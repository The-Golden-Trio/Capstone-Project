import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { blankFit } from '@datn/game-core';
import { PrismaService } from '../prisma/prisma.service';
import { consentStatus, type ConsentStatus } from '../consent/consent';
import type { AuthUser } from './decorators/current-user.decorator';
import type { GoogleSignInDto, RegisterDto } from './dto/auth.dto';
import { GoogleService } from './google.service';

const GOOGLE_PROVIDER = 'google';

/** Người dùng như web app nhìn thấy: không có băm mật khẩu, có trạng thái đồng ý. */
export interface SessionUser {
  id: string;
  username: string;
  email: string | null;
  displayName: string;
  role: string;
  dateOfBirth: string | null;
  consentStatus: ConsentStatus;
  /** Đã đặt mật khẩu chưa — quyết định màn Tài khoản hiện gì. */
  hasPassword: boolean;
  linkedProviders: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly google: GoogleService,
  ) {}

  /* ── Đọc ─────────────────────────────────────────────────────────── */

  async getSessionUser(userId: string): Promise<SessionUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { consent: true, oauthAccounts: true },
    });
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      dateOfBirth: user.dateOfBirth
        ? user.dateOfBirth.toISOString().slice(0, 10)
        : null,
      consentStatus: consentStatus(user.dateOfBirth, Boolean(user.consent)),
      hasPassword: Boolean(user.passwordHash),
      linkedProviders: user.oauthAccounts.map((a) => a.provider),
    };
  }

  /* ── Đăng ký bằng mật khẩu ───────────────────────────────────────── */

  async register(dto: RegisterDto): Promise<AuthUser> {
    const clash = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.email }],
      },
      select: { username: true, email: true },
    });
    if (clash) {
      throw new ConflictException(
        clash.username === dto.username
          ? 'Tên đăng nhập này đã có người dùng'
          : 'Email này đã được đăng ký',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        displayName: dto.displayName,
        passwordHash: await argon2.hash(dto.password),
        dateOfBirth: new Date(dto.dateOfBirth),
        // Hồ sơ chơi tạo cùng lúc, nên không bao giờ có tài khoản không hồ sơ.
        gameProfile: { create: { quizFit: blankFit() } },
      },
    });

    return { id: user.id, username: user.username, role: user.role };
  }

  /* ── Đăng nhập bằng mật khẩu ─────────────────────────────────────── */

  async validateCredentials(
    identifier: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier.toLowerCase() },
        ],
      },
    });

    // Tài khoản chỉ đăng nhập bằng Google thì không có băm để so.
    if (!user?.passwordHash) return null;

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) return null;

    return { id: user.id, username: user.username, role: user.role };
  }

  /* ── Đăng nhập bằng Google ───────────────────────────────────────── */

  /**
   * Ba đường, theo đúng thứ tự này:
   *   1. Đã có liên kết Google → chính là người đó.
   *   2. Email đã xác minh trùng một tài khoản sẵn có → nối thêm liên kết.
   *   3. Còn lại → tạo tài khoản mới.
   *
   * Bước 2 bắt buộc `email_verified`: thiếu điều kiện đó thì bất kỳ ai tạo
   * được một tài khoản Google mang email của người khác cũng chiếm được
   * tài khoản của họ.
   */
  async signInWithGoogle(dto: GoogleSignInDto): Promise<AuthUser> {
    const identity = await this.google.verify(dto.credential);

    const linked = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: GOOGLE_PROVIDER,
          providerAccountId: identity.providerAccountId,
        },
      },
      include: { user: true },
    });
    if (linked) {
      return {
        id: linked.user.id,
        username: linked.user.username,
        role: linked.user.role,
      };
    }

    if (identity.emailVerified) {
      const byEmail = await this.prisma.user.findUnique({
        where: { email: identity.email },
      });
      if (byEmail) {
        await this.prisma.oAuthAccount.create({
          data: {
            userId: byEmail.id,
            provider: GOOGLE_PROVIDER,
            providerAccountId: identity.providerAccountId,
          },
        });
        return {
          id: byEmail.id,
          username: byEmail.username,
          role: byEmail.role,
        };
      }
    }

    const created = await this.prisma.user.create({
      data: {
        username: await this.uniqueUsernameFrom(identity.email),
        email: identity.email,
        displayName: identity.name ?? identity.email.split('@')[0],
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gameProfile: { create: { quizFit: blankFit() } },
        oauthAccounts: {
          create: {
            provider: GOOGLE_PROVIDER,
            providerAccountId: identity.providerAccountId,
          },
        },
      },
    });

    return {
      id: created.id,
      username: created.username,
      role: created.role,
    };
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
      const taken = await this.prisma.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      });
      if (!taken) return candidate;
    }
    return `${base}${Date.now().toString(36)}`;
  }

  /* ── Đồng ý của người giám hộ ────────────────────────────────────── */

  async recordConsent(
    userId: string,
    guardianName: string,
    guardianEmail: string,
  ): Promise<void> {
    await this.prisma.parentalConsent.upsert({
      where: { userId },
      create: { userId, guardianName, guardianEmail },
      update: { guardianName, guardianEmail, consentedAt: new Date() },
    });
  }

  /* ── Quản lý tài khoản ───────────────────────────────────────────── */

  async updateAccount(
    userId: string,
    data: { displayName?: string; email?: string },
  ): Promise<void> {
    if (data.email) {
      const taken = await this.prisma.user.findFirst({
        where: { email: data.email, NOT: { id: userId } },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Email này đã được đăng ký');
    }
    await this.prisma.user.update({ where: { id: userId }, data });
  }

  async changePassword(
    userId: string,
    currentPassword: string | undefined,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    // Đã có mật khẩu thì phải chứng minh biết mật khẩu cũ. Chưa có (tài khoản
    // Google) thì đây là lần đặt đầu tiên, phiên đăng nhập là đủ.
    if (user.passwordHash) {
      const ok =
        currentPassword !== undefined &&
        (await argon2.verify(user.passwordHash, currentPassword));
      if (!ok) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await argon2.hash(newPassword) },
    });
  }

  /** Gỡ liên kết Google, nhưng không để ai tự khoá mình ra ngoài. */
  async unlinkProvider(userId: string, provider: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { oauthAccounts: true },
    });
    if (!user) throw new UnauthorizedException();

    const remaining = user.oauthAccounts.filter((a) => a.provider !== provider);
    if (!user.passwordHash && remaining.length === 0) {
      throw new ConflictException(
        'Đây là cách đăng nhập duy nhất của bạn. Hãy đặt mật khẩu trước khi gỡ.',
      );
    }

    await this.prisma.oAuthAccount.deleteMany({ where: { userId, provider } });
  }

  async deleteAccount(userId: string): Promise<void> {
    // Mọi bảng liên quan đều onDelete: Cascade, nên một lệnh là sạch.
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
