import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Clapperboard } from 'lucide-react';
import { cn } from '@datn/ui';
import { WORKBENCH_TABS, type WorkbenchTab } from './model';

export type TabBadges = Partial<Record<WorkbenchTab, number>>;

/**
 * Bàn làm việc cạnh sân khấu: những gì người chơi dùng được trong ca. Khi có
 * tài liệu hoặc bản soạn đang mở (`viewer`), nó chiếm chỗ của các tab.
 */
export function Workbench({
  tab,
  onTab,
  badges,
  viewer,
  className,
  children,
}: {
  tab: WorkbenchTab;
  onTab: (tab: WorkbenchTab) => void;
  badges: TabBadges;
  viewer: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const idBase = useId();
  const opener = useRef<HTMLElement | null>(null);
  const hasViewer = !!viewer;

  // Đóng tài liệu thì trả focus về nút đã mở nó.
  useLayoutEffect(() => {
    if (hasViewer) {
      const focused = document.activeElement;
      opener.current = focused instanceof HTMLElement ? focused : null;
      return;
    }
    const previous = opener.current;
    opener.current = null;
    if (previous?.isConnected && !previous.closest('[inert]')) previous.focus();
  }, [hasViewer]);

  return (
    <aside
      aria-label="Bàn làm việc"
      data-workbench
      className={cn('flex min-h-0 min-w-0 flex-col', className)}
    >
      {viewer ?? (
        <>
          <div
            role="tablist"
            aria-label="Bàn làm việc"
            className="flex shrink-0 gap-1 border-b-[3px] border-toon-ink bg-toon-paper p-2 max-lg:hidden"
          >
            {WORKBENCH_TABS.map((item, index) => {
              const active = item.key === tab;
              const Icon = item.icon;
              const badge = badges[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  id={`${idBase}-tab-${item.key}`}
                  aria-controls={`${idBase}-panel`}
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  data-workbench-tab={item.key}
                  onClick={() => onTab(item.key)}
                  onKeyDown={(event) => {
                    const last = WORKBENCH_TABS.length - 1;
                    const target =
                      event.key === 'ArrowRight'
                        ? (index + 1) % WORKBENCH_TABS.length
                        : event.key === 'ArrowLeft'
                          ? (index + last) % WORKBENCH_TABS.length
                          : event.key === 'Home'
                            ? 0
                            : event.key === 'End'
                              ? last
                              : -1;
                    if (target < 0) return;
                    event.preventDefault();
                    const next = WORKBENCH_TABS[target];
                    onTab(next.key);
                    event.currentTarget.parentElement
                      ?.querySelector<HTMLElement>(
                        `[data-workbench-tab="${next.key}"]`,
                      )
                      ?.focus();
                  }}
                  className={cn(
                    'relative inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-full border-[2.5px] px-1.5 font-toon text-sm font-bold focus-visible:outline-none focus-visible:shadow-toon-focus',
                    active
                      ? 'border-toon-ink bg-toon-mustard text-toon-ink shadow-toon-sm'
                      : 'border-transparent text-toon-ink-soft hover:bg-toon-sand/70 hover:text-toon-ink',
                  )}
                >
                  <Icon
                    size={15}
                    strokeWidth={2.6}
                    aria-hidden
                    className="shrink-0"
                  />
                  <span className="truncate">{item.label}</span>{' '}
                  {!!badge && (
                    <Badge
                      value={badge}
                      noun={item.badgeNoun}
                      className="absolute -right-0.5 -top-1.5"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div
            role="tabpanel"
            id={`${idBase}-panel`}
            aria-labelledby={`${idBase}-tab-${tab}`}
            className="min-h-0 flex-1 overflow-y-auto bg-toon-cream"
          >
            {children}
          </div>
        </>
      )}
    </aside>
  );
}

function Badge({
  value,
  noun,
  className,
}: {
  value: number;
  noun?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border-2 border-toon-ink bg-toon-paper px-1 font-toon-body text-[11px] font-bold leading-none tabular-nums text-toon-ink',
        className,
      )}
    >
      {noun ? (
        <>
          <span aria-hidden>{value}</span>
          <span className="sr-only">
            {value} {noun}
          </span>
        </>
      ) : (
        value
      )}
    </span>
  );
}

/**
 * Điện thoại: thanh dưới đổi giữa sân khấu và các tab của bàn làm việc,
 * mỗi tab mở toàn màn.
 */
export function WorkbenchNav({
  view,
  onScene,
  onTab,
  badges,
  className,
}: {
  view: 'scene' | WorkbenchTab;
  onScene: () => void;
  onTab: (tab: WorkbenchTab) => void;
  badges: TabBadges;
  className?: string;
}) {
  const items = [
    { key: 'scene' as const, label: 'Cảnh', icon: Clapperboard },
    ...WORKBENCH_TABS,
  ];
  return (
    <nav
      aria-label="Màn chơi"
      className={cn(
        'shrink-0 border-t-[3px] border-toon-ink bg-toon-paper pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = view === item.key;
          const Icon = item.icon;
          const badge = item.key === 'scene' ? 0 : badges[item.key];
          const noun = item.key === 'scene' ? undefined : item.badgeNoun;
          return (
            <li key={item.key}>
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                data-workbench-tab={item.key}
                onClick={() =>
                  item.key === 'scene' ? onScene() : onTab(item.key)
                }
                className={cn(
                  'relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 font-toon text-xs font-bold focus-visible:outline-none focus-visible:shadow-toon-focus',
                  active ? 'text-toon-ink' : 'text-toon-ink-soft',
                )}
              >
                <span
                  className={cn(
                    'grid h-7 w-12 place-items-center rounded-full border-2',
                    active
                      ? 'border-toon-ink bg-toon-mustard'
                      : 'border-transparent',
                  )}
                >
                  <Icon size={17} strokeWidth={2.6} aria-hidden />
                </span>
                {item.label}{' '}
                {!!badge && (
                  <Badge
                    value={badge}
                    noun={noun}
                    className="absolute left-[calc(50%+0.7rem)] top-1"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
