import { Link } from 'react-router-dom';
import {
  ToonButton,
  LoadingBlock,
  Tooltip,
  CartoonPlanet,
  InkStar,
  regionColor,
} from '@datn/ui';
import {
  Foldout,
  Notice,
  EmptyMessage,
  PaperCard,
  CardHeading,
  StatCard,
} from './ProfileKit';

import { errorText, useCatalogue } from '../../api/hooks';
import type { CatalogueOccupation, PlayerRecord } from '../../api/types';
import { constellationPoints, timeCells } from './recordView';
export function StatsTab({ record }: { record: PlayerRecord }) {
  const catalogue = useCatalogue();
  const stats = record.stats;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Ca đã hoàn thành" value={stats.scenarios} />
        <StatCard
          label="Giờ đã chơi"
          value={(stats.minutes / 60).toLocaleString('vi-VN', {
            maximumFractionDigits: 1,
          })}
          hint={`${stats.minutes.toLocaleString('vi-VN')} phút nhập vai`}
        />
        <StatCard
          label="Nghề đã thử"
          value={`${stats.occupationsTried}/${stats.occupationsTotal}`}
        />
        <StatCard label="Nhóm ngành đã ghé" value={stats.groupsVisited} />
      </div>
      <PaperCard>
        <CardHeading
          title="Những vì sao đã ghé"
          description="Chấm sáng: nghề đã thử. Vùng còn tối: chơi thêm để mở."
        />
        {catalogue.isError ? (
          <EmptyMessage
            title="Chưa vẽ được bản đồ"
            description={errorText(catalogue.error)}
            action={
              <ToonButton
                variant="secondary"
                onClick={() => void catalogue.refetch()}
              >
                Thử lại
              </ToonButton>
            }
          />
        ) : !catalogue.data ? (
          <LoadingBlock />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.data.regions.map((region) => {
              const occupations = catalogue.data.occupations.filter(
                (occupation) => occupation.regionId === region.id,
              );
              const tried = occupations.filter(
                (occupation) => occupation.my.status !== 'NEW',
              ).length;
              return (
                <div
                  key={region.id}
                  className="rounded-lg border border-toon-ink bg-toon-cream p-4"
                >
                  <h3
                    className="font-toon text-sm font-bold"
                    style={{
                      borderBottom: `3px solid ${regionColor(region.id)}`,
                    }}
                  >
                    {region.name}
                  </h3>
                  <p className="mt-1 text-xs text-toon-ink-soft">
                    {tried}/{occupations.length} nghề đã thử
                  </p>
                  <RegionConstellation
                    occupations={occupations}
                    regionName={region.name}
                    color={regionColor(region.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </PaperCard>
      <PaperCard>
        <CardHeading
          title="Thời gian trong từng vùng"
          description="Mỗi ô đầy là 30 phút. Ô cuối ghi lại cả phần phút lẻ."
        />
        {!stats.minutes ? (
          <EmptyMessage
            className="grayscale opacity-60"
            title="chơi thêm để mở"
            description="Thời gian được ghi lại khi bạn bắt đầu thử nghề."
          />
        ) : catalogue.data ? (
          <div className="space-y-5">
            {catalogue.data.regions.map((region) => {
              const minutes = stats.minutesByRegion[region.id] ?? 0;
              return (
                <div key={region.id}>
                  <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                    <h3 className="font-toon font-bold">{region.name}</h3>
                    <span className="text-toon-ink-soft">{minutes} phút</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {minutes === 0 ? (
                      <p className="text-xs text-toon-ink-soft">
                        chơi thêm để mở
                      </p>
                    ) : (
                      timeCells(minutes).map((cell, index) => (
                        <Tooltip
                          key={index}
                          content={`${region.name} · ${cell} phút`}
                        >
                          <button
                            type="button"
                            aria-label={`${region.name}, ô ${index + 1}: ${cell} phút`}
                            className="relative size-5 overflow-hidden rounded-md border-2 border-toon-ink bg-toon-sand focus-visible:shadow-toon-focus"
                          >
                            <span
                              aria-hidden
                              className="absolute inset-x-0 bottom-0"
                              style={{
                                height: `${(cell / 30) * 100}%`,
                                backgroundColor: regionColor(region.id),
                              }}
                            />
                          </button>
                        </Tooltip>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : catalogue.isError ? (
          <Notice tone="danger">
            {errorText(catalogue.error)}
            <ToonButton
              variant="ghost"
              onClick={() => void catalogue.refetch()}
            >
              Thử lại
            </ToonButton>
          </Notice>
        ) : (
          <LoadingBlock text="Đang lấy danh mục vùng nghề…" />
        )}
      </PaperCard>
      <PaperCard>
        <CardHeading
          title="Những việc bạn thích làm"
          description="Năm việc được chọn “Thích” nhiều nhất sau ca làm."
        />
        {stats.favouriteTasks.length ? (
          <ol className="space-y-3">
            {[...stats.favouriteTasks]
              .sort((a, b) => b.likes - a.likes)
              .slice(0, 5)
              .map((task, index) => (
                <li
                  key={task.text}
                  className="flex gap-3 rounded-lg border border-toon-ink p-3"
                >
                  <span className="text-toon-ink-soft">{index + 1}.</span>
                  <p className="min-w-0 flex-1 text-sm">{task.text}</p>
                  <span className="shrink-0 text-xs text-toon-ink-soft">
                    {task.likes} lần thích
                  </span>
                </li>
              ))}
          </ol>
        ) : (
          <EmptyMessage
            className="grayscale opacity-60"
            title="chơi thêm để mở"
            description="Trả lời câu hỏi thích tới đâu sau một ca để ghi lại việc bạn muốn thử tiếp."
          />
        )}
      </PaperCard>
    </div>
  );
}

function RegionConstellation({
  occupations,
  regionName,
  color,
}: {
  occupations: CatalogueOccupation[];
  regionName: string;
  color: string;
}) {
  const points = constellationPoints(occupations.length);
  const hasTried = occupations.some(
    (occupation) => occupation.my.status !== 'NEW',
  );

  if (!occupations.length)
    return (
      <p className="my-5 text-xs text-toon-ink-soft">
        Chưa có nghề trong vùng này.
      </p>
    );

  return (
    <div>
      <svg
        viewBox="0 0 220 160"
        role="img"
        aria-label={`Cụm sao ${regionName}: ${occupations.filter((occupation) => occupation.my.status !== 'NEW').length} trên ${occupations.length} nghề đã thử`}
        className="my-3 w-full"
      >
        <polyline
          points={points.map(([x, y]) => `${x},${y}`).join(' ')}
          fill="none"
          stroke={hasTried ? color : '#5d7ea8'}
          strokeOpacity=".6"
          strokeWidth="1.2"
          strokeDasharray="3 5"
        />
        {occupations.map((occupation, index) => {
          const [x, y] = points[index];
          const tried = occupation.my.status !== 'NEW';
          return (
            <g key={occupation.code}>
              <title>
                {occupation.name} · {tried ? 'đã thử' : 'chưa thử'}
              </title>
              <g
                transform={`translate(${x - (tried ? 9 : 4)} ${y - (tried ? 9 : 4)})`}
              >
                {tried ? (
                  <CartoonPlanet
                    seed={occupation.code}
                    region={occupation.regionId}
                    size={18}
                    ring={occupation.playable}
                  />
                ) : (
                  <InkStar
                    size={8}
                    fill="#a6d2ea"
                    className="[&_path]:[vector-effect:none]"
                  />
                )}
              </g>
              {tried && (
                <path
                  d={`m${x - 3} ${y - 10} 2 2 4-4`}
                  fill="none"
                  stroke="#1e1b18"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        })}
      </svg>
      <Foldout title="Xem các nghề trong cụm">
        <ul className="max-h-60 space-y-2 overflow-y-auto">
          {occupations.map((occupation) => (
            <li key={occupation.code}>
              <Link
                to={`/occupations/${occupation.code}`}
                className="flex gap-2 rounded py-1 text-xs text-toon-ink-soft hover:underline"
              >
                <span
                  style={{
                    color: occupation.my.status !== 'NEW' ? color : '#8ea5c3',
                  }}
                >
                  {occupation.my.status !== 'NEW' ? '✓' : '○'}
                </span>
                <span>
                  {occupation.name} ·{' '}
                  {occupation.my.status !== 'NEW' ? 'đã thử' : 'chưa thử'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Foldout>
    </div>
  );
}
