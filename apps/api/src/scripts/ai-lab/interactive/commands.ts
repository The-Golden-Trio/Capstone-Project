/**
 * Đọc một dòng tester gõ thành lệnh, và đổi lệnh thành bước kịch bản
 * (`Step`). Thuần: không I/O, không đồng hồ; nhận trạng thái màn chơi
 * (`SceneView`) và thời gian đã đo, trả về việc cần làm.
 */
import type { shift } from '@datn/game-core';
import type { Step } from '../playthrough';

export type Command =
  | { kind: 'say'; text: string }
  | { kind: 'lam'; key: string }
  | { kind: 'chon'; option: string }
  | { kind: 'nop' }
  | { kind: 'ket' }
  | { kind: 'xong' }
  | { kind: 'huy' }
  | { kind: 'goiy' }
  | { kind: 'lai' }
  | { kind: 'tt' }
  | { kind: 'ghichu'; text: string }
  | { kind: 'giup' }
  | { kind: 'thoat' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string };

/** Lệnh đi qua engine: đổi được thành một `Step`. */
export type EngineCommand = Extract<
  Command,
  { kind: 'say' | 'lam' | 'chon' | 'nop' | 'ket' | 'xong' | 'huy' | 'goiy' }
>;

export const isEngineCommand = (c: Command): c is EngineCommand =>
  ['say', 'lam', 'chon', 'nop', 'ket', 'xong', 'huy', 'goiy'].includes(c.kind);

/** Gõ dòng này khi đang điền form để bỏ form, không gửi gì cho engine. */
export const ABORT_FORM = '/bo';

export const HELP_LINES = [
  'Gõ chữ thường để nói (khi đang trò chuyện hoặc được hỏi), rồi Enter.',
  '  /lam <key>        làm một hành động trong danh sách; hành động có form thì hỏi từng ô',
  '  /chon <phương án> chọn phương án (đồng hồ chạy từ lúc phương án hiện ra)',
  '  /nop              nộp tài liệu của nút đang chờ, hỏi từng ô',
  '  /ket              xác nhận kết ca khi engine hỏi nộp sớm',
  '  /huy              huỷ nộp sớm, quay lại làm tiếp',
  '  /xong             kết thúc cuộc trò chuyện đang mở',
  '  /goiy             xin gợi ý',
  '  /lai              thử lại khi AI báo hết model (ca đang tạm dừng)',
  '  /tt               xem trạng thái nội bộ: cờ, dữ kiện, lời hứa, khúc mắc, nút, yêu cầu AI',
  '  /ghichu <chữ>     ghi nhận xét về seed, rubric hay cơ chế, gắn với lượt hiện tại',
  `  ${ABORT_FORM}              (khi đang điền form) bỏ form`,
  '  /giup             in bảng này',
  '  /thoat            thoát; vẫn lưu nếu có --out',
];

const WORDS: Record<string, Command['kind']> = {
  lam: 'lam',
  chon: 'chon',
  nop: 'nop',
  ket: 'ket',
  huy: 'huy',
  xong: 'xong',
  goiy: 'goiy',
  lai: 'lai',
  tt: 'tt',
  ghichu: 'ghichu',
  giup: 'giup',
  thoat: 'thoat',
};

export function parseCommand(line: string): Command {
  const text = line.trim();
  if (text === '') return { kind: 'empty' };
  if (!text.startsWith('/')) return { kind: 'say', text };

  const [word, ...rest] = text.slice(1).split(/\s+/);
  const arg = rest.join(' ').trim();
  const kind = WORDS[word.toLowerCase()];
  if (!kind)
    return {
      kind: 'error',
      message: `Không có lệnh /${word}. Gõ /giup để xem các lệnh.`,
    };

  switch (kind) {
    case 'lam':
      return arg
        ? { kind, key: arg.split(/\s+/)[0] }
        : {
            kind: 'error',
            message: '/lam cần key hành động, ví dụ /lam open_log.',
          };
    case 'chon':
      return arg
        ? { kind, option: arg.split(/\s+/)[0] }
        : { kind: 'error', message: '/chon cần phương án, ví dụ /chon b.' };
    case 'ghichu':
      return arg
        ? { kind, text: arg }
        : {
            kind: 'error',
            message: '/ghichu cần nội dung, ví dụ /ghichu rubric hỏi hai lần.',
          };
    default:
      return { kind } as Command;
  }
}

/* ── Lệnh thành bước ───────────────────────────────────────────────────── */

export type Plan =
  | {
      kind: 'step';
      step: Step;
      /** Điều tester cần biết về cách lệnh được hiểu (ví dụ hết giờ chọn). */
      notice?: string;
    }
  /** Cần điền form trước: `build` nhận chữ từng ô và các ô đã tick. */
  | {
      kind: 'form';
      title: string;
      form: shift.ArtefactForm;
      build: (fields: Record<string, string>, ticks: string[]) => Step;
    }
  | { kind: 'error'; message: string };

const err = (message: string): Plan => ({ kind: 'error', message });
const sameKey = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Chờ trả lời bằng chữ thì lời `say` ghi `ifAwait`, để chạy lại không vỡ khi nhánh AI khác. */
const BRANCHING_AWAITS = ['node_reply', 'probe_answer', 'last_word'];

export function planCommand(
  command: EngineCommand,
  view: shift.SceneView,
  /** Mili giây từ lúc phương án hiện ra; `null` khi chưa hiện. */
  elapsedMs: number | null,
): Plan {
  const waiting = view.await.kind;

  switch (command.kind) {
    case 'say': {
      const branching = BRANCHING_AWAITS.includes(waiting);
      return {
        kind: 'step',
        step: {
          do: 'say',
          text: command.text,
          ...(branching ? { ifAwait: waiting } : {}),
        } as Step,
      };
    }

    case 'lam': {
      const action = view.actions.find((a) => sameKey(a.key, command.key));
      if (!action)
        return err(
          `Không có hành động "${command.key}". Có: ${view.actions.map((a) => a.key).join(', ')}.`,
        );
      if (!action.enabled)
        return err(
          `Chưa làm được "${action.key}": ${action.reason ?? 'engine không cho'}.`,
        );
      if (action.form) {
        const key = action.key;
        return {
          kind: 'form',
          title: action.label,
          form: action.form,
          build: (fields, ticks) => ({
            do: 'action',
            key,
            fields,
            ...(ticks.length > 0 ? { ticks } : {}),
          }),
        };
      }
      return { kind: 'step', step: { do: 'action', key: action.key } };
    }

    case 'chon': {
      if (view.await.kind !== 'node_choice' || !view.node)
        return err('Chưa có phương án nào để chọn lúc này.');
      const option = view.node.options.find((o) =>
        sameKey(o.key, command.option),
      );
      if (!option)
        return err(
          `Không có phương án "${command.option}". Có: ${view.node.options.map((o) => o.key).join(', ')}.`,
        );
      const limit = view.node.timeLimitSeconds;
      if (limit !== undefined && elapsedMs !== null && elapsedMs > limit * 1000)
        return {
          kind: 'step',
          step: { do: 'timeout' },
          notice: `Quá ${limit} giây (bạn mất ${Math.round(elapsedMs / 1000)} giây): tính là hết giờ, không trả lời (D-86).`,
        };
      return {
        kind: 'step',
        step: {
          do: 'choose',
          option: option.key,
          ...(elapsedMs !== null ? { elapsedMs: Math.round(elapsedMs) } : {}),
        },
      };
    }

    case 'nop': {
      if (view.await.kind !== 'node_artefact' || !view.node?.form)
        return err('Chưa có tài liệu nào cần nộp lúc này.');
      const artefact = view.await.artefact;
      return {
        kind: 'form',
        title: view.node.form.title,
        form: view.node.form,
        build: (fields, ticks) => ({
          do: 'save_artefact',
          artefact,
          fields,
          ...(ticks.length > 0 ? { ticks } : {}),
        }),
      };
    }

    case 'ket':
      return waiting === 'confirm_end'
        ? { kind: 'step', step: { do: 'confirm_end' } }
        : err('Chỉ dùng /ket khi engine hỏi có nộp sớm không.');

    case 'huy':
      return waiting === 'confirm_end'
        ? { kind: 'step', step: { do: 'cancel_end' } }
        : err('Chỉ dùng /huy khi engine hỏi có nộp sớm không.');

    case 'xong':
      if (waiting === 'last_word')
        return {
          kind: 'step',
          step: { do: 'end_conversation', ifAwait: waiting },
        };
      return waiting === 'conversation'
        ? { kind: 'step', step: { do: 'end_conversation' } }
        : err('Không có cuộc trò chuyện nào đang mở.');

    case 'goiy':
      return { kind: 'step', step: { do: 'hint' } };
  }
}
