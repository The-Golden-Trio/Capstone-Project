import {
  InkStar,
  ACHIEVEMENT_KINDS,
  seededRandom,
  type AchievementKind,
} from '@datn/ui';

/** Huy hiệu người chơi: la bàn mực, các chấm giữ nguyên theo seed. */
export function PlayerSeal({
  seed,
  size = 88,
}: {
  seed: string;
  size?: number;
}) {
  const rand = seededRandom(seed);
  return (
    <svg
      role="img"
      aria-label="Huy hiệu người chơi"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="shrink-0"
    >
      <path
        d="M50 4 89 25v50L50 96 11 75V25Z"
        fill="#142650"
        stroke="#1e1b18"
        strokeWidth="3"
      />
      <path
        d="m50 13 31 17v40L50 87 19 70V30Z"
        fill="none"
        stroke="#f6cf5e"
        strokeWidth="2"
        strokeDasharray="3 5"
      />
      {Array.from({ length: 5 }, (_, i) => (
        <circle
          key={i}
          cx={25 + rand() * 50}
          cy={25 + rand() * 50}
          r="1.5"
          fill="#a6d2ea"
        />
      ))}
      <path
        d="m50 23 7 20 20 7-20 7-7 20-7-20-20-7 20-7Z"
        fill="#f6cf5e"
        stroke="#1e1b18"
        strokeWidth="2.5"
      />
      <path d="m43 57 7 20 7-20Z" fill="#ef6f5e" />
      <circle
        cx="50"
        cy="50"
        r="4"
        fill="#fffaf0"
        stroke="#1e1b18"
        strokeWidth="2"
      />
    </svg>
  );
}
export function AchievementSeal({
  kind,
  label,
  locked = false,
  size = 96,
}: {
  kind: AchievementKind;
  label?: string;
  locked?: boolean;
  size?: number;
}) {
  return (
    <svg
      role="img"
      aria-label={
        label ??
        `${ACHIEVEMENT_KINDS[kind].name}${locked ? ' — Chưa mở khoá' : ''}`
      }
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="shrink-0"
    >
      <path
        d="m50 5 39 22v46L50 95 11 73V27Z"
        fill={locked ? '#dcc6a0' : ACHIEVEMENT_KINDS[kind].color}
        stroke="#1e1b18"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="m50 15 30 17v36L50 85 20 68V32Z"
        fill="none"
        stroke="#1e1b18"
        strokeWidth="2"
        strokeDasharray={locked ? '3 4' : undefined}
      />
      {locked ? (
        <text
          x="50"
          y="66"
          textAnchor="middle"
          fontFamily="var(--font-toon)"
          fontSize="48"
          fontWeight="800"
          fill="#665c52"
        >
          ?
        </text>
      ) : (
        <g transform="translate(23 23)">
          <InkStar size={54} fill="#fffaf0" />
        </g>
      )}
    </svg>
  );
}
export function SkillRadar({
  axes,
  values,
  highlight,
}: {
  axes: Array<{ key: string; label: string; starred?: boolean }>;
  values: Record<string, number>;
  highlight?: string;
}) {
  const point = (i: number, r: number) => {
    const a = (i * 2 * Math.PI) / axes.length - Math.PI / 2;
    return [200 + Math.cos(a) * r, 190 + Math.sin(a) * r];
  };
  const shape = (r: number) =>
    axes.map((_, i) => point(i, r).join(',')).join(' ');
  const value = (key: string) =>
    Number.isFinite(values[key]) ? Math.max(0, Math.min(5, values[key])) : 0;
  return (
    <figure className="mx-auto max-w-[420px]">
      <svg
        role="img"
        aria-label="Nhóm kỹ năng mềm, thang từ 0 đến 5"
        viewBox="0 0 400 380"
        className="w-full font-toon"
      >
        <polygon
          points={shape(112)}
          fill="#f7ecd6"
          stroke="#1e1b18"
          strokeWidth="2.5"
        />
        {[1, 2, 3, 4].map((r) => (
          <polygon
            key={r}
            points={shape((r * 112) / 5)}
            fill="none"
            stroke="#1e1b18"
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity=".35"
          />
        ))}
        {axes.map((axis, i) => (
          <line
            key={axis.key}
            x1="200"
            y1="190"
            x2={point(i, 112)[0]}
            y2={point(i, 112)[1]}
            stroke="#1e1b18"
            opacity=".3"
          />
        ))}
        <polygon
          points={axes
            .map((axis, i) => point(i, (value(axis.key) * 112) / 5).join(','))
            .join(' ')}
          fill="#f6cf5e"
          stroke="#1e1b18"
          strokeWidth="3"
        />
        {axes.map((axis, i) => {
          const [x, y] = point(i, 150);
          const [vx, vy] = point(i, (value(axis.key) * 112) / 5);
          return (
            <g
              key={axis.key}
              opacity={highlight && highlight !== axis.key ? 0.35 : 1}
            >
              <circle
                cx={vx}
                cy={vy}
                r="4"
                fill="#fffaf0"
                stroke="#1e1b18"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#1e1b18"
                fontSize="14"
                fontWeight="800"
              >
                {axis.label}
              </text>
              {axis.starred && (
                <path
                  d="m0-4 1.3 2.7L4 0 1.3 1.3 0 4-1.3 1.3-4 0-1.3-1.3Z"
                  transform={`translate(${x} ${y + 15})`}
                  fill="#c98d17"
                />
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
