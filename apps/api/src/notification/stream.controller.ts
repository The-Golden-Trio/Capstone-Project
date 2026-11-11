/**
 * `GET /api/v1/stream`: luồng Server-Sent Events của màn chơi ca làm.
 *
 * Trình duyệt mở bằng `fetch` (để gửi được cookie/Bearer) và đọc thân như
 * một luồng. Tin gắn với sự kiện đã lưu có `id`; nối lại với `Last-Event-ID`
 * thì máy chủ báo `scene.changed` cho mỗi lượt có sự kiện bị lỡ, để màn hình
 * tải lại cảnh và lời thoại thay vì mất tin.
 */
import {
  Controller,
  Get,
  Headers,
  Query,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { ProblemFilter } from '../common/problem';
import { PrismaService } from '../prisma/prisma.service';
import { StreamService } from './stream.service';
import type { StreamEnvelope } from './stream.types';

/** Ping giữ kết nối qua proxy và load balancer. */
export const PING_MS = 15_000;

export function sseFrame(envelope: StreamEnvelope): string {
  const id = envelope.id ? `id: ${envelope.id}\n` : '';
  return `${id}data: ${JSON.stringify(envelope.message)}\n\n`;
}

@Controller('v1/stream')
@UseFilters(ProblemFilter)
export class StreamController {
  constructor(
    private readonly stream: StreamService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async open(
    @CurrentUser() user: AuthUser,
    @Headers('last-event-id') lastEventHeader: string | undefined,
    @Query('lastEventId') lastEventQuery: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    res.write(': open\n\n');

    // Đăng ký nghe trước rồi mới replay, để không lọt tin ở giữa hai bước.
    const stop = this.stream.listen(user.id, (envelope) =>
      res.write(sseFrame(envelope)),
    );
    const ping = setInterval(() => res.write(': ping\n\n'), PING_MS);
    req.on('close', () => {
      clearInterval(ping);
      stop();
    });

    const last = lastEventHeader ?? lastEventQuery;
    if (last && /^\d+$/.test(last)) {
      for (const envelope of await this.missed(user.id, BigInt(last)))
        res.write(sseFrame(envelope));
    }
  }

  /** Mỗi lượt có sự kiện sau `lastId`: một tin `scene.changed`, mang id mới nhất. */
  async missed(userId: string, lastId: bigint): Promise<StreamEnvelope[]> {
    const rows = await this.prisma.runEvent.groupBy({
      by: ['runId'],
      where: { id: { gt: lastId }, run: { userId } },
      _max: { id: true },
    });
    return rows
      .flatMap((r) =>
        r._max.id === null ? [] : [{ runId: r.runId, id: r._max.id }],
      )
      .sort((a, b) => (a.id < b.id ? -1 : 1))
      .map((r) => ({
        id: String(r.id),
        message: {
          type: 'scene.changed' as const,
          runId: r.runId,
          payload: {},
        },
      }));
  }
}
