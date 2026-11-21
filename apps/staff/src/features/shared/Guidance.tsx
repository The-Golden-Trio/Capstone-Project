/**
 * Khối hiển thị hướng dẫn và gợi ý soạn theo research: lời dẫn cạnh trường,
 * danh sách gợi ý của máy, checklist tự rà. Đều không chặn thao tác nào.
 */
import { useState, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import type { ChecklistItem, Guide } from '../authoring/guidance';
import type { Hint } from '../authoring/lint';

/** Nguồn research nhỏ, in đơn cách. */
export function SourceTag({ children }: { children: ReactNode }) {
  return (
    <span className="ml-1.5 font-mono text-[10.5px] whitespace-nowrap text-ink-faint">
      [{children}]
    </span>
  );
}

/** Lời dẫn dùng làm `hint` của ô nhập. */
export function guideHint(guide: Guide): ReactNode {
  return (
    <>
      {guide.text}
      <SourceTag>{guide.source}</SourceTag>
    </>
  );
}

/** Danh sách gợi ý của máy; `onOpen` nhảy tới chỗ cần sửa. */
export function HintList({
  hints,
  onOpen,
  empty = 'Không có gợi ý nào.',
}: {
  hints: Hint[];
  onOpen?: (hint: Hint) => void;
  empty?: string;
}) {
  if (hints.length === 0)
    return <p className="text-[13px] text-success">{empty}</p>;
  return (
    <ul className="space-y-1.5">
      {hints.map((h, i) => (
        <li
          key={`${h.id}-${h.path}-${i}`}
          className={cx(
            'flex items-start gap-2 rounded-lg border px-3 py-1.5 text-[13px]',
            h.severity === 'warn'
              ? 'border-warning/30 bg-warning/10 text-warning'
              : 'border-line-strong/30 bg-night-900/35 text-ink-muted',
          )}
        >
          <span aria-hidden="true" className="mt-px">
            {h.severity === 'warn' ? '⚠' : 'ℹ'}
          </span>
          <span className="min-w-0 flex-1">
            {h.message}
            <SourceTag>{h.source}</SourceTag>
          </span>
          {onOpen && (
            <button
              type="button"
              onClick={() => onOpen(h)}
              className="shrink-0 text-[12px] font-semibold text-info hover:underline"
            >
              Mở
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Nhãn đếm gợi ý trên tab. */
export function HintCount({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-warning/10 px-1 text-[10px] text-warning">
      {n}
    </span>
  );
}

function readChecked(key: string | undefined): string[] {
  if (!key) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const v: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Checklist tự rà. Trạng thái chỉ nằm ở trình duyệt của người đang xem
 * (`storageKey`), không gửi lên máy chủ.
 */
export function Checklist({
  items,
  storageKey,
  disabled,
}: {
  items: ChecklistItem[];
  storageKey?: string;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState<string[]>(() =>
    readChecked(storageKey),
  );
  const toggle = (id: string) =>
    setChecked((cur) => {
      const next = cur.includes(id)
        ? cur.filter((x) => x !== id)
        : [...cur, id];
      if (storageKey)
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* bộ nhớ trình duyệt bị chặn: vẫn dùng được trong phiên */
        }
      return next;
    });
  const done = items.filter((i) => checked.includes(i.id)).length;
  return (
    <div>
      <p className="mb-2 text-[12px] text-ink-faint">
        Đã rà {done}/{items.length}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-2 text-[13px]">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-brand"
                checked={checked.includes(item.id)}
                disabled={disabled}
                onChange={() => toggle(item.id)}
              />
              <span>
                {item.text}
                <SourceTag>{item.source}</SourceTag>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type StepState = 'done' | 'current' | 'todo';

/** Thanh bước soạn; bấm một bước để mở tab tương ứng. */
export function Stepper<T extends string>({
  steps,
  onSelect,
}: {
  steps: Array<{ id: T; label: string; state: StepState; note?: string }>;
  onSelect?: (id: T) => void;
}) {
  return (
    <ol
      aria-label="Các bước soạn"
      className="mb-5 flex flex-wrap items-center gap-x-1 gap-y-2"
    >
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden="true" className="px-1 text-ink-faint">
              ›
            </span>
          )}
          <button
            type="button"
            onClick={() => onSelect?.(s.id)}
            aria-current={s.state === 'current' ? 'step' : undefined}
            className={cx(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors',
              s.state === 'done' &&
                'border-success/40 bg-success/10 text-success',
              s.state === 'current' &&
                'border-line-strong/60 bg-surface text-info',
              s.state === 'todo' &&
                'border-line-strong/40 text-ink-faint hover:text-ink-muted',
            )}
          >
            <span aria-hidden="true">
              {s.state === 'done' ? '✓' : `${i + 1}`}
            </span>
            {s.label}
            {s.note && <span className="font-normal">· {s.note}</span>}
          </button>
        </li>
      ))}
    </ol>
  );
}

/** Thẻ gọn liệt kê nguyên tắc, dùng ở portal và D03. */
export function PrincipleList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-[13px] text-ink-muted">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}
