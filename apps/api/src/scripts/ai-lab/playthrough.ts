/**
 * Kịch bản người chơi cho `ai-lab`: một file JSON liệt kê từng việc người chơi
 * làm, theo đúng các loại lượt của API ca làm (`play/shift.dto.ts`), chỉ bỏ
 * `turnId`. Mọi câu trong kịch bản là câu giả do nhóm viết để thử AI, không
 * phải lời của người chơi thật.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { shift } from '@datn/game-core';
import { z } from 'zod';

const id = z.string().min(1).max(80);
const text = z.string().trim().min(1).max(4000);
const fields = z.record(id, z.string().max(4000));

const awaitKind = z.enum([
  'start',
  'phase',
  'conversation',
  'node_reply',
  'node_choice',
  'node_artefact',
  'probe_answer',
  'confirm_end',
  'last_word',
  'ai',
  'ended',
]);

/**
 * Chỉ làm bước này khi engine đang chờ đúng loại này (hoặc một trong các
 * loại). Nhánh của engine đổi theo câu trả lời của bộ phán, nên bước như "trả
 * lời câu hỏi thêm" chỉ nên chạy nếu câu hỏi ấy có xuất hiện; không khớp thì
 * bỏ qua, không phải lỗi kịch bản.
 */
const when = {
  ifAwait: z.union([awaitKind, z.array(awaitKind).min(1)]).optional(),
};

/** Một việc người chơi làm. `do` trùng với `kind` của `TurnDto`, cộng `start`. */
export const StepSchema = z.discriminatedUnion('do', [
  z.object({ do: z.literal('start'), ...when }),
  z.object({
    do: z.literal('action'),
    key: id,
    fields: fields.optional(),
    ticks: z.array(id).max(20).optional(),
    ...when,
  }),
  z.object({ do: z.literal('say'), text, ...when }),
  z.object({ do: z.literal('end_conversation'), ...when }),
  z.object({
    do: z.literal('choose'),
    option: id,
    elapsedMs: z.number().int().nonnegative().optional(),
    ...when,
  }),
  z.object({ do: z.literal('timeout'), ...when }),
  z.object({
    do: z.literal('save_artefact'),
    artefact: id,
    fields,
    ticks: z.array(id).max(20).optional(),
    ...when,
  }),
  z.object({ do: z.literal('confirm_end'), ...when }),
  z.object({ do: z.literal('cancel_end'), ...when }),
  z.object({ do: z.literal('hint'), ...when }),
]);
export type Step = z.infer<typeof StepSchema>;

export const PlaythroughSchema = z.object({
  /** Dòng nhắc: đây là câu giả, không phải người chơi thật. */
  _note: z.string().optional(),
  name: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'chỉ chữ thường, số và dấu gạch ngang'),
  /** Mã seed, ví dụ `SWE_BACKEND.L3.m2`. */
  seed: id,
  title: z.string(),
  /** Điều kịch bản này muốn thử, để người đọc nhật ký biết cần nhìn gì. */
  intent: z.string(),
  steps: z.array(StepSchema).min(1),
});
export type Playthrough = z.infer<typeof PlaythroughSchema>;

/** Đổi một việc của kịch bản thành đầu vào của engine, như `toPlayerInput` của API. */
export function toPlayerInput(step: Step): shift.PlayerInput {
  switch (step.do) {
    case 'start':
      return { type: 'START' };
    case 'action':
      return {
        type: 'ACTION',
        key: step.key,
        fields: step.fields,
        ticks: step.ticks,
      };
    case 'say':
      return { type: 'SAY', text: step.text };
    case 'end_conversation':
      return { type: 'END_CONVERSATION' };
    case 'choose':
      return { type: 'CHOOSE', option: step.option, elapsedMs: step.elapsedMs };
    case 'timeout':
      return { type: 'TIMEOUT' };
    case 'save_artefact':
      return {
        type: 'SAVE_ARTEFACT',
        artefact: step.artefact,
        fields: step.fields,
        ticks: step.ticks,
      };
    case 'confirm_end':
      return { type: 'CONFIRM_END' };
    case 'cancel_end':
      return { type: 'CANCEL_END' };
    case 'hint':
      return { type: 'HINT' };
  }
}

/** Bước có đang đúng chỗ không: không có `ifAwait` thì luôn đúng. */
export function stepApplies(step: Step, awaiting: string): boolean {
  if (step.ifAwait === undefined) return true;
  const kinds = Array.isArray(step.ifAwait) ? step.ifAwait : [step.ifAwait];
  return kinds.includes(awaiting as (typeof kinds)[number]);
}

/** Một dòng ngắn mô tả việc, cho nhật ký. */
export function describeStep(step: Step): string {
  switch (step.do) {
    case 'start':
      return 'Bắt đầu ca';
    case 'action':
      return `Hành động ${step.key}${
        step.fields ? ` (${Object.keys(step.fields).join(', ')})` : ''
      }`;
    case 'say':
      return `Nói: ${step.text}`;
    case 'end_conversation':
      return 'Kết thúc cuộc trò chuyện';
    case 'choose':
      return `Chọn phương án ${step.option}`;
    case 'timeout':
      return 'Hết giờ chọn';
    case 'save_artefact':
      return `Gửi tài liệu ${step.artefact}`;
    case 'confirm_end':
      return 'Xác nhận nộp sớm';
    case 'cancel_end':
      return 'Huỷ nộp sớm';
    case 'hint':
      return 'Xin gợi ý';
  }
}

export function parsePlaythrough(raw: unknown, source: string): Playthrough {
  const result = PlaythroughSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.') || '(gốc)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Kịch bản ${source} không hợp lệ:\n${issues}`);
  }
  return result.data;
}

export function loadPlaythrough(path: string): Playthrough {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf-8'));
  return parsePlaythrough(raw, basename(path));
}

/** Tên các kịch bản trong thư mục (bỏ đuôi `.json`), theo thứ tự chữ cái. */
export function listPlaythroughs(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -'.json'.length))
    .sort();
}

/** Có dấu thư mục hoặc đuôi `.json` thì là đường dẫn file, không phải tên trong thư mục. */
const isFilePath = (value: string): boolean =>
  /[\\/]/.test(value) || value.endsWith('.json');

/**
 * `--play=<tên>|<đường dẫn .json>|a,b|all` thành danh sách kịch bản; tên sai
 * thì liệt kê tên có. Đường dẫn dùng để chạy lại file do chế độ chơi tay xuất ra.
 */
export function selectPlaythroughs(dir: string, play: string): Playthrough[] {
  const names = listPlaythroughs(dir);
  const chosen = play === 'all' ? names : play.split(',');
  for (const name of chosen)
    if (!isFilePath(name) && !names.includes(name))
      throw new Error(
        `Không có kịch bản "${name}". Có: ${names.join(', ')}, hoặc all, hoặc đường dẫn file .json.`,
      );
  return chosen.map((name) =>
    loadPlaythrough(isFilePath(name) ? name : join(dir, `${name}.json`)),
  );
}
