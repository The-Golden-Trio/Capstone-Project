/**
 * Lọc thứ AI đọc ra từ câu tự luận trước khi nó chạm vào chân dung.
 *
 * AI có thể bịa. Luật ở đây giữ nó trung thực theo cùng cách máy chấm làm
 * (FR-05): mỗi giá trị phải kèm một trích dẫn có thật trong câu trả lời, nếu
 * không thì bỏ. Sau đó kẹp mỗi chiều về ±2 để một câu tự luận không bao giờ
 * nặng hơn một câu chọn "rất đúng".
 */
import type { Signal, TextReading } from '../data/schema.js';

export const TEXT_SIGNAL_CAP = 2;

export interface AcceptedEvidence {
  dimension: string;
  value: number;
  quote: string;
}

export interface AcceptedTextReading {
  signal: Signal;
  /** `null` khi AI không thấy gì về trục Người–Vật, hoặc trích dẫn không có thật. */
  orientation: number | null;
  evidence: AcceptedEvidence[];
}

const normalise = (text: string): string =>
  text.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();

const clamp = (value: number): number =>
  Math.max(-TEXT_SIGNAL_CAP, Math.min(TEXT_SIGNAL_CAP, value));

/** Trích dẫn có thật trong câu trả lời không (bỏ qua hoa thường và khoảng trắng). */
export function quoteFound(answer: string, quote: string): boolean {
  const q = normalise(quote);
  return q.length >= 3 && normalise(answer).includes(q);
}

export function acceptTextReading(
  answer: string,
  reading: TextReading,
  dimensions: readonly string[],
): AcceptedTextReading {
  const known = new Set(dimensions);
  const signal: Signal = {};
  const evidence: AcceptedEvidence[] = [];

  for (const item of reading.signals) {
    if (!known.has(item.dimension)) continue;
    if (!Number.isFinite(item.value) || item.value === 0) continue;
    if (!quoteFound(answer, item.quote)) continue;
    const value = clamp(item.value);
    signal[item.dimension] = clamp((signal[item.dimension] ?? 0) + value);
    evidence.push({ dimension: item.dimension, value, quote: item.quote });
  }

  const o = reading.orientation;
  const orientation =
    o &&
    Number.isFinite(o.value) &&
    o.value !== 0 &&
    quoteFound(answer, o.quote)
      ? clamp(o.value)
      : null;

  return { signal, orientation, evidence };
}
