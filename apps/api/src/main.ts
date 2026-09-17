import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { loadEnv } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const env = loadEnv();

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Phiên đăng nhập nằm trong cookie httpOnly, nên cần đọc được cookie.
  app.use(cookieParser());

  // Lúc dev, Vite proxy /api sang đây nên trình duyệt thấy cùng một origin và
  // CORS không tham gia. Cấu hình này dành cho lúc web và api ở hai origin.
  app.enableCors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  });

  await app.listen(env.PORT);
  Logger.log(
    `🚀 API đang chạy tại http://localhost:${env.PORT}/${globalPrefix}`,
  );
}

bootstrap();
