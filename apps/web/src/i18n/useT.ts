/**
 * Ngôn ngữ đang chọn, và hàm tra chuỗi.
 *
 * Lưu bằng zustand persist thay vì context: ngôn ngữ đọc được cả ở ngoài cây
 * React (ví dụ khi dựng thông báo lỗi), và không phải bọc thêm provider nào.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DIMENSION_EN,
  QUIZ_OPTION_EN,
  QUIZ_PROMPT_EN,
} from './gameContent';
import { translate, type Language, type MessageKey } from './messages';

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      // Người dùng thật là học sinh THPT Việt Nam, nên tiếng Việt là mặc định.
      language: 'vi',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'vaonghe.lang.v1' },
  ),
);

export type Translate = (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string;

/** Hàm dịch chuỗi giao diện, gắn với ngôn ngữ đang chọn. */
export function useT(): Translate {
  const language = useLanguageStore((s) => s.language);
  return (key, vars) => translate(key, language, vars);
}

export const useLanguage = (): Language =>
  useLanguageStore((s) => s.language);

/**
 * Nội dung lấy từ bộ dữ liệu: trả bản tiếng Anh nếu có, không thì giữ nguyên
 * tiếng Việt gốc. Nhờ vậy thêm bản dịch chỉ là thêm dòng vào `gameContent.ts`.
 */
export function useGameText() {
  const language = useLanguageStore((s) => s.language);
  const pick = (table: Record<string, string>, id: string, fallback: string) =>
    language === 'en' ? (table[id] ?? fallback) : fallback;

  return {
    dimension: (key: string, fallback: string) =>
      pick(DIMENSION_EN, key, fallback),
    quizPrompt: (questionId: string, fallback: string) =>
      pick(QUIZ_PROMPT_EN, questionId, fallback),
    quizOption: (optionId: string, fallback: string) =>
      pick(QUIZ_OPTION_EN, optionId, fallback),
    /** Nội dung kịch bản chưa có bản tiếng Anh — dùng để hiện ghi chú. */
    scenariosAreVietnameseOnly: language === 'en',
  };
}
