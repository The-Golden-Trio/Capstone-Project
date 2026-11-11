import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { z } from 'zod';
import { ProblemException, ZodProblemPipe, toProblem } from './problem';

describe('Problem (RFC 9457)', () => {
  it('giữ nguyên ProblemException, đổi HttpException sang code ổn định', () => {
    expect(
      toProblem(new ProblemException(409, 'TURN_IN_PROGRESS', 'Đang chờ')),
    ).toMatchObject({
      status: 409,
      code: 'TURN_IN_PROGRESS',
      type: 'about:blank',
    });
    expect(toProblem(new UnauthorizedException())).toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });
    expect(toProblem(new NotFoundException('Không có'))).toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      title: 'Không có',
    });
    expect(toProblem(new Error('x'))).toMatchObject({
      status: 500,
      code: 'INTERNAL_ERROR',
    });
  });

  it('lỗi Zod thành 422 VALIDATION_FAILED kèm từng trường', () => {
    const pipe = new ZodProblemPipe(z.object({ text: z.string().min(1) }));
    try {
      pipe.transform({ text: '' });
      throw new Error('không ném lỗi');
    } catch (err) {
      expect(toProblem(err)).toMatchObject({
        status: 422,
        code: 'VALIDATION_FAILED',
        errors: [{ field: 'text' }],
      });
    }
  });
});
