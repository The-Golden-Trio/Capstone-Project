import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  ToonButton,
  ToonDisclosure,
  ToonDots,
  ToonStatusGlyph,
  CartoonPlanet,
  Skeleton,
  toonButtonClasses,
} from '@datn/ui';
import {
  Notice,
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
        description={`${new Set(rows.map((row) => row.occupationCode)).size} nghề · sắp theo lần chơi gần nhất`}
      />
      {rows.length ? (
        // Một danh sách hàng trong một thẻ, không thẻ lồng trong thẻ.
        <ol className="toon-rows -mx-2">
          {rows.map((row, index) => (
            <PlayingOccupation
              key={row.enrolmentId}
              row={row}
              primary={index === 0}
            />
          ))}
        </ol>
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
  const missing =
    row.nextLevel?.conditions.filter((condition) => !condition.met).length ?? 0;

  return (
    <li className="px-2 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <CartoonPlanet
          seed={row.occupationCode}
          region={row.regionId}
          size={52}
          ring
        />
        <div className="min-w-0 flex-1 basis-56">
          <h3 className="font-toon text-xl font-bold leading-snug">
            <Link
              to={`/occupations/${row.occupationCode}`}
              className="rounded hover:underline focus-visible:shadow-toon-focus"
            >
              {row.occupationName}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-toon-ink-soft">
            Cấp {row.levelNo} · {row.levelTitle}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-toon-ink-soft">
            {row.total > 0 ? (
              <span className="inline-flex items-center gap-2">
                <span
                  role="progressbar"
                  aria-label="Màn đã hoàn thành"
                  aria-valuemin={0}
                  aria-valuemax={row.total}
                  aria-valuenow={Math.min(row.total, Math.max(0, row.done))}
                  className="inline-flex"
                >
                  <ToonDots
                    total={row.total}
                    done={row.done}
                    current={row.done + 1}
                    label={`${row.done}/${row.total} màn`}
                  />
                </span>
                <span className="tabular-nums">
                  {row.done}/{row.total} màn
                </span>
              </span>
            ) : (
              <span>Chưa có màn chính</span>
            )}
            {row.nextLevel && (
              <span className="inline-flex items-center gap-1.5">
                <ToonStatusGlyph kind={missing ? 'locked' : 'done'} size={13} />
                Mở cấp {row.nextLevel.levelNo}:{' '}
                {missing ? `còn ${missing} điều kiện` : 'đủ điều kiện'}
              </span>
            )}
          </div>
        </div>
        <Link
          to={`/islands/${row.enrolmentId}`}
          style={
            primary ? { backgroundColor: 'var(--color-toon-star)' } : undefined
          }
          className={toonButtonClasses({
            variant: primary ? 'primary' : 'secondary',
            size: 'sm',
            className: 'shrink-0',
          })}
        >
          Chơi tiếp
          <span className="visually-hidden"> {row.occupationName}</span>
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <ToonDisclosure
        summary="Tiến độ, điều kiện và mặt khó"
        className="mt-2 pl-[68px] text-sm max-sm:pl-0 [&>summary]:min-h-9 [&>summary]:py-1 [&>summary]:text-sm [&>summary]:text-toon-ink-soft"
      >
        <div className="space-y-3 text-sm text-toon-ink-soft">
          <p>
            {row.group} · Lần gần nhất{' '}
            {new Date(row.lastPlayedAt).toLocaleDateString('vi-VN')}
          </p>
          {row.nextLevel ? (
            <div>
              <p className="font-bold text-toon-ink">
                Mở cấp {row.nextLevel.levelNo} cần:
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {row.nextLevel.conditions.map((condition) => (
                  <li key={condition.label} className="flex items-start gap-2">
                    <ToonStatusGlyph
                      kind={condition.met ? 'done' : 'soon'}
                      size={15}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="visually-hidden">
                        {condition.met ? 'Đã đạt: ' : 'Chưa đạt: '}
                      </span>
                      {condition.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Chưa có cấp tiếp theo trong lộ trình này.</p>
          )}
          <div>
            <p className="mb-1 flex items-center gap-2 font-toon font-bold text-toon-ink">
              <ToonStatusGlyph kind="warning" size={15} /> Mặt khó của nghề
            </p>
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
              <ul className="space-y-1.5">
                {occupation.data.downsides.map((downside) => (
                  <li key={downside}>
                    <ReadMore text={downside} />
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nội dung về mặt khó của nghề đang được bổ sung.</p>
            )}
          </div>
        </div>
      </ToonDisclosure>
    </li>
  );
}
