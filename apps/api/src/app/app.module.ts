import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { loadEnv } from '../config/env';
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
    AuthModule,
    RunsModule,
    ProfileModule,
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
