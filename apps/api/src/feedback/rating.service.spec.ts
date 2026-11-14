/**
 * FR-19, AD-01e: form khoá tới khi xong mọi cấp, mỗi người đánh giá một lần,
 * đủ năm tiêu chí, số tổng hợp giấu dưới ngưỡng (NFR-06).
 */
import type { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env';
import type { PrismaService } from '../prisma/prisma.service';
import type { ProgressService } from '../progress/progress.service';
import { Problem } from '../core/problem';
import { RatingService } from './rating.service';

const OCC = {
  id: '11111111-1111-4111-8111-111111111111',
  code: 'SWE_BACKEND',
};
const CODES = [
  'SALARY',
  'PRESSURE',
  'DIFFICULTY',
  'WORK_LIFE_BALANCE',
  'ENJOYMENT',
];
const FULL = Object.fromEntries(CODES.map((c) => [c, 4]));

function setup(opts: {
  bands?: boolean[] | null;
  existing?: boolean;
  count?: number;
  occupation?: typeof OCC | null;
  createError?: unknown;
}) {
  const create = opts.createError
    ? jest.fn().mockRejectedValue(opts.createError)
    : jest.fn().mockResolvedValue({ id: 'r1' });
  const findOccupation = jest
    .fn()
    .mockResolvedValue(opts.occupation === undefined ? OCC : opts.occupation);
  const prisma = {
    occupation: { findUnique: findOccupation },
    occupationRating: {
      findUnique: jest
        .fn()
        .mockResolvedValue(opts.existing ? { id: 'old' } : null),
      count: jest.fn().mockResolvedValue(opts.count ?? 0),
      create,
    },
    ratingScore: {
      groupBy: jest.fn().mockResolvedValue(
        CODES.map((code) => ({
          attributeCode: code,
          _avg: { score: 3.456 },
        })),
      ),
    },
    ratingAttribute: {
      findMany: jest
        .fn()
        .mockResolvedValue(
          CODES.map((code, i) => ({ code, sortOrder: i + 1 })),
        ),
    },
  } as unknown as PrismaService;
  const bands = opts.bands === undefined ? [true, true] : opts.bands;
  const progress = {
    roleProgress: jest
      .fn()
      .mockResolvedValue(
        bands === null
          ? null
          : { bands: bands.map((completed) => ({ completed })) },
      ),
  } as unknown as ProgressService;
  const config = {
    get: jest.fn().mockReturnValue(5),
  } as unknown as ConfigService<Env, true>;
  return {
    service: new RatingService(prisma, progress, config),
    create,
    findOccupation,
  };
}

const problemOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (err) {
    if (err instanceof Problem)
      return { status: err.getStatus(), code: err.code };
    throw err;
  }
  throw new Error('không ném lỗi');
};

describe('RatingService', () => {
  it('form khoá khi còn cấp chưa xong', async () => {
    const { service } = setup({ bands: [true, false] });
    const form = await service.form('u1', OCC.code);
    expect(form).toMatchObject({
      occupationId: OCC.id,
      eligible: false,
      lockedReason: 'LEVELS_NOT_COMPLETED',
    });
    expect(form.attributes.map((a) => a.label)).toEqual([
      'Lương',
      'Áp lực',
      'Độ khó',
      'Cân bằng công việc – cuộc sống',
      'Mức yêu thích',
    ]);
  });

  it('form mở khi xong mọi cấp, khoá lại khi đã đánh giá', async () => {
    expect((await setup({}).service.form('u1', OCC.code)).eligible).toBe(true);
    expect(
      (await setup({ existing: true }).service.form('u1', OCC.code))
        .lockedReason,
    ).toBe('ALREADY_RATED');
  });

  it('tra nghề theo uuid hoặc theo mã nghề', async () => {
    const { service, findOccupation } = setup({});
    await service.form('u1', OCC.id);
    await service.form('u1', OCC.code);
    expect(findOccupation.mock.calls.map((c) => c[0].where)).toEqual([
      { id: OCC.id },
      { code: OCC.code },
    ]);
  });

  it('nghề chưa có trong catalogue: 404', async () => {
    const { service } = setup({ occupation: null });
    expect(await problemOf(service.form('u1', 'NOPE'))).toEqual({
      status: 404,
      code: 'NOT_FOUND',
    });
  });

  it('chưa xong mọi cấp hoặc nghề không có cấp nào: 403', async () => {
    for (const bands of [[true, false], [], null]) {
      const { service, create } = setup({ bands });
      expect(
        await problemOf(service.rate('u1', OCC.code, { scores: FULL })),
      ).toEqual({ status: 403, code: 'LEVELS_NOT_COMPLETED' });
      expect(create).not.toHaveBeenCalled();
    }
  });

  it('đánh giá lần hai hoặc gửi trùng cùng lúc: 409', async () => {
    expect(
      await problemOf(
        setup({ existing: true }).service.rate('u1', OCC.code, {
          scores: FULL,
        }),
      ),
    ).toEqual({ status: 409, code: 'ALREADY_RATED' });
    expect(
      await problemOf(
        setup({
          createError: Object.assign(new Error('dup'), { code: 'P2002' }),
        }).service.rate('u1', OCC.code, { scores: FULL }),
      ),
    ).toEqual({ status: 409, code: 'ALREADY_RATED' });
  });

  it('thiếu tiêu chí hoặc tiêu chí lạ: 422', async () => {
    const { service, create } = setup({});
    const missing: Record<string, number> = { ...FULL };
    delete missing.SALARY;
    expect(
      await problemOf(service.rate('u1', OCC.code, { scores: missing })),
    ).toEqual({ status: 422, code: 'VALIDATION_FAILED' });
    expect(
      await problemOf(
        service.rate('u1', OCC.code, { scores: { ...FULL, LOOKS: 5 } }),
      ),
    ).toEqual({ status: 422, code: 'VALIDATION_FAILED' });
    expect(create).not.toHaveBeenCalled();
  });

  it('lưu đủ năm điểm và trả số tổng hợp, giấu dưới ngưỡng', async () => {
    const { service, create } = setup({ count: 1 });
    const summary = await service.rate('u1', OCC.code, {
      scores: FULL,
      comment: 'Đúng như mình nghĩ',
    });
    expect(create.mock.calls[0][0].data).toMatchObject({
      explorerId: 'u1',
      occupationId: OCC.id,
      comment: 'Đúng như mình nghĩ',
      scores: {
        create: CODES.map((code) => ({ attributeCode: code, score: 4 })),
      },
    });
    expect(summary).toEqual({ responseCount: 1, withheld: true, averages: {} });
  });

  it('đủ ngưỡng thì công bố điểm trung bình', async () => {
    const summary = await setup({ count: 5 }).service.summary(OCC.id);
    expect(summary.withheld).toBe(false);
    expect(summary.averages).toEqual(
      Object.fromEntries(CODES.map((c) => [c, 3.46])),
    );
  });
});
