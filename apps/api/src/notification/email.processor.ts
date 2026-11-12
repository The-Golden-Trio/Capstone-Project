import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { Worker, type Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  EMAIL_QUEUE,
  REDIS_URL,
  redisOptions,
  type EmailJob,
} from '../core/queues';
import { MailerService } from './mailer.service';
import { renderMail } from './templates';

/** CL-07 `EmailProcessor` (worker): gửi một dòng `notification` kênh EMAIL. */
@Injectable()
export class EmailProcessor implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger('Worker·email');
  private worker: Worker<EmailJob> | null = null;

  constructor(
    @Inject(REDIS_URL) private readonly redisUrl: string,
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  onApplicationBootstrap(): void {
    this.worker = new Worker<EmailJob>(
      EMAIL_QUEUE,
      (job) => this.process(job),
      {
        connection: redisOptions(this.redisUrl),
        concurrency: 4,
      },
    );
    this.worker.on('failed', (job, err) =>
      this.logger.warn(`Email ${job?.id} lỗi: ${err.message}`),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }

  async process(job: Job<EmailJob>): Promise<void> {
    const row = await this.prisma.notification.findUnique({
      where: { id: job.data.notificationId },
      include: { recipient: { select: { email: true } } },
    });
    if (!row || row.sentAt) return;
    if (!row.recipient.email) {
      this.logger.warn(`Người nhận ${row.recipientId} không có email, bỏ qua`);
      return;
    }
    const mail = renderMail(
      row.template,
      (row.payload ?? {}) as Record<string, unknown>,
      job.data.secret ?? {},
    );
    await this.mailer.send(row.recipient.email, mail.subject, mail.text);
    await this.prisma.notification.update({
      where: { id: row.id },
      data: { sentAt: new Date() },
    });
  }
}
