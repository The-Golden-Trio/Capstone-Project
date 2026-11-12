import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContentModule } from '../content/content.module';
import { CoreModule } from '../core/core.module';
import { PlayModule } from '../play/play.module';
import { loadEnv } from '../config/env';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { LifecycleModule } from '../lifecycle/lifecycle.module';
import { ReviewModule } from '../review/review.module';
import { ScenarioModule } from '../scenario/scenario.module';
import { PublishingModule } from '../publishing/publishing.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileModule } from '../profile/profile.module';
import { RunsModule } from '../runs/runs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
      // Thiếu biến nào thì dừng ngay lúc khởi động, kèm tên biến còn thiếu.
      validate: loadEnv,
    }),
    PrismaModule,
    ContentModule,
    AuthModule,
    RunsModule,
    ProfileModule,
    AiModule,
    CoreModule,
    NotificationModule,
    UserModule,
    PlayModule,
    // Content lifecycle (CL-00): staff app của CA và DE.
    CatalogueModule,
    LifecycleModule,
    ReviewModule,
    ScenarioModule,
    PublishingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Thứ tự có ý nghĩa: xác thực trước, rồi mới xét vai trò.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
