import { useEffect, useState, type MouseEvent } from 'react';
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
import { cn } from '@datn/ui';
import type { SceneView } from '../../api/types';
import { WORKBENCH_TABS, placeOf } from './workbench/model';

type Action = SceneView['actions'][number];

const ICON: Record<string, LucideIcon> = {
  talk: MessageCircle,
  meeting: Users,
  open: FileText,
  run: Play,
  write: PenLine,
  rewrite: PenLine,
  message: Send,
  wait: Hourglass,
  trigger: Flag,
};

const colorOf = (kind: string) => {
  const place = placeOf(kind);
  return place === 'trigger'
    ? '#f0b63c'
    : (WORKBENCH_TABS.find((tab) => tab.key === place)?.color ?? '#eea7b4');
};

/** Lý do engine ghi cho mọi việc khi ca đã khép (game-core, shift/context.ts). */

/** Ngay sau khi hộp thoại hoặc khung nói đổi thành khay việc, cú chạm định qua nhịp có thể rơi vào một nút việc. */
export const TAP_GUARD_MS = 400;

export function useTapGuard(disabled: boolean) {
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

/**
 * Danh sách việc của một tab. Việc làm được hiện trước ở dạng nút đầy đủ; việc
 * bị khoá xuống dưới, gọn một dòng nhưng vẫn kèm lý do để người chơi hiểu luật.
 */
export function ActionList({
  actions,
  minutesPerPoint,
  disabled,
  onPick,
  label,
}: {
  actions: Action[];
  minutesPerPoint: number;
  disabled: boolean;
  onPick: (a: Action) => void;
  label: string;
}) {
  const guarded = useTapGuard(disabled);
  if (!actions.length) return null;
  const ordered = [
    ...actions.filter((a) => a.enabled),
    ...actions.filter((a) => !a.enabled),
  ];
  return (
    <ul aria-label={label} className="grid gap-2">
      {ordered.map((a) => (
        <li key={a.key}>
          <ActionButton
            action={a}
            minutesPerPoint={minutesPerPoint}
            disabled={disabled}
            guarded={guarded}
            compact={!a.enabled}
            showReason
            onPick={onPick}
          />
        </li>
      ))}
    </ul>
  );
}

export function ActionButton({
  action: a,
  minutesPerPoint,
  disabled,
  guarded = false,
  onPick,
  compact = false,
  showReason = false,
}: {
  action: Action;
  minutesPerPoint: number;
  disabled: boolean;
  guarded?: boolean;
  onPick: (a: Action) => void;
  /** Một dòng, không có ô biểu tượng to: nút gắn trên tài liệu, thẻ người, việc đang khoá. */
  compact?: boolean;
  /** Hiện lý do khoá thành chữ thay vì chỉ đọc cho trình đọc màn hình. */
  showReason?: boolean;
}) {
  const Icon = ICON[a.kind] ?? Play;
  const off = disabled || !a.enabled;
  const why = !a.enabled && a.reason ? `why-${a.key}` : undefined;
  return (
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
      aria-describedby={why}
      className={cn(
        'group flex w-full items-center text-left font-toon-body font-bold leading-snug transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:shadow-toon-focus',
        compact
          ? 'min-h-11 gap-2 rounded-xl border-2 px-2.5 py-1.5 text-sm'
          : 'min-h-14 gap-3 rounded-2xl border-[2.5px] px-2.5 py-2 text-[15px]',
        !off && (a.kind === 'trigger' ? 'bg-[#ffe4a3]' : 'bg-toon-paper'),
        off
          ? 'cursor-not-allowed border-toon-ink/40 bg-toon-sand/70 text-toon-ink-soft shadow-none'
          : 'border-toon-ink text-toon-ink shadow-toon-sm hover:-translate-y-0.5 hover:shadow-toon active:translate-y-0.5 active:shadow-toon-press',
      )}
    >
      {compact ? (
        !a.enabled ? (
          <Lock size={14} strokeWidth={2.6} aria-hidden className="shrink-0" />
        ) : (
          <Icon size={15} strokeWidth={2.6} aria-hidden className="shrink-0" />
        )
      ) : (
        <span
          aria-hidden
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-xl border-[2.5px]',
            off ? 'border-toon-ink/40 opacity-60' : 'border-toon-ink',
          )}
          style={{ backgroundColor: colorOf(a.kind) }}
        >
          {!a.enabled ? (
            <Lock size={16} strokeWidth={2.6} />
          ) : (
            <Icon size={17} strokeWidth={2.6} />
          )}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block">{a.label}</span>
        {why && (
          <span
            id={why}
            className={cn(
              'block text-xs font-semibold text-toon-ink-soft',
              compact && !showReason && 'sr-only',
              !compact && 'mt-0.5',
            )}
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
  );
}

/**
 * Nút chốt của ca (seed D1: người chơi tự chốt để sang nút tiếp). Hiện việc
 * chốt đang mở; chưa mở được thì hiện việc chốt đầu tiên kèm lý do.
 */
export function TriggerButtons({
  actions,
  ended,
  disabled,
  onPick,
  className,
}: {
  actions: Action[];
  ended: boolean;
  disabled: boolean;
  onPick: (a: Action) => void;
  className?: string;
}) {
  if (ended) return null;
  const triggers = actions.filter((a) => a.kind === 'trigger');
  const open = triggers.filter((a) => a.enabled);
  const shown = open.length ? open : triggers.slice(0, 1);
  if (!shown.length) return null;
  return (
    <div className={cn('flex shrink-0 items-center gap-2', className)}>
      {shown.map((a) => {
        const off = disabled || !a.enabled;
        return (
          <button
            key={a.key}
            type="button"
            disabled={off}
            data-action-key={a.key}
            title={!a.enabled ? a.reason : undefined}
            onClick={() => onPick(a)}
            className={cn(
              'inline-flex min-h-11 items-center gap-1.5 rounded-full border-[2.5px] px-3.5 py-1 font-toon text-sm font-extrabold transition-[transform,box-shadow] duration-150 focus-visible:outline-none focus-visible:shadow-toon-focus',
              off
                ? 'cursor-not-allowed border-toon-ink/40 bg-toon-sand/70 text-toon-ink-faint'
                : 'border-toon-ink bg-toon-mustard text-toon-ink shadow-toon-sm hover:-translate-y-0.5 hover:shadow-toon active:translate-y-0.5 active:shadow-toon-press',
            )}
          >
            {a.enabled ? (
              <Flag size={15} strokeWidth={2.6} aria-hidden />
            ) : (
              <Lock size={14} strokeWidth={2.6} aria-hidden />
            )}
            {a.label}
            {!a.enabled && a.reason && (
              <span className="sr-only">: {a.reason}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
