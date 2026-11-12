/**
 * Luồng sự kiện tới người dùng (CL-07 `StreamService`, SD-01): worker hay API
 * `publish`, màn hình đang mở nhận qua `GET /v1/stream` (SSE).
 *
 * Mỗi sự kiện vừa được ghi vào một Redis Stream của người dùng (giữ ~500 sự
 * kiện gần nhất), vừa được PUBLISH lên kênh của người dùng. Nhờ vậy:
 *   - màn đang mở nhận ngay qua pub/sub;
 *   - mất kết nối rồi nối lại với `Last-Event-ID` thì nhận bù những gì đã lỡ
 *     (hợp đồng `/stream`), không phải poll.
 * `id` của SSE là id của Redis Stream, tăng dần theo thời gian.
 */
import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_URL } from '../core/queues';

/** Phần `data` của một tin SSE (openapi `StreamEvent`). */
export interface StreamEvent {
  type: string;
  runId?: string;
  jobId?: string;
  /** Sự kiện của staff app gắn với một scenario (generation.ready, review.outcome…). */
  scenarioId?: string;
  payload: Record<string, unknown>;
}

export interface DeliveredEvent {
  id: string;
  event: StreamEvent;
}

const KEEP = 500;
const keyOf = (userId: string) => `jq:stream:${userId}`;

@Injectable()
export class StreamService implements OnModuleDestroy {
  private readonly logger = new Logger(StreamService.name);
  private readonly pub: Redis;
  private readonly subscribers = new Set<Redis>();

  constructor(@Inject(REDIS_URL) private readonly url: string) {
    this.pub = new Redis(url, { lazyConnect: true });
  }

  async publish(userId: string, event: StreamEvent): Promise<string> {
    const data = JSON.stringify(event);
    const id = await this.pub.xadd(
      keyOf(userId),
      'MAXLEN',
      '~',
      String(KEEP),
      '*',
      'data',
      data,
    );
    if (!id) throw new Error('Redis không trả id cho sự kiện');
    await this.pub.publish(keyOf(userId), JSON.stringify({ id, data }));
    return id;
  }

  /**
   * Nghe sự kiện của một người dùng. Đăng ký kênh TRƯỚC rồi mới đọc bù, và bỏ
   * tin trùng theo id — không lỡ tin nào rơi vào khe giữa hai bước.
   * Trả hàm huỷ.
   */
  async subscribe(
    userId: string,
    lastEventId: string | null,
    onEvent: (delivered: DeliveredEvent) => void,
  ): Promise<() => Promise<void>> {
    const sub = new Redis(this.url);
    this.subscribers.add(sub);
    let lastSent = lastEventId ?? '';
    let replaying = true;
    const buffered: DeliveredEvent[] = [];

    const deliver = (item: DeliveredEvent) => {
      if (lastSent && compareIds(item.id, lastSent) <= 0) return;
      lastSent = item.id;
      onEvent(item);
    };

    sub.on('message', (_channel: string, message: string) => {
      try {
        const { id, data } = JSON.parse(message) as {
          id: string;
          data: string;
        };
        const item = { id, event: JSON.parse(data) as StreamEvent };
        if (replaying) buffered.push(item);
        else deliver(item);
      } catch (err) {
        this.logger.warn(`Bỏ một tin hỏng trên luồng: ${String(err)}`);
      }
    });
    await sub.subscribe(keyOf(userId));

    if (lastEventId) {
      const missed = await this.pub.xrange(
        keyOf(userId),
        `(${lastEventId}`,
        '+',
      );
      for (const [id, fields] of missed) {
        const data = fields[fields.indexOf('data') + 1];
        if (data) deliver({ id, event: JSON.parse(data) as StreamEvent });
      }
    }
    replaying = false;
    buffered.forEach(deliver);

    return async () => {
      this.subscribers.delete(sub);
      await sub.quit().catch(() => sub.disconnect());
    };
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(
      [...this.subscribers].map((s) => s.quit().catch(() => s.disconnect())),
    );
    await this.pub.quit().catch(() => this.pub.disconnect());
  }
}

/** So id của Redis Stream (`<ms>-<seq>`). */
export function compareIds(a: string, b: string): number {
  const [am, as] = a.split('-').map(Number);
  const [bm, bs] = b.split('-').map(Number);
  return am !== bm ? am - bm : (as ?? 0) - (bs ?? 0);
}
