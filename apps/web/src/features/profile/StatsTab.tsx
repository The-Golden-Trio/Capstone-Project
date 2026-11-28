import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock3, Layers, Orbit } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { ToonButton, LoadingBlock, Tooltip, regionColor } from '@datn/ui';
import { Notice, EmptyMessage, PaperCard, CardHeading } from './ProfileKit';

import { errorText, useCatalogue } from '../../api/hooks';
import type { CatalogueOccupation, PlayerRecord } from '../../api/types';
import { useRecordContext } from './useRecordContext';
import { constellationPoints, timeCells } from './recordView';
export function StatsTab({ record }: { record: PlayerRecord }) {
  const catalogue = useCatalogue();
  const stats = record.stats;
  const context = useRecordContext(record);
  return (
    <div className="space-y-6">
      {/* Bốn con số trên một dải, không bốn thẻ rời. */}
      <PaperCard className="p-0">
        <dl className="grid grid-cols-2 divide-toon-ink/10 lg:grid-cols-4 lg:divide-x-[1.5px] [&>div:nth-child(-n+2)]:max-lg:border-b-[1.5px] [&>div:nth-child(-n+2)]:max-lg:border-toon-ink/10 [&>div:nth-child(odd)]:max-lg:border-r-[1.5px] [&>div:nth-child(odd)]:max-lg:border-toon-ink/10">
          <Stat
            icon={<CheckCircle2 size={20} />}
            label="Ca đã hoàn thành"
            value={stats.scenarios}
          />
          <Stat
            icon={<Clock3 size={20} />}
            label="Giờ đã chơi"
            value={(stats.minutes / 60).toLocaleString('vi-VN', {
              maximumFractionDigits: 1,
            })}
            hint={`${stats.minutes.toLocaleString('vi-VN')} phút nhập vai`}
          />
          <Stat
            icon={<Orbit size={20} />}
            label="Nghề đã thử"
            value={`${stats.occupationsTried}/${stats.occupationsTotal}`}
          />
          <Stat
            icon={<Layers size={20} />}
            label="Nhóm ngành đã ghé"
            value={stats.groupsVisited}
          />
        </dl>
      </PaperCard>

      <PaperCard>
        <CardHeading
          title="Những vì sao đã ghé"
          description="Chấm sáng: nghề đã thử. Vùng còn tối: chơi thêm để mở. Chạm một ngôi sao để mở hồ sơ nghề."
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
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.data.regions.map((region) => {
              const occupations = catalogue.data.occupations.filter(
                (occupation) => occupation.regionId === region.id,
              );
              const tried = occupations.filter(
                (occupation) => occupation.my.status !== 'NEW',
              );
              const color = regionColor(region.id);
              return (
                <section key={region.id} aria-label={region.name}>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-toon text-base font-bold">
                      {region.name}
                    </h3>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-toon-ink-soft">
                      {tried.length}/{occupations.length}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-toon-ink/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(tried.length / Math.max(1, occupations.length)) * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <RegionConstellation
                    occupations={occupations}
                    regionName={region.name}
                    color={color}
                  />
                  {/* Chỉ nêu tên nghề đã thử; nghề chưa thử đã thấy là chấm mờ ở trên. */}
                  {tried.length > 0 && (
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold">
                      {tried.map((o) => (
                        <li key={o.code} className="flex items-center gap-1">
                          <span
                            aria-hidden
                            className="size-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          {o.shortName}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </PaperCard>

      <PaperCard>
        <CardHeading
          title="Thời gian theo vùng"
          description="Mỗi ô đầy là 30 phút. Ô cuối ghi lại cả phần phút lẻ."
        />
        {!stats.minutes ? (
          <EmptyMessage
            className="grayscale opacity-60"
            title="chơi thêm để mở"
            description="Thời gian được ghi lại khi bạn bắt đầu thử nghề."
          />
        ) : catalogue.data ? (
          <ul className="toon-rows">
            {catalogue.data.regions.map((region) => {
              const minutes = stats.minutesByRegion[region.id] ?? 0;
              return (
                <li
                  key={region.id}
                  className="grid items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[12rem_minmax(0,1fr)_5rem]"
                >
                  <h3 className="flex items-center gap-2 font-toon text-sm font-bold">
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: regionColor(region.id) }}
                    />
                    {region.name}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {minutes === 0 ? (
                      <p className="text-xs text-toon-ink-faint">
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
                            className="relative size-4 overflow-hidden rounded-[5px] bg-toon-ink/10 focus-visible:shadow-toon-focus"
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
                  <span className="text-right text-xs font-bold tabular-nums text-toon-ink-soft">
                    {minutes} phút
                  </span>
                </li>
              );
            })}
          </ul>
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
          title="Việc bạn thích"
          description="Năm việc được chọn “Thích” nhiều nhất sau ca làm."
        />
        {stats.favouriteTasks.length ? (
          <ol className="toon-rows">
            {[...stats.favouriteTasks]
              .sort((a, b) => b.likes - a.likes)
              .slice(0, 5)
              .map((task, index) => (
                <li key={task.text} className="flex items-start gap-4 py-3">
                  <span className="mt-0.5 font-toon text-sm font-bold tabular-nums text-toon-ink-faint">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{task.text}</p>
                    <p className="mt-0.5 text-xs font-bold text-toon-maroon">
                      {context.taskGroup(task.text)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-toon-ink-soft">
                    ♥ {task.likes}
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

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 sm:p-5">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-full bg-toon-star-soft text-toon-ink"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-toon-ink-soft">{label}</dt>
        <dd className="font-toon text-2xl font-extrabold leading-tight tabular-nums">
          {value}
        </dd>
        {hint && <p className="text-[11px] text-toon-ink-faint">{hint}</p>}
      </div>
    </div>
  );
}

/**
 * Chòm sao của một vùng: mỗi nghề một ngôi sao. Nghề đã thử sáng màu vùng và
 * có quầng; nghề chưa thử là chấm mờ. Chạm sao nào mở hồ sơ nghề đó.
 */
function RegionConstellation({
  occupations,
  regionName,
  color,
}: {
  occupations: CatalogueOccupation[];
  regionName: string;
  color: string;
}) {
  const navigate = useNavigate();
  const glowId = `glow-${useId().replace(/:/g, '')}`;
  const points = constellationPoints(occupations.length);
  if (!occupations.length)
    return (
      <p className="my-5 text-xs text-toon-ink-soft">
        Chưa có nghề trong vùng này.
      </p>
    );
  const triedCount = occupations.filter((o) => o.my.status !== 'NEW').length;
  return (
    <div className="my-3 overflow-hidden rounded-[16px] bg-toon-night">
      <svg
        viewBox="0 0 220 160"
        role="img"
        aria-label={`Cụm sao ${regionName}: ${triedCount} trên ${occupations.length} nghề đã thử`}
        className="block w-full"
      >
        <defs>
          <radialGradient id={glowId}>
            <stop offset="0" stopColor={color} stopOpacity=".55" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="110"
          cy="80"
          rx="100"
          ry="66"
          fill={`url(#${glowId})`}
          opacity={0.25 + 0.75 * (triedCount / occupations.length)}
        />
        {occupations.map((occupation, index) => {
          const [x, y] = points[index];
          const tried = occupation.my.status !== 'NEW';
          const href = `/occupations/${occupation.code}`;
          return (
            <a
              key={occupation.code}
              href={href}
              aria-label={`${occupation.name}, ${tried ? 'đã thử' : 'chưa thử'}`}
              onClick={(event) => {
                event.preventDefault();
                navigate(href);
              }}
              className="cursor-pointer [&:focus-visible>circle]:stroke-toon-star [&:hover>circle]:opacity-100"
            >
              <title>
                {occupation.name} · {tried ? 'đã thử' : 'chưa thử'}
              </title>
              {tried && (
                <circle cx={x} cy={y} r="9" fill={color} opacity=".3" />
              )}
              <circle
                cx={x}
                cy={y}
                r={tried ? 4.5 : 2}
                fill={tried ? color : '#c9d6f2'}
                opacity={tried ? 1 : 0.4}
                stroke={tried ? '#fffaf0' : 'none'}
                strokeWidth="1.2"
              />
            </a>
          );
        })}
      </svg>
    </div>
  );
}
