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
import { cn } from '@datn/ui';
import type { SceneView } from '../../api/types';

type Action = SceneView['actions'][number];

/** Nhóm việc, màu ô biểu tượng lấy từ bảng màu tô phẳng của theme. */
const GROUPS = {
  Chốt: { color: '#f0b63c' },
  'Hỏi người': { color: '#a6d2ea' },
  'Xem tài liệu': { color: '#a8dbb9' },
  'Làm việc': { color: '#eea7b4' },
} as const;
type Group = keyof typeof GROUPS;

const KIND: Record<string, { icon: LucideIcon; group: Group }> = {
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

const GROUP_ORDER: Group[] = ['Chốt', 'Hỏi người', 'Xem tài liệu', 'Làm việc'];

/**
 * Danh sách việc làm được ở pha xử lý, kèm giá bằng điểm thời gian. Việc
 * bị khoá vẫn hiện, kèm lý do, để người chơi hiểu luật thay vì đoán.
 */
export function ActionPanel({
  actions,
  minutesPerPoint,
  disabled,
  onPick,
}: {
  actions: Action[];
  minutesPerPoint: number;
  disabled: boolean;
  onPick: (a: Action) => void;
}) {
  const groups = GROUP_ORDER.map((g) => ({
    name: g,
    items: actions.filter((a) => (KIND[a.kind]?.group ?? 'Làm việc') === g),
  })).filter((g) => g.items.length);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <section key={g.name} aria-label={g.name}>
          <h3 className="mb-2 flex items-center gap-2 font-toon text-sm font-extrabold uppercase tracking-wide text-toon-ink-soft">
            <span
              aria-hidden
              className="size-3 rounded-full border-2 border-toon-ink"
              style={{ backgroundColor: GROUPS[g.name].color }}
            />
            {g.name}
          </h3>
          <ul className="grid gap-2.5">
            {g.items.map((a) => {
              const meta = KIND[a.kind] ?? KIND.run;
              const Icon = meta.icon;
              const isTrigger = a.kind === 'trigger';
              const off = disabled || !a.enabled;
              return (
                <li key={a.key}>
                  <button
                    type="button"
                    disabled={off}
                    onClick={() => onPick(a)}
                    title={!a.enabled ? a.reason : undefined}
                    aria-describedby={
                      !a.enabled && a.reason ? `why-${a.key}` : undefined
                    }
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-2xl border-[2.5px] border-toon-ink px-2.5 py-2 text-left font-toon-body text-[15px] font-bold leading-snug text-toon-ink shadow-toon-sm transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:shadow-toon-focus',
                      isTrigger ? 'bg-[#ffe4a3]' : 'bg-toon-paper',
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
                      style={{ backgroundColor: GROUPS[meta.group].color }}
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
                      >
                        {a.points}đ · {a.points * minutesPerPoint}′
                      </span>
                    )}
                  </button>
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
      <p className="text-xs font-semibold text-toon-ink-faint">
        đ = điểm thời gian. Một cuộc trò chuyện tối đa 3 lượt tốn 1 điểm.
      </p>
    </div>
  );
}
