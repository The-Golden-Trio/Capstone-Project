import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mở một endpoint cho người chưa đăng nhập.
 *
 * `JwtAuthGuard` đăng ký ở phạm vi toàn cục, nên mặc định mọi route đều phải
 * có phiên — thêm route mới mà quên bảo vệ thì nó vẫn được bảo vệ. Muốn mở
 * thì phải nói ra, và chỗ nói ra nhìn thấy được ngay trên route.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
