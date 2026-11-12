import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { loadEnv } from './config/env';
import { WorkerModule } from './worker.module';

async function bootstrapApi() {
  const app = await NestFactory.create(AppModule);
  const env = loadEnv();

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Phiên là Bearer token (Q2), không dùng cookie. Lúc dev, Vite proxy /api
  // nên trình duyệt thấy cùng origin; CORS chỉ dùng khi web, staff app và api
  // ở các origin khác nhau.
  app.enableCors({ origin: [env.WEB_ORIGIN, env.STAFF_ORIGIN] });

  // Dữ liệu staff đổi theo người xem và theo thao tác của người khác. `ETag`
  // của scenario chỉ là `row_version` của NỘI DUNG (để khoá lạc quan,
  // `If-Match`), không đại diện cả bản trả về — nên bỏ GET có điều kiện để
  // Express không trả 304 cho một bản đã cũ.
  app.use(
    ['/api/v1/staff', '/api/v1/me'],
    (
      req: { headers: Record<string, unknown> },
      res: { setHeader: (k: string, v: string) => void },
      next: () => void,
    ) => {
      delete req.headers['if-none-match'];
      delete req.headers['if-modified-since'];
      res.setHeader('Cache-Control', 'no-store');
      next();
    },
  );

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
  Logger.log(
    '🛠  Worker đang chạy: chấm (AI-5), hỏi vặn (AI-4), email, sinh scenario',
  );
}

(process.argv.includes('--worker') ? bootstrapWorker() : bootstrapApi()).catch(
  (err: unknown) => {
    Logger.error(
      err instanceof Error ? (err.stack ?? err.message) : String(err),
    );
    process.exit(1);
  },
);
