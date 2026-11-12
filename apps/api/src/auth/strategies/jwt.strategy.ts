import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Env } from '../../config/env';
import type { AuthUser } from '../decorators/current-user.decorator';
import type { AccessTokenPayload } from '../token.service';

/**
 * Access token đi trong header `Authorization: Bearer …` (Q2, openapi
 * `bearerAuth`). Máy khách giữ access token trong bộ nhớ, refresh token ở
 * localStorage; luồng SSE mở bằng fetch để gửi được header.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  validate(payload: AccessTokenPayload): AuthUser {
    if (!payload?.sub || !Array.isArray(payload.roles))
      throw new UnauthorizedException();
    return { id: payload.sub, roles: payload.roles };
  }
}
