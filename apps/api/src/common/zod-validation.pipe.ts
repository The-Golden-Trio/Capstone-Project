import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * Kiểm dữ liệu vào bằng Zod.
 *
 * Dùng Zod thay vì class-validator vì `packages/game-core` đã kiểm bộ dữ liệu
 * bằng Zod rồi — một thư viện kiểm dữ liệu cho cả dự án, không phải hai.
 *
 *     @Post()
 *     register(@Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto) {}
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Dữ liệu gửi lên không hợp lệ',
        issues: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    return result.data;
  }
}
