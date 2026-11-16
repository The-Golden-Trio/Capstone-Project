import {
  FileText,
  Flag,
  Hourglass,
  MessageCircle,
  PenLine,
  Play,
  Send,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@datn/ui';
import type { SceneView } from '../../api/types';

type Action = SceneView['actions'][number];

const KIND: Record<string, { icon: LucideIcon; group: string }> = {
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

const GROUP_ORDER = ['Chốt', 'Hỏi người', 'Xem tài liệu', 'Làm việc'];

/**
 * Danh sách việc làm được ở pha xử lý, kèm giá bằng điểm thời gian. Việc
 * bị khoá vẫn hiện, kèm lý do, để người chơi hiểu luật thay vì đoán.
 */
export function ActionPanel({
  actions,
  minutesPerPoint,
  disabled,
  onPick,
  compact = false,
}: {
  actions: Action[];
  minutesPerPoint: number;
  disabled: boolean;
  onPick: (a: Action) => void;
  compact?: boolean;
}) {
  const groups = GROUP_ORDER.map((g) => ({
    name: g,
    items: actions.filter((a) => (KIND[a.kind]?.group ?? 'Làm việc') === g),
  })).filter((g) => g.items.length);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <section key={g.name} aria-label={g.name}>
          <h3 className="eyebrow mb-2 text-night-300">{g.name}</h3>
          <ul className={cn('grid gap-1.5', compact && 'grid-cols-2')}>
            {g.items.map((a) => {
              const meta = KIND[a.kind] ?? KIND.run;
              const Icon = meta.icon;
              const isTrigger = a.kind === 'trigger';
              const off = disabled || !a.enabled;
              const btn = (
                <button
                  type="button"
                  disabled={off}
                  onClick={() => onPick(a)}
                  title={!a.enabled ? a.reason : undefined}
                  aria-describedby={
                    !a.enabled && a.reason ? `why-${a.key}` : undefined
                  }
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed',
                    isTrigger
                      ? 'border-gold-500/50 bg-gold-900/35 text-gold-100 hover:bg-gold-900/60 disabled:border-line disabled:bg-transparent disabled:text-night-400'
                      : 'border-line bg-night-800/50 text-ink hover:border-line-strong hover:bg-night-700/60 disabled:text-night-400 disabled:hover:bg-night-800/50',
                  )}
                >
                  <Icon
                    size={16}
                    aria-hidden
                    className={cn(
                      'shrink-0',
                      isTrigger
                        ? 'text-gold-300'
                        : 'text-night-300 group-hover:text-gold-300',
                    )}
                  />
                  <span className="min-w-0 flex-1 leading-snug">{a.label}</span>
                  {a.points > 0 && (
                    <span className="tabular shrink-0 rounded bg-night-950/60 px-1.5 py-0.5 text-[11px] font-semibold text-ink-faint">
                      {a.points}đ · {a.points * minutesPerPoint}′
                    </span>
                  )}
                </button>
              );
              return (
                <li key={a.key}>
                  {btn}
                  {!a.enabled && a.reason && (
                    <span id={`why-${a.key}`} className="visually-hidden">
                      {a.reason}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="text-[11px] text-night-300">
        đ = điểm thời gian. Một cuộc trò chuyện tối đa 3 lượt tốn 1 điểm.
      </p>
    </div>
  );
}
