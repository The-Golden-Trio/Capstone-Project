import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import type { Env } from '../config/env';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService, type SessionUser } from './auth.service';
import { TokenService } from './token.service';
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from './cookies';
import { Public } from './decorators/public.decorator';
import {
  CurrentUser,
  type AuthUser,
} from './decorators/current-user.decorator';
import {
  ChangePasswordSchema,
  ConsentSchema,
  GoogleSignInSchema,
  LoginSchema,
  RegisterSchema,
  UpdateAccountSchema,
  type ChangePasswordDto,
  type ConsentDto,
  type GoogleSignInDto,
  type RegisterDto,
  type UpdateAccountDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokenService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private get isProduction(): boolean {
    return this.config.get('NODE_ENV', { infer: true }) === 'production';
  }

  /** Cấp token, đặt cookie, trả về người dùng — dùng chung cho cả ba lối vào. */
  private async establishSession(
    user: AuthUser,
    req: Request,
    res: Response,
  ): Promise<SessionUser> {
    const pair = await this.tokens.issuePair(user, req.get('user-agent'));
    setAuthCookies(res, pair, this.isProduction);

    const session = await this.auth.getSessionUser(user.id);
    if (!session) throw new NotFoundException('Không tìm thấy tài khoản');
    return session;
  }

  @Public()
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionUser> {
    const user = await this.auth.register(dto);
    return this.establishSession(user, req, res);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @Post('login')
  async login(
    // Chỉ để Nest kiểm dạng trước khi LocalStrategy chạm vào.
    @Body(new ZodValidationPipe(LoginSchema)) _dto: unknown,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionUser> {
    return this.establishSession(user, req, res);
  }

  @Public()
  @HttpCode(200)
  @Post('google')
  async google(
    @Body(new ZodValidationPipe(GoogleSignInSchema)) dto: GoogleSignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionUser> {
    const user = await this.auth.signInWithGoogle(dto);
    return this.establishSession(user, req, res);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const presented = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE
    ];
    if (!presented) throw new UnauthorizedException('Không có phiên nào');

    try {
      const pair = await this.tokens.rotate(presented, req.get('user-agent'));
      setAuthCookies(res, pair, this.isProduction);
      return { ok: true };
    } catch (error) {
      // Refresh hỏng thì cookie cũng nên biến mất, nếu không trình duyệt sẽ
      // thử lại mãi bằng đúng cái token đã chết.
      clearAuthCookies(res, this.isProduction);
      throw error;
    }
  }

  @Public()
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const presented = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE
    ];
    if (presented) await this.tokens.revoke(presented);
    clearAuthCookies(res, this.isProduction);
    return { ok: true };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthUser): Promise<SessionUser> {
    const session = await this.auth.getSessionUser(user.id);
    if (!session) throw new UnauthorizedException();
    return session;
  }

  /* ── Tài khoản ───────────────────────────────────────────────────── */

  @Patch('account')
  async updateAccount(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateAccountSchema)) dto: UpdateAccountDto,
  ): Promise<SessionUser> {
    await this.auth.updateAccount(user.id, dto);
    const session = await this.auth.getSessionUser(user.id);
    if (!session) throw new UnauthorizedException();
    return session;
  }

  @HttpCode(200)
  @Post('account/password')
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ChangePasswordSchema)) dto: ChangePasswordDto,
  ): Promise<{ ok: true }> {
    await this.auth.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
    // Đổi mật khẩu thì mọi phiên khác phải chết — đó là nửa còn lại của việc
    // đổi mật khẩu sau khi nghi bị lộ.
    await this.tokens.revokeAllForUser(user.id);
    return { ok: true };
  }

  @Delete('account/providers/:provider')
  async unlink(
    @CurrentUser() user: AuthUser,
    @Param('provider') provider: string,
  ): Promise<SessionUser> {
    await this.auth.unlinkProvider(user.id, provider);
    const session = await this.auth.getSessionUser(user.id);
    if (!session) throw new UnauthorizedException();
    return session;
  }

  @Delete('account')
  async deleteAccount(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    await this.auth.deleteAccount(user.id);
    clearAuthCookies(res, this.isProduction);
    return { ok: true };
  }

  /* ── Đồng ý của người giám hộ ────────────────────────────────────── */

  @HttpCode(200)
  @Post('consent')
  async consent(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ConsentSchema)) dto: ConsentDto,
  ): Promise<SessionUser> {
    await this.auth.recordConsent(user.id, dto.guardianName, dto.guardianEmail);
    const session = await this.auth.getSessionUser(user.id);
    if (!session) throw new UnauthorizedException();
    return session;
  }
}
