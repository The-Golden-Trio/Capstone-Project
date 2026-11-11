import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { loadEnv } from './config/env';
import { WorkerModule } from './worker.module';

async function bootstrapApi() {
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

  app.enableShutdownHooks();
  await app.listen(env.PORT);
  Logger.log(
    `🚀 API đang chạy tại http://localhost:${env.PORT}/${globalPrefix}`,
  );
}

/** Vai worker (§5.3.1): cùng bản build, chạy với `--worker`. */
async function bootstrapWorker() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  Logger.log('🛠  Worker đang chạy: chấm (AI-5) và hỏi vặn (AI-4)');
}

(process.argv.includes('--worker') ? bootstrapWorker() : bootstrapApi()).catch(
  (err: unknown) => {
    Logger.error(
      err instanceof Error ? (err.stack ?? err.message) : String(err),
    );
    process.exit(1);
  },
);
