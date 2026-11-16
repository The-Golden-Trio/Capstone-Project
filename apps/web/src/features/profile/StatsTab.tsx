import { Link } from 'react-router-dom';
import {
  Accordion,
  Button,
  Callout,
  EmptyState,
  LoadingBlock,
  Panel,
  PanelHeader,
  Stat,
  Tooltip,
  regionColor,
} from '@datn/ui';
import { errorText, useCatalogue } from '../../api/hooks';
import type { CatalogueOccupation, PlayerRecord } from '../../api/types';
import { constellationPoints, timeCells } from './recordView';
export function StatsTab({ record }: { record: PlayerRecord }) {
  const catalogue = useCatalogue();
  const stats = record.stats;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Ca đã hoàn thành" value={stats.scenarios} />
        <Stat
          label="Giờ đã chơi"
          value={(stats.minutes / 60).toLocaleString('vi-VN', {
            maximumFractionDigits: 1,
          })}
          hint={`${stats.minutes.toLocaleString('vi-VN')} phút nhập vai`}
        />
        <Stat
          label="Nghề đã thử"
          value={`${stats.occupationsTried}/${stats.occupationsTotal}`}
        />
        <Stat label="Nhóm ngành đã ghé" value={stats.groupsVisited} />
      </div>
      <Panel padding="lg">
        <PanelHeader
          title="Những vì sao đã ghé"
          description="Mỗi chấm là một nghề. Chấm sáng và dấu ✓ ghi lại nơi bạn đã thử."
        />
        {catalogue.isError ? (
          <EmptyState
            title="Chưa vẽ được bản đồ"
            description={errorText(catalogue.error)}
            action={
              <Button
                variant="secondary"
                onClick={() => void catalogue.refetch()}
              >
                Thử lại
              </Button>
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
                  className="rounded-lg border border-line bg-night-950/40 p-4"
                >
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: regionColor(region.id) }}
                  >
                    {region.name}
                  </h3>
                  <p className="mt-1 text-xs text-ink-faint">
                    {tried}/{occupations.length} nghề đã thử
                    {tried === 0 && ' · chơi thêm để mở'}
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
      </Panel>
      <Panel padding="lg">
        <PanelHeader
          title="Thời gian trong từng vùng"
          description="Mỗi ô đầy là 30 phút. Ô cuối ghi lại cả phần phút lẻ."
        />
        {!stats.minutes ? (
          <EmptyState
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
                    <h3>{region.name}</h3>
                    <span className="text-ink-faint">{minutes} phút</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {minutes === 0 ? (
                      <p className="text-xs text-ink-faint">chơi thêm để mở</p>
                    ) : (
                      timeCells(minutes).map((cell, index) => (
                        <Tooltip
                          key={index}
                          content={`${region.name} · ${cell} phút`}
                        >
                          <button
                            type="button"
                            aria-label={`${region.name}, ô ${index + 1}: ${cell} phút`}
                            className="size-5 rounded-sm border border-line focus-visible:shadow-focus"
                            style={{
                              background: `linear-gradient(0deg, ${regionColor(region.id)} ${(cell / 30) * 100}%, #142b52 ${(cell / 30) * 100}%)`,
                            }}
                          />
                        </Tooltip>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : catalogue.isError ? (
          <Callout tone="danger">
            {errorText(catalogue.error)}
            <Button variant="ghost" onClick={() => void catalogue.refetch()}>
              Thử lại
            </Button>
          </Callout>
        ) : (
          <LoadingBlock text="Đang lấy danh mục vùng nghề…" />
        )}
      </Panel>
      <Panel padding="lg">
        <PanelHeader
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
                  className="flex gap-3 rounded-lg border border-line p-3"
                >
                  <span className="text-ink-faint">{index + 1}.</span>
                  <p className="min-w-0 flex-1 text-sm">{task.text}</p>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {task.likes} lần thích
                  </span>
                </li>
              ))}
          </ol>
        ) : (
          <EmptyState
            className="grayscale opacity-60"
            title="chơi thêm để mở"
            description="Trả lời câu hỏi thích tới đâu sau một ca để ghi lại việc bạn muốn thử tiếp."
          />
        )}
      </Panel>
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
      <p className="my-5 text-xs text-ink-faint">
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
          strokeOpacity=".14"
          strokeWidth=".6"
        />
        {occupations.map((occupation, index) => {
          const [x, y] = points[index];
          const tried = occupation.my.status !== 'NEW';
          return (
            <g key={occupation.code}>
              <title>
                {occupation.name} · {tried ? 'đã thử' : 'chưa thử'}
              </title>
              {tried && (
                <circle cx={x} cy={y} r="7" fill={color} opacity=".14" />
              )}
              <circle
                cx={x}
                cy={y}
                r={tried ? 3 : 1.8}
                fill={tried ? color : '#5d7ea8'}
                opacity={tried ? 1 : 0.5}
              />
              {tried && (
                <path
                  d={`m${x - 3} ${y - 8} 2 2 4-4`}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.2"
                />
              )}
            </g>
          );
        })}
      </svg>
      <Accordion title="Xem các nghề trong cụm">
        <ul className="max-h-60 space-y-2 overflow-y-auto">
          {occupations.map((occupation) => (
            <li key={occupation.code}>
              <Link
                to={`/occupations/${occupation.code}`}
                className="flex gap-2 rounded py-1 text-xs text-ink-muted hover:underline"
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
      </Accordion>
    </div>
  );
}
