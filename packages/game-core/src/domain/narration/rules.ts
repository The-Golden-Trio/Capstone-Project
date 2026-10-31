/**
 * Bốn luật kiểm câu AI-4 viết, TRƯỚC khi người chơi thấy.
 *
 * Toàn là luật tất định, chạy vài mili giây — không gọi thêm model nào, nên
 * không ăn vào ngân sách 5 giây của NFR-01 (follow-up sinh xong trong 5 s ở
 * p95). Nằm trong `game-core` để máy khách và máy chủ dùng đúng một bộ luật.
 *
 *   R1  Không bịa tên, số: mọi con số và tên riêng phải có trong kịch bản
 *       AI-4 được thấy, hoặc trong câu người chơi.
 *   R2  Follow-up trong trần: chỉ hỏi khi engine cho phép; hỏi đúng một câu.
 *   R3  Không lộ: không lặp lại nguyên cụm từ của rubric, khoá chấm, gợi ý
 *       chưa dùng, kết cục, hay hoạt động chưa tới.
 *   R4  Đúng khuôn: JSON đúng schema, không rỗng, không bị cắt, đúng độ dài.
 *
 * Giới hạn phải nói thẳng: luật không bắt được một ý bịa ghép từ toàn chữ có
 * sẵn trong kịch bản, cũng không bắt được rubric bị diễn đạt lại. Phần đó để
 * log review bằng một model khác họ, sau khi chơi.
 */
import { z } from 'zod';
import { normalizeVi } from '../format.js';

/**
 * Lời nối dài tối đa bao nhiêu ký tự.
 *
 * 1–2 câu thoại vừa một bong bóng chat trên điện thoại. Khoảng 100–130 token
 * tiếng Việt — cộng câu hỏi vẫn nằm gọn trong 300 token đầu ra của call profile.
 */
export const NARRATION_MAX_CHARS = 280;

/** Một câu hỏi, một ý. Dài hơn thế thường là hai câu hỏi ghép lại. */
export const FOLLOW_UP_MAX_CHARS = 200;

/**
 * R3 coi là "lộ" khi trùng một cụm 5 âm tiết liền nhau.
 *
 * 4 âm tiết thì quá ngắn: những cụm như "người chơi có thể" có ở khắp nơi.
 * 6 trở lên thì model chỉ cần đổi một chữ là lọt. Con số này chỉnh sau khi đo
 * trên bộ thử (lớp "dò rubric").
 */
export const LEAK_NGRAM = 5;

export const NarrationOutputSchema = z
  .object({
    speaker: z.string().min(1),
    narration: z.string().trim().min(1).max(NARRATION_MAX_CHARS),
    follow_up: z.string().trim().min(1).max(FOLLOW_UP_MAX_CHARS).nullable(),
  })
  .strict();

export type NarrationOutput = z.infer<typeof NarrationOutputSchema>;

/**
 * Cùng khuôn ấy, viết dưới dạng JSON Schema để gửi cho nhà cung cấp hỗ trợ
 * chế độ strict.
 *
 * Viết tay thay vì sinh tự động từ Zod: nhà cung cấp chỉ nhận một tập con của
 * JSON Schema (Alibaba từ chối `uniqueItems`, `patternProperties`…), nên phải
 * biết chính xác mình gửi đi những từ khoá nào. `speaker` là enum các NPC của
 * kịch bản, nên model không thể bịa ra một nhân vật.
 */
export function narrationJsonSchema(castIds: readonly string[]) {
  return {
    type: 'object',
    properties: {
      speaker: { type: 'string', enum: [...castIds] },
      narration: { type: 'string', maxLength: NARRATION_MAX_CHARS },
      follow_up: { type: ['string', 'null'], maxLength: FOLLOW_UP_MAX_CHARS },
    },
    required: ['speaker', 'narration', 'follow_up'],
    additionalProperties: false,
  } as const;
}

export type RuleId = 'R1' | 'R2' | 'R3' | 'R4';

export interface RuleViolation {
  rule: RuleId;
  /** Cho người đọc log: nói rõ vi phạm cái gì, kể cả cụm bị lộ. */
  detail: string;
  /**
   * Cho model khi bắt viết lại. Với R3 câu này cố ý KHÔNG nhắc lại cụm bị lộ:
   * nói cho model biết cụm rubric nào cần tránh tức là đưa rubric vào prompt.
   */
  feedback: string;
}

export interface NarrationCheckContext {
  /** Mọi chữ AI-4 được thấy: kịch bản đã lọc, diễn biến, câu người chơi. */
  visibleTexts: readonly string[];
  /** Mọi chữ AI-4 không được nói ra — xem `hiddenTexts`. */
  hiddenTexts: readonly string[];
  /** `npc_id` của các nhân vật trong kịch bản. */
  castIds: readonly string[];
  /** Engine có cho hỏi đào sâu ở lượt này không (trần của hoạt động và của màn). */
  followUpAllowed: boolean;
  /** `finish_reason` nhà cung cấp trả về. `length` nghĩa là bị cắt giữa chừng. */
  finishReason: string;
}

export interface NarrationCheck {
  output: NarrationOutput | null;
  violations: RuleViolation[];
}

/* ── R4 ────────────────────────────────────────────────────────────── */

/**
 * Bóc JSON khỏi chuỗi trả về.
 *
 * Chấp nhận khối ```json … ``` vì bóc nó không đổi nội dung, còn bắt sinh lại
 * chỉ vì ba dấu backtick thì tốn thêm vài giây của người chơi.
 */
function parseJson(raw: string): unknown {
  const fenced = raw.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return JSON.parse(fenced ? fenced[1] : raw.trim());
}

function checkShape(
  raw: string,
  ctx: NarrationCheckContext,
): { output: NarrationOutput | null; violations: RuleViolation[] } {
  const violations: RuleViolation[] = [];
  const fail = (detail: string, feedback = detail) =>
    violations.push({ rule: 'R4', detail, feedback });

  if (ctx.finishReason === 'length') {
    fail(
      'Bị cắt giữa chừng vì chạm giới hạn token đầu ra',
      'Câu trả lời quá dài nên bị cắt. Viết ngắn hơn, đúng giới hạn độ dài.',
    );
    return { output: null, violations };
  }

  if (raw.trim() === '') {
    fail('Nhà cung cấp trả về nội dung rỗng', 'Bạn chưa trả về gì. Trả về đúng một đối tượng json.');
    return { output: null, violations };
  }

  let parsed: unknown;
  try {
    parsed = parseJson(raw);
  } catch {
    fail('Không phải JSON hợp lệ', 'Kết quả không phải json hợp lệ. Chỉ trả về đúng một đối tượng json.');
    return { output: null, violations };
  }

  const result = NarrationOutputSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.') || '(gốc)'}: ${i.message}`)
      .join('; ');
    fail(`Sai schema — ${issues}`, `Json sai khuôn (${issues}). Giữ đúng ba trường speaker, narration, follow_up.`);
    return { output: null, violations };
  }

  if (!ctx.castIds.includes(result.data.speaker)) {
    fail(
      `speaker "${result.data.speaker}" không phải nhân vật của kịch bản`,
      `speaker phải là một trong: ${ctx.castIds.join(', ')}.`,
    );
  }

  return { output: result.data, violations };
}

/* ── R1 ────────────────────────────────────────────────────────────── */

const NUMBER = /\d+(?:[.,:/]\d+)*/g;

/**
 * Các dạng của một con số để so khớp: "4.2" và "4,2" là một (dấu thập phân
 * kiểu Việt), "1.000" và "1000" là một (dấu nghìn).
 */
function numberForms(raw: string): string[] {
  const canon = raw.replace(/,/g, '.');
  return [canon, canon.replace(/\./g, '')];
}

function numbersIn(text: string): string[] {
  return text.match(NUMBER) ?? [];
}

const WORD = /\p{L}[\p{L}\p{N}]*/gu;

/**
 * Từ viết tắt chung của nơi làm việc. Là từ vựng, không phải sự thật về kịch
 * bản, nên R1 không coi là tên bịa.
 *
 * Tìm ra khi chạy thử: AI-4 viết "mỗi đơn một lần chạm DB" và bị R1 loại, vì
 * "DB" không có trong kịch bản. Câu đúng mà bị bắt viết lại là mất vài giây
 * của người chơi. Danh sách ngắn có chủ đích: chỉ những từ người ngoài nghề
 * cũng gặp. Tên công nghệ cụ thể ("Kafka", "AWS") vẫn phải có trong kịch bản —
 * bịa ra một công nghệ là bịa ra một sự thật về nơi làm việc.
 */
export const COMMON_TERMS: readonly string[] = [
  'AI', 'API', 'APP', 'CPU', 'CV', 'DB', 'HR', 'HTTP', 'ID', 'IT', 'KPI',
  'OK', 'PC', 'PM', 'QA', 'RAM', 'SQL', 'UI', 'URL', 'UX',
];

/** Ký tự đứng ngay trước một từ mà sau nó từ đó coi như đầu câu. */
const SENTENCE_BREAK = /[.!?…:;"'“”‘’«»(\n]$/u;

/**
 * Các từ viết hoa có thể là tên riêng.
 *
 * Từ đầu câu viết hoa là chuyện bình thường ("Bạn", "Ừ"), nên bỏ qua — trừ
 * khi nó còn chữ hoa ở giữa ("PostgreSQL", "API"), dấu hiệu chắc chắn của tên
 * riêng hay từ viết tắt.
 */
function properNounsIn(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(WORD)) {
    const word = match[0];
    if (!/^\p{Lu}/u.test(word)) continue;

    const before = text.slice(0, match.index).trimEnd();
    const sentenceStart = before === '' || SENTENCE_BREAK.test(before);
    const innerCapital = /\p{Lu}/u.test(word.slice(1));
    if (sentenceStart && !innerCapital) continue;

    found.push(word);
  }
  return found;
}

function checkFacts(
  output: NarrationOutput,
  ctx: NarrationCheckContext,
): RuleViolation[] {
  const written = [output.narration, output.follow_up ?? ''].join('\n');
  const violations: RuleViolation[] = [];

  const knownNumbers = new Set(
    ctx.visibleTexts.flatMap(numbersIn).flatMap(numberForms),
  );
  const invented = [
    ...new Set(
      numbersIn(written).filter(
        (n) => !numberForms(n).some((form) => knownNumbers.has(form)),
      ),
    ),
  ];
  if (invented.length > 0) {
    violations.push({
      rule: 'R1',
      detail: `Số không có trong kịch bản hay câu người chơi: ${invented.join(', ')}`,
      feedback: `Bạn dùng số không có trong kịch bản hay câu người chơi: ${invented.join(', ')}. Chỉ dùng số có sẵn, hoặc bỏ số đi.`,
    });
  }

  // Tên so GIỮ NGUYÊN DẤU, chỉ bỏ hoa thường. Bỏ dấu thì tên bịa "Minh"
  // trùng với chữ "mình" có ở khắp kịch bản, và R1 cho qua.
  const nameKey = (word: string) => word.normalize('NFC').toLowerCase();
  const knownWords = new Set(
    [...ctx.visibleTexts, ...ctx.castIds, ...COMMON_TERMS]
      .flatMap((text) => text.match(WORD) ?? [])
      .map(nameKey),
  );
  const unknownNames = [
    ...new Set(
      properNounsIn(written).filter((w) => !knownWords.has(nameKey(w))),
    ),
  ];
  if (unknownNames.length > 0) {
    violations.push({
      rule: 'R1',
      detail: `Tên riêng không có trong kịch bản hay câu người chơi: ${unknownNames.join(', ')}`,
      feedback: `Bạn dùng tên không có trong kịch bản hay câu người chơi: ${unknownNames.join(', ')}. Chỉ dùng tên nhân vật, công ty, công nghệ có sẵn.`,
    });
  }

  return violations;
}

/* ── R2 ────────────────────────────────────────────────────────────── */

const questionMarks = (text: string): number => (text.match(/\?/g) ?? []).length;

function checkFollowUp(
  output: NarrationOutput,
  ctx: NarrationCheckContext,
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const fail = (detail: string, feedback: string) =>
    violations.push({ rule: 'R2', detail, feedback });

  // Câu hỏi chỉ được nằm ở `follow_up`, để engine đếm được — một câu hỏi lẻn
  // vào lời nối là một lượt đào sâu không ai đếm.
  if (questionMarks(output.narration) > 0) {
    fail(
      'Lời nối có câu hỏi',
      'narration không được chứa câu hỏi. Nếu được hỏi thì đặt câu hỏi ở follow_up.',
    );
  }

  if (output.follow_up === null) return violations;

  if (!ctx.followUpAllowed) {
    fail(
      'Hỏi đào sâu khi engine không cho phép (hết trần hoặc hoạt động không có mục tiêu đào sâu)',
      'Lượt này không được hỏi đào sâu. Đặt follow_up là null.',
    );
    return violations;
  }

  const question = output.follow_up.replace(/["'”’»)\s]+$/u, '');
  if (questionMarks(question) !== 1 || !question.endsWith('?')) {
    fail(
      `follow_up phải là đúng một câu hỏi, kết thúc bằng "?" — đang có ${questionMarks(question)} dấu hỏi`,
      'follow_up phải là đúng MỘT câu hỏi, hỏi một ý, kết thúc bằng dấu "?".',
    );
  }

  return violations;
}

/* ── R3 ────────────────────────────────────────────────────────────── */

const syllables = (text: string): string[] =>
  normalizeVi(text).split(/[^a-z0-9+]+/).filter(Boolean);

function ngrams(text: string, n: number): string[] {
  const tokens = syllables(text);
  const grams: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++)
    grams.push(tokens.slice(i, i + n).join(' '));
  return grams;
}

function checkLeak(
  output: NarrationOutput,
  ctx: NarrationCheckContext,
): RuleViolation[] {
  // Cụm nào có cả ở phần được thấy thì AI-4 có quyền dùng: mục tiêu đào sâu
  // và mốc rubric hay dùng chung chữ, mà mục tiêu thì AI-4 được thấy.
  const visible = new Set(
    ctx.visibleTexts.flatMap((t) => ngrams(t, LEAK_NGRAM)),
  );
  const forbidden = new Set(
    ctx.hiddenTexts
      .flatMap((t) => ngrams(t, LEAK_NGRAM))
      .filter((g) => !visible.has(g)),
  );

  const written = [output.narration, output.follow_up ?? ''].join('\n');
  const leaked = [
    ...new Set(ngrams(written, LEAK_NGRAM).filter((g) => forbidden.has(g))),
  ];
  if (leaked.length === 0) return [];

  return [
    {
      rule: 'R3',
      detail: `Lặp lại nội dung ẩn: ${leaked.map((g) => `"${g}"`).join(', ')}`,
      feedback:
        'Câu vừa rồi nhắc tới nội dung người chơi chưa được thấy. Viết lại, chỉ dựa vào kịch bản đã cho và câu người chơi; câu hỏi phải mở, không gợi ý đáp án.',
    },
  ];
}

/* ── Gộp ───────────────────────────────────────────────────────────── */

/**
 * Kiểm một câu trả lời thô của model.
 *
 * R4 chạy trước: không đọc được khuôn thì không có gì để kiểm R1–R3. Khi đã
 * đọc được, chạy đủ ba luật còn lại để lần viết lại sửa được hết một lượt.
 */
export function checkNarration(
  raw: string,
  ctx: NarrationCheckContext,
): NarrationCheck {
  const shape = checkShape(raw, ctx);
  if (!shape.output) return shape;

  const output = shape.output;
  return {
    output,
    violations: [
      ...shape.violations,
      ...checkFacts(output, ctx),
      ...checkFollowUp(output, ctx),
      ...checkLeak(output, ctx),
    ],
  };
}
