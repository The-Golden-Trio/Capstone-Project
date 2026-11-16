import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';

export interface MenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  onSelect: () => void;
}
export interface MenuProps {
  trigger: (props: ButtonHTMLAttributes<HTMLButtonElement>) => ReactNode;
  items: MenuItem[];
  label?: string;
}
export function Menu({ trigger, items, label = 'Tuỳ chọn' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const initial = useRef(0);
  const id = useId();
  const close = () => {
    setOpen(false);
    root.current
      ?.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')
      ?.focus();
  };
  useEffect(() => {
    if (!open) return;
    menu.current
      ?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
      [initial.current]?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return (
    <div
      ref={root}
      className="relative inline-block"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      {trigger({
        type: 'button',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? id : undefined,
        onClick: () => {
          initial.current = 0;
          setOpen(!open);
        },
        onKeyDown: (e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            initial.current = e.key === 'ArrowUp' ? items.length - 1 : 0;
            setOpen(true);
          }
        },
      })}
      {open && (
        <div
          ref={menu}
          id={id}
          role="menu"
          aria-label={label}
          className="absolute right-0 top-full z-50 mt-2 min-w-52 rounded-xl border border-line-gold bg-night-900 p-1.5 shadow-lift"
          onKeyDown={(e) => {
            const buttons = Array.from(
              e.currentTarget.querySelectorAll<HTMLButtonElement>(
                '[role="menuitem"]',
              ),
            );
            const index = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            if (e.key === 'Escape') {
              e.preventDefault();
              close();
            }
            const next =
              e.key === 'ArrowDown'
                ? (index + 1) % buttons.length
                : e.key === 'ArrowUp'
                  ? (index - 1 + buttons.length) % buttons.length
                  : e.key === 'Home'
                    ? 0
                    : e.key === 'End'
                      ? buttons.length - 1
                      : null;
            if (next !== null) {
              e.preventDefault();
              buttons[next]?.focus();
            }
          }}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                close();
                item.onSelect();
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm hover:bg-night-700 focus:bg-night-700',
                item.danger ? 'text-danger' : 'text-ink-muted',
              )}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
