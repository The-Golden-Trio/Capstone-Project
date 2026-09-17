import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import type { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly auth: AuthService) {
    // Người dùng gõ tên đăng nhập hoặc email vào cùng một ô.
    super({ usernameField: 'identifier', passwordField: 'password' });
  }

  async validate(identifier: string, password: string): Promise<AuthUser> {
    const user = await this.auth.validateCredentials(identifier, password);
    if (!user) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }
    return user;
  }
}
