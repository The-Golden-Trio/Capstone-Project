/**
 * CL-03 `RatingService` (FR-19, AD-01e): đánh giá nghề năm tiêu chí sau khi
 * xong mọi cấp (D-27, DR-08); số tổng hợp bị giấu dưới ngưỡng (NFR-06).
 *
 * Lệch thiết kế tạm thời (07 A26): explorer vẫn chạy trên catalogue prototype
 * (`RoleDoc`, mã nghề), nên `occupationId` nhận cả uuid lẫn mã nghề, và "xong
 * mọi cấp" đọc từ `ProgressService` (ScenarioRun prototype) thay vì
 * `enrolment.completed_at` của ERD-05.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env';
import { Problem } from '../core/problem';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import type {
  RatingForm,
  RatingInput,
  RatingLockedReason,
  RatingSummary,
} from './feedback.dto';

/** Nhãn hiển thị của năm tiêu chí D-27; mã nằm ở bảng `rating_attribute`. */
const ATTRIBUTE_LABELS: Record<string, string> = {
  SALARY: 'Lương',
  PRESSURE: 'Áp lực',
  DIFFICULTY: 'Độ khó',
  WORK_LIFE_BALANCE: 'Cân bằng công việc – cuộc sống',
  ENJOYMENT: 'Mức yêu thích',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface OccupationRef {
  id: string;
  code: string;
}

@Injectable()
export class RatingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async form(userId: string, occupationIdOrCode: string): Promise<RatingForm> {
    const occupation = await this.findOccupation(occupationIdOrCode);
    const [lockedReason, attributes] = await Promise.all([
      this.lockedReason(userId, occupation),
      this.attributes(),
    ]);
    return {
      occupationId: occupation.id,
      eligible: lockedReason === null,
      lockedReason,
      attributes,
    };
  }

  async rate(
    userId: string,
    occupationIdOrCode: string,
    dto: RatingInput,
  ): Promise<RatingSummary> {
    const occupation = await this.findOccupation(occupationIdOrCode);
    const locked = await this.lockedReason(userId, occupation);
    if (locked === 'LEVELS_NOT_COMPLETED')
      throw new Problem(
        403,
        'LEVELS_NOT_COMPLETED',
        'Cần hoàn thành mọi cấp của nghề trước khi đánh giá',
      );
    if (locked === 'ALREADY_RATED') throw alreadyRated();

    const codes = (await this.attributes()).map((a) => a.code);
    const errors = [
      ...codes
        .filter((code) => !(code in dto.scores))
        .map((code) => ({ field: `scores.${code}`, reason: 'chưa chấm' })),
      ...Object.keys(dto.scores)
        .filter((code) => !codes.includes(code))
        .map((code) => ({
          field: `scores.${code}`,
          reason: 'không phải tiêu chí đánh giá',
        })),
    ];
    if (errors.length)
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Dữ liệu gửi lên không hợp lệ',
        errors,
      );

    try {
      await this.prisma.occupationRating.create({
        data: {
          explorerId: userId,
          occupationId: occupation.id,
          comment: dto.comment || null,
          scores: {
            create: codes.map((code) => ({
              attributeCode: code,
              score: dto.scores[code],
            })),
          },
        },
      });
    } catch (err) {
      // Hai lần gửi cùng lúc: khoá (explorer, occupation) chặn lần thứ hai.
      if ((err as { code?: string }).code === 'P2002') throw alreadyRated();
      throw err;
    }
    return this.summary(occupation.id);
  }

  /** Số tổng hợp của một nghề; dưới ngưỡng thì chỉ báo số lượt (NFR-06). */
  async summary(occupationId: string): Promise<RatingSummary> {
    const [responseCount, groups] = await Promise.all([
      this.prisma.occupationRating.count({ where: { occupationId } }),
      this.prisma.ratingScore.groupBy({
        by: ['attributeCode'],
        where: { rating: { occupationId } },
        _avg: { score: true },
      }),
    ]);
    const withheld =
      responseCount < this.config.get('RATING_MIN_RESPONSES', { infer: true });
    const averages: Record<string, number> = {};
    if (!withheld)
      for (const group of groups)
        averages[group.attributeCode] =
          Math.round((group._avg.score ?? 0) * 100) / 100;
    return { responseCount, withheld, averages };
  }

  private async findOccupation(idOrCode: string): Promise<OccupationRef> {
    const occupation = await this.prisma.occupation.findUnique({
      where: UUID.test(idOrCode) ? { id: idOrCode } : { code: idOrCode },
      select: { id: true, code: true },
    });
    if (!occupation)
      throw new Problem(404, 'NOT_FOUND', 'Nghề này chưa nhận đánh giá');
    return occupation;
  }

  private async lockedReason(
    userId: string,
    occupation: OccupationRef,
  ): Promise<RatingLockedReason | null> {
    const [progress, existing] = await Promise.all([
      this.progress.roleProgress(userId, occupation.code),
      this.prisma.occupationRating.findUnique({
        where: {
          explorerId_occupationId: {
            explorerId: userId,
            occupationId: occupation.id,
          },
        },
        select: { id: true },
      }),
    ]);
    if (existing) return 'ALREADY_RATED';
    const allDone =
      !!progress &&
      progress.bands.length > 0 &&
      progress.bands.every((band) => band.completed);
    return allDone ? null : 'LEVELS_NOT_COMPLETED';
  }

  private async attributes(): Promise<RatingForm['attributes']> {
    const rows = await this.prisma.ratingAttribute.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => ({
      code: row.code,
      label: ATTRIBUTE_LABELS[row.code] ?? row.code,
      sortOrder: row.sortOrder,
    }));
  }
}

const alreadyRated = () =>
  new Problem(409, 'ALREADY_RATED', 'Bạn đã đánh giá nghề này');
