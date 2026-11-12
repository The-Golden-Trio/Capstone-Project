/* Chép từ apps/web/src/play/api/sse.ts. Nợ kỹ thuật: tách thành thư viện dùng chung khi có. */
/**
 * Đọc luồng Server-Sent Events từ thân một `Response` của `fetch`.
 *
 * Không dùng `EventSource` vì nó không gửi được header `Authorization`, mà
 * hợp đồng đặt phiên đăng nhập vào Bearer token (`openapi.yaml`, `/stream`).
 */

export interface SseMessage {
  id: string | null;
  event: string;
  data: string;
}

/**
 * Tách các khối tin đã đủ khỏi bộ đệm. Phần dở dang (chưa có dòng trống kết
 * thúc) được trả lại trong `rest` để ghép với mẩu tới sau.
 */
export function parseSseChunk(buffer: string): {
  messages: SseMessage[];
  rest: string;
} {
  const normalised = buffer.replace(/\r\n?/g, '\n');
  const blocks = normalised.split('\n\n');
  const rest = blocks.pop() ?? '';
  const messages: SseMessage[] = [];

  for (const block of blocks) {
    let id: string | null = null;
    let event = 'message';
    const data: string[] = [];

    for (const line of block.split('\n')) {
      if (line === '' || line.startsWith(':')) continue;
      const colon = line.indexOf(':');
      const field = colon === -1 ? line : line.slice(0, colon);
      let value = colon === -1 ? '' : line.slice(colon + 1);
      if (value.startsWith(' ')) value = value.slice(1);

      if (field === 'id') id = value;
      else if (field === 'event') event = value;
      else if (field === 'data') data.push(value);
    }

    if (data.length > 0) messages.push({ id, event, data: data.join('\n') });
  }

  return { messages, rest };
}

/** Đọc hết một luồng, gọi `onMessage` cho từng tin. Dừng khi `signal` huỷ. */
export async function readSse(
  body: ReadableStream<Uint8Array>,
  onMessage: (message: SseMessage) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    const { messages, rest } = parseSseChunk(buffer);
    buffer = rest;
    messages.forEach(onMessage);
  }
}
