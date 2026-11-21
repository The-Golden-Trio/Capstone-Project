/**
 * Khử định danh các đoạn bằng chứng trước khi gửi ra nhà cung cấp (DC-03).
 *
 * Khử cả lời NPC: nhân vật hay gọi người chơi bằng tên. Câu trích của judge
 * được so với chữ ĐÃ khử (đúng cái model nhận), nên service dùng đoạn đã khử
 * cho cả prompt lẫn bước kiểm.
 */
import {
  deidentify,
  type Deidentified,
  type KnownIdentity,
  type shift,
} from '@datn/game-core';

export function deidentifySegments(
  segments: readonly shift.EvidenceSegment[],
  identity?: KnownIdentity,
): {
  segments: shift.EvidenceSegment[];
  redactions: Deidentified['redactions'];
} {
  const redactions: Deidentified['redactions'] = {};
  const clean = (text: string): string => {
    const out = deidentify(text, identity);
    for (const [kind, n] of Object.entries(out.redactions) as Array<
      [keyof Deidentified['redactions'], number]
    >)
      redactions[kind] = (redactions[kind] ?? 0) + n;
    return out.text;
  };

  const sanitized = segments.map((segment): shift.EvidenceSegment => ({
    ...segment,
    entries: segment.entries.map((e): shift.EvidenceEntry => {
      if (e.role !== 'player') return { ...e, text: clean(e.text) };
      const { turn } = e;
      if (turn.kind === 'action') return e;
      if (turn.parts) {
        const parts = turn.parts.map((p) => ({
          label: p.label,
          text: clean(p.text),
        }));
        return {
          role: 'player',
          turn: { ...turn, parts, text: parts.map((p) => p.text).join('\n') },
        };
      }
      return { role: 'player', turn: { ...turn, text: clean(turn.text) } };
    }),
  }));
  return { segments: sanitized, redactions };
}
