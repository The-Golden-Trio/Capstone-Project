import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../core/queues';
import type { NotificationChannel } from '../generated/prisma/enums';
import type { Prisma } from '../generated/prisma/client';

export interface NotifyOptions {
  channels?: NotificationChannel[];
  /** Chỉ đi trong email, không lưu DB. */
  secret?: Record<string, string>;
}

/**
 * CL-07 `NotificationService`: mỗi kênh một dòng `notification` (ERD-07).
 * IN_APP hiện ở chuông của staff app; EMAIL được đẩy vào queue `email` cho
 * worker gửi, nên request không chờ SMTP.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queues: QueueService,
  ) {}

  async notify(
    recipientId: string,
    template: string,
    payload: Record<string, unknown>,
    options: NotifyOptions = {},
  ): Promise<void> {
    const channels = options.channels ?? ['IN_APP', 'EMAIL'];
    for (const channel of channels) {
      const row = await this.prisma.notification.create({
        data: {
          recipientId,
          channel,
          template,
          payload: payload as Prisma.InputJsonValue,
        },
      });
      if (channel === 'EMAIL') {
        await this.queues
          .enqueueEmail({ notificationId: row.id, secret: options.secret })
          .catch((err: unknown) =>
            this.logger.warn(
              `Không đẩy được email ${row.id} vào queue: ${String(err)}`,
            ),
          );
      }
    }
  }

  /** openapi `listNotifications`: thông báo trong app, mới nhất trước. */
  async list(recipientId: string, limit = 30) {
    const rows = await this.prisma.notification.findMany({
      where: { recipientId, channel: 'IN_APP' },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
    });
    return rows.map((r) => ({
      id: r.id,
      template: r.template,
      payload: r.payload,
      createdAt: r.createdAt.toISOString(),
      readAt: r.readAt?.toISOString() ?? null,
    }));
  }
}
