import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleService } from './google.service';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  // Không dùng session của Passport: phiên nằm ở cookie JWT, máy chủ không
  // giữ trạng thái nào ngoài bảng refresh token.
  imports: [PassportModule.register({ session: false }), JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    GoogleService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
