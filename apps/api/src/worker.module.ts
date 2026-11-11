/**
 * Process worker (§5.3.1: modular monolith, một codebase chạy hai vai). Không
 * mở cổng HTTP; nhận việc từ queue `grading`, gọi model qua gateway, ghi kết
 * quả vào PostgreSQL và đẩy sự kiện qua Redis.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssessmentModule } from './assessment/assessment.module';
import { GradingProcessor } from './assessment/grading.processor';
import { ShiftTurnProcessor } from './assessment/shift-turn.processor';
import { loadEnv } from './config/env';
import { ContentModule } from './content/content.module';
import { CoreModule } from './core/core.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
      validate: loadEnv,
    }),
    PrismaModule,
    ContentModule,
    CoreModule,
    AssessmentModule,
  ],
  providers: [GradingProcessor, ShiftTurnProcessor],
})
export class WorkerModule {}
