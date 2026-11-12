import { Injectable } from '@nestjs/common';
import { Problem } from '../core/problem';
import { PrismaService } from '../prisma/prisma.service';
import type { Tx } from '../lifecycle/scenario-state-machine';
import type {
  CreateReviewCriteriaVersionInput,
  ReviewCriteria,
} from './catalogue.dto';

/** CL-02 `ReviewCriteriaService`: tiêu chí duyệt có version, bản cao nhất có hiệu lực (FR-32). */
@Injectable()
export class ReviewCriteriaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Bản đang hiệu lực, hoặc `null` khi nghề chưa có tiêu chí. */
  async current(
    occupationId: string,
    tx: Tx | PrismaService = this.prisma,
  ): Promise<(ReviewCriteria & { versionId: string }) | null> {
    const version = await tx.reviewCriteriaVersion.findFirst({
      where: { occupationId },
      orderBy: { versionNo: 'desc' },
      include: { criteria: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!version) return null;
    return {
      versionId: version.id,
      versionNo: version.versionNo,
      criteria: version.criteria.map((c) => ({
        criterionId: c.id,
        text: c.text,
      })),
    };
  }

  async get(occupationId: string): Promise<ReviewCriteria> {
    const found = await this.current(occupationId);
    if (!found)
      throw new Problem(404, 'NOT_FOUND', 'Nghề này chưa có tiêu chí duyệt');
    return { versionNo: found.versionNo, criteria: found.criteria };
  }

  async createVersion(
    occupationId: string,
    actorId: string,
    dto: CreateReviewCriteriaVersionInput,
  ): Promise<ReviewCriteria> {
    const created = await this.prisma.$transaction(async (tx) => {
      const latest = await tx.reviewCriteriaVersion.findFirst({
        where: { occupationId },
        orderBy: { versionNo: 'desc' },
        select: { versionNo: true },
      });
      return tx.reviewCriteriaVersion.create({
        data: {
          occupationId,
          versionNo: (latest?.versionNo ?? 0) + 1,
          createdBy: actorId,
          criteria: {
            create: dto.criteria.map((c, sortOrder) => ({
              text: c.text,
              sortOrder,
            })),
          },
        },
        include: { criteria: { orderBy: { sortOrder: 'asc' } } },
      });
    });
    return {
      versionNo: created.versionNo,
      criteria: created.criteria.map((c) => ({
        criterionId: c.id,
        text: c.text,
      })),
    };
  }
}
