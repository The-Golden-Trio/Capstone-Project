/**
 * AI giả, tất định: dùng cho test, bản demo trong trình duyệt và chế độ
 * `AI_MODE=fake` của máy chủ khi dev.
 *
 * KHÔNG phải đường thay thế khi chạy thật (D-92): máy chủ chỉ cho bật ở môi
 * trường dev. Bộ phán giả khớp cụm từ khai sẵn cho từng seed, đủ để chạy
 * trọn luồng và kiểm luật engine, không đủ để chấm hay quyết điều gì thật.
 */
import { normalizeVi } from '../../domain/format.js';
import type { Beat } from '../schema.js';
import type { CheckAnswer, CheckRequest, NarrateRequest } from '../state.js';

/** Cụm từ làm bộ phán giả trả "có", theo cờ. */
export type FakeCheckRules = Record<string, string[]>;

/** Cụm từ để đoán sự kiện mà lời hứa gắn vào. */
export type FakeEventRules = Record<string, string[]>;

const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Lấy phần câu hỏi trong hook: "…; hỏi em dựa vào đâu…" → "Em dựa vào đâu…?" */
function questionFromHook(hook: string): string {
  const match = hook.match(/hỏi (?:chung )?(.+?)(?:\.|$)/);
  const core = (match?.[1] ?? hook).split(/[.;]/)[0].trim();
  return `${capitalize(core)}?`;
}

export function fakeNarration(req: NarrateRequest): Beat[] {
  const beat = (
    text: string,
    expression: Beat['expression'] = 'binh_thuong',
  ): Beat => ({
    speaker: req.slot,
    text,
    expression,
  });
  let beats: Beat[];
  switch (req.task) {
    case 'probe':
      beats = [
        beat(
          questionFromHook(req.hook ?? 'em nói thêm được không'),
          'suy_nghi',
        ),
      ];
      break;
    case 'reaction':
      beats = [beat('Ừ, để mình coi.')];
      break;
    case 'bridge':
      beats = [
        {
          speaker: 'canh',
          text: 'Bạn quay lại việc đang làm.',
          expression: 'binh_thuong',
        },
      ];
      break;
    default: {
      const said = normalizeVi(req.playerText ?? '');
      const reveal = req.mayReveal[0];
      if (req.guidance) beats = [beat('Để anh coi kỹ đã.', 'suy_nghi')];
      else if (reveal && said.length > 0) beats = [beat(reveal.text)];
      else beats = [beat('Ừ, mình nghe rồi.')];
    }
  }
  return beats.slice(0, Math.max(1, req.maxBeats));
}

export function fakeChecks(
  req: CheckRequest,
  rules: FakeCheckRules,
  events: FakeEventRules = {},
): CheckAnswer[] {
  const scope = normalizeVi(req.scope);
  return req.questions.map((q) => {
    const phrases = rules[q.flag] ?? [];
    const hit = phrases.find((p) => scope.includes(normalizeVi(p)));
    if (!hit) return { flag: q.flag, answer: 'no' as const };
    const answer: CheckAnswer = { flag: q.flag, answer: 'yes', quote: hit };
    if (q.extract) {
      const time = req.scope.match(/\b(\d{1,2})\s*(?::|h|giờ)\s*(\d{2})\b/i);
      const half = req.scope.match(/\b(\d{1,2})\s*(?:giờ\s*)?rưỡi/i);
      const event = Object.entries(events).find(([, words]) =>
        words.some((w) => scope.includes(normalizeVi(w))),
      )?.[0];
      answer.extracted = {
        ...(time
          ? { time: `${Number(time[1])}:${time[2]}` }
          : half
            ? { time: `${Number(half[1])}:30` }
            : event
              ? { event }
              : {}),
        ...(/\b(goi|alo|call)\b/.test(scope)
          ? { channel: 'call' as const }
          : {}),
      };
    }
    return answer;
  });
}
