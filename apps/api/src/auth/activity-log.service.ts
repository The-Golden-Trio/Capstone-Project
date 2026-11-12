import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '../generated/prisma/client';

export interface ActivityTarget {
  type: string;
  id?: string;
  detail?: Record<string, unknown>;
}

/** CL-01 `ActivityLogService` (ERD-01 `activity_log`). Ghi log không bao giờ làm hỏng thao tác chính. */
@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(
    actorId: string | null,
    action: string,
    target?: ActivityTarget,
  ): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          actorId,
          action,
          targetType: target?.type,
          targetId: target?.id,
          detail: target?.detail as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (err) {
      this.logger.warn(`Không ghi được activity_log ${action}: ${String(err)}`);
    }
  }
}
