/**
 * Luật máy kiểm lời AI-4 bản 2 (Luật dẫn truyện, Phần C2), chạy TRƯỚC khi
 * người chơi thấy. Bản 2 trả `{beats: [{speaker, text, expression}], question_by}`.
 *
 *   R1  Không bịa: số và tên riêng chỉ lấy từ hồ sơ được giao, lời người chơi.
 *   R2  Tối đa một câu hỏi, ở nhịp cuối, do chính nhân vật đang nói hỏi. Việc
 *       `probe` phải có đúng một câu hỏi. Lời cảnh không hỏi.
 *   R4  Đúng khuôn: JSON đúng schema, ≤ 120 ký tự mỗi nhịp, ≤ số nhịp được
 *       giao, biểu cảm thuộc bộ 8 mã.
 *
 * R3 (không dạy, không khen chê) không kiểm được bằng luật tất định; để log
 * review bằng model khác họ sau khi chơi, như bản 1.
 */
import { z } from 'zod';
import {
  inventedFacts,
  type RuleViolation,
} from '../domain/narration/rules.js';
import { EXPRESSIONS, SCENE_SPEAKER, type Beat } from './schema.js';
import type { NarrateRequest } from './state.js';

export const BEAT_MAX_CHARS = 120;
export const MAX_BEATS = 5;

const OutputSchema = z.object({
  beats: z
    .array(
      z.object({
        speaker: z.string().min(1),
        text: z.string().trim().min(1),
        expression: z.string(),
      }),
    )
    .min(1),
  question_by: z.string().nullable().optional(),
});

/** JSON Schema gửi cho nhà cung cấp hỗ trợ chế độ strict. */
export function shiftNarrationJsonSchema(req: NarrateRequest) {
  const speakers = [...new Set([...req.present, req.slot, SCENE_SPEAKER])];
  return {
    type: 'object',
    additionalProperties: false,
    required: ['beats', 'question_by'],
    properties: {
      beats: {
        type: 'array',
        minItems: 1,
        maxItems: Math.min(req.maxBeats, MAX_BEATS),
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['speaker', 'text', 'expression'],
          properties: {
            speaker: { type: 'string', enum: speakers },
            text: { type: 'string', maxLength: BEAT_MAX_CHARS },
            expression: { type: 'string', enum: [...EXPRESSIONS] },
          },
        },
      },
      question_by: { type: ['string', 'null'] },
    },
  };
}

/** Mọi chữ AI-4 được thấy ở lượt này: nguồn hợp lệ cho số và tên (R1). */
export function visibleTextsOf(req: NarrateRequest): string[] {
  return [
    req.company.name,
    req.company.profile,
    req.profile.name,
    req.profile.want,
    req.profile.pressure,
    req.profile.stance,
    ...req.profile.beliefs,
    ...req.profile.concerns,
    ...req.knownFacts.map((f) => f.text),
    ...req.mayReveal.map((f) => f.text),
    ...req.confirmOnly.map((f) => f.text),
    ...req.recent.map((l) => l.text),
    ...req.limits.not_allowed,
    ...req.limits.need_approval,
    req.scene.time,
    req.hook ?? '',
    req.guidance ?? '',
    req.ambient ?? '',
    req.playerText ?? '',
  ].filter(Boolean);
}

export interface ShiftNarrationCheck {
  beats: Beat[] | null;
  violations: RuleViolation[];
}

const v = (
  rule: RuleViolation['rule'],
  detail: string,
  feedback = detail,
): RuleViolation => ({
  rule,
  detail,
  feedback,
});

function parse(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse((fenced ? fenced[1] : raw).trim());
}

export function checkShiftNarration(
  raw: string,
  req: NarrateRequest,
  finishReason: string,
  castNames: readonly string[] = [],
): ShiftNarrationCheck {
  if (finishReason === 'length')
    return {
      beats: null,
      violations: [
        v(
          'R4',
          'Bị cắt giữa chừng (finish_reason=length)',
          'Câu trả lời bị cắt. Viết ngắn hơn.',
        ),
      ],
    };

  let json: unknown;
  try {
    json = parse(raw);
  } catch {
    return {
      beats: null,
      violations: [
        v('R4', 'Không phải JSON', 'Chỉ trả về đúng một đối tượng JSON.'),
      ],
    };
  }
  const shape = OutputSchema.safeParse(json);
  if (!shape.success)
    return {
      beats: null,
      violations: [
        v(
          'R4',
          `Sai khuôn: ${shape.error.issues[0]?.message ?? ''}`,
          'Trả về đúng khuôn {"beats": [...], "question_by": ...}.',
        ),
      ],
    };

  const beats = shape.data.beats;
  const violations: RuleViolation[] = [];
  const allowedSpeakers = new Set([...req.present, req.slot, SCENE_SPEAKER]);

  /* R4 */
  if (beats.length > Math.min(req.maxBeats, MAX_BEATS))
    violations.push(
      v(
        'R4',
        `${beats.length} nhịp, tối đa ${req.maxBeats}`,
        `Viết tối đa ${req.maxBeats} nhịp.`,
      ),
    );
  for (const b of beats) {
    if (b.text.length > BEAT_MAX_CHARS)
      violations.push(
        v(
          'R4',
          `Nhịp dài ${b.text.length} ký tự`,
          `Mỗi nhịp tối đa ${BEAT_MAX_CHARS} ký tự.`,
        ),
      );
    if (!(EXPRESSIONS as readonly string[]).includes(b.expression))
      violations.push(
        v(
          'R4',
          `Biểu cảm ngoài bộ 8 mã: ${b.expression}`,
          `expression phải thuộc: ${EXPRESSIONS.join(', ')}.`,
        ),
      );
    if (!allowedSpeakers.has(b.speaker))
      violations.push(
        v(
          'R4',
          `Người nói không có mặt: ${b.speaker}`,
          `speaker chỉ được là: ${[...allowedSpeakers].join(', ')}.`,
        ),
      );
  }

  /* R2 */
  const asking = beats
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => b.text.includes('?'));
  if (
    asking.length > 1 ||
    asking.some(({ b }) => (b.text.match(/\?/g) ?? []).length > 1)
  )
    violations.push(
      v('R2', 'Hỏi nhiều hơn một câu', 'Chỉ hỏi tối đa một câu, ở nhịp cuối.'),
    );
  for (const { b, i } of asking) {
    if (i !== beats.length - 1)
      violations.push(
        v(
          'R2',
          'Câu hỏi không ở nhịp cuối',
          'Câu hỏi phải là nhịp cuối, đứng riêng.',
        ),
      );
    if (b.speaker === SCENE_SPEAKER)
      violations.push(
        v('R2', 'Lời cảnh đặt câu hỏi', 'Nhịp "canh" không được hỏi.'),
      );
    else if (b.speaker !== req.slot)
      violations.push(
        v(
          'R2',
          `Người hỏi là ${b.speaker}, không phải ${req.slot}`,
          `Chỉ ${req.slot} được hỏi ở lượt này.`,
        ),
      );
  }
  if (req.task === 'probe' && asking.length !== 1)
    violations.push(
      v(
        'R2',
        'Việc probe phải có đúng một câu hỏi',
        'Việc "probe" phải kết thúc bằng đúng một câu hỏi theo hook.',
      ),
    );

  /* R1 */
  const written = beats.map((b) => b.text.replace(/\{ten\}/g, '')).join('\n');
  const invented = inventedFacts(written, visibleTextsOf(req), [
    ...req.present,
    ...castNames,
  ]);
  if (invented.numbers.length > 0)
    violations.push(
      v(
        'R1',
        `Số không có nguồn: ${invented.numbers.join(', ')}`,
        `Bạn dùng số không có trong hồ sơ hay lời người chơi: ${invented.numbers.join(', ')}. Bỏ số đi.`,
      ),
    );
  if (invented.names.length > 0)
    violations.push(
      v(
        'R1',
        `Tên riêng không có nguồn: ${invented.names.join(', ')}`,
        `Bạn dùng tên không có trong hồ sơ: ${invented.names.join(', ')}. Chỉ dùng tên có sẵn.`,
      ),
    );

  return {
    beats: beats.map((b) => ({
      speaker: b.speaker,
      text: b.text,
      expression: b.expression as Beat['expression'],
    })),
    violations,
  };
}
