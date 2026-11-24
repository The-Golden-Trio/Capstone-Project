import { useEffect, useId, useState, type MouseEvent } from 'react';
import {
  Clock3,
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

/** Ngay sau khi hộp thoại hoặc khung nói đổi thành khay việc, cú chạm định qua nhịp có thể rơi vào một nút việc. */
export const TAP_GUARD_MS = 400;

function useTapGuard(disabled: boolean) {
  const [guarded, setGuarded] = useState(false);
  useEffect(() => {
    if (disabled) return;
    setGuarded(true);
    const id = window.setTimeout(() => setGuarded(false), TAP_GUARD_MS);
    return () => window.clearTimeout(id);
  }, [disabled]);
  return guarded;
}

/** Chuột và bàn phím không bị chặn: chỉ cú chạm mới có kiểu "chạm xuyên". */
function isTouchTap(event: MouseEvent) {
  const type = (event.nativeEvent as { pointerType?: string }).pointerType;
  return (
    type === 'touch' ||
    type === 'pen' ||
    (type === undefined &&
      window.matchMedia?.('(pointer: coarse)').matches === true)
  );
}

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
  cast,
}: {
  actions: Action[];
  minutesPerPoint: number;
  disabled: boolean;
  onPick: (a: Action) => void;
  suspended?: { label: string; remaining: number } | null;
  cast: SceneView['cast'];
}) {
  const idBase = useId();
  const guarded = useTapGuard(disabled);
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
          Đang dở: {suspended.label} (còn {suspended.remaining} lượt)
        </p>
      )}
      <ToonTabs
        label="Nhóm việc"
        variant="quiet"
        idBase={idBase}
        value={current.name}
        onChange={setTab}
        items={groups.map((g) => {
          const Icon = ACTION_GROUPS[g.name].icon;
          return {
            key: g.name,
            label: g.name,
            icon: <Icon size={15} strokeWidth={2.6} aria-hidden />,
            // Chỉ tab đang mở hiện số việc, để hàng tab không thành một dãy huy hiệu.
            count:
              g.name === current.name
                ? g.items.filter((a) => a.enabled).length
                : undefined,
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
                guarded={guarded}
                status={
                  a.kind === 'talk'
                    ? cast.find((person) => person.slot === a.target)?.status
                    : undefined
                }
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
  guarded,
  onPick,
  status,
}: {
  action: Action;
  minutesPerPoint: number;
  disabled: boolean;
  guarded: boolean;
  onPick: (a: Action) => void;
  status?: string;
}) {
  const meta = KIND[a.kind] ?? KIND.run;
  const Icon = meta.icon;
  const off = disabled || !a.enabled;
  return (
    <>
      <button
        type="button"
        disabled={off}
        onClick={(event) => {
          if (guarded && isTouchTap(event)) return;
          onPick(a);
        }}
        data-action-key={a.key}
        data-tap-guard={guarded || undefined}
        title={!a.enabled ? a.reason : undefined}
        aria-describedby={!a.enabled && a.reason ? `why-${a.key}` : undefined}
        className={cn(
          'group flex size-full items-center gap-3 rounded-2xl border-[2.5px] px-2.5 py-2 text-left font-toon-body text-[15px] font-bold leading-snug transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:shadow-toon-focus',
          !off && (a.kind === 'trigger' ? 'bg-[#ffe4a3]' : 'bg-toon-paper'),
          off
            ? 'cursor-not-allowed border-toon-ink/40 bg-toon-sand/70 text-toon-ink-faint shadow-none'
            : 'border-toon-ink text-toon-ink shadow-toon-sm hover:-translate-y-0.5 hover:shadow-toon active:translate-y-0.5 active:shadow-toon-press',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-xl border-[2.5px]',
            off ? 'border-toon-ink/40 opacity-60' : 'border-toon-ink',
          )}
          style={{ backgroundColor: ACTION_GROUPS[meta.group].color }}
        >
          {!a.enabled ? (
            <Lock size={16} strokeWidth={2.6} />
          ) : (
            <Icon size={17} strokeWidth={2.6} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block">
            {a.label}
            {status && (
              <span className="mt-0.5 block text-xs font-semibold text-toon-ink-soft">
                {status}
              </span>
            )}
          </span>
          {!a.enabled && a.reason && (
            <span
              id={`why-${a.key}`}
              className="mt-0.5 block text-xs font-semibold text-toon-ink-faint"
            >
              {a.reason}
            </span>
          )}
        </span>
        {a.enabled && a.points > 0 && (
          <span
            className="tabular inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-toon-ink-soft"
            title={`Mất khoảng ${a.points * minutesPerPoint} phút trong ca`}
          >
            <Clock3 size={13} strokeWidth={2.6} aria-hidden />
            {a.points} lượt
          </span>
        )}
      </button>
    </>
  );
}
