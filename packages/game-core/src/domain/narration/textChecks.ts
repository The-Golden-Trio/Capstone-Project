/**
 * Các phép kiểm chữ dùng chung cho luật của AI-4: bóc JSON, tìm số và tên
 * không có nguồn (R1), đếm câu hỏi (R2), tìm cụm lặp lại nội dung ẩn (R3).
 *
 * Dùng cho cả contract cũ (`rules.ts`, một câu follow-up) lẫn contract nhịp
 * (`beats.ts`, D-130), để hai bản luật không lệch nhau ở phần giống nhau.
 */
import { normalizeVi } from '../format.js';

/**
 * R3 coi là "lộ" khi trùng một cụm 5 âm tiết liền nhau.
 *
 * 4 âm tiết thì quá ngắn: những cụm như "người chơi có thể" có ở khắp nơi.
 * 6 trở lên thì model chỉ cần đổi một chữ là lọt. Con số này chỉnh sau khi đo
 * trên bộ thử (lớp "dò rubric").
 */
export const LEAK_NGRAM = 5;

/**
 * Bóc JSON khỏi chuỗi trả về.
 *
 * Chấp nhận khối ```json … ``` vì bóc nó không đổi nội dung, còn bắt sinh lại
 * chỉ vì ba dấu backtick thì tốn thêm vài giây của người chơi.
 */
export function parseJson(raw: string): unknown {
  const fenced = raw.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return JSON.parse(fenced ? fenced[1] : raw.trim());
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

const numbersIn = (text: string): string[] => text.match(NUMBER) ?? [];

/**
 * Giờ của một mốc giờ cũng là số đã biết: nguồn ghi "trước 12:00" thì nhân vật
 * nói "12 giờ" là đúng nguồn. Gặp khi gọi thật 11/11/2026: R1 bắt oan "12" dù
 * mục tiêu của màn có "12:00".
 *
 * Chỉ lấy phần giờ, không lấy phần phút: lấy cả phút thì "8:30" trong giờ làm
 * việc của công ty làm "30" thành số đã biết, và câu bịa "30 phút" lọt qua.
 */
const hourOf = (raw: string): string[] =>
  /^\d{1,2}:\d{2}$/.test(raw) ? [String(Number(raw.split(':')[0]))] : [];

/** Số trong `written` mà không chữ nào trong `sources` có. */
export function inventedNumbers(
  written: string,
  sources: readonly string[],
): string[] {
  const known = new Set(
    sources
      .flatMap(numbersIn)
      .flatMap((n) => [
        ...numberForms(n),
        ...hourOf(n),
      ]),
  );
  return [
    ...new Set(
      numbersIn(written).filter(
        (n) => !numberForms(n).some((form) => known.has(form)),
      ),
    ),
  ];
}

export const WORD = /\p{L}[\p{L}\p{N}]*/gu;

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
  'AI',
  'API',
  'APP',
  'CPU',
  'CV',
  'DB',
  'HR',
  'HTTP',
  'ID',
  'IT',
  'KPI',
  'OK',
  'PC',
  'PM',
  'QA',
  'RAM',
  'SQL',
  'UI',
  'URL',
  'UX',
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

/**
 * Tên riêng trong `written` mà không chữ nào trong `sources` có.
 *
 * So GIỮ NGUYÊN DẤU, chỉ bỏ hoa thường. Bỏ dấu thì tên bịa "Minh" trùng với
 * chữ "mình" có ở khắp kịch bản, và R1 cho qua.
 */
export function unknownNames(
  written: string,
  sources: readonly string[],
): string[] {
  const key = (word: string) => word.normalize('NFC').toLowerCase();
  const known = new Set(
    [...sources, ...COMMON_TERMS]
      .flatMap((text) => text.match(WORD) ?? [])
      .map(key),
  );
  return [...new Set(properNounsIn(written).filter((w) => !known.has(key(w))))];
}

/* ── R2 ────────────────────────────────────────────────────────────── */

export const questionMarks = (text: string): number =>
  (text.match(/\?/g) ?? []).length;

/* ── R3 ────────────────────────────────────────────────────────────── */

/**
 * Cụm khen chê, nhận xét câu trả lời của người chơi (R3: "không khen chê").
 *
 * Danh sách hẹp có chủ đích: chỉ những cụm gần như luôn là đánh giá người
 * chơi. "Đúng rồi", "đúng là" không có ở đây vì nhân vật được xác nhận dữ kiện
 * mình biết (D4). Bắt sai thì tốn một lần viết lại; bỏ sót thì log review bắt.
 * Gặp khi gọi thật 11/11/2026: "Em làm kỹ lắm", "cách so sánh đó hợp lý",
 * "logic đó đúng", "Lý lẽ đó đủ…".
 */
export const VERDICT_PHRASES: readonly string[] = [
  'giỏi',
  'làm tốt',
  'tốt lắm',
  'hay lắm',
  'kỹ lắm',
  'làm kỹ',
  'xuất sắc',
  'tuyệt vời',
  'hợp lý',
  'logic đó',
  'lý lẽ đó',
  'chuẩn rồi',
  'sai rồi',
  'chưa ổn',
  'chưa đúng',
];

/** Các cụm khen chê có trong `written` (so giữ dấu, bỏ hoa thường, đúng ranh giới từ). */
export function verdictPhrases(written: string): string[] {
  const text = written.normalize('NFC').toLowerCase();
  return VERDICT_PHRASES.filter((phrase) =>
    new RegExp(`(?<![\\p{L}])${phrase.normalize('NFC')}(?![\\p{L}])`, 'u').test(
      text,
    ),
  );
}

const syllables = (text: string): string[] =>
  normalizeVi(text)
    .split(/[^a-z0-9+]+/)
    .filter(Boolean);

export function ngrams(text: string, n: number): string[] {
  const tokens = syllables(text);
  const grams: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++)
    grams.push(tokens.slice(i, i + n).join(' '));
  return grams;
}

/**
 * Cụm `LEAK_NGRAM` âm tiết trong `written` trùng với nội dung ẩn.
 *
 * Cụm nào có cả ở phần được thấy thì AI-4 có quyền dùng: mục tiêu đào sâu và
 * mốc rubric hay dùng chung chữ, mà mục tiêu thì AI-4 được thấy.
 */
export function leakedNgrams(
  written: string,
  visible: readonly string[],
  hidden: readonly string[],
): string[] {
  const seen = new Set(visible.flatMap((t) => ngrams(t, LEAK_NGRAM)));
  const forbidden = new Set(
    hidden.flatMap((t) => ngrams(t, LEAK_NGRAM)).filter((g) => !seen.has(g)),
  );
  return [
    ...new Set(ngrams(written, LEAK_NGRAM).filter((g) => forbidden.has(g))),
  ];
}
