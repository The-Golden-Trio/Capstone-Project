/**
 * Circuit breaker cho từng nhà cung cấp.
 *
 * Khi một hãng lỗi liên tục, người chơi kế tiếp không nên phải chờ hết 4,5 s
 * mới biết là lỗi rồi mới được chuyển sang dự phòng. Breaker "ngắt" hãng đó
 * một lúc: mọi lượt gọi đi thẳng sang dự phòng. Hết thời gian ngắt thì cho
 * MỘT lượt thử; thử hỏng là ngắt lại ngay, thử được là đóng mạch.
 */
import { systemClock, type Clock, type GatewayErrorKind, type ProviderId } from './gateway.types';

export interface BreakerOptions {
  /** Hỏng liên tiếp bao nhiêu lần thì ngắt. */
  failureThreshold: number;
  /** Ngắt bao lâu với lỗi tạm thời (quá giờ, quá tải, lỗi máy chủ). */
  cooldownMs: number;
  /** Ngắt bao lâu với lỗi cấu hình (sai key, hết tiền) — thử lại sớm cũng vô ích. */
  configCooldownMs: number;
}

export const DEFAULT_BREAKER: BreakerOptions = {
  failureThreshold: 3,
  cooldownMs: 30_000,
  configCooldownMs: 5 * 60_000,
};

/** Lỗi không nói gì về sức khoẻ của hãng: lỗi của mình, hay nội dung bị lọc. */
const NOT_HEALTH: ReadonlySet<GatewayErrorKind> = new Set(['bad_request', 'content_filtered']);
const CONFIG: ReadonlySet<GatewayErrorKind> = new Set(['auth', 'quota']);

export class CircuitBreaker {
  private readonly state = new Map<ProviderId, { failures: number; openUntil: number }>();

  constructor(
    private readonly clock: Clock = systemClock,
    private readonly options: BreakerOptions = DEFAULT_BREAKER,
  ) {}

  private of(provider: ProviderId) {
    let entry = this.state.get(provider);
    if (!entry) {
      entry = { failures: 0, openUntil: 0 };
      this.state.set(provider, entry);
    }
    return entry;
  }

  isOpen(provider: ProviderId): boolean {
    return this.clock.now() < this.of(provider).openUntil;
  }

  recordSuccess(provider: ProviderId): void {
    this.state.set(provider, { failures: 0, openUntil: 0 });
  }

  recordFailure(provider: ProviderId, kind: GatewayErrorKind): void {
    if (NOT_HEALTH.has(kind)) return;
    const entry = this.of(provider);

    if (CONFIG.has(kind)) {
      entry.openUntil = this.clock.now() + this.options.configCooldownMs;
      return;
    }

    entry.failures += 1;
    if (entry.failures >= this.options.failureThreshold)
      entry.openUntil = this.clock.now() + this.options.cooldownMs;
  }
}
