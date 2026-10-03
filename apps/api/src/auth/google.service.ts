import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import type { Env } from '../config/env';

export interface GoogleIdentity {
  /** `sub` của Google — định danh ổn định, không đổi kể cả khi người dùng đổi email. */
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
}

/**
 * Xác minh ID token do Google Identity Services trả về trên trình duyệt.
 *
 * Máy khách gửi lên một chuỗi; chuỗi đó chỉ đáng tin sau khi kiểm chữ ký,
 * `aud` (đúng client ID của mình) và `iss`. `google-auth-library` làm cả ba.
 */
@Injectable()
export class GoogleService {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor(config: ConfigService<Env, true>) {
    this.clientId = config.get('GOOGLE_CLIENT_ID', { infer: true });
    this.client = new OAuth2Client(this.clientId);
  }

  async verify(credential: string): Promise<GoogleIdentity> {
    let payload;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: this.clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Token Google không hợp lệ');
    }

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Token Google thiếu thông tin tài khoản');
    }

    return {
      providerAccountId: payload.sub,
      email: payload.email.toLowerCase(),
      // Chỉ email đã xác minh mới được dùng để nối vào tài khoản sẵn có —
      // nếu không, một địa chỉ chưa xác minh có thể chiếm tài khoản người khác.
      emailVerified: payload.email_verified === true,
      name: payload.name ?? null,
    };
  }
}
