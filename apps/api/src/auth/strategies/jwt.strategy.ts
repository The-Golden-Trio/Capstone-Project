import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { Env } from '../../config/env';
import type { AuthUser } from '../decorators/current-user.decorator';
import type { AccessTokenPayload } from '../token.service';
import { ACCESS_COOKIE } from '../cookies';

/** Lấy access token từ cookie httpOnly, không phải từ header Authorization. */
const fromCookie = (req: Request): string | null =>
  (req.cookies as Record<string, string> | undefined)?.[ACCESS_COOKIE] ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService<Env, true>) {
    super({
      // Vẫn nhận Bearer token để tiện gọi bằng curl khi dò lỗi; đường chính
      // là cookie.
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  validate(payload: AccessTokenPayload): AuthUser {
    if (!payload?.sub) throw new UnauthorizedException();
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
