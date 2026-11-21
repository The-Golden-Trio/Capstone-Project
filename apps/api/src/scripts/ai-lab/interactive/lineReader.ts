/**
 * Đọc từng dòng từ stdin bằng `node:readline`, phần I/O mỏng của chế độ chơi
 * tay. Dùng bộ lặp bất đồng bộ của readline để dòng gõ (hoặc dán) lúc engine
 * đang xử lý vẫn được giữ lại, không rơi mất như khi dùng `rl.question`.
 */
import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';

export interface LineReader {
  /** In `prompt` rồi chờ một dòng; `null` khi hết đầu vào (EOF, Ctrl+C, Ctrl+D). */
  read(prompt: string): Promise<string | null>;
  close(): void;
}

export function createLineReader(
  input: Readable,
  output: Writable,
): LineReader {
  const rl = createInterface({
    input,
    output,
    terminal: (input as { isTTY?: boolean }).isTTY === true,
  });
  let closed = false;
  rl.on('close', () => (closed = true));
  rl.on('SIGINT', () => rl.close());
  const lines = rl[Symbol.asyncIterator]();
  return {
    async read(prompt) {
      // Stdin dạng pipe có thể đã đóng khi các dòng đã đệm còn chưa đọc hết.
      if (!closed) {
        rl.setPrompt(prompt);
        rl.prompt();
      }
      const next = await lines.next();
      return next.done ? null : next.value;
    },
    close: () => rl.close(),
  };
}
