import type { TranscriptLine } from '../../../api/types';

/**
 * Hình thức sân khấu theo kênh đang trò chuyện. `scene` là cảnh visual novel
 * (gặp trực tiếp, lời dẫn); `call` giữ hộp thoại như `scene` nhưng thay nhân
 * vật đứng bằng màn cuộc gọi; `thread` là khung tin nhắn cho chat 1-1 và
 * nhóm chat.
 */
export type StageForm = 'scene' | 'call' | 'thread';

/** Số tin tối đa hiện trong khung tin nhắn; phần cũ hơn xem ở tấm "Xem lại". */
const THREAD_MAX = 8;

export const isThreadChannel = (channel: TranscriptLine['channel']) =>
  channel === 'chat' || channel === 'group';

export const isBotLine = (line: TranscriptLine, bots: ReadonlySet<string>) =>
  line.kind === 'system' && bots.has(line.speaker);

/** Nhịp đang đọc: tin bot không chiếm chỗ, hộp thoại giữ nhịp trò chuyện trước nó. */
export function conversationBeat(
  shown: readonly TranscriptLine[],
  current: TranscriptLine | null,
  bots: ReadonlySet<string>,
): TranscriptLine | null {
  if (!current || !isBotLine(current, bots)) return current;
  for (let i = shown.length - 1; i >= 0; i--) {
    const line = shown[i];
    if (line.kind === 'npc' || line.kind === 'scene') return line;
  }
  return null;
}

export function stageForm(beat: TranscriptLine | null): StageForm {
  if (beat?.kind !== 'npc') return 'scene';
  if (isThreadChannel(beat.channel)) return 'thread';
  return beat.channel === 'call' ? 'call' : 'scene';
}

/**
 * Các tin của khung tin nhắn, cũ tới mới: đi ngược từ tin mới nhất qua lời
 * NPC, lời người chơi và tin bot, dừng ở lời dẫn cảnh, kênh khác, hoặc khi
 * `context` đổi (cuộc trò chuyện hay nút khác). Hai cuộc chat liền nhau với
 * người khác nhau không gộp một khung; nhóm chat giữ đủ thành viên vì mọi
 * lời trong nhóm chung một `context`. Tin bot không xét `context`.
 * `notice` là tin bot đang hiện thành thẻ thông báo nên không lặp ở đây.
 */
export function threadLines(
  shown: readonly TranscriptLine[],
  bots: ReadonlySet<string>,
  notice: TranscriptLine | null,
): TranscriptLine[] {
  const out: TranscriptLine[] = [];
  let context: string | null = null;
  for (let i = shown.length - 1; i >= 0 && out.length < THREAD_MAX; i--) {
    const line = shown[i];
    if (line === notice) continue;
    if (line.kind === 'scene') break;
    if (line.kind === 'system') {
      if (isBotLine(line, bots)) out.unshift(line);
      continue;
    }
    if (line.channel ? !isThreadChannel(line.channel) : line.kind !== 'player')
      break;
    if (context !== null && line.context !== context) break;
    context = line.context;
    out.unshift(line);
  }
  return out;
}
