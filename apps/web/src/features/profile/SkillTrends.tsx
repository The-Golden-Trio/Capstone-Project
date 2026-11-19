import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { profile } from '@datn/game-core';
import { cn } from '@datn/ui';
import type { PlayerRecord, SoftSkillId } from '../../api/types';
import { skillTimeline } from './recordView';

/** One shared run axis; an unscored group keeps its last observed total. */
export function SkillTrends({
  skills,
  journal,
  value,
  onChange,
}: {
  skills: PlayerRecord['softSkills'];
  journal: PlayerRecord['journal'];
  value?: SoftSkillId;
  onChange?: (id: SoftSkillId) => void;
}) {
  const [local, setLocal] = useState<SoftSkillId>(
    profile.SOFT_SKILL_GROUPS[0].id,
  );
  const selected = value ?? local;
  const setSelected = (id: SoftSkillId) => {
    setLocal(id);
    onChange?.(id);
  };
  const [activeRun, setActiveRun] = useState<string | null>(null);
  const caption = useId();
  const { runs, series } = skillTimeline(skills, journal);
  const currentGroup = series.find((group) => group.id === selected);
  const active =
    runs.find((run) => run.runId === activeRun) ?? runs[runs.length - 1];
  const plot = useRef<HTMLDivElement>(null);
  const activeIndex = runs.findIndex((run) => run.runId === active?.runId);
  useEffect(() => {
    const node = plot.current;
    if (node && activeIndex >= 0)
      node.scrollLeft =
        ((node.scrollWidth - node.clientWidth) * activeIndex) /
        Math.max(1, runs.length - 1);
  }, [activeIndex, runs.length]);
  const event = active ? currentGroup?.events.get(active.runId) : undefined;
  const x = (i: number) =>
    48 + (runs.length <= 1 ? 250 : (i / (runs.length - 1)) * 500);
  const y = (value: number) =>
    190 -
    (Math.max(0, Math.min(profile.SOFT_SKILL_MAX, value)) /
      profile.SOFT_SKILL_MAX) *
      160;
  return (
    <section
      aria-labelledby={`${caption}-title`}
      className="mt-6 rounded-2xl border-2 border-toon-ink bg-toon-cream p-3 sm:p-4"
    >
      <h3 id={`${caption}-title`} className="font-toon text-xl font-bold">
        Qua từng ca
      </h3>
      <div
        role="group"
        aria-label="Chọn nhóm kỹ năng trên biểu đồ"
        className="my-3 flex flex-wrap gap-2"
      >
        {profile.SOFT_SKILL_GROUPS.map((group) => (
          <button
            type="button"
            key={group.id}
            aria-pressed={selected === group.id}
            onClick={() => {
              setSelected(group.id);
              setActiveRun(null);
            }}
            className={cn(
              'rounded-full border-2 border-toon-ink px-3 py-1 text-xs font-bold focus-visible:shadow-toon-focus',
              selected === group.id
                ? 'bg-toon-mustard text-toon-ink'
                : 'bg-toon-paper text-toon-ink-soft',
            )}
          >
            {group.short}
          </button>
        ))}
      </div>
      {runs.length ? (
        <figure>
          <label className="mb-3 block text-xs font-bold">
            Chọn ca để xem điểm
            <select
              value={active?.runId ?? ''}
              onChange={(e) => setActiveRun(e.target.value)}
              className="mt-1 block min-h-11 w-full max-w-sm rounded-lg border-2 border-toon-ink bg-toon-paper p-2 focus-visible:shadow-toon-focus"
            >
              {runs.map((run) => (
                <option key={run.runId} value={run.runId}>
                  #{run.index} · {run.title}
                </option>
              ))}
            </select>
          </label>
          <div
            ref={plot}
            className="overflow-x-auto rounded focus-visible:shadow-toon-focus"
            tabIndex={0}
            role="region"
            aria-label="Biểu đồ kỹ năng có thể cuộn ngang"
          >
            <svg
              viewBox="0 0 580 220"
              role="group"
              aria-label="Bảy nhóm kỹ năng qua từng ca"
              className="w-full min-w-[520px]"
            >
              {[0, 3000, 6000, profile.SOFT_SKILL_MAX].map((value) => (
                <g key={value} aria-hidden>
                  <path
                    d={`M48 ${y(value)}H558`}
                    stroke="#b6aa97"
                    strokeDasharray="3 5"
                  />
                  <text
                    x="40"
                    y={y(value) + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#4a433c"
                  >
                    {value.toLocaleString('vi-VN')}
                  </text>
                </g>
              ))}
              {[
                ...series.filter((group) => group.id !== selected),
                ...series.filter((group) => group.id === selected),
              ].map((group) => (
                <polyline
                  key={group.id}
                  data-skill-line={group.id}
                  points={group.points
                    .flatMap((value, i) =>
                      value === null ? [] : [`${x(i)},${y(value)}`],
                    )
                    .join(' ')}
                  fill="none"
                  stroke={group.id === selected ? '#7a2c45' : '#b6aa97'}
                  strokeWidth={group.id === selected ? 3 : 1.5}
                />
              ))}
              {runs.map((run, i) => {
                const total = currentGroup?.points[i];
                if (total === null || total === undefined) return null;
                const scored = currentGroup?.events.get(run.runId);
                const label = `Ca ${run.index}: ${run.title}, ${scored ? `${scored.delta < 0 ? 'trừ' : 'cộng'} ${Math.abs(scored.delta)} điểm` : 'không chấm nhóm này'}`;
                return (
                  <g key={run.runId}>
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={label}
                      aria-describedby={caption}
                      className="cursor-pointer focus-visible:outline-none [&:focus-visible_.point-ring]:stroke-toon-sky-deep [&:focus-visible_.point-ring]:stroke-[4px]"
                      onMouseEnter={() => setActiveRun(run.runId)}
                      onFocus={() => setActiveRun(run.runId)}
                      onClick={() => setActiveRun(run.runId)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveRun(run.runId);
                        }
                      }}
                    >
                      <title>{label}</title>
                      <circle
                        className="point-ring"
                        cx={x(i)}
                        cy={y(total)}
                        r="12"
                        fill="transparent"
                        stroke={
                          active?.runId === run.runId
                            ? '#1e1b18'
                            : 'transparent'
                        }
                        strokeWidth="2"
                      />
                      <circle
                        cx={x(i)}
                        cy={y(total)}
                        r="5"
                        fill={
                          scored && scored.delta < 0 ? '#ef6f5e' : '#f0b63c'
                        }
                        stroke="#1e1b18"
                        strokeWidth="2"
                      />
                    </g>
                    <text
                      aria-hidden
                      x={x(i)}
                      y="210"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#4a433c"
                    >
                      #{run.index}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <figcaption
            id={caption}
            aria-live="polite"
            className="mt-3 text-sm text-toon-ink-soft"
          >
            {active && (
              <>
                <Link
                  to={`/play/${active.runId}/summary`}
                  className="font-bold underline"
                >
                  #{active.index} · {active.title}
                </Link>
                <p>
                  {profile.softSkillGroup(selected).short}:{' '}
                  {event ? (
                    <>
                      {event.delta < 0 ? '−' : '+'}
                      {Math.abs(event.delta).toLocaleString('vi-VN')} điểm ·
                      tổng {event.total.toLocaleString('vi-VN')}
                      {event.zodiacBonus > 0 &&
                        ` · gồm +${event.zodiacBonus} từ chòm sao`}
                    </>
                  ) : (
                    'Không chấm nhóm này trong ca đã chọn.'
                  )}
                </p>
              </>
            )}
          </figcaption>
        </figure>
      ) : (
        <p className="text-sm text-toon-ink-soft">
          Chơi một ca có chấm điểm để bắt đầu lịch sử.
        </p>
      )}
      <p className="mt-2 text-xs text-toon-ink-soft">
        Chọn ca hoặc chạm chấm; kéo ngang trên màn nhỏ. Đường xám: nhóm khác.
        Chưa có lịch sử không phải điểm 0.
      </p>
    </section>
  );
}
