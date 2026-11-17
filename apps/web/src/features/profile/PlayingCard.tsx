import { Link } from 'react-router-dom';
import {
  ToonButton,
  ToonProgress,
  CartoonPlanet,
  Skeleton,
  toonButtonClasses,
  regionColor,
} from '@datn/ui';
import {
  Notice,
  Foldout,
  ReadMore,
  EmptyMessage,
  PaperCard,
  CardHeading,
} from './ProfileKit';

import { errorText, useOccupation } from '../../api/hooks';
import type { PlayingRow } from '../../api/types';

export function PlayingCard({ playing }: { playing: PlayingRow[] }) {
  const rows = [...playing].sort(
    (a, b) => Date.parse(b.lastPlayedAt) - Date.parse(a.lastPlayedAt),
  );
  return (
    <PaperCard>
      <CardHeading
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
        <EmptyMessage
          title="Một hành tinh đang đợi bạn"
          description="Chọn nghề để bắt đầu ca làm đầu tiên."
          action={
            <Link to="/galaxy" className={toonButtonClasses()}>
              Khám phá ngân hà
            </Link>
          }
        />
      )}
    </PaperCard>
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
      className="relative rounded-2xl border-[3px] border-toon-ink bg-toon-cream p-4 sm:p-5"
      style={{ borderTopColor: regionColor(row.regionId) }}
    >
      <div className="flex items-start gap-3">
        <CartoonPlanet
          seed={row.occupationCode}
          region={row.regionId}
          size={64}
          ring
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-toon-ink-soft">
            {row.group} › Cấp {row.levelNo} · {row.levelTitle}
          </p>
          <h3 className="mt-1 font-toon text-2xl font-bold">
            <Link
              to={`/occupations/${row.occupationCode}`}
              className="hover:underline"
            >
              {row.occupationName}
            </Link>
          </h3>
        </div>
      </div>
      <Link
        to={`/islands/${row.enrolmentId}`}
        style={
          primary ? { backgroundColor: 'var(--color-toon-star)' } : undefined
        }
        className={toonButtonClasses({
          className: 'mt-4',
          variant: primary ? 'primary' : 'secondary',
          size: 'sm',
        })}
      >
        Chơi tiếp<span className="visually-hidden"> {row.occupationName}</span>
      </Link>
      <div className="my-3 max-w-lg">
        <ToonProgress
          max={Math.max(1, row.total)}
          value={row.done}
          label="Màn đã hoàn thành"
        />
        <p className="mt-1 text-xs text-toon-ink-soft">
          {row.done}/{row.total} màn đã xong · Lần gần nhất{' '}
          {new Date(row.lastPlayedAt).toLocaleDateString('vi-VN')}
        </p>
      </div>
      {row.nextLevel ? (
        <Foldout
          title={`Mở cấp ${row.nextLevel.levelNo} cần:`}
          className="mb-4 text-sm text-toon-ink-soft"
        >
          <ul className="mt-1 space-y-1">
            {row.nextLevel.conditions.map((condition) => (
              <li key={condition.label}>
                {condition.met ? '✓ Đã đạt' : '○ Chưa đạt'} · {condition.label}
              </li>
            ))}
          </ul>
        </Foldout>
      ) : (
        <p className="mb-4 rounded-xl border-2 border-toon-ink bg-toon-coral-light p-3 text-xs text-toon-ink-soft">
          Chưa có cấp tiếp theo trong lộ trình này.
        </p>
      )}
      <div className="mb-4 rounded-xl border-2 border-toon-ink bg-toon-coral-light p-3 text-xs text-toon-ink-soft">
        <p className="mb-2 font-semibold">Mặt khó của nghề</p>
        {occupation.isError ? (
          <Notice tone="warning">
            {errorText(occupation.error)}{' '}
            <ToonButton
              size="sm"
              variant="ghost"
              onClick={() => void occupation.refetch()}
            >
              Tải lại thông tin nghề
            </ToonButton>
          </Notice>
        ) : !occupation.data ? (
          <Skeleton className="max-w-lg" />
        ) : occupation.data.downsides.length ? (
          <ul className="list-inside list-disc space-y-1">
            {occupation.data.downsides.slice(0, 1).map((downside) => (
              <li key={downside}>
                <ReadMore text={downside} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-toon-ink-soft">
            Nội dung về mặt khó của nghề đang được bổ sung.
          </p>
        )}
        {occupation.data && occupation.data.downsides.length > 1 && (
          <Foldout title="Những mặt khó khác">
            {occupation.data.downsides.slice(1).map((text) => (
              <div key={text} className="mt-2">
                <ReadMore text={text} />
              </div>
            ))}
          </Foldout>
        )}
      </div>
    </article>
  );
}
