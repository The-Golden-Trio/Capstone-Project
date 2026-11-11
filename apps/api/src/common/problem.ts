/**
 * Lỗi theo RFC 9457 (Problem Details), kèm `code` ổn định — quy ước của
 * `reports/master/api/openapi.yaml`. Chỉ gắn cho các controller `/api/v1`;
 * route prototype `/api/...` giữ dạng lỗi cũ để client cũ không vỡ.
 */
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  type ExceptionFilter,
  type PipeTransform,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ZodType } from 'zod';

export interface ProblemBody {
  type: string;
  title: string;
  status: number;
  code: string;
  detail?: string;
  errors?: Array<{ field?: string; reason?: string }>;
}

export class ProblemException extends HttpException {
  constructor(
    status: number,
    readonly code: string,
    title: string,
    readonly errors?: ProblemBody['errors'],
  ) {
    super(
      {
        type: 'about:blank',
        title,
        status,
        code,
        ...(errors ? { errors } : {}),
      },
      status,
    );
  }
}

const CODE_BY_STATUS: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_FAILED',
  429: 'TOO_MANY_REQUESTS',
};

@Catch()
export class ProblemFilter implements ExceptionFilter {
  private readonly logger = new Logger('Problem');

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (response.headersSent) return;
    const body = toProblem(exception);
    if (body.status >= 500)
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    response.status(body.status).type('application/problem+json').json(body);
  }
}

export function toProblem(exception: unknown): ProblemBody {
  if (exception instanceof ProblemException)
    return exception.getResponse() as ProblemBody;
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const raw = exception.getResponse();
    const message =
      typeof raw === 'string'
        ? raw
        : typeof (raw as { message?: unknown }).message === 'string'
          ? (raw as { message: string }).message
          : exception.message;
    return {
      type: 'about:blank',
      title: message,
      status,
      code: CODE_BY_STATUS[status] ?? `HTTP_${status}`,
    };
  }
  return {
    type: 'about:blank',
    title: 'Lỗi máy chủ',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
  };
}

/** Kiểm đầu vào bằng Zod; sai thì 422 `VALIDATION_FAILED` dạng Problem. */
@Injectable()
export class ZodProblemPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success)
      throw new ProblemException(
        422,
        'VALIDATION_FAILED',
        'Dữ liệu gửi lên không hợp lệ',
        result.error.issues.map((i) => ({
          field: i.path.join('.'),
          reason: i.message,
        })),
      );
    return result.data;
  }
}
