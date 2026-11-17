import type { QuizAnswers, QuizForm } from '../../api/types';

export interface QuizDraft {
  phase: 'intro' | 'cards' | 'about';
  index: number;
  answers: QuizAnswers;
}
export const emptyDraft = (): QuizDraft => ({
  phase: 'intro',
  index: 0,
  answers: { cards: {}, interests: [], goals: {} },
});

/** Chỉ khôi phục dữ liệu còn có trong form hiện hành, không tin dữ liệu lưu cũ. */
export function parseDraft(raw: string | null, form: QuizForm): QuizDraft {
  const fresh = emptyDraft();
  try {
    const data = JSON.parse(raw ?? 'null');
    if (!data || typeof data !== 'object') return fresh;
    for (const card of form.cards) {
      const value = data.answers?.cards?.[card.id];
      if (value === 1 || value === 2 || value === 3)
        fresh.answers.cards[card.id] = value;
    }
    fresh.answers.interests = form.interests
      .filter(
        (v) =>
          Array.isArray(data.answers?.interests) &&
          data.answers.interests.includes(v),
      )
      .slice(0, 5);
    for (const goal of form.goals) {
      const saved = data.answers?.goals?.[goal.id];
      fresh.answers.goals[goal.id] = {
        picked: goal.options.filter(
          (v) => Array.isArray(saved?.picked) && saved.picked.includes(v),
        ),
        note: typeof saved?.note === 'string' ? saved.note.slice(0, 500) : '',
      };
    }
    const missing = form.cards.findIndex(
      (c) => fresh.answers.cards[c.id] === undefined,
    );
    fresh.index = Number.isInteger(data.index)
      ? Math.min(Math.max(0, data.index), Math.max(0, form.cards.length - 1))
      : 0;
    fresh.phase =
      data.phase === 'about' && missing === -1
        ? 'about'
        : data.phase === 'cards' || data.phase === 'about'
          ? 'cards'
          : 'intro';
    if (missing !== -1 && (data.phase === 'about' || missing < fresh.index))
      fresh.index = missing;
    return fresh;
  } catch {
    return fresh;
  }
}

export function toggleChoice(
  values: string[],
  value: string,
  max = Infinity,
): string[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : values.length < max
      ? [...values, value]
      : values;
}

/** Bản nháp C4, chờ người có chuyên môn đọc duyệt; không phải công cụ chẩn đoán. */
const DISTRESS_DRAFT = [
  'tu tu',
  'tu sat',
  'muon chet',
  'khong muon song',
  'het muon song',
  'chet cho xong',
  'bien mat mai mai',
  'tu lam dau',
  'tu hai',
  'rach tay',
  'cat tay',
  'tram cam',
  'bat nat',
  'bao hanh',
  'k muon song',
  'ko muon song',
  'hong muon song',
  'mun chet',
];
export function hasDistressSignal(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return DISTRESS_DRAFT.some((term) => ` ${normalized} `.includes(` ${term} `));
}

/** Nguyên văn lời nhắn ở khối C · “Chi tiết: an toàn, giữ đơn giản”. */
export const DISTRESS_MESSAGE =
  'Có vẻ dạo này bạn đang có chuyện khó. Bạn không phải tự gánh một mình đâu. Nếu muốn nói chuyện với ai đó, bạn có thể gọi Tổng đài 111, miễn phí, 24/24.';
