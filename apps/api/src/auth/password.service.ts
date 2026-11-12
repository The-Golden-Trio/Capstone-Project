import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/** Băm mật khẩu có muối (NFR-17). */
@Injectable()
export class PasswordService {
  hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
