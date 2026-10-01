/**
 * Hai việc AI làm cho Get to Know Me, tách thành giao diện để thay được:
 *
 *   - đọc câu tự luận ra tín hiệu 8 chiều và trục Người–Vật (kèm trích dẫn)
 *   - viết đoạn mô tả người chơi (FR-13)
 *
 * Cả hai được phép trả `null` — chưa cấu hình AI, lỗi mạng, quá giờ, bị từ
 * chối. Tầng dịch vụ coi `null` là "chưa làm được" và có đường lui riêng:
 * câu tự luận để đọc sau, đoạn mô tả viết bằng khuôn cố định.
 */
import type { SocialLabel, TextReading } from '@datn/game-core';

export interface TextToRead {
  questionId: string;
  prompt: string;
  /** Các chiều câu hỏi được soạn để làm lộ ra — chỉ là gợi ý. */
  probes: string[];
  text: string;
}

export interface QuizTextReader {
  /** Theo `questionId`. `null` khi chưa đọc được. */
  read(input: {
    dimensions: Record<string, string>;
    answers: TextToRead[];
  }): Promise<Record<string, TextReading> | null>;
}

export type PortraitLocale = 'vi' | 'en';

/**
 * Những gì được phép đưa cho người viết mô tả. Cố ý KHÔNG có tên, email hay
 * ngày sinh (NFR-05): mô tả chỉ cần biết người chơi làm việc ra sao.
 */
export interface PortraitFacts {
  locale: PortraitLocale;
  stage: string | null;
  /** Chiều mạnh nhất trước, kèm mô tả và điểm. */
  strengths: Array<{ dimension: string; description: string; value: number }>;
  /** Chiều âm nhất trước. */
  aversions: Array<{ dimension: string; description: string; value: number }>;
  social: { value: number; label: SocialLabel } | null;
  topRoles: string[];
  texts: Array<{ prompt: string; text: string }>;
}

export interface WrittenDescription {
  text: string;
  model: string;
}

export interface DescriptionWriter {
  write(facts: PortraitFacts): Promise<WrittenDescription | null>;
}

/** Một AI làm cả hai việc. */
export type PortraitAi = QuizTextReader & DescriptionWriter;

/** Token tiêm `PortraitAi | null` — `null` khi chưa cấu hình khoá. */
export const PORTRAIT_AI = Symbol('PORTRAIT_AI');
