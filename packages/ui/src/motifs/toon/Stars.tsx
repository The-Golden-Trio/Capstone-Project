import { color, line, motionCss, svgProps, type MotifProps } from './shared';

export interface InkStarProps extends MotifProps {
  variant?: 'sparkle' | 'round5';
  fill?: string;
}

/** Bốn cánh lệch nhẹ như nét bút; bản năm cánh bo mềm như miếng dán. */
export function InkStar({
  variant = 'sparkle',
  fill = color('star'),
  ...props
}: InkStarProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        {...line}
        fill={fill}
        d={
          variant === 'sparkle'
            ? 'M46 6 Q51 33 59 37 L86 45 Q61 51 57 58 L48 89 Q42 61 35 57 L8 48 Q34 42 38 34 Z'
            : 'M48 10 Q51 8 54 17 L61 33 80 35 Q91 36 81 45 L68 57 72 77 Q74 88 64 82 L48 72 30 83 Q20 88 23 76 L27 57 12 43 Q5 35 17 34 L36 32 43 15 Q45 10 48 10 Z'
        }
      />
      <path
        d="M45 26 41 39 31 44"
        fill="none"
        stroke={color('star-soft')}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface TwinkleProps extends InkStarProps {
  delay?: number;
}

export function Twinkle({ delay = 0, ...props }: TwinkleProps) {
  return (
    <svg {...svgProps({ ...props, size: props.size ?? 28 })}>
      <style>{motionCss}</style>
      <g
        data-celestial-motion="twinkle"
        style={{ animationDelay: `${delay}s` }}
      >
        <InkStar {...props} size={96} />
      </g>
    </svg>
  );
}
