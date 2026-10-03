import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

/**
 * Client Prisma dùng chung cho cả ứng dụng.
 *
 * Prisma 7 nhận kết nối qua driver adapter thay vì chuỗi URL trong lược đồ.
 * Ở đây trỏ vào DATABASE_URL — pooler chế độ transaction của Supabase — vì
 * nó chịu được nhiều kết nối ngắn, đúng kiểu tải của một API HTTP.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Đã kết nối cơ sở dữ liệu');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
