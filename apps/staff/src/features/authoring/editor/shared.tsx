import { Button } from '@datn/ui';
/** Phần dùng chung của các tab trong editor D03. */
import type { ReactNode } from 'react';
import type { ScenarioContent } from '../../../api/types';
import { HintList } from '../../shared/Guidance';
import type { Hint } from '../lint';

export interface SkillName {
  competencyId: string;
  name: string;
}

export interface EditorProps {
  content: ScenarioContent;
  onChange: (next: ScenarioContent) => void;
  readOnly: boolean;
  /** Năng lực của scenario (`scenario_skill`), để gắn tiêu chí. */
  skills: SkillName[];
  /** Cấp của scenario, để chọn lời dẫn theo cấp. */
  levelNo: number;
  /** Gợi ý soạn của `lintContent` cho toàn bản đang sửa. */
  hints: Hint[];
  /** Mở hộp "sửa phần này bằng AI" cho đường dẫn `part`. */
  onRevise?: (part: string, label: string) => void;
}

export function ReviseButton({
  onRevise,
  part,
  label,
  readOnly,
}: {
  onRevise?: EditorProps['onRevise'];
  part: string;
  label: string;
  readOnly: boolean;
}) {
  if (!onRevise || readOnly) return null;
  return (
    <Button size="sm" variant="ghost" onClick={() => onRevise(part, label)}>
      <span aria-hidden="true">✨</span> Sửa bằng AI
    </Button>
  );
}

/** Nhóm trường có tiêu đề; `note` là dòng mô tả nhỏ dưới tiêu đề. */
export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <fieldset className="mt-4 rounded-xl border border-line bg-night-900/25 p-4">
      <legend className="px-1 text-[13px] font-semibold">{title}</legend>
      {note && <p className="mb-3 text-[12px] text-ink-faint">{note}</p>}
      {children}
    </fieldset>
  );
}

/** Gợi ý có đường dẫn bắt đầu bằng `prefix`, hiện ngay trong khối đang sửa. */
export function InlineHints({
  hints,
  prefix,
  exact,
}: {
  hints: Hint[];
  prefix: string;
  /** Chỉ lấy gợi ý đúng đường dẫn này, không lấy phần con. */
  exact?: boolean;
}) {
  const mine = hints.filter((h) =>
    exact
      ? h.path === prefix
      : h.path === prefix ||
        h.path.startsWith(`${prefix}.`) ||
        h.path.startsWith(`${prefix}[`),
  );
  if (mine.length === 0) return null;
  return (
    <div className="mb-3">
      <HintList hints={mine} />
    </div>
  );
}
