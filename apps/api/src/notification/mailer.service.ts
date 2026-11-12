import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import type { Env } from '../config/env';

/** Gửi email qua SMTP_URL. Không cấu hình thì chỉ ghi log (dev không cần mail thật). */
@Injectable()
export class MailerService implements OnModuleDestroy {
  private readonly logger = new Logger('Mailer');
  private readonly transport: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService<Env, true>) {
    const url = config.get('SMTP_URL', { infer: true });
    this.from = config.get('MAIL_FROM', { infer: true });
    this.transport = url ? nodemailer.createTransport(url) : null;
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.transport) {
      this.logger.log(`[SMTP chưa cấu hình] tới ${to}: ${subject}`);
      return;
    }
    await this.transport.sendMail({ from: this.from, to, subject, text });
  }

  onModuleDestroy(): void {
    this.transport?.close();
  }
}
