import { Link } from 'react-router-dom';
import {
  Button,
  Callout,
  EmptyState,
  Panel,
  PanelHeader,
  SegmentedProgress,
  Skeleton,
  buttonClasses,
  regionColor,
} from '@datn/ui';
import { errorText, useOccupation } from '../../api/hooks';
import type { PlayingRow } from '../../api/types';

export function PlayingCard({ playing }: { playing: PlayingRow[] }) {
  const rows = [...playing].sort(
    (a, b) => Date.parse(b.lastPlayedAt) - Date.parse(a.lastPlayedAt),
  );
  return (
    <Panel padding="lg">
      <PanelHeader
        title="Đang chơi"
        description="Tiếp tục từ nơi bạn vừa dừng lại."
      />
      {rows.length ? (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <PlayingOccupation
              key={row.enrolmentId}
              row={row}
              primary={index === 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Một hành tinh đang đợi bạn"
          description="Chọn nghề để bắt đầu ca làm đầu tiên."
          action={
            <Link to="/galaxy" className={buttonClasses()}>
              Khám phá ngân hà
            </Link>
          }
        />
      )}
    </Panel>
  );
}

function PlayingOccupation({
  row,
  primary,
}: {
  row: PlayingRow;
  primary: boolean;
}) {
  const occupation = useOccupation(row.occupationCode);

  return (
    <article
      className="rounded-lg border border-line border-l-2 bg-night-950/25 p-4"
      style={{ borderLeftColor: regionColor(row.regionId) }}
    >
      <p className="text-xs text-ink-faint">
        {row.group} › Cấp {row.levelNo} · {row.levelTitle}
      </p>
      <h3 className="mt-1 text-lg">
        <Link
          to={`/occupations/${row.occupationCode}`}
          className="hover:underline"
        >
          {row.occupationName}
        </Link>
      </h3>
      <div className="my-3 max-w-lg">
        <SegmentedProgress
          total={row.total}
          done={row.done}
          label="Màn đã hoàn thành"
        />
        <p className="mt-1 text-xs text-ink-faint">
          {row.done}/{row.total} màn đã xong · Lần gần nhất{' '}
          {new Date(row.lastPlayedAt).toLocaleDateString('vi-VN')}
        </p>
      </div>
      {row.nextLevel ? (
        <div className="mb-4 text-sm text-ink-muted">
          <p>Mở cấp {row.nextLevel.levelNo} cần:</p>
          <ul className="mt-1 space-y-1">
            {row.nextLevel.conditions.map((condition) => (
              <li key={condition.label}>
                {condition.met ? '✓ Đã đạt' : '○ Chưa đạt'} · {condition.label}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-4 text-xs text-ink-faint">
          Chưa có cấp tiếp theo trong lộ trình này.
        </p>
      )}
      <div className="mb-4 text-xs text-ink-muted">
        <p className="mb-2 font-semibold">Mặt khó của nghề</p>
        {occupation.isError ? (
          <Callout tone="warning">
            {errorText(occupation.error)}{' '}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void occupation.refetch()}
            >
              Tải lại thông tin nghề
            </Button>
          </Callout>
        ) : !occupation.data ? (
          <Skeleton className="max-w-lg" />
        ) : occupation.data.downsides.length ? (
          <ul className="list-inside list-disc space-y-1">
            {occupation.data.downsides.map((downside) => (
              <li key={downside}>{downside}</li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-faint">
            Nội dung về mặt khó của nghề đang được bổ sung.
          </p>
        )}
      </div>
      <Link
        to={`/islands/${row.enrolmentId}`}
        className={buttonClasses({
          variant: primary ? 'primary' : 'secondary',
          size: 'sm',
        })}
      >
        Chơi tiếp<span className="visually-hidden"> {row.occupationName}</span>
      </Link>
    </article>
  );
}
