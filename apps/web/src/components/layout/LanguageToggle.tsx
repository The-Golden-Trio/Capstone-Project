import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import type { Language } from '../../i18n/messages';
import { useLanguageStore, useT } from '../../i18n/useT';

const OPTIONS: Array<{ code: Language; label: string; short: string }> = [
  { code: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { code: 'en', label: 'English', short: 'EN' },
];

/**
 * Chọn ngôn ngữ, nằm trên thanh đầu trang.
 *
 * Đặt ở header chứ không giấu trong trang Tài khoản, vì người chưa đăng nhập
 * cũng cần đổi được — màn đăng nhập là thứ họ gặp đầu tiên.
 */
export function LanguageToggle() {
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const current = OPTIONS.find((o) => o.code === language) ?? OPTIONS[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={t('top.language')}
        className={cx(
          'flex items-center gap-1.5 rounded-full border px-2.5 py-[5px] font-mono text-[11px] transition-colors',
          open
            ? 'border-gold bg-gold-soft text-gold-2'
            : 'border-line-2 bg-inset text-ink-2 hover:border-gold',
        )}
      >
        <svg
          viewBox="0 0 20 20"
          className="h-[13px] w-[13px] opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7.5" />
          <path d="M2.5 10h15M10 2.5c2 2.4 2 12.6 0 15M10 2.5c-2 2.4-2 12.6 0 15" />
        </svg>
        {current.short}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('top.language')}
          className="toast-pop absolute right-0 top-[calc(100%+8px)] z-40 w-[150px] overflow-hidden rounded-[10px] border border-line bg-surf shadow-lift"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              role="option"
              aria-selected={option.code === language}
              onClick={() => {
                setLanguage(option.code);
                setOpen(false);
              }}
              className={cx(
                'flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] transition-colors',
                option.code === language
                  ? 'bg-gold-soft font-semibold text-gold-2'
                  : 'text-ink-2 hover:bg-panel',
              )}
            >
              {option.label}
              {option.code === language && (
                <span aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
