import Anthropic from '@anthropic-ai/sdk';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env';
import { RunsModule } from '../runs/runs.module';
import { ClaudePortraitAi } from './ai/claude-portrait-ai';
import { PORTRAIT_AI, type PortraitAi } from './ai/portrait-ai';
import { PortraitService } from './portrait.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [RunsModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    PortraitService,
    {
      // Không có khoá thì `null`: câu tự luận chờ đọc sau, mô tả dùng khuôn.
      provide: PORTRAIT_AI,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): PortraitAi | null => {
        const apiKey = config.get('ANTHROPIC_API_KEY', { infer: true });
        return apiKey
          ? new ClaudePortraitAi(
              new Anthropic({ apiKey }),
              config.get('PORTRAIT_MODEL', { infer: true }),
            )
          : null;
      },
    },
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
