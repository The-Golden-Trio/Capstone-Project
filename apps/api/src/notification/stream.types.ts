/**
 * Tin trên `GET /api/v1/stream` cho màn chơi ca làm. Phần `data` của mỗi tin
 * SSE là một `StreamMessage` dạng JSON; tin có `id` thì trình duyệt gửi lại
 * qua `Last-Event-ID` khi nối lại.
 */
export type StreamMessage =
  | {
      /** Dòng mới của một lượt, ngay khi AI xong một bước. */
      type: 'turn.lines';
      runId: string;
      turnId: string;
      payload: { lines: unknown[] };
    }
  | {
      /** Lượt xong: cảnh mới. */
      type: 'turn.done';
      runId: string;
      turnId: string;
      payload: { scene: unknown; ended: boolean };
    }
  | {
      /** Có sự kiện mới mà kết nối này đã lỡ: tải lại cảnh và lời thoại. */
      type: 'scene.changed';
      runId: string;
      payload: Record<string, never>;
    }
  | {
      /** Nhà cung cấp model chậm hay lỗi, đang thử lại hoặc đổi model. */
      type: 'provider.delay';
      runId: string;
      turnId: string;
      payload: { waitingFor: 'narration' | 'checks' };
    }
  | {
      /** Hết model dùng được: phiên tạm dừng, giữ tiến độ (D-92). */
      type: 'run.paused';
      runId: string;
      turnId: string;
      payload: { reason: string };
    };

/** Gói tin qua Redis: kèm `id` (id `run_event`) nếu tin gắn với một sự kiện đã lưu. */
export interface StreamEnvelope {
  id?: string;
  message: StreamMessage;
}

export const channelOf = (userId: string) => `explorer:${userId}`;
