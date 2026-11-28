import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass } from 'lucide-react';
import {
  EmptyState,
  MEDAL,
  ToonButton,
  ToonDisclosure,
  ToonProgress,
  cn,
} from '@datn/ui';

import { errorText } from '../../api/hooks';
import type {
  KeywordRef,
  RatingCriterion,
  RatingSummary,
} from '../../api/types';

/** Dòng "Xem thêm" nhỏ bên trong một chương. */
export const compactDisclosure =
  '[&>summary]:min-h-9 [&>summary]:py-1 [&>summary]:text-sm';

export function LoadError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <EmptyState
      title="Chưa tải được dữ liệu"
      description={errorText(error)}
      action={
        <ToonButton variant="secondary" onClick={retry}>
          Thử lại
        </ToonButton>
      }
    />
  );
}

/** Đoạn văn đầy đủ. `firstSentence`, `words` giữ để tương thích, không cắt nữa. */
export function BriefText({
  text,
}: {
  text: string;
  words?: number;
  firstSentence?: boolean;
}) {
  return <p className="whitespace-pre-line text-sm leading-relaxed">{text}</p>;
}

/**
 * Một chương của hồ sơ nghề: luôn mở, có số thứ tự và ký hiệu riêng. Hồ sơ
 * đọc từ trên xuống như một chuỗi, không phải lưới ô gập phải bấm từng ô.
 */
export function PaperSection({
  id,
  title,
  icon,
  index,
  tone = 'paper',
  children,
}: {
  id?: string;
  title: string;
  icon?: ReactNode;
  /** Số chương trong chuỗi (1-based). */
  index?: number;
  tone?: 'paper' | 'warning';
  children: ReactNode;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'scroll-mt-24 rounded-[24px] p-5 text-toon-ink shadow-soft sm:p-7',
        tone === 'warning' ? 'bg-toon-star-soft' : 'bg-toon-paper',
      )}
    >
      <h2
        id={headingId}
        className="mb-5 flex items-center gap-3 font-toon text-xl font-extrabold leading-tight sm:text-2xl"
      >
        <span
          aria-hidden
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-full',
            tone === 'warning' ? 'bg-toon-paper/80' : 'bg-toon-sand/70',
          )}
        >
          {icon ?? <Compass size={20} />}
        </span>
        <span className="min-w-0 flex-1">{title}</span>
        {index !== undefined && (
          <span
            aria-hidden
            className="font-toon text-sm font-bold tabular-nums text-toon-ink-faint"
          >
            {String(index).padStart(2, '0')}
          </span>
        )}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function TaskList({
  items,
  empty = 'Chưa có thông tin được công bố.',
}: {
  items: string[];
  /** Giữ để tương thích; danh sách luôn hiện đủ, không giấu sau "Xem thêm". */
  limit?: number;
  empty?: string;
}) {
  return items.length ? (
    <ul className="space-y-2.5 text-sm leading-relaxed">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className="mt-2 size-1.5 shrink-0 rounded-full bg-toon-sky-deep"
          />
          <p className="min-w-0 whitespace-pre-line">{text}</p>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-toon-ink-faint">{empty}</p>
  );
}

export function Keywords({
  items,
  empty = 'Chưa có kỹ năng nghề được công bố.',
}: {
  items: KeywordRef[];
  empty?: string;
}) {
  if (!items.length)
    return <p className="text-sm text-toon-ink-faint">{empty}</p>;
  const cards = (entries: KeywordRef[]) => (
    <ul className="toon-rows">
      {entries.map((k) => (
        <li key={k.id} className="flex min-w-0 items-center gap-3 py-2.5">
          <LevelPips level={k.level} />
          <p className="min-w-0 flex-1 break-words text-sm font-bold">
            {k.name}
          </p>
          <span className="shrink-0 text-xs font-semibold text-toon-ink-faint">
            {MEDAL[k.level].name}
          </span>
        </li>
      ))}
    </ul>
  );
  return cards(items);
}

/** Mức kỹ năng 1–3 bằng ba vạch: đọc được mà không cần chữ. */
export function LevelPips({ level }: { level: number }) {
  return (
    <span
      role="img"
      aria-label={`Mức ${level}/3`}
      className="inline-flex shrink-0 items-end gap-0.5"
    >
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          aria-hidden
          className={cn(
            'w-1.5 rounded-full',
            n === 1 ? 'h-2' : n === 2 ? 'h-3' : 'h-4',
            n <= level ? 'bg-toon-ink' : 'bg-toon-ink/15',
          )}
        />
      ))}
    </span>
  );
}

export function KeywordLegend() {
  return (
    <ToonDisclosure
      summary="Ba mức kỹ năng"
      className={cn('text-xs text-toon-ink-faint', compactDisclosure)}
    >
      <p>
        Làm quen · có hướng dẫn; Thành thạo · tự làm việc thường gặp; Chuyên sâu
        · xử lý việc khó và hướng dẫn người khác.
      </p>
    </ToonDisclosure>
  );
}

export function Ratings({
  summary,
  criteria,
}: {
  summary: RatingSummary;
  criteria: RatingCriterion[];
}) {
  if (summary.withheld)
    return (
      <p className="text-sm">Cần thêm người đánh giá trước khi công bố số.</p>
    );
  if (!summary.responseCount || !Object.keys(summary.averages).length)
    return (
      <p className="text-sm text-toon-ink-faint">
        Chưa có đánh giá được công bố.
      </p>
    );
  return (
    <div className="space-y-5">
      <p className="text-xs text-toon-ink-faint">
        Từ {summary.responseCount} người đã đi hết nghề · thang 1–5, điểm cao
        mang nghĩa khác nhau ở từng tiêu chí.
      </p>
      {criteria.map((c) => (
        <div key={c.code}>
          <ToonProgress
            label={c.name}
            max={5}
            value={summary.averages[c.code] ?? 0}
            showValue
            valueText={
              summary.averages[c.code] == null
                ? 'Chưa có số liệu'
                : `${summary.averages[c.code].toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/5`
            }
          />
          <div className="mt-2 flex justify-between gap-4 text-xs text-toon-ink-faint">
            <span>{c.low}</span>
            <span className="text-right">{c.high}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RoleLinks({
  roles,
}: {
  roles: Array<{ code: string; name: string }>;
}) {
  const links = (entries: typeof roles) => (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {entries.map((r) => (
        <li key={r.code}>
          {/* Liên kết sang nghề khác: chữ có mũi tên, không mặc áo nút. */}
          <Link
            to={`/occupations/${r.code}`}
            className="group inline-flex items-center gap-1 rounded-md text-sm font-bold text-toon-sky-deep underline decoration-2 decoration-toon-sky-deep/30 underline-offset-4 hover:decoration-toon-sky-deep focus-visible:shadow-toon-focus"
          >
            {r.name}
            <ArrowUpRight
              size={14}
              strokeWidth={2.6}
              aria-hidden
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
  return links(roles);
}

/** Đảo nổi chỉ dùng mảng màu phẳng; trạng thái luôn có chữ bên ngoài hình. */
export function CareerIsland({
  levelNo,
  color,
  active = false,
  locked = false,
  className,
}: {
  levelNo: number;
  color: string;
  active?: boolean;
  locked?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 180 132"
      className={cn('w-full max-w-40', className)}
    >
      {active && (
        <ellipse
          cx="90"
          cy="100"
          rx="76"
          ry="24"
          fill="none"
          stroke="var(--color-toon-star)"
          strokeWidth="2.5"
          strokeDasharray="5 7"
        />
      )}
      <path
        d="m27 65 19 35 29 8 16 14 19-18 24-7 20-32Z"
        fill="var(--color-toon-night-soft)"
        stroke="var(--color-toon-night-deep)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="m48 78 28 15 15 29 9-29 35-15"
        fill="var(--color-toon-night-line)"
        stroke="var(--color-toon-night-deep)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M24 62 44 44 73 37 108 40 135 42 157 62 143 80 107 85 77 81 41 83Z"
        fill={locked ? 'var(--color-toon-night-line)' : color}
        stroke="var(--color-toon-night-deep)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M70 59 92 52 116 63 92 75Z"
        fill="var(--color-toon-paper)"
        stroke="var(--color-toon-night-deep)"
        strokeWidth="3"
      />
      <path
        d="M92 52V17"
        stroke="var(--color-toon-night-deep)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m92 17 33 8-33 10Z"
        fill={active ? 'var(--color-toon-star)' : 'var(--color-toon-paper)'}
        stroke="var(--color-toon-night-deep)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <text
        x="92"
        y="69"
        textAnchor="middle"
        fontFamily="var(--font-toon)"
        fontWeight="800"
        fontSize="15"
        fill="var(--color-toon-night-deep)"
      >
        {levelNo}
      </text>
      <path
        d="m47 55 5-9 5 9Z m78 12 4-8 5 8Z"
        fill="var(--color-toon-night-deep)"
      />
    </svg>
  );
}
