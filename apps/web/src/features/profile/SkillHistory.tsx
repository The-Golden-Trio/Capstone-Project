import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@datn/ui';
import { EmptyMessage } from './ProfileKit';

import type { SoftSkillState } from '../../api/types';
import { RunPath } from './RunPath';
import { chronological } from './recordView';

const number = (value: number) => value.toLocaleString('vi-VN');

export function SkillHistory({
  history,
}: {
  history: SoftSkillState['history'];
}) {
  const events = chronological(history);
  const tooltipId = useId();
  const [active, setActive] = useState<number | null>(null);
  if (events.length < 2)
    return (
      <EmptyMessage
        className="grayscale opacity-60"
        title="chơi thêm để mở"
        description="Cần ít nhất hai ca có chấm nhóm này để vẽ đường tích luỹ."
      />
    );
  const max = Math.max(1, ...events.map((event) => event.total));
  const min = Math.min(0, ...events.map((event) => event.total));
  const point = (index: number) => [
    20 + (index / (events.length - 1)) * 280,
    105 - ((events[index].total - min) / (max - min)) * 85,
  ];
  const activeIndex = Math.min(active ?? events.length - 1, events.length - 1);
  const current = events[activeIndex];
  return (
    <figure>
      <svg
        viewBox="0 0 320 125"
        role="group"
        aria-label="Điểm tích luỹ qua từng ca làm"
        className="w-full"
      >
        <polyline
          points={events.map((_, index) => point(index).join(',')).join(' ')}
          fill="none"
          stroke="#1e1b18"
          strokeWidth="2"
        />
        {events.map((event, index) => {
          const [x, y] = point(index);
          return (
            <g
              key={`${event.runId}-${index}`}
              role="button"
              tabIndex={0}
              aria-label={`Ca ${index + 1}: ${event.title}, ${event.delta < 0 ? 'trừ' : 'cộng'} ${Math.abs(event.delta)} điểm`}
              aria-describedby={activeIndex === index ? tooltipId : undefined}
              aria-pressed={activeIndex === index}
              className="cursor-pointer focus-visible:outline-none"
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActive(index);
                }
              }}
            >
              <title>{`${event.title} · ${event.path.startsWith('/') ? 'Chi tiết đường nghề bên dưới' : event.path} · ${new Date(event.date).toLocaleDateString('vi-VN')} · ${event.delta < 0 ? '−' : '+'}${Math.abs(event.delta)} · gồm +${event.zodiacBonus} từ chòm sao · tổng ${event.total}`}</title>
              <circle cx={x} cy={y} r="12" fill="transparent" />
              {activeIndex === index && (
                <circle
                  cx={x}
                  cy={y}
                  r="9"
                  fill="none"
                  stroke="#1e1b18"
                  strokeWidth="1.5"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r="5"
                stroke="#1e1b18"
                strokeWidth="1.5"
                fill={event.delta < 0 ? '#ef6f5e' : '#f6cf5e'}
              />
              <text
                x={x}
                y={y - 9}
                textAnchor="middle"
                fill="#1e1b18"
                fontSize="9"
              >
                {event.delta < 0 ? '−' : '+'}
              </text>
            </g>
          );
        })}
      </svg>
      <div
        className="flex flex-wrap gap-2"
        aria-label="Chọn ca để xem chi tiết"
      >
        {events.map((event, index) => (
          <button
            key={`${event.runId}-${index}`}
            type="button"
            aria-pressed={activeIndex === index}
            onFocus={() => setActive(index)}
            onMouseEnter={() => setActive(index)}
            onClick={() => setActive(index)}
            className={cn(
              'rounded border px-2 py-1 text-xs focus-visible:shadow-toon-focus',
              activeIndex === index
                ? 'border-toon-ink text-toon-maroon'
                : 'border-toon-ink text-toon-ink-soft',
            )}
          >
            #{index + 1} {event.delta < 0 ? '−' : '+'}
            {number(Math.abs(event.delta))}
          </button>
        ))}
      </div>
      <figcaption
        id={tooltipId}
        aria-live="polite"
        className="mt-3 space-y-1 text-xs text-toon-ink-soft"
      >
        <Link
          to={`/play/${current.runId}/summary`}
          className="font-semibold underline"
        >
          {current.title}
        </Link>
        <p>
          <RunPath runId={current.runId} path={current.path} />
        </p>
        <p>
          {new Date(current.date).toLocaleDateString('vi-VN')} ·{' '}
          {current.delta < 0 ? '−' : '+'}
          {number(Math.abs(current.delta))} điểm · gồm +
          {number(current.zodiacBonus)} từ chòm sao · tổng{' '}
          {number(current.total)}
        </p>
      </figcaption>
    </figure>
  );
}
