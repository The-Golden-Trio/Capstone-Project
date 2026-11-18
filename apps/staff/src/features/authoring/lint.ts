/**
 * Gợi ý soạn theo research, chạy ở client trên `ScenarioContent` đang sửa.
 * Chỉ là gợi ý, không chặn nộp; luật bắt buộc nằm ở `ContentValidator` của
 * máy chủ. Mỗi gợi ý chỉ dựa trên trường đã có, không suy ra trường mới.
 */
import type { ScenarioContent } from '../../api/types';

export type HintSeverity = 'warn' | 'info';

export interface Hint {
  id: string;
  /** Đường dẫn tới chỗ cần sửa, dạng `activities[1].items[0]`. */
  path: string;
  message: string;
  source: string;
  severity: HintSeverity;
}

export type EditorTab =
  'intro' | 'cast' | 'activities' | 'events' | 'endings' | 'sideQuests';

/** Tab của editor chứa đường dẫn `path`. */
export function tabOfPath(path: string): EditorTab {
  if (path.startsWith('cast')) return 'cast';
  if (path.startsWith('activities')) return 'activities';
  if (path.startsWith('randomEvents')) return 'events';
  if (path.startsWith('endings')) return 'endings';
  if (path.startsWith('sideQuests')) return 'sideQuests';
  return 'intro';
}

/** Chỉ số activity trong `path`, nếu có. */
export function activityIndexOfPath(path: string): number | null {
  const m = /^activities\[(\d+)\]/.exec(path);
  return m ? Number(m[1]) : null;
}

/** Tách câu theo dấu kết câu; đủ dùng cho gợi ý, không phải phân tích ngôn ngữ. */
export function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const wordCount = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const CLOSED = ['CHOICE', 'ORDERING', 'PRIORITIZING'] as const;
const KNOWLEDGE_QUESTION =
  /(là gì|tên là gì|tên gì|định nghĩa|nghĩa là gì|viết tắt của)\s*\??\s*$/i;
const BEAT_MAX = 120;
const ANCHOR_MIN_WORDS = 6;

export function lintContent(content: ScenarioContent): Hint[] {
  const out: Hint[] = [];
  const push = (h: Hint) => out.push(h);

  const situation = content.situation?.trim() ?? '';
  if (situation) {
    const n = sentencesOf(situation).length;
    if (n < 2 || n > 4)
      push({
        id: 'SITUATION_LENGTH',
        path: 'situation',
        message: `Tình huống đang có ${n} câu; nên 2–4 câu bằng lời thường.`,
        source: 'Seed §B1',
        severity: 'info',
      });
  }

  const cast = content.cast ?? [];
  if (cast.length < 2 || cast.length > 6)
    push({
      id: 'CAST_COUNT',
      path: 'cast',
      message: `Màn có ${cast.length} NPC; nên khai 2–6 vai.`,
      source: 'Seed §C1',
      severity: 'warn',
    });
  cast.forEach((m, i) => {
    if (!m.pressure?.trim())
      push({
        id: 'CAST_PRESSURE',
        path: `cast[${i}]`,
        message: `NPC “${m.name || m.npcKey}” chưa có áp lực: NPC muốn gì, đang bị ép gì?`,
        source: 'Seed §C1 · điểm kiểm 6',
        severity: 'info',
      });
  });

  const acts = content.activities;
  if (!acts.some((a) => a.allowedTypes.some((t) => t !== 'FREE_TEXT')))
    push({
      id: 'NO_CLOSED_FORMAT',
      path: 'activities',
      message:
        'Chưa activity nào cho phép dạng đóng; mỗi màn nên có ít nhất một.',
      source: 'Seed §D3',
      severity: 'info',
    });

  acts.forEach((a, i) => {
    const at = `activities[${i}]`;
    const label = `Activity ${a.key}`;

    if (!a.forwardTo && !a.allowedTypes.includes('FREE_TEXT'))
      push({
        id: 'END_WRITTEN',
        path: at,
        message: `${label} là activity kết nhưng không cho phép tự luận; nút kết luôn là dạng viết.`,
        source: 'Seed §D3',
        severity: 'warn',
      });

    const prompt = a.inputPrompt.trim();
    if (prompt && KNOWLEDGE_QUESTION.test(prompt))
      push({
        id: 'KNOWLEDGE_QUESTION',
        path: `${at}.inputPrompt`,
        message: `${label}: câu hỏi trông như hỏi kiến thức; nên hỏi cách xử lý (“bạn làm gì?”).`,
        source: 'Seed §1',
        severity: 'info',
      });

    if (a.jobScope.trim() && !/không/i.test(a.jobScope))
      push({
        id: 'JOB_SCOPE_LIMITS',
        path: `${at}.jobScope`,
        message: `${label}: phạm vi mới ghi điều được làm; thêm điều cần xin duyệt hoặc không được làm.`,
        source: 'Seed §A2',
        severity: 'info',
      });

    for (const field of ['npcLine', 'closingLine'] as const) {
      const text = a[field]?.trim() ?? '';
      if (!text) continue;
      const ss = sentencesOf(text);
      const name = field === 'npcLine' ? 'Lời NPC' : 'Câu chốt';
      if (
        field === 'npcLine' &&
        text.includes('?') &&
        !ss[ss.length - 1]?.endsWith('?')
      )
        push({
          id: 'QUESTION_LAST',
          path: `${at}.${field}`,
          message: `${label}: ${name} có câu hỏi nhưng không đặt ở cuối.`,
          source: 'Seed §C3',
          severity: 'info',
        });
      if (ss.some((s) => s.length > BEAT_MAX))
        push({
          id: 'BEAT_TOO_LONG',
          path: `${at}.${field}`,
          message: `${label}: ${name} có câu dài hơn ${BEAT_MAX} ký tự; chia thành nhịp ngắn.`,
          source: 'Luật R4 (số tạm)',
          severity: 'info',
        });
    }

    const closed = a.allowedTypes.filter((t) =>
      (CLOSED as readonly string[]).includes(t),
    );
    const items = a.items ?? [];
    if (closed.length > 0) {
      items.forEach((it, j) => {
        if (!(it.why ?? it.note ?? '').trim())
          push({
            id: 'ITEM_REASON',
            path: `${at}.items[${j}]`,
            message: `${label}: mục ${it.key} chưa có lý do / ghi chú.`,
            source: 'Luật A6',
            severity: 'warn',
          });
      });
      if (a.allowedTypes.includes('CHOICE')) {
        const missing = items.filter((it) => it.score === undefined);
        if (missing.length)
          push({
            id: 'CHOICE_SCORE_MISSING',
            path: `${at}.items`,
            message: `${label}: ${missing.length} phương án chưa có điểm.`,
            source: 'Seed §E1',
            severity: 'warn',
          });
        else if (
          items.length >= 2 &&
          (!items.some((it) => it.score === 2) ||
            !items.some((it) => it.score === 0))
        )
          push({
            id: 'CHOICE_PROFILE',
            path: `${at}.items`,
            message: `${label}: phương án nên có ít nhất một mục 2 điểm và một mục 0 điểm.`,
            source: 'Seed §E1',
            severity: 'info',
          });
      }
    }

    a.rubric.forEach((r, j) => {
      const short = (['anchor2', 'anchor1', 'anchor0'] as const).filter(
        (f) => r[f].trim() && wordCount(r[f]) < ANCHOR_MIN_WORDS,
      );
      if (short.length)
        push({
          id: 'ANCHOR_SHORT',
          path: `${at}.rubric[${j}]`,
          message: `${label}: mốc ${short.map((f) => f.slice(-1)).join(', ')} quá ngắn; viết bằng hành vi quan sát được.`,
          source: 'Seed §E1 · điểm kiểm 4',
          severity: 'warn',
        });
    });
  });

  content.endings.forEach((e, i) => {
    if (e.type === 'SECRET' && !e.extraBehaviour?.trim())
      push({
        id: 'SECRET_BEHAVIOUR',
        path: `endings[${i}]`,
        message: 'Kết cục bí mật chưa ghi hành vi mở khoá.',
        source: 'điểm kiểm 9',
        severity: 'warn',
      });
  });

  return out;
}

/** Đếm gợi ý theo tab của editor. */
export function countByTab(hints: Hint[]): Record<EditorTab, number> {
  const counts: Record<EditorTab, number> = {
    intro: 0,
    cast: 0,
    activities: 0,
    events: 0,
    endings: 0,
    sideQuests: 0,
  };
  for (const h of hints) counts[tabOfPath(h.path)]++;
  return counts;
}
