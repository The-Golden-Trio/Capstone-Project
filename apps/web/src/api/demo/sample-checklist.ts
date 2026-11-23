import type { shift } from '@datn/game-core';
import { AUTOPLAY_SCRIPTS } from './playthroughs';
import { stateOf } from './rules';
import type { SavedRun } from './store';
import type { SampleChecklist } from '../types';

/**
 * SAMPLE — bảng "Chấm dự kiến" của lượt chơi mẫu bản 5.2 (người chơi Lan),
 * chép nguyên từ tài liệu lượt chơi mẫu. Đây không phải kết quả của AI chấm
 * (D-92 cấm chấm không AI): chỉ để người trình bày đối chiếu kịch bản, nên
 * chỉ hiện ở demo và chỉ khi ca được chơi đúng như kịch bản của Lan.
 */
const LAN_CHECKLIST: SampleChecklist = {
  seed: 'SWE_BACKEND.L3.m2',
  items: [
    {
      code: '4.2',
      name: 'Tìm nguyên nhân gốc',
      level: 2,
      evidence: [
        'A: “bước 2 trong code em lấy món từng đơn 1”, “901 lần”',
        'B: “CPU DB có 24% à”, “build bắt đầu 10:05”',
        'C: “từ 4,4 giây còn 0,18 giây… đều chỉ 2 lần hỏi”',
      ],
    },
    {
      code: '7.1',
      name: 'Trung thực, nhận lỗi',
      level: 2,
      evidence: [
        'A: “lỗi ở API bên em chứ k phải mạng khách”',
        'B: “API lịch sử đơn (phần em viết)”',
      ],
    },
    {
      code: '1.5',
      name: 'Chia sẻ thông tin đúng lúc',
      level: 2,
      evidence: [
        'A: báo chị Linh lúc 10:05',
        'B: “có bản sửa chạy thử rồi… phải có a An duyệt”',
        'C: “11h30 em gọi báo chị”',
      ],
    },
    {
      code: '7.4',
      name: 'Giữ lời hứa',
      level: 2,
      evidence: [
        'A: hẹn 11:30 và gọi đúng hẹn; n1-c gửi file đúng hẹn',
        'B: “phải có a An duyệt mới đưa lên được”',
      ],
    },
    {
      code: '1.1',
      name: 'Viết rõ ràng',
      level: 2,
      evidence: [
        'A: câu đầu phần Nguyên nhân và phần Hướng xử lý nói thẳng',
        'B: “Anh duyệt giúp em đưa lên production”',
        'C: “901 lần”, “4,4 giây còn 0,18 giây”',
      ],
    },
    {
      code: 'R',
      name: 'Lường trước rủi ro',
      level: 2,
      evidence: [
        'A: “phải có a An duyệt mới đưa lên được” (chọn chờ duyệt khi bị hối)',
        'B: “xem Minh Phát mở lịch sử dưới 2s và chỉ hỏi CSDL 2 lần” (khi được hỏi)',
        'C: “em bấm Rollback… khoảng 2 phút là về bản cũ” (tự viết trong email)',
      ],
    },
  ],
};

type Move = { type: string; [key: string]: unknown };

const clean = (fields: Record<string, string> | undefined) =>
  Object.fromEntries(
    Object.entries(fields ?? {})
      .filter(([, value]) => value.trim())
      .sort(([a], [b]) => a.localeCompare(b)),
  );

/** Việc của người chơi, bỏ phần máy trả lời và thời gian đếm giờ thực (khác nhau giữa các lần chơi). */
function moveOf(input: shift.ShiftInput): Move | null {
  switch (input.type) {
    case 'ACTION':
      return {
        type: input.type,
        key: input.key,
        fields: clean(input.fields),
        ticks: [...(input.ticks ?? [])].sort(),
      };
    case 'SAVE_ARTEFACT':
      return {
        type: input.type,
        artefact: input.artefact,
        fields: clean(input.fields),
        ticks: [...(input.ticks ?? [])].sort(),
      };
    case 'SAY':
      return { type: input.type, text: input.text.trim() };
    case 'CHOOSE':
      return { type: input.type, option: input.option };
    // Trên giao diện phải bấm kết thúc trò chuyện rồi mới chọn việc khác; engine coi ACTION giữa cuộc trò chuyện cũng là đóng nó.
    case 'END_CONVERSATION':
    case 'NARRATION':
    case 'CHECKS':
      return null;
    default:
      return { ...input };
  }
}

/** Đầu vào engine của một bước kịch bản (bước `ifAwait` được coi là có xảy ra, như lượt của Lan). */
function inputOf(step: shift.Step): shift.PlayerInput | null {
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
    case 'choose':
      return { type: 'CHOOSE', option: step.option };
    case 'save_artefact':
      return {
        type: 'SAVE_ARTEFACT',
        artefact: step.artefact,
        fields: step.fields,
        ticks: step.ticks,
      };
    case 'confirm_end':
      return { type: 'CONFIRM_END' };
    default:
      return null;
  }
}

/** Bảng chấm dự kiến, chỉ khi ca đã kết thúc và người chơi làm đúng từng việc như Lan. */
export function sampleChecklistFor(run: SavedRun): SampleChecklist | null {
  const script = AUTOPLAY_SCRIPTS.lan;
  if (run.taskId !== script.seed || !stateOf(run).ended) return null;
  const moves = (inputs: shift.ShiftInput[]) =>
    inputs.flatMap((input) => moveOf(input) ?? []);
  const wanted = script.steps.flatMap((step) => inputOf(step) ?? []);
  return JSON.stringify(moves(run.events)) === JSON.stringify(moves(wanted))
    ? LAN_CHECKLIST
    : null;
}
