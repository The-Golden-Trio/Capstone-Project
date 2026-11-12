import { Body, Controller, HttpCode, Post, UseFilters } from '@nestjs/common';
import { ProblemFilter, ZodProblemPipe } from '../core/problem';
import { AuthService, type Session } from './auth.service';
import { Public } from './decorators/public.decorator';
import {
  CurrentUser,
  type AuthUser,
} from './decorators/current-user.decorator';
import {
  ConfirmPasswordResetSchema,
  GoogleSignInSchema,
  RefreshSessionSchema,
  RegisterSchema,
  RequestPasswordResetSchema,
  SignInSchema,
  SignOutSchema,
  type ConfirmPasswordResetInput,
  type GoogleSignInInput,
  type RefreshSessionInput,
  type RegisterInput,
  type RequestPasswordResetInput,
  type SignInInput,
  type SignOutInput,
} from './dto/auth.dto';

/** CL-01 `AuthController`, openapi tag Auth (SD-04). Phiên trả về là Bearer (Q2). */
@Controller('v1/auth')
@UseFilters(ProblemFilter)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(
    @Body(new ZodProblemPipe(RegisterSchema)) dto: RegisterInput,
  ): Promise<Session> {
    return this.auth.register(dto);
  }

  @Public()
  @HttpCode(200)
  @Post('sign-in')
  signIn(@Body(new ZodProblemPipe(SignInSchema)) dto: SignInInput) {
    return this.auth.signIn(dto);
  }

  @Public()
  @HttpCode(200)
  @Post('google')
  signInWithGoogle(
    @Body(new ZodProblemPipe(GoogleSignInSchema)) dto: GoogleSignInInput,
  ): Promise<Session> {
    return this.auth.signInWithGoogle(dto);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  refreshSession(
    @Body(new ZodProblemPipe(RefreshSessionSchema)) dto: RefreshSessionInput,
  ): Promise<Session> {
    return this.auth.refresh(dto.refreshToken);
  }

  @HttpCode(204)
  @Post('sign-out')
  async signOut(
    @CurrentUser() user: AuthUser,
    @Body(new ZodProblemPipe(SignOutSchema)) dto: SignOutInput,
  ): Promise<void> {
    await this.auth.signOut(user, dto);
  }

  @Public()
  @HttpCode(202)
  @Post('password-reset')
  async requestPasswordReset(
    @Body(new ZodProblemPipe(RequestPasswordResetSchema))
    dto: RequestPasswordResetInput,
  ): Promise<void> {
    await this.auth.requestPasswordReset(dto);
  }

  @Public()
  @HttpCode(204)
  @Post('password-reset/confirm')
  async confirmPasswordReset(
    @Body(new ZodProblemPipe(ConfirmPasswordResetSchema))
    dto: ConfirmPasswordResetInput,
  ): Promise<void> {
    await this.auth.confirmPasswordReset(dto);
  }
}
