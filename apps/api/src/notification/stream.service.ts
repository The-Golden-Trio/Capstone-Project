/**
 * Đẩy tin tới các màn đang mở, qua Redis pub/sub (CL-07 NotificationModule).
 *
 * Worker chỉ `publish`. API giữ một kết nối `psubscribe` chung cho mọi người
 * chơi, mở lần đầu có người nghe, rồi chia tin tới đúng các kết nối SSE.
 */
import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import type { Env } from '../config/env';
import { redisOptions } from '../core/queues';
import { channelOf, type StreamEnvelope } from './stream.types';

type Listener = (envelope: StreamEnvelope) => void;

@Injectable()
export class StreamService implements OnModuleDestroy {
  private readonly logger = new Logger(StreamService.name);
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private readonly listeners = new Map<string, Set<Listener>>();

  constructor(private readonly config: ConfigService<Env, true>) {}

  private client(): Redis {
    return new Redis({
      ...redisOptions(this.config.get('REDIS_URL', { infer: true })),
      lazyConnect: false,
      maxRetriesPerRequest: null,
    });
  }

  async publish(userId: string, envelope: StreamEnvelope): Promise<void> {
    this.publisher ??= this.client();
    await this.publisher.publish(channelOf(userId), JSON.stringify(envelope));
  }

  /** Nghe tin của một người chơi. Trả hàm huỷ. */
  listen(userId: string, listener: Listener): () => void {
    this.ensureSubscribed();
    const set = this.listeners.get(userId) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(userId, set);
    return () => {
      set.delete(listener);
      if (set.size === 0) this.listeners.delete(userId);
    };
  }

  private ensureSubscribed(): void {
    if (this.subscriber) return;
    const sub = this.client();
    this.subscriber = sub;
    sub.on('pmessage', (_pattern: string, channel: string, raw: string) => {
      const userId = channel.slice(channel.indexOf(':') + 1);
      const set = this.listeners.get(userId);
      if (!set) return;
      let envelope: StreamEnvelope;
      try {
        envelope = JSON.parse(raw) as StreamEnvelope;
      } catch {
        return;
      }
      for (const listener of set) listener(envelope);
    });
    sub.on('error', (err: Error) => this.logger.warn(`Redis: ${err.message}`));
    void sub
      .psubscribe(channelOf('*'))
      .catch((err: Error) => this.logger.error(err.message));
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(
      [this.publisher, this.subscriber]
        .filter((c): c is Redis => c !== null)
        .map((c) => c.quit().catch(() => undefined)),
    );
  }
}
