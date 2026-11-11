/**
 * Lỗi theo RFC 9457 (`Problem` trong openapi.yaml): mỗi lỗi có `code` ổn định
 * để máy khách rẽ nhánh, ví dụ `SCENARIO_UNAVAILABLE`, `ANSWER_INVALID`.
 *
 * Chỉ gắn cho các controller `/v1` (hợp đồng mới). Controller cũ giữ định dạng
 * lỗi mặc định của Nest để không làm hỏng màn hình cũ.
 */
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

export interface ProblemBody {
  type: string;
  title: string;
  status: number;
  code: string;
  detail?: string;
  errors?: Array<{ field?: string; reason: string }>;
}

export class Problem extends HttpException {
  constructor(
    status: number,
    readonly code: string,
    title: string,
    readonly errors?: ProblemBody['errors'],
  ) {
    super(title, status);
  }
}

const CODE_BY_STATUS: Record<number, string> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'ANSWER_INVALID',
};

@Catch()
export class ProblemFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const body = toProblem(exception);
    if (body.status >= 500)
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    res.status(body.status).type('application/problem+json').json(body);
  }
}

export function toProblem(exception: unknown): ProblemBody {
  if (exception instanceof Problem)
    return {
      type: 'about:blank',
      title: exception.message,
      status: exception.getStatus(),
      code: exception.code,
      ...(exception.errors ? { errors: exception.errors } : {}),
    };
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const response = exception.getResponse();
    const message =
      typeof response === 'object' && response && 'message' in response
        ? String((response as { message: unknown }).message)
        : exception.message;
    return {
      type: 'about:blank',
      title: message,
      status,
      code: CODE_BY_STATUS[status] ?? 'HTTP_ERROR',
    };
  }
  return {
    type: 'about:blank',
    title: 'Internal server error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL',
  };
}
