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

export interface FakeScript {
  replies: Record<string, Array<{ when: string[]; beats: Beat[] }>>;
  fallbackReplies?: Record<string, Beat[]>;
  probes: Array<{ hook: string; beats: Beat[] }>;
  reactions: Record<string, Beat[]>;
  defer: Beat[];
}

const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Lấy phần câu hỏi trong hook: "…; hỏi em dựa vào đâu…" → "Em dựa vào đâu…?" */
function questionFromHook(hook: string): string {
  const match = hook.match(/hỏi (?:chung )?(.+?)(?:\.|$)/);
  const core = (match?.[1] ?? hook).split(/[.;]/)[0].trim();
  return `${capitalize(core)}?`;
}

export function fakeNarration(
  req: NarrateRequest,
  script?: FakeScript,
): Beat[] {
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
      beats = script?.probes.find((probe) => probe.hook === req.hook)
        ?.beats ?? [
        beat(
          questionFromHook(req.hook ?? 'em nói thêm được không'),
          'suy_nghi',
        ),
      ];
      break;
    case 'reaction':
      beats = (req.node ? script?.reactions[req.node] : undefined) ?? [
        beat('Ừ, để mình coi.'),
      ];
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
      if (req.guidance) {
        beats = script?.defer ?? [beat('Để anh coi kỹ đã.', 'suy_nghi')];
        break;
      }
      const reply = script?.replies[req.slot]?.find((entry) =>
        entry.when.some((phrase) => said.includes(normalizeVi(phrase))),
      );
      const asks =
        /\?|\b(gi|sao|nao|may|bao\s+gio|o\s+dau)\b/.test(said) ||
        /\b(khong|hong|chua|k\s+a)(?:\s+(a|ha|em|anh|chi))?\s*(?:[.!;\n]|$)/.test(
          said,
        );
      beats =
        reply?.beats ??
        (reveal && asks
          ? [beat(reveal.text)]
          : (script?.fallbackReplies?.[req.slot] ?? [beat('Ừ, mình nghe rồi.')]));
      break;
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
      const phrase = normalizeVi(hit);
      const index = scope.indexOf(phrase);
      const clause = [...scope.matchAll(/[^.!?;\n]+/g)].find(
        (part) =>
          part.index <= index &&
          index + phrase.length <= part.index + part[0].length,
      );
      const fields = q.extract.fields;
      const timing =
        closestTiming(
          clause?.[0] ?? scope,
          index - (clause?.index ?? 0),
          phrase.length,
          fields,
          events,
        ) ?? closestTiming(scope, index, phrase.length, fields, events);
      answer.extracted = {
        ...timing,
        ...(fields.includes('channel') &&
        /\b(goi|alo|call)\b/.test(clause?.[0] ?? scope)
          ? { channel: 'call' as const }
          : {}),
      };
    }
    return answer;
  });
}

function closestTiming(
  scope: string,
  index: number,
  length: number,
  fields: ReadonlyArray<'time' | 'event' | 'channel'>,
  events: FakeEventRules,
): { time?: string; event?: string } | undefined {
  const candidates: Array<{
    distance: number;
    timing: { time?: string; event?: string };
  }> = [];
  const distance = (start: number, size: number) =>
    Math.max(index - (start + size), start - (index + length), 0);
  if (fields.includes('time')) {
    const times =
      /\b(\d{1,2})\s*(?::|h|gio)\s*(\d{2})\b|\b(\d{1,2})\s*(?:gio\s*)?ruoi\b/g;
    for (const match of scope.matchAll(times))
      candidates.push({
        distance: distance(match.index, match[0].length),
        timing: { time: `${Number(match[1] ?? match[3])}:${match[2] ?? '30'}` },
      });
  }
  if (fields.includes('event'))
    for (const [event, words] of Object.entries(events))
      for (const word of words) {
        const normalized = normalizeVi(word);
        for (
          let start = scope.indexOf(normalized);
          normalized && start !== -1;
          start = scope.indexOf(normalized, start + normalized.length)
        )
          candidates.push({
            distance: distance(start, normalized.length),
            timing: { event },
          });
      }
  return candidates.sort((a, b) => a.distance - b.distance)[0]?.timing;
}
