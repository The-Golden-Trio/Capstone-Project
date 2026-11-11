/**
 * `GET /api/v1/stream` (openapi `openEventStream`, CL-07 `StreamController`).
 *
 * Viết SSE bằng tay trên `Response` thay vì `@Sse()`: cần gửi `id` cho
 * `Last-Event-ID`, dòng chú thích giữ kết nối, và dọn đăng ký Redis đúng lúc
 * trình duyệt đóng màn.
 */
import { Controller, Get, Headers, Req, Res, UseFilters } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { ProblemFilter } from './problem';
import { StreamService } from './stream.service';

/** Proxy và trình duyệt cắt kết nối im lặng lâu; 20 s một dòng chú thích là đủ. */
const HEARTBEAT_MS = 20_000;

@Controller('v1/stream')
@UseFilters(ProblemFilter)
export class StreamController {
  constructor(private readonly stream: StreamService) {}

  @Get()
  async open(
    @CurrentUser() user: AuthUser,
    @Headers('last-event-id') lastEventId: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    // Tắt đệm của nginx nếu có đứng trước.
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    res.write(': connected\n\n');

    const unsubscribe = await this.stream.subscribe(
      user.id,
      lastEventId?.trim() || null,
      ({ id, event }) => {
        res.write(
          `id: ${id}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`,
        );
      },
    );
    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);

    req.on('close', () => {
      clearInterval(heartbeat);
      void unsubscribe();
    });
  }
}
