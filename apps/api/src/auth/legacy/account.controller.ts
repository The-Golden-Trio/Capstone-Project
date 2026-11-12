import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CurrentUser,
  type AuthUser,
} from '../decorators/current-user.decorator';
import {
  ChangePasswordSchema,
  ConsentSchema,
  UpdateAccountSchema,
  type ChangePasswordDto,
  type ConsentDto,
  type UpdateAccountDto,
} from '../dto/auth.dto';
import { loadSessionUser, type SessionUser } from '../me';
import { LegacyAccountService } from './account.service';

/**
 * Route tài khoản prototype dưới `/api/auth` (màn Tài khoản, màn đồng ý của
 * explorer). Đăng nhập, refresh, đăng xuất đã chuyển sang `/api/v1/auth`
 * (Bearer). Giữ tới khi web đổi sang `/v1/me` (07 A25).
 */
@Controller('auth')
export class LegacyAccountController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly account: LegacyAccountService,
  ) {}

  private async current(userId: string): Promise<SessionUser> {
    const session = await loadSessionUser(this.prisma, userId);
    if (!session) throw new UnauthorizedException();
    return session;
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<SessionUser> {
    return this.current(user.id);
  }

  @Patch('account')
  async updateAccount(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateAccountSchema)) dto: UpdateAccountDto,
  ): Promise<SessionUser> {
    await this.account.updateAccount(user.id, dto);
    return this.current(user.id);
  }

  @HttpCode(200)
  @Post('account/password')
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ChangePasswordSchema)) dto: ChangePasswordDto,
  ): Promise<{ ok: true }> {
    await this.account.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
    return { ok: true };
  }

  @Delete('account/providers/:provider')
  async unlink(
    @CurrentUser() user: AuthUser,
    @Param('provider') provider: string,
  ): Promise<SessionUser> {
    await this.account.unlinkProvider(user.id, provider);
    return this.current(user.id);
  }

  @Delete('account')
  async deleteAccount(@CurrentUser() user: AuthUser): Promise<{ ok: true }> {
    await this.account.deleteAccount(user.id);
    return { ok: true };
  }

  @HttpCode(200)
  @Post('consent')
  async consent(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ConsentSchema)) dto: ConsentDto,
  ): Promise<SessionUser> {
    await this.account.recordConsent(
      user.id,
      dto.guardianName,
      dto.guardianEmail,
    );
    return this.current(user.id);
  }
}
