import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

const DUE_SOON_MS = 24 * 60 * 60 * 1000;
const WAITING = ['SUBMITTED', 'IN_REVIEW'] as const;

/**
 * CL-07 `ReminderScheduler` (worker, mỗi giờ): nhắc người duyệt trước hạn
 * 24 giờ và báo quá hạn cho người duyệt và CA (FR-34). Mốc 24 giờ là đề xuất
 * (07 A22+). Chống gửi trùng: `reminded_at` cho lời nhắc, và dò dòng
 * `notification` REVIEW_OVERDUE của cùng lượt duyệt cho báo quá hạn.
 */
@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger('Worker·reminder');

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async tick(): Promise<void> {
    await this.remindBeforeDeadline();
    await this.notifyOverdueReviews();
  }

  async remindBeforeDeadline(now = new Date()): Promise<number> {
    const rows = await this.prisma.reviewAssignment.findMany({
      where: {
        status: 'ACTIVE',
        remindedAt: null,
        deadlineAt: { gt: now, lte: new Date(now.getTime() + DUE_SOON_MS) },
        scenario: { status: { in: [...WAITING] } },
      },
      include: {
        scenario: { select: { id: true, task: { select: { text: true } } } },
      },
    });
    for (const r of rows) {
      await this.notifications.notify(r.reviewerId, 'REVIEW_DUE_SOON', {
        assignmentId: r.id,
        scenarioId: r.scenario.id,
        taskText: r.scenario.task.text,
        deadlineAt: r.deadlineAt.toISOString(),
      });
      await this.prisma.reviewAssignment.update({
        where: { id: r.id },
        data: { remindedAt: now },
      });
    }
    if (rows.length)
      this.logger.log(`Nhắc ${rows.length} lượt duyệt sắp tới hạn`);
    return rows.length;
  }

  async notifyOverdueReviews(now = new Date()): Promise<number> {
    const rows = await this.prisma.reviewAssignment.findMany({
      where: {
        status: 'ACTIVE',
        deadlineAt: { lt: now },
        scenario: { status: { in: [...WAITING] } },
      },
      include: {
        scenario: {
          select: {
            id: true,
            task: {
              select: { text: true, level: { select: { occupationId: true } } },
            },
          },
        },
      },
    });
    let sent = 0;
    for (const r of rows) {
      const already = await this.prisma.notification.findFirst({
        where: {
          template: 'REVIEW_OVERDUE',
          payload: { path: ['assignmentId'], equals: r.id },
        },
        select: { id: true },
      });
      if (already) continue;
      const admins = await this.prisma.staffAssignment.findMany({
        where: {
          occupationId: r.scenario.task.level.occupationId,
          role: 'CONTENT_ADMIN',
          endedAt: null,
        },
        select: { userId: true },
      });
      const payload = {
        assignmentId: r.id,
        scenarioId: r.scenario.id,
        taskText: r.scenario.task.text,
        deadlineAt: r.deadlineAt.toISOString(),
      };
      for (const userId of new Set([
        r.reviewerId,
        ...admins.map((a) => a.userId),
      ]))
        await this.notifications.notify(userId, 'REVIEW_OVERDUE', payload);
      sent += 1;
    }
    if (sent) this.logger.log(`Báo quá hạn ${sent} lượt duyệt`);
    return sent;
  }
}
