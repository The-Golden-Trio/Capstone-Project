/**
 * CL-03 `AppFeedbackService` (FR-20, AD-01g): lưu góp ý về app kèm thời điểm
 * và phiên bản. Phần xem và đánh dấu đã xử lý của System Admin
 * (`/admin/app-feedback`, CL-07) chưa làm.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { SendAppFeedbackInput } from './feedback.dto';

@Injectable()
export class AppFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async send(userId: string, dto: SendAppFeedbackInput): Promise<void> {
    await this.prisma.appFeedback.create({
      data: { userId, text: dto.text, appVersion: dto.appVersion },
    });
  }
}
