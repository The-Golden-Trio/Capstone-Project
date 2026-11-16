import { Link } from 'react-router-dom';
import { Button, EmptyState, MEDAL, Medal, ProgressBar } from '@datn/ui';
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
        <Button variant="secondary" onClick={retry}>
          Thử lại
        </Button>
      }
    />
  );
}

export function Keywords({
  items,
  empty = 'Chưa có kỹ năng nghề được công bố.',
}: {
  items: KeywordRef[];
  empty?: string;
}) {
  if (!items.length) return <p className="text-sm text-ink-faint">{empty}</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((k) => (
        <li
          key={k.id}
          className="flex items-center gap-3 rounded-lg border border-line bg-night-900/40 p-3"
        >
          <Medal
            level={k.level}
            size={32}
            label={`${k.name}: ${MEDAL[k.level].name}`}
          />
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold">{k.name}</p>
            <p className="text-xs text-ink-faint">{MEDAL[k.level].name}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function KeywordLegend() {
  return (
    <p className="mt-3 text-xs leading-relaxed text-ink-faint">
      Ba mức: Làm quen · có hướng dẫn; Thành thạo · tự làm việc thường gặp;
      Chuyên sâu · xử lý việc khó và hướng dẫn người khác.
    </p>
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
      <p className="text-sm text-ink-muted">
        Cần thêm người đánh giá trước khi công bố số.
      </p>
    );
  if (!summary.responseCount || !Object.keys(summary.averages).length)
    return (
      <p className="text-sm text-ink-faint">Chưa có đánh giá được công bố.</p>
    );
  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-faint">
        Từ {summary.responseCount} người đã đi hết nghề · thang 1–5, điểm cao
        mang nghĩa khác nhau ở từng tiêu chí.
      </p>
      {criteria.map((c) => (
        <div key={c.code}>
          <ProgressBar
            label={c.name}
            max={5}
            value={summary.averages[c.code] ?? 0}
            showValue
            color="#9ab8cf"
            valueText={
              summary.averages[c.code] == null
                ? 'Chưa có số liệu'
                : `${summary.averages[c.code].toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/5`
            }
          />
          <div className="mt-1 flex justify-between gap-4 text-xs text-ink-faint">
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
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((r) => (
        <Link
          key={r.code}
          to={`/occupations/${r.code}`}
          className="rounded-full border border-line bg-night-800/60 px-3 py-2 text-sm text-ink-muted transition-colors hover:border-line-strong hover:text-ink focus-visible:shadow-focus"
        >
          {r.name}
        </Link>
      ))}
    </div>
  );
}
