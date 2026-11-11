/**
 * Module của worker process (CL-00: vai `worker`). Không có HTTP; chỉ xử lý
 * job trong hàng đợi và đẩy tin qua Redis pub/sub.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssessmentModule } from './assessment/assessment.module';
import { loadEnv } from './config/env';
import { ContentModule } from './content/content.module';
import { CoreModule } from './core/core.module';
import { NotificationCoreModule } from './notification/notification.module';
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
    NotificationCoreModule,
    AssessmentModule.forWorker(),
  ],
})
export class WorkerModule {}
