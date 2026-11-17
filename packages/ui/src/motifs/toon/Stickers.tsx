import { color, line, svgProps, type MotifProps } from './shared';
import { InkStar } from './Stars';

export interface StickerBadgeProps extends MotifProps {
  children: string;
}

/** Chữ là một nhãn ngắn; truyền label khi huy hiệu mang thông tin riêng. */
export function StickerBadge({ children, ...props }: StickerBadgeProps) {
  return (
    <svg {...svgProps(props, '0 0 120 120')}>
      <path
        {...line}
        fill={color('star')}
        d="m60 5 10 10 14-4 5 14 14 5-4 14 10 10-10 10 4 14-14 5-5 14-14-4-10 10-10-10-14 4-5-14-14-5 4-14L5 54l10-10-4-14 14-5 5-14 14 4Z"
        transform="translate(5 5)"
      />
      <circle
        cx="60"
        cy="60"
        r="36"
        fill="none"
        stroke={color('ink')}
        strokeWidth="1.5"
        strokeDasharray="2 5"
      />
      <path d="m55 33 5-10 5 10-5 5Z" fill={color('compass-red')} />
      <text
        x="60"
        y="67"
        textAnchor="middle"
        fill={color('ink')}
        fontFamily="var(--font-toon)"
        fontSize={Math.min(17, 78 / (Math.max(1, children.length) * 0.62))}
        fontWeight="800"
      >
        {children}
      </text>
      <path
        d="m43 82 17 4 17-4"
        fill="none"
        stroke={color('ink')}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface RibbonProps extends MotifProps {
  children: string;
}

export function Ribbon({ children, size = 280, ...props }: RibbonProps) {
  return (
    <svg
      {...svgProps({ size, ...props }, '0 0 320 92')}
      style={{ height: 'auto', aspectRatio: '320 / 92' }}
    >
      <path
        {...line}
        fill={color('mustard-deep')}
        d="M7 26 55 25 55 76 8 76 23 52Z M265 25 313 26 297 52 312 76 265 76Z"
      />
      <path
        {...line}
        fill={color('wood')}
        d="m43 63 18 16V48Z m234 0-18 16V48Z"
      />
      <path
        {...line}
        fill={color('star')}
        d="M43 15 Q160 4 277 15V63Q160 53 43 63Z"
      />
      <text
        x="160"
        y="42"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color('ink')}
        fontFamily="var(--font-toon)"
        fontSize={Math.min(23, 216 / (Math.max(1, children.length) * 0.56))}
        fontWeight="800"
      >
        {children}
      </text>
      <path
        d="M59 23 Q160 14 261 23"
        fill="none"
        stroke={color('star-soft')}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface TapeProps extends MotifProps {
  tone?: 'gold' | 'blue';
  angle?: number;
}

export function Tape({
  tone = 'gold',
  angle = -12,
  size = 112,
  ...props
}: TapeProps) {
  return (
    <svg {...svgProps({ size, ...props }, '0 0 128 80')}>
      <g transform={`rotate(${angle} 64 40)`}>
        <path
          {...line}
          stroke={color('ink')}
          fill={color(tone === 'gold' ? 'star-soft' : 'sky')}
          d="m13 24 5-5 6 5 6-5 6 5 68-5-3 6 6 5-5 6 5 6-6 5 4 7-76 4-6-5-6 5-5-5 4-6-5-5 4-6Z"
        />
        <path
          d="m34 32 53-3 M34 44l38-2"
          stroke={color(tone === 'gold' ? 'mustard' : 'sky-deep')}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export interface CornerStarsProps extends MotifProps {
  corner?: 'left' | 'right';
}

export function CornerStars({ corner = 'right', ...props }: CornerStarsProps) {
  return (
    <svg {...svgProps(props)}>
      <g
        transform={
          corner === 'left' ? 'translate(96 0) scale(-1 1)' : undefined
        }
      >
        <InkStar size={58} />
        <svg x="58" y="36" width="30" height="30" viewBox="0 0 96 96">
          <InkStar size={96} fill={color('compass-red')} variant="round5" />
        </svg>
        <path
          d="m66 10 4-7 M79 20l9-2 M21 67l-5 7"
          stroke={color('star')}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="55" cy="76" r="3" fill={color('star-soft')} />
      </g>
    </svg>
  );
}

export function WavyDivider({ size = '100%', ...props }: MotifProps) {
  return (
    <svg
      {...svgProps({ size, ...props }, '0 0 640 32')}
      height="32"
      preserveAspectRatio="none"
    >
      <path
        d="M2 18Q22 2 42 18T82 18T122 18T162 18T202 18T242 18T282 18T322 18T362 18T402 18T442 18T482 18T522 18T562 18T602 18T642 18"
        fill="none"
        stroke={color('star')}
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}
