/**
 * Worker process: xử lý phần AI của lượt ca làm (CL-00, Q7).
 *   pnpm exec nx run @datn/api:serve-worker
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { aiModeOf, loadEnv } from './config/env';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  const env = loadEnv();
  Logger.log(
    `⚙️  Worker đang chạy (AI_MODE=${aiModeOf(env)}, Redis ${new URL(env.REDIS_URL).host})`,
  );
}

bootstrap();
