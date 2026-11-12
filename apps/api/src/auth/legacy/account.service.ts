import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../password.service';
import { TokenService } from '../token.service';

/**
 * Các thao tác tài khoản của màn Tài khoản (explorer prototype). Hợp đồng đích
 * là `PATCH/DELETE /me` của `UserModule` (CL-01); giữ route cũ tới khi web
 * chuyển hẳn (07 A25).
 */
@Injectable()
export class LegacyAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

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

  async updateAccount(
    userId: string,
    data: { displayName?: string; email?: string },
  ): Promise<void> {
    if (data.email) {
      const taken = await this.prisma.userAccount.findFirst({
        where: { email: data.email, NOT: { id: userId } },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Email này đã được đăng ký');
    }
    await this.prisma.userAccount.update({ where: { id: userId }, data });
  }

  async changePassword(
    userId: string,
    currentPassword: string | undefined,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();

    // Đã có mật khẩu thì phải chứng minh biết mật khẩu cũ. Chưa có (tài khoản
    // Google) thì đây là lần đặt đầu tiên, phiên đăng nhập là đủ.
    if (user.passwordHash) {
      const ok =
        currentPassword !== undefined &&
        (await this.passwords.verify(currentPassword, user.passwordHash));
      if (!ok) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { passwordHash: await this.passwords.hash(newPassword) },
    });
    // Đổi mật khẩu thì mọi phiên khác phải chết.
    await this.tokens.revokeAll(userId);
  }

  /** Gỡ liên kết Google, nhưng không để ai tự khoá mình ra ngoài. */
  async unlinkProvider(userId: string, provider: string): Promise<void> {
    if (provider !== 'google') return;
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      include: { googleIdentity: true },
    });
    if (!user) throw new UnauthorizedException();
    if (!user.passwordHash && user.googleIdentity) {
      throw new ConflictException(
        'Đây là cách đăng nhập duy nhất của bạn. Hãy đặt mật khẩu trước khi gỡ.',
      );
    }
    await this.prisma.googleIdentity.deleteMany({ where: { userId } });
  }

  async deleteAccount(userId: string): Promise<void> {
    // Bảng explorer đều onDelete: Cascade. Tài khoản staff có bảng tham chiếu
    // kiểu Restrict nên sẽ bị từ chối — đúng ý: staff không tự xoá được.
    await this.prisma.userAccount.delete({ where: { id: userId } });
  }
}
