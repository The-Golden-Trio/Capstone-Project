import { describe, expect, it } from 'vitest';
import { parseSseChunk } from './sse';

describe('parseSseChunk', () => {
  it('tách tin đủ, giữ phần dở dang', () => {
    const { messages, rest } = parseSseChunk(
      'id: 7\nevent: answer.graded\ndata: {"a":1}\n\n: ping\n\ndata: {"b"',
    );
    expect(messages).toEqual([
      { id: '7', event: 'answer.graded', data: '{"a":1}' },
    ]);
    expect(rest).toBe('data: {"b"');
  });

  it('ghép nhiều dòng data, chấp nhận CRLF', () => {
    const { messages } = parseSseChunk('data: a\r\ndata: b\r\n\r\n');
    expect(messages[0].data).toBe('a\nb');
  });
});
