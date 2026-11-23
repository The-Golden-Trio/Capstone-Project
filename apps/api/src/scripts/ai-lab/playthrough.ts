/**
 * Kịch bản người chơi cho `ai-lab`: một file JSON liệt kê từng việc người chơi
 * làm, theo đúng các loại lượt của API ca làm (`play/shift.dto.ts`), chỉ bỏ
 * `turnId`. Mọi câu trong kịch bản là câu giả do nhóm viết để thử AI, không
 * phải lời của người chơi thật.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { shift } from '@datn/game-core';

/** Khuôn kịch bản dùng chung với web nên nằm ở game-core; đây chỉ nạp file và đổi sang đầu vào engine. */
export const { stepApplies } = shift;
export type Step = shift.Step;
export type Playthrough = shift.Playthrough;

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
  const result = shift.PlaythroughSchema.safeParse(raw);
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
