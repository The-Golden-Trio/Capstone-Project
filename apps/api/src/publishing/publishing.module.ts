/**
 * CL-06 `PublishingModule` (phần P4): thư viện asset, thiết kế trình bày,
 * dựng bản game nháp. Import `PlayModule` của CL-00 bỏ tới P5 (play-test),
 * vì `PlayModule` đích chưa có. AI gợi ý trình bày / sinh ảnh hoãn (D-104).
 */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LifecycleModule } from '../lifecycle/lifecycle.module';
import { AssetService } from './asset.service';
import { BuildService } from './build.service';
import {
  AssetController,
  BuildController,
  PresentationController,
} from './publishing.controller';
import { PresentationService } from './presentation.service';

@Module({
  imports: [AuthModule, LifecycleModule],
  controllers: [PresentationController, BuildController, AssetController],
  providers: [AssetService, PresentationService, BuildService],
})
export class PublishingModule {}
