import { useId, useState } from 'react';
import {
  FileText,
  Flag,
  Hourglass,
  Lock,
  MessageCircle,
  PenLine,
  Play,
  Send,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { ToonTabPanel, ToonTabs, cn } from '@datn/ui';
import type { SceneView } from '../../api/types';

type Action = SceneView['actions'][number];

/** Nhóm việc, màu ô biểu tượng lấy từ bảng màu tô phẳng của theme. */
export const ACTION_GROUPS = {
  'Hỏi người': { color: '#a6d2ea', icon: MessageCircle },
  'Xem tài liệu': { color: '#a8dbb9', icon: FileText },
  'Làm việc': { color: '#eea7b4', icon: PenLine },
  Chốt: { color: '#f0b63c', icon: Flag },
} as const;
export type ActionGroup = keyof typeof ACTION_GROUPS;

const KIND: Record<string, { icon: LucideIcon; group: ActionGroup }> = {
  talk: { icon: MessageCircle, group: 'Hỏi người' },
  meeting: { icon: Users, group: 'Hỏi người' },
  open: { icon: FileText, group: 'Xem tài liệu' },
  run: { icon: Play, group: 'Làm việc' },
  write: { icon: PenLine, group: 'Làm việc' },
  rewrite: { icon: PenLine, group: 'Làm việc' },
  message: { icon: Send, group: 'Làm việc' },
  wait: { icon: Hourglass, group: 'Làm việc' },
  trigger: { icon: Flag, group: 'Chốt' },
};

/** Nhóm của một việc (dùng cả trong test để mở đúng tab). */
export const groupOf = (kind: string): ActionGroup =>
  KIND[kind]?.group ?? 'Làm việc';

const GROUP_ORDER: ActionGroup[] = [
  'Hỏi người',
  'Xem tài liệu',
  'Làm việc',
  'Chốt',
];

/**
 * Khay chọn việc ở pha xử lý: bốn nhóm thành tab, mỗi lần chỉ thấy vài
 * việc của một nhóm để người chơi không bị một danh sách dài đập vào mắt.
 * Việc bị khoá vẫn hiện kèm lý do, để người chơi hiểu luật thay vì đoán.
 */
export function ActionTray({
  actions,
  minutesPerPoint,
  disabled,
  onPick,
  suspended,
}: {
  actions: Action[];
  minutesPerPoint: number;
  disabled: boolean;
  onPick: (a: Action) => void;
  suspended?: { label: string; remaining: number } | null;
}) {
  const idBase = useId();
  const groups = GROUP_ORDER.map((g) => ({
    name: g,
    items: actions.filter((a) => groupOf(a.kind) === g),
  })).filter((g) => g.items.length);
  const [tab, setTab] = useState<ActionGroup>(
    groups.find((g) => g.items.some((a) => a.enabled))?.name ??
      groups[0]?.name ??
      'Hỏi người',
  );
  const current = groups.find((g) => g.name === tab) ?? groups[0];
  if (!current) return null;

  return (
    <div className="flex flex-col gap-3">
      {suspended && (
        <p className="rounded-xl border-2 border-toon-ink bg-[#ffe4a3] px-3 py-1.5 text-sm font-bold text-toon-ink">
          Đang dở: {suspended.label} (còn {suspended.remaining} điểm)
        </p>
      )}
      <ToonTabs
        label="Nhóm việc"
        idBase={idBase}
        value={current.name}
        onChange={setTab}
        items={groups.map((g) => {
          const Icon = ACTION_GROUPS[g.name].icon;
          return {
            key: g.name,
            label: g.name,
            icon: <Icon size={15} strokeWidth={2.6} aria-hidden />,
            count: g.items.filter((a) => a.enabled).length,
          };
        })}
      />
      <ToonTabPanel idBase={idBase} tabKey={current.name} active>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {current.items.map((a) => (
            <li key={a.key}>
              <ActionButton
                action={a}
                minutesPerPoint={minutesPerPoint}
                disabled={disabled}
                onPick={onPick}
              />
            </li>
          ))}
        </ul>
      </ToonTabPanel>
    </div>
  );
}

function ActionButton({
  action: a,
  minutesPerPoint,
  disabled,
  onPick,
}: {
  action: Action;
  minutesPerPoint: number;
  disabled: boolean;
  onPick: (a: Action) => void;
}) {
  const meta = KIND[a.kind] ?? KIND.run;
  const Icon = meta.icon;
  const off = disabled || !a.enabled;
  return (
    <>
      <button
        type="button"
        disabled={off}
        onClick={() => onPick(a)}
        title={!a.enabled ? a.reason : undefined}
        aria-describedby={!a.enabled && a.reason ? `why-${a.key}` : undefined}
        className={cn(
          'group flex size-full items-center gap-3 rounded-2xl border-[2.5px] border-toon-ink px-2.5 py-2 text-left font-toon-body text-[15px] font-bold leading-snug text-toon-ink shadow-toon-sm transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:shadow-toon-focus',
          a.kind === 'trigger' ? 'bg-[#ffe4a3]' : 'bg-toon-paper',
          off
            ? 'cursor-not-allowed border-toon-ink/40 bg-toon-sand/70 text-toon-ink-faint shadow-none'
            : 'hover:-translate-y-0.5 hover:shadow-toon active:translate-y-0.5 active:shadow-toon-press',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-xl border-[2.5px] border-toon-ink',
            off && 'border-toon-ink/40 opacity-60',
          )}
          style={{ backgroundColor: ACTION_GROUPS[meta.group].color }}
        >
          {!a.enabled ? (
            <Lock size={16} strokeWidth={2.6} />
          ) : (
            <Icon size={17} strokeWidth={2.6} />
          )}
        </span>
        <span className="min-w-0 flex-1">{a.label}</span>
        {a.points > 0 && (
          <span
            className={cn(
              'tabular shrink-0 rounded-lg border-2 border-toon-ink bg-toon-cream px-1.5 py-0.5 text-xs font-extrabold',
              off && 'border-toon-ink/40',
            )}
            title={`${a.points} điểm thời gian, ${a.points * minutesPerPoint} phút`}
          >
            {a.points * minutesPerPoint}′
          </span>
        )}
      </button>
      {!a.enabled && a.reason && (
        <span id={`why-${a.key}`} className="visually-hidden">
          {a.reason}
        </span>
      )}
    </>
  );
}
