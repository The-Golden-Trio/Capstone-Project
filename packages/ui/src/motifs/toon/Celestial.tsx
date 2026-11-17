import { regionColor, type RegionId } from '../../tokens';
import { seededRandom } from '../../lib/seed';
import {
  color,
  ink,
  line,
  motionCss,
  svgProps,
  type MotifProps,
} from './shared';

export interface CartoonMoonProps extends MotifProps {
  face?: false | 'sleep' | 'smile';
}

export function CartoonMoon({ face = false, ...props }: CartoonMoonProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        {...line}
        fill={color('star-soft')}
        d="M61 8 C22 2 4 36 17 64 C30 93 68 91 85 66 C54 77 32 39 61 8 Z"
      />
      <path
        d="M23 32 Q17 43 22 53"
        fill="none"
        stroke={color('paper')}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="65" r="5" fill={color('star')} />
      <circle cx="24" cy="57" r="2" fill={color('star')} />
      {face && (
        <g {...line} fill="none" strokeWidth="2.5">
          {face === 'sleep' ? (
            <path d="M28 43 Q32 47 36 43 M43 49 Q47 53 51 49" />
          ) : (
            <path d="M29 43 29 45 M44 48 44 50" />
          )}
          <path
            d={face === 'sleep' ? 'M36 56 Q38 59 40 57' : 'M34 55 Q38 64 45 59'}
          />
          <path
            d="M25 51 29 53"
            stroke={color('compass-red')}
            strokeWidth="4"
          />
        </g>
      )}
    </svg>
  );
}

export interface CartoonPlanetProps extends MotifProps {
  seed?: string;
  region?: RegionId;
  ring?: boolean;
}
const regions: RegionId[] = [
  'ky_thuat',
  'suc_khoe',
  'kinh_doanh',
  'cong_nghe',
  'sang_tao',
  'dich_vu',
];

/** Cùng seed giữ nguyên màu vùng và vị trí đốm, không cần clipPath/id toàn cục. */
export function CartoonPlanet({
  seed = 'jobquest',
  region,
  ring = true,
  ...props
}: CartoonPlanetProps) {
  const rand = seededRandom(seed);
  const fill = regionColor(
    region ?? regions[Math.floor(rand() * regions.length)],
  );
  const tilt = Math.round(rand() * 28 - 14);
  return (
    <svg {...svgProps(props)}>
      <g transform={`rotate(${tilt} 48 48)`}>
        {ring && (
          <g transform="rotate(-24 48 49)" fill="none">
            <ellipse
              cx="48"
              cy="49"
              rx="44"
              ry="13"
              stroke={ink}
              strokeWidth="9"
            />
            <ellipse
              cx="48"
              cy="49"
              rx="44"
              ry="13"
              stroke={color('star')}
              strokeWidth="5"
            />
          </g>
        )}
        <circle {...line} cx="48" cy="45" r="31" fill={fill} />
        <path
          d="M28 27 Q39 15 54 20 Q43 24 47 31 Q53 41 35 41 Q23 39 28 27 Z"
          fill={color('paper')}
        />
        <path
          d="M47 48 Q60 40 72 48 Q74 59 64 66 Q48 73 42 64 Q36 54 47 48 Z"
          fill={color('night-line')}
        />
        <path
          d="M32 54 Q34 50 38 52 Q40 57 36 59 Q31 59 32 54"
          fill={color('paper')}
        />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={40 + Math.round(rand() * 18)}
            cy={30 + Math.round(rand() * 11)}
            r={2 + rand() * 2}
            fill={color('night-soft')}
          />
        ))}
        <circle cx="48" cy="45" r="31" fill="none" {...line} />
        {ring && (
          <g transform="rotate(-24 48 49)" fill="none" strokeLinecap="round">
            <path d="M4 49 A44 13 0 0 0 92 49" stroke={ink} strokeWidth="9" />
            <path
              d="M4 49 A44 13 0 0 0 92 49"
              stroke={color('star')}
              strokeWidth="5"
            />
          </g>
        )}
      </g>
    </svg>
  );
}

export function Comet(props: MotifProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        {...line}
        fill={color('compass-red')}
        d="M9 77 41 19 44 42 78 8 63 53 88 48 42 86 Q18 97 9 77 Z"
      />
      <path
        {...line}
        fill={color('star')}
        d="m13 76 33-38-4 25 25-12-26 31 Z"
      />
      <circle {...line} cx="27" cy="72" r="18" fill={color('star-soft')} />
      <path
        d="M18 70 Q18 61 26 61"
        fill="none"
        stroke={color('paper')}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface OrbitProps extends MotifProps {
  animated?: boolean;
}

export function Orbit({ animated = true, ...props }: OrbitProps) {
  return (
    <svg {...svgProps(props)}>
      <style>{motionCss}</style>
      {/* Nhóm quay trong mặt phẳng tròn rồi ép dọc: hạt đi đúng đường elip. */}
      <g transform="translate(0 24) scale(1 .5)">
        <circle
          cx="48"
          cy="48"
          r="39"
          fill="none"
          stroke={color('star')}
          strokeWidth="2.5"
          strokeDasharray="5 7"
          vectorEffect="non-scaling-stroke"
        />
        <g data-celestial-motion={animated ? 'orbit' : undefined}>
          <g transform="translate(87 48) scale(1 2)">
            <circle {...line} r="7" className="fill-toon-planet" />
            <path
              d="M-3-2 1-4"
              stroke={color('paper')}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
      <path
        d="m44 39 4-10 4 10 10 4-10 4-4 10-4-10-10-4 Z"
        fill={color('star')}
      />
    </svg>
  );
}

export function Constellation(props: MotifProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="m13 65 21-40 25 18 24-29-12 62-37-51"
        fill="none"
        stroke={color('night-line')}
        strokeWidth="2.75"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {[
        [13, 65],
        [34, 25],
        [59, 43],
        [83, 14],
        [71, 76],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle
            {...line}
            cx={x}
            cy={y}
            r={i === 1 ? 6 : 4}
            fill={color(i % 2 ? 'star' : 'paper')}
          />
        </g>
      ))}
    </svg>
  );
}

export function Cloud(props: MotifProps) {
  return (
    <svg {...svgProps(props, '0 0 144 80')}>
      <path
        {...line}
        fill={color('night-soft')}
        d="M24 63 C3 62 4 34 26 34 C27 8 64 3 77 28 C92 16 117 26 117 42 C140 36 145 63 125 65 Z"
      />
      <path
        d="M31 44 Q34 27 51 28 M81 38 Q92 30 101 40"
        stroke={color('night-line')}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
