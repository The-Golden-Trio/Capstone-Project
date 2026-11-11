/** Tên hàng đợi job. API đẩy job, worker xử lý (CL-00: API và worker chỉ nói qua queue). */
export const QUEUES = {
  /** Một lượt ca làm cần AI: viết lời (AI-4) hay trả lời câu kiểm (bộ phán). */
  turn: 'shift-turn',
} as const;

/** Token tiêm `Queue<TurnJob>` của BullMQ. */
export const TURN_QUEUE = Symbol('TURN_QUEUE');

export interface TurnJob {
  runId: string;
  turnId: string;
}

/** `redis://user:pass@host:port/db` → tuỳ chọn kết nối cho ioredis/BullMQ. */
export function redisOptions(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    ...(u.username ? { username: decodeURIComponent(u.username) } : {}),
    ...(u.password ? { password: decodeURIComponent(u.password) } : {}),
    ...(u.pathname.length > 1 ? { db: Number(u.pathname.slice(1)) } : {}),
    ...(u.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}
