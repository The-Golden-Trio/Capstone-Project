/**
 * Process worker (§5.3.1: modular monolith, một codebase chạy hai vai). Không
 * mở cổng HTTP; nhận việc từ queue `grading`, gọi model qua gateway, ghi kết
 * quả vào PostgreSQL và đẩy sự kiện qua Redis.
 */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AssessmentModule } from './assessment/assessment.module';
import { GradingProcessor } from './assessment/grading.processor';
import { ShiftTurnProcessor } from './assessment/shift-turn.processor';
import { loadEnv } from './config/env';
import { ContentModule } from './content/content.module';
import { CoreModule } from './core/core.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailProcessor } from './notification/email.processor';
import { ReminderScheduler } from './notification/reminder.scheduler';
import { NotificationModule } from './notification/notification.module';
import { GenerationProcessor } from './scenario/generation.processor';
import { ScenarioModule } from './scenario/scenario.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
      validate: loadEnv,
    }),
    // Cron chỉ chạy ở worker (CL-07 `ReminderScheduler`).
    ScheduleModule.forRoot(),
    PrismaModule,
    ContentModule,
    CoreModule,
    NotificationModule,
    AssessmentModule,
    ScenarioModule,
  ],
  providers: [
    GradingProcessor,
    ShiftTurnProcessor,
    EmailProcessor,
    GenerationProcessor,
    ReminderScheduler,
  ],
})
export class WorkerModule {}
