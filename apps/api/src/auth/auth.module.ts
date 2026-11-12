import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessPolicyService } from './access-policy.service';
import { ActivityLogService } from './activity-log.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './google-oauth.service';
import { OccupationAccessGuard } from './guards/occupation-access.guard';
import { LegacyAccountController } from './legacy/account.controller';
import { LegacyAccountService } from './legacy/account.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/** CL-01 `AuthModule`. Phiên là Bearer + refresh xoay vòng trong `auth_session` (Q2). */
@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({}),
  ],
  controllers: [AuthController, LegacyAccountController],
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    GoogleOAuthService,
    ActivityLogService,
    AccessPolicyService,
    OccupationAccessGuard,
    JwtStrategy,
    LegacyAccountService,
  ],
  exports: [
    TokenService,
    PasswordService,
    ActivityLogService,
    AccessPolicyService,
    OccupationAccessGuard,
  ],
})
export class AuthModule {}
