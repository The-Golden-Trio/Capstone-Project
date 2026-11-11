/** CL-04 FlagService: người chơi báo nội dung sai (FR-14). Staff app xử lý sau. */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FlagService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    runId: string,
    dto: { activityKey: string; reason: string },
  ): Promise<void> {
    await this.prisma.contentFlag.create({
      data: { runId, activityKey: dto.activityKey, reason: dto.reason },
    });
  }
}
