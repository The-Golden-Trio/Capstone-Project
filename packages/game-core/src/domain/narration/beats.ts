/**
 * Contract AI-4 theo nhịp (D-130; Luật dẫn truyện phần C, bản 3 ngày 5/11).
 *
 * Engine quyết chuyện gì xảy ra, ai nói, khi nào hỏi; AI-4 chỉ viết chữ cho
 * đúng một trong bốn việc engine giao:
 *
 *   reply     NPC đáp trong pha, hoặc đáp sau câu trả lời probe (E4)
 *   bridge    lời nối sang một nút
 *   reaction  đáp một lựa chọn, viết lại lời theo `reaction` của seed (A6)
 *   probe     NPC hỏi theo `hook` engine đã chọn (A7)
 *
 * Trả về `{beats: [{speaker, text, expression}], question_by}`. Bốn luật máy
 * kiểm, sửa từ R1–R4 của bản 1:
 *
 *   R1  Tên và con số chỉ lấy từ những gì engine gửi: thẻ nhân vật (gồm dữ
 *       kiện slot biết), hồ sơ công ty, màn, lời người chơi, ambient được giao.
 *   R2  Tối đa một câu hỏi, ở nhịp cuối, do nhân vật engine giao hỏi. Task
 *       probe phải có đúng một câu hỏi. Lời cảnh không hỏi. Engine tắt hỏi thì
 *       không hỏi.
 *   R3  Không dạy, không chấm: không lặp lại nội dung ẩn (rubric, `observes`,
 *       `signs`, khúc mắc `hold_until` chưa tới, dữ kiện slot không biết, nút
 *       chưa tới), không dùng cụm khen chê người chơi (`VERDICT_PHRASES`).
 *   R4  Đúng khuôn: JSON đúng schema, mỗi nhịp ≤ 120 ký tự, tối đa 5 nhịp (số
 *       tạm; engine được giao ít hơn), người nói là nhân vật có mặt hoặc lời
 *       cảnh. Biểu cảm ngoài bộ 8 mã không bắt viết lại: engine ép về
 *       `binh_thuong` (Seed C3 "sai thì về bình thường", E8).
 *
 * "Không nêu cách giải" bằng lời khác (phần còn lại của R3) và 13 luật cách
 * viết không máy nào kiểm: dặn trong prompt, đo bằng bộ thử và log review.
 */
import { z } from 'zod';
import type { RuleId, RuleViolation } from './rules.js';
import {
  inventedNumbers,
  leakedNgrams,
  parseJson,
  questionMarks,
  unknownNames,
  verdictPhrases,
} from './textChecks.js';

export type NarrationTask = 'reply' | 'bridge' | 'reaction' | 'probe';
export const NARRATION_TASKS: readonly NarrationTask[] = [
  'reply',
  'bridge',
  'reaction',
  'probe',
];

/** Bộ 8 biểu cảm có asset (Seed C3, lint A5). */
export const EXPRESSIONS = [
  'binh_thuong',
  'vui',
  'cuoi_lon',
  'ngac_nhien',
  'suy_nghi',
  'lo_lang',
  'kho_chiu',
  'buon',
] as const;
export type Expression = (typeof EXPRESSIONS)[number];

/** `speaker` của lời cảnh: ngôi thứ hai, không biểu cảm, không bao giờ hỏi. */
export const SCENE_SPEAKER = 'canh';

/** Mỗi nhịp một ý, 1–2 câu, khoảng hai dòng hộp thoại (C3, R4). */
export const BEAT_MAX_CHARS = 120;

/** Tối đa nhịp mỗi lượt. Luật dẫn truyện ghi "số tạm"; chốt sau khi đo. */
export const BEATS_MAX = 5;

export const BeatSchema = z
  .object({
    speaker: z.string().min(1),
    text: z.string().trim().min(1).max(BEAT_MAX_CHARS),
    expression: z.enum(EXPRESSIONS).nullable(),
  })
  .strict();

export const BeatsOutputSchema = z
  .object({
    beats: z.array(BeatSchema).min(1).max(BEATS_MAX),
    question_by: z.string().min(1).nullable(),
  })
  .strict();

export type Beat = z.infer<typeof BeatSchema>;
export type BeatsOutput = z.infer<typeof BeatsOutputSchema>;

/**
 * Cùng khuôn ấy, dạng JSON Schema gửi nhà cung cấp hỗ trợ strict. `speaker`
 * và `question_by` là enum các slot có mặt, nên model không bịa được người nói.
 */
export function beatsJsonSchema(
  speakers: readonly string[],
  maxBeats: number = BEATS_MAX,
) {
  return {
    type: 'object',
    properties: {
      beats: {
        type: 'array',
        minItems: 1,
        maxItems: maxBeats,
        items: {
          type: 'object',
          properties: {
            speaker: { type: 'string', enum: [...speakers, SCENE_SPEAKER] },
            text: { type: 'string', maxLength: BEAT_MAX_CHARS },
            expression: {
              type: ['string', 'null'],
              enum: [...EXPRESSIONS, null],
            },
          },
          required: ['speaker', 'text', 'expression'],
          additionalProperties: false,
        },
      },
      question_by: { type: ['string', 'null'], enum: [...speakers, null] },
    },
    required: ['beats', 'question_by'],
    additionalProperties: false,
  } as const;
}

export interface BeatsCheckContext {
  task: NarrationTask;
  /** Nhân vật engine giao lượt này; với probe là `by` (A7). Chỉ người này được hỏi. */
  lead: string;
  /** Slot có mặt và có thẻ trong prompt: những người được phép nói. */
  speakers: readonly string[];
  /** Engine cho hỏi ở lượt này không. Probe luôn hỏi, bỏ qua cờ này. */
  questionAllowed: boolean;
  /** Engine giao tối đa bao nhiêu nhịp (≤ `BEATS_MAX`), ví dụ 1 nhịp trước `approval_line`. */
  maxBeats: number;
  /** Mọi chữ gửi cho AI-4: thẻ, công ty, màn, cảnh, lượt gần nhất, ambient, hook, lời người chơi. */
  visibleTexts: readonly string[];
  /** Mọi chữ AI-4 không được nói ra (R3). Engine gom. */
  hiddenTexts: readonly string[];
  finishReason: string;
}

export interface BeatsCheck {
  output: BeatsOutput | null;
  violations: RuleViolation[];
}

const violation = (
  rule: RuleId,
  detail: string,
  feedback = detail,
): RuleViolation => ({ rule, detail, feedback });

/* ── R4 ────────────────────────────────────────────────────────────── */

const isExpression = (value: unknown): value is Expression =>
  typeof value === 'string' &&
  (EXPRESSIONS as readonly string[]).includes(value);

/**
 * Ép biểu cảm trước khi kiểm khuôn (E8, Seed C3). Lời cảnh không có mặt người
 * nên luôn là null; nhịp nhân vật thiếu hay sai mã thì về `binh_thuong`. Viết
 * lại cả lượt chỉ vì một mặt là mất vài giây của người chơi, trong khi mặt
 * bình thường không làm sai nội dung. Gặp lần đầu khi gọi thật 11/11/2026:
 * Qwen ở chế độ `json_object` để null cho nhịp câu hỏi.
 */
function forceExpressions(parsed: unknown): unknown {
  const beats = (parsed as { beats?: unknown })?.beats;
  if (!Array.isArray(beats)) return parsed;
  return {
    ...(parsed as object),
    beats: beats.map((b: unknown) => {
      if (!b || typeof b !== 'object') return b;
      const beat = b as Record<string, unknown>;
      if (beat['speaker'] === SCENE_SPEAKER)
        return { ...beat, expression: null };
      return isExpression(beat['expression'])
        ? beat
        : { ...beat, expression: 'binh_thuong' };
    }),
  };
}

function checkShape(raw: string, ctx: BeatsCheckContext): BeatsCheck {
  if (ctx.finishReason === 'length')
    return {
      output: null,
      violations: [
        violation(
          'R4',
          'Bị cắt giữa chừng vì chạm giới hạn token đầu ra',
          'Câu trả lời quá dài nên bị cắt. Viết ít nhịp hơn, mỗi nhịp ngắn hơn.',
        ),
      ],
    };
  if (raw.trim() === '')
    return {
      output: null,
      violations: [
        violation(
          'R4',
          'Nhà cung cấp trả về nội dung rỗng',
          'Bạn chưa trả về gì. Trả về đúng một đối tượng json.',
        ),
      ],
    };

  let parsed: unknown;
  try {
    parsed = parseJson(raw);
  } catch {
    return {
      output: null,
      violations: [
        violation(
          'R4',
          'Không phải JSON hợp lệ',
          'Kết quả không phải json hợp lệ. Chỉ trả về đúng một đối tượng json.',
        ),
      ],
    };
  }

  const result = BeatsOutputSchema.safeParse(forceExpressions(parsed));
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.') || '(gốc)'}: ${i.message}`)
      .join('; ');
    return {
      output: null,
      violations: [
        violation(
          'R4',
          `Sai schema — ${issues}`,
          `Json sai khuôn (${issues}). Đúng khuôn: {"beats": [{"speaker", "text", "expression"}], "question_by"}; mỗi nhịp tối đa ${BEAT_MAX_CHARS} ký tự, tối đa ${BEATS_MAX} nhịp, expression thuộc: ${EXPRESSIONS.join(', ')}.`,
        ),
      ],
    };
  }

  const output: BeatsOutput = result.data;

  const violations: RuleViolation[] = [];
  if (output.beats.length > ctx.maxBeats)
    violations.push(
      violation(
        'R4',
        `${output.beats.length} nhịp, lượt này chỉ được ${ctx.maxBeats}`,
        `Lượt này viết tối đa ${ctx.maxBeats} nhịp.`,
      ),
    );

  const allowed = new Set([...ctx.speakers, SCENE_SPEAKER]);
  const strangers = [
    ...new Set(
      output.beats.map((b) => b.speaker).filter((s) => !allowed.has(s)),
    ),
  ];
  if (strangers.length > 0)
    violations.push(
      violation(
        'R4',
        `Người nói không có mặt: ${strangers.join(', ')}`,
        `speaker chỉ được là: ${[...allowed].join(', ')}.`,
      ),
    );

  // Màn làm việc không gọi người chơi bằng tên; dấu ngoặc nhọn là chỗ giữ tên
  // (`{ten}`) lọt ra màn hình nguyên văn (luật cách viết 10).
  if (output.beats.some((b) => /[{}]/.test(b.text)))
    violations.push(
      violation(
        'R4',
        'Có dấu ngoặc nhọn trong lời',
        'Không viết dấu ngoặc nhọn. Gọi người chơi đúng như dòng "Xưng …, gọi người chơi …" trong thẻ.',
      ),
    );

  return { output, violations };
}

/* ── R1 ────────────────────────────────────────────────────────────── */

function checkFacts(
  output: BeatsOutput,
  ctx: BeatsCheckContext,
): RuleViolation[] {
  const written = output.beats.map((b) => b.text).join('\n');
  const violations: RuleViolation[] = [];

  const numbers = inventedNumbers(written, ctx.visibleTexts);
  if (numbers.length > 0)
    violations.push(
      violation(
        'R1',
        `Số không có nguồn: ${numbers.join(', ')}`,
        `Bạn dùng số không có trong thẻ nhân vật, hồ sơ công ty, lời người chơi hay ambient: ${numbers.join(', ')}. Chỉ dùng số có sẵn, hoặc bỏ số đi.`,
      ),
    );

  const names = unknownNames(written, [...ctx.visibleTexts, ...ctx.speakers]);
  if (names.length > 0)
    violations.push(
      violation(
        'R1',
        `Tên riêng không có nguồn: ${names.join(', ')}`,
        `Bạn dùng tên không có trong thẻ nhân vật, hồ sơ công ty, lời người chơi hay ambient: ${names.join(', ')}. Chỉ dùng tên có sẵn.`,
      ),
    );

  return violations;
}

/* ── R2 ────────────────────────────────────────────────────────────── */

function checkQuestions(
  output: BeatsOutput,
  ctx: BeatsCheckContext,
): RuleViolation[] {
  const fail = (detail: string, feedback: string) =>
    violation('R2', detail, feedback);
  const { beats, question_by: askedBy } = output;
  const last = beats[beats.length - 1];
  const total = beats.reduce((n, b) => n + questionMarks(b.text), 0);
  const violations: RuleViolation[] = [];

  if (
    beats.some((b) => b.speaker === SCENE_SPEAKER && questionMarks(b.text) > 0)
  )
    violations.push(
      fail('Lời cảnh có câu hỏi', 'Nhịp "canh" không bao giờ hỏi.'),
    );

  if (total > 1)
    violations.push(
      fail(
        `${total} câu hỏi trong một lượt`,
        'Cả lượt chỉ được tối đa MỘT câu hỏi, đặt ở nhịp cuối.',
      ),
    );
  else if (total === 1 && questionMarks(last.text) === 0)
    violations.push(
      fail(
        'Câu hỏi không nằm ở nhịp cuối',
        'Câu hỏi phải là nhịp cuối, đứng riêng.',
      ),
    );

  if (ctx.task === 'probe') {
    if (total !== 1 || last.speaker !== ctx.lead)
      violations.push(
        fail(
          'Probe phải có đúng một câu hỏi, ở nhịp cuối, do người hỏi engine giao',
          `Task "probe": nhịp cuối là MỘT câu hỏi của ${ctx.lead}, đi ra từ hook.`,
        ),
      );
  } else if (total > 0 && !ctx.questionAllowed) {
    violations.push(
      fail(
        'Hỏi khi lượt này không được hỏi',
        'Lượt này không được hỏi: không có dấu "?". question_by là null.',
      ),
    );
  }

  if (total > 0 && last.speaker !== ctx.lead)
    violations.push(
      fail(
        `Người hỏi là ${last.speaker}, không phải ${ctx.lead}`,
        `Chỉ ${ctx.lead} được hỏi ở lượt này.`,
      ),
    );

  // question_by là thứ engine đọc để biết ai đang chờ câu trả lời; phải khớp chữ.
  const expectedBy = total > 0 ? last.speaker : null;
  if (askedBy !== expectedBy)
    violations.push(
      fail(
        `question_by là ${askedBy ?? 'null'}, nhưng ${total > 0 ? `${last.speaker} hỏi` : 'không ai hỏi'}`,
        'question_by là slot của người hỏi ở nhịp cuối, hoặc null khi không có câu hỏi.',
      ),
    );

  return violations;
}

/* ── R3 ────────────────────────────────────────────────────────────── */

function checkLeak(
  output: BeatsOutput,
  ctx: BeatsCheckContext,
): RuleViolation[] {
  const spoken = output.beats
    .filter((b) => b.speaker !== SCENE_SPEAKER)
    .map((b) => b.text)
    .join('\n');
  const verdicts = verdictPhrases(spoken);
  const judged =
    verdicts.length > 0
      ? [
          violation(
            'R3',
            `Khen chê người chơi: ${verdicts.map((v) => `"${v}"`).join(', ')}`,
            `Nhân vật vừa nhận xét câu trả lời của người chơi (${verdicts.join(', ')}). Bỏ lời khen chê; chỉ đáp theo việc, xác nhận hay bác bỏ dữ kiện mình biết.`,
          ),
        ]
      : [];

  const leaked = leakedNgrams(
    output.beats.map((b) => b.text).join('\n'),
    ctx.visibleTexts,
    ctx.hiddenTexts,
  );
  if (leaked.length === 0) return judged;
  return [
    ...judged,
    violation(
      'R3',
      `Lặp lại nội dung ẩn: ${leaked.map((g) => `"${g}"`).join(', ')}`,
      // Không nhắc lại cụm bị lộ: nói ra cụm nào cần tránh là đưa nội dung ẩn vào prompt.
      'Lời vừa rồi nhắc tới điều nhân vật không biết hoặc người chơi chưa được thấy. Viết lại, chỉ dựa vào thẻ, cảnh và lời người chơi; không nêu cách giải.',
    ),
  ];
}

/**
 * Kiểm một câu trả lời thô của model. R4 chạy trước: không đọc được khuôn thì
 * không có gì để kiểm R1–R3. Đọc được rồi thì chạy đủ, để lần viết lại sửa hết
 * một lượt.
 */
export function checkBeats(raw: string, ctx: BeatsCheckContext): BeatsCheck {
  const shape = checkShape(raw, ctx);
  if (!shape.output) return shape;
  const output = shape.output;
  return {
    output,
    violations: [
      ...shape.violations,
      ...checkFacts(output, ctx),
      ...checkQuestions(output, ctx),
      ...checkLeak(output, ctx),
    ],
  };
}
