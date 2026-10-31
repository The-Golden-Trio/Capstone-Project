/**
 * Khử định danh câu người chơi trước khi gửi ra nhà cung cấp model.
 *
 * Hai lớp: xoá những gì nền tảng biết về người chơi (tên, username, email),
 * rồi xoá các mẫu nhận diện được bất kỳ ai (email, số điện thoại Việt Nam, số
 * CCCD/CMND, đường link). Tên người khác người chơi tự gõ vào thì không bắt
 * hết được bằng mẫu — vì thế kịch bản gọi người chơi bằng vai và mọi nhân vật
 * đều có tên sẵn, và rủi ro còn lại được ghi trong chính sách quyền riêng tư.
 *
 * Nhãn thay thế không chứa chữ số, để R1 không coi nhãn là một con số bịa.
 */
import { normalizeVi } from '../format.js';

export interface KnownIdentity {
  /** Họ tên, tên gọi — viết có dấu hay không dấu đều được. */
  names?: readonly string[];
  usernames?: readonly string[];
  emails?: readonly string[];
}

export type RedactionKind =
  | 'email'
  | 'link'
  | 'phone'
  | 'id_number'
  | 'known_name';

export interface Deidentified {
  text: string;
  /** Đã thay bao nhiêu chỗ mỗi loại — ghi vào bản ghi, không ghi nội dung. */
  redactions: Partial<Record<RedactionKind, number>>;
}

export const REDACTION_LABEL: Record<RedactionKind, string> = {
  email: '[EMAIL]',
  link: '[LIÊN KẾT]',
  phone: '[SỐ ĐIỆN THOẠI]',
  id_number: '[SỐ GIẤY TỜ]',
  known_name: '[NGƯỜI CHƠI]',
};

/**
 * Thứ tự có ý nghĩa: email trước link (email trông giống tên miền), số điện
 * thoại trước số giấy tờ (cả hai đều là dãy số dài).
 */
const PATTERNS: Array<[RedactionKind, RegExp]> = [
  ['email', /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu],
  ['link', /\bhttps?:\/\/\S+|\bwww\.\S+/giu],
  // 0 hoặc +84 rồi 9 chữ số, cho phép cách bằng dấu cách, chấm, gạch.
  ['phone', /(?<![\p{N}])(?:\+?84|0)(?:[\s.-]?\p{N}){9}(?![\p{N}])/gu],
  // CCCD 12 số, CMND 9 số, đứng riêng.
  ['id_number', /(?<![\p{N}])(?:\p{N}{12}|\p{N}{9})(?![\p{N}])/gu],
];

const WORD = /[\p{L}\p{N}]+/gu;

const lower = (word: string) => word.normalize('NFC').toLowerCase();

/**
 * Một từ người chơi gõ có phải là một chữ trong tên không.
 *
 * Gõ có dấu thì phải khớp đúng dấu: người chơi tên Minh vẫn viết chữ "mình"
 * bình thường, xoá nó đi là làm hỏng câu trả lời đem đi chấm. Gõ không dấu
 * thì so sau khi bỏ dấu, vì "nguyen van duc" vẫn là "Nguyễn Văn Đức".
 */
function sameWord(typed: string, nameWord: string): boolean {
  if (lower(typed) === lower(nameWord)) return true;
  const typedHasMarks = normalizeVi(typed) !== lower(typed);
  return !typedHasMarks && normalizeVi(typed) === normalizeVi(nameWord);
}

/**
 * Thay mọi chỗ xuất hiện của một tên đã biết, không phân biệt hoa thường.
 * So từng cụm từ liền nhau, rồi thay đúng đoạn gốc.
 */
function replaceKnown(
  text: string,
  needle: string,
  label: string,
): { text: string; count: number } {
  const target = needle.match(WORD) ?? [];
  if (target.length === 0) return { text, count: 0 };

  const words = [...text.matchAll(WORD)].map((m) => ({
    raw: m[0],
    start: m.index ?? 0,
    end: (m.index ?? 0) + m[0].length,
  }));

  const spans: Array<[number, number]> = [];
  for (let i = 0; i + target.length <= words.length; i++) {
    if (target.every((t, k) => sameWord(words[i + k].raw, t))) {
      spans.push([words[i].start, words[i + target.length - 1].end]);
      i += target.length - 1;
    }
  }

  let out = text;
  for (const [start, end] of spans.reverse())
    out = out.slice(0, start) + label + out.slice(end);
  return { text: out, count: spans.length };
}

export function deidentify(
  text: string,
  known: KnownIdentity = {},
): Deidentified {
  const redactions: Deidentified['redactions'] = {};
  const bump = (kind: RedactionKind, n: number) => {
    if (n > 0) redactions[kind] = (redactions[kind] ?? 0) + n;
  };

  let out = text;

  // Email đã biết trước, rồi mới tới mẫu email chung.
  for (const email of known.emails ?? []) {
    const parts = out.split(email);
    bump('email', parts.length - 1);
    out = parts.join(REDACTION_LABEL.email);
  }

  for (const [kind, pattern] of PATTERNS) {
    out = out.replace(pattern, () => {
      bump(kind, 1);
      return REDACTION_LABEL[kind];
    });
  }

  // Tên dài trước tên ngắn: thay "Nguyễn Văn Đức" trước "Đức".
  const names = [...(known.names ?? []), ...(known.usernames ?? [])]
    .filter((n) => n.trim().length > 0)
    .sort((a, b) => b.length - a.length);
  for (const name of names) {
    const replaced = replaceKnown(out, name, REDACTION_LABEL.known_name);
    bump('known_name', replaced.count);
    out = replaced.text;
  }

  return { text: out, redactions };
}
