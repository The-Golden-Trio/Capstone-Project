import { useId } from 'react';
import { cn } from '../lib/cn';
import { EXPRESSION_LABELS, type Expression } from '../tokens';

/** Chuyển động thân nhân vật; emote vẫn tự chuyển động bên trong bong bóng. */
export const EXPRESSION_MOTION: Record<
  Expression,
  'none' | 'hop' | 'shake' | 'bob'
> = {
  binh_thuong: 'none',
  vui: 'hop',
  cuoi_lon: 'hop',
  ngac_nhien: 'hop',
  suy_nghi: 'bob',
  lo_lang: 'none',
  kho_chiu: 'shake',
  buon: 'none',
};

export interface EmoteProps {
  expression: Expression;
  /** Kích thước vuông, tính bằng px; nét vẽ thiết kế cho 40–64 px. */
  size?: number;
  className?: string;
}

const color = {
  ink: 'var(--color-toon-ink, #1e1b18)',
  paper: 'var(--color-toon-paper, #fffaf0)',
  gold: 'var(--color-toon-mustard, #f0b63c)',
  coral: 'var(--color-toon-coral, #e2703f)',
  rose: 'var(--color-toon-rose, #eea7b4)',
  sky: 'var(--color-toon-sky, #a6d2ea)',
  blue: 'var(--color-toon-sky-deep, #4f8db3)',
  gray: 'var(--color-toon-ink-faint, #665c52)',
};

const bubble =
  'M34 5C47.3 5 58 15.3 58 28S47.3 51 34 51C29.6 51 25.4 49.9 21.8 47.9L8 57L12.4 41.1C10.9 37.2 10 32.8 10 28C10 15.3 20.7 5 34 5Z';

type VisibleExpression = Exclude<Expression, 'binh_thuong'>;
const gestures: Record<VisibleExpression, { timing: string; frames: string }> =
  {
    vui: {
      timing: '1.6s ease-in-out infinite',
      frames: '0%,100%{transform:rotate(-5deg)}50%{transform:rotate(6deg)}',
    },
    cuoi_lon: {
      timing: '1.3s ease-in-out infinite',
      frames:
        '0%,45%,100%{transform:scale(1)}20%{transform:scale(1.08) rotate(-3deg)}30%{transform:scale(1.04) rotate(3deg)}',
    },
    ngac_nhien: {
      timing: '.65s cubic-bezier(.3,1.6,.5,1) both',
      frames:
        '0%,100%{transform:translateY(0)}35%{transform:translateY(-4px)}65%{transform:translateY(1px)}',
    },
    suy_nghi: {
      timing: '1.5s ease-in-out infinite',
      frames:
        '0%,55%,100%{opacity:.45;transform:translateY(0)}25%{opacity:1;transform:translateY(-2px)}',
    },
    lo_lang: {
      timing: '1.8s ease-in-out infinite',
      frames:
        '0%,100%{transform:translateY(-1px)}60%{transform:translateY(3px)}',
    },
    kho_chiu: {
      timing: '.6s ease-in-out both',
      frames:
        '0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-9deg)}40%,80%{transform:rotate(9deg)}',
    },
    buon: {
      timing: '2.2s ease-in-out infinite',
      frames:
        '0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(2px) rotate(2deg)}',
    },
  };

/** Bong bóng biểu cảm đặt cạnh đầu nhân vật; bình thường không chiếm chỗ. */
export function Emote({ expression, size = 56, className }: EmoteProps) {
  // Gọi hook cả khi không vẽ để đổi biểu cảm không làm thay đổi thứ tự hook.
  const id = `toon-emote-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  if (expression === 'binh_thuong') return null;
  const gesture = gestures[expression];
  const target = expression === 'suy_nghi' ? '.emote-dot' : '.emote-mark';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={EXPRESSION_LABELS[expression]}
      focusable="false"
      data-emote={id}
      className={cn(
        'pointer-events-none shrink-0 select-none overflow-visible animate-toon-pop motion-reduce:animate-none',
        className,
      )}
      fill="none"
      stroke={color.ink}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Tên keyframe và selector riêng từng instance, không ảnh hưởng SVG khác. */}
      <style>{`
        @keyframes ${id}-gesture { ${gesture.frames} }
        [data-emote="${id}"] ${target} {
          transform-box: fill-box;
          transform-origin: center;
          animation: ${id}-gesture ${gesture.timing};
        }
        @media (prefers-reduced-motion: reduce) {
          [data-emote="${id}"], [data-emote="${id}"] * { animation: none !important; }
        }
      `}</style>
      <g aria-hidden="true">
        <path
          d={bubble}
          transform="translate(2 3)"
          fill={color.ink}
          stroke="none"
        />
        <path d={bubble} fill={color.paper} />
        <g className="emote-mark">
          <Symbol expression={expression} />
        </g>
      </g>
    </svg>
  );
}

function Symbol({ expression }: { expression: VisibleExpression }) {
  switch (expression) {
    case 'vui':
      return (
        <>
          <path d="M29 34V19L40 16V30M29 23L40 20" />
          <ellipse cx={25} cy={35} rx={4.5} ry={3.5} fill={color.rose} />
          <ellipse cx={36} cy={31} rx={4.5} ry={3.5} fill={color.rose} />
          <path
            d="M47 13L48.5 17.5L53 19L48.5 20.5L47 25L45.5 20.5L41 19L45.5 17.5Z"
            fill={color.gold}
            strokeWidth={2}
          />
          <path
            d="M19 22L19.8 24.2L22 25L19.8 25.8L19 28L18.2 25.8L16 25L18.2 24.2Z"
            fill={color.gold}
            strokeWidth={1.5}
          />
        </>
      );
    case 'cuoi_lon':
      return (
        <>
          <path
            d="M20 14L25 13L26 24L22 25ZM40 13L45 14L43 25L39 24Z"
            fill={color.gold}
          />
          <circle cx={24} cy={29} r={1.6} fill={color.gold} strokeWidth={2} />
          <circle cx={41} cy={29} r={1.6} fill={color.gold} strokeWidth={2} />
          <path d="M26 34Q28 31 30 34M36 34Q38 31 40 34" />
          <path d="M25 38Q33 47 42 38Z" fill={color.rose} />
        </>
      );
    case 'ngac_nhien':
      return (
        <>
          <path d="M29 14Q34 12 39 14L37 31H31Z" fill={color.coral} />
          <circle cx={34} cy={39} r={4} fill={color.coral} />
        </>
      );
    case 'suy_nghi':
      return (
        <>
          {[24, 34, 44].map((x, i) => (
            <circle
              key={x}
              className="emote-dot"
              cx={x}
              cy={28}
              r={3.3}
              fill={color.blue}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </>
      );
    case 'lo_lang':
      return (
        <>
          <path
            d="M35 13C32 21 24 28 24 34A11 11 0 0 0 46 34C46 28 38 20 35 13Z"
            fill={color.sky}
          />
          <path d="M29 32Q27 37 32 39" stroke={color.paper} />
          <path d="M19 18L21 21M17 27H20" strokeWidth={2} />
        </>
      );
    case 'kho_chiu':
      return (
        <>
          {[0, 90, 180, 270].map((angle) => (
            <path
              key={angle}
              d="M24 15Q33 16 33 25H29Q29 20 23 19Z"
              transform={`rotate(${angle} 34 28)`}
              fill={color.coral}
            />
          ))}
        </>
      );
    case 'buon':
      return (
        <>
          <path
            d="M24 32C16 32 17 23 24 22C25 14 37 13 41 21C50 19 53 32 45 32Z"
            fill={color.gray}
          />
          {[25, 35, 45].map((x) => (
            <path key={x} d={`M${x} 36L${x - 2} 41`} stroke={color.blue} />
          ))}
        </>
      );
  }
}
