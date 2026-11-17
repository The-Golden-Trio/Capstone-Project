import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Compass } from 'lucide-react';
import { EmptyState, MEDAL, ToonButton, ToonProgress, cn } from '@datn/ui';
import { errorText } from '../../api/hooks';
import type {
  KeywordRef,
  RatingCriterion,
  RatingSummary,
} from '../../api/types';

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

/** Chỉ chia cách hiển thị, giữ nguyên toàn bộ chữ nguồn khi mở đọc tiếp. */
export function BriefText({
  text,
  words = 35,
  firstSentence = false,
}: {
  text: string;
  words?: number;
  firstSentence?: boolean;
}) {
  const sentence = firstSentence
    ? text.match(/^.*?[.!?](?=\s|$)/su)?.[0]
    : undefined;
  const prefix =
    sentence ??
    text.match(new RegExp(`^(?:\\S+\\s+){0,${words - 1}}\\S+`, 'u'))?.[0] ??
    text;
  const rest = text.slice(prefix.length);
  return (
    <div className="text-sm leading-relaxed">
      <p>{prefix}</p>
      {rest.trim() && (
        <details className="mt-2">
          <summary className="w-fit cursor-pointer rounded-md font-bold underline decoration-dotted underline-offset-4 focus-visible:shadow-toon-focus">
            Xem thêm
          </summary>
          <p className="mt-2 whitespace-pre-line">{rest.trimStart()}</p>
        </details>
      )}
    </div>
  );
}

export function PaperSection({
  id,
  title,
  icon,
  children,
  open = false,
}: {
  id?: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details
      id={id}
      open={open || undefined}
      className="group scroll-mt-28 rounded-[22px] border-[3px] border-toon-ink bg-toon-paper text-toon-ink shadow-toon"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-[18px] px-5 py-5 font-toon text-xl font-extrabold focus-visible:shadow-toon-focus sm:px-6 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="text-toon-ink-soft">
          {icon ?? <Compass size={21} />}
        </span>
        <span className="min-w-0 flex-1">{title}</span>
        <ChevronDown
          aria-hidden
          size={20}
          className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="space-y-5 border-t-2 border-dashed border-toon-shade px-5 py-5 sm:px-6">
        {children}
      </div>
    </details>
  );
}

export function TaskList({
  items,
  limit = 3,
  empty = 'Chưa có thông tin được công bố.',
}: {
  items: string[];
  limit?: number;
  empty?: string;
}) {
  const list = (entries: string[]) => (
    <ul className="space-y-3 text-sm leading-relaxed">
      {entries.map((text, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className="mt-2 size-1.5 shrink-0 rounded-full bg-toon-sky-deep"
          />
          <div className="min-w-0">
            <BriefText text={text} />
          </div>
        </li>
      ))}
    </ul>
  );
  return items.length ? (
    <div>
      {list(items.slice(0, limit))}
      {items.length > limit && (
        <details className="mt-4">
          <summary className="w-fit cursor-pointer rounded-md text-sm font-bold underline underline-offset-4 focus-visible:shadow-toon-focus">
            Xem thêm ({items.length - limit})
          </summary>
          <div className="mt-3">{list(items.slice(limit))}</div>
        </details>
      )}
    </div>
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
    <ul className="grid gap-3 sm:grid-cols-2">
      {entries.map((k) => (
        <li
          key={k.id}
          className="flex min-w-0 items-center gap-3 rounded-2xl border-2 border-toon-ink bg-toon-cream p-3 shadow-toon-sm"
        >
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-toon-ink bg-toon-star font-toon text-xl font-extrabold"
          >
            {k.level}
          </span>
          <div className="min-w-0">
            <p className="break-words text-sm font-bold">{k.name}</p>
            <p className="text-xs font-semibold text-toon-ink-faint">
              {MEDAL[k.level].name}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
  return (
    <div>
      {cards(items.slice(0, 3))}
      {items.length > 3 && (
        <details className="mt-4">
          <summary className="w-fit cursor-pointer rounded-md text-sm font-bold underline underline-offset-4 focus-visible:shadow-toon-focus">
            Xem thêm kỹ năng ({items.length - 3})
          </summary>
          <div className="mt-3">{cards(items.slice(3))}</div>
        </details>
      )}
    </div>
  );
}

export function KeywordLegend() {
  return (
    <details className="mt-4 text-xs text-toon-ink-faint">
      <summary className="w-fit cursor-pointer rounded-md font-bold focus-visible:shadow-toon-focus">
        Ba mức kỹ năng
      </summary>
      <p className="mt-2">
        Làm quen · có hướng dẫn; Thành thạo · tự làm việc thường gặp; Chuyên sâu
        · xử lý việc khó và hướng dẫn người khác.
      </p>
    </details>
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
    <ul className="flex flex-wrap gap-2">
      {entries.map((r) => (
        <li key={r.code}>
          <Link
            to={`/occupations/${r.code}`}
            className="inline-block rounded-xl border-2 border-toon-ink bg-toon-cream px-3 py-2 text-sm font-bold hover:bg-toon-sand focus-visible:shadow-toon-focus"
          >
            {r.name}
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <div>
      {links(roles.slice(0, 3))}
      {roles.length > 3 && (
        <details className="mt-3">
          <summary className="w-fit cursor-pointer rounded-md text-sm font-bold focus-visible:shadow-toon-focus">
            Xem thêm nghề ({roles.length - 3})
          </summary>
          <div className="mt-3">{links(roles.slice(3))}</div>
        </details>
      )}
    </div>
  );
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
