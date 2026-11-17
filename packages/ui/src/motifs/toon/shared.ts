import type { CSSProperties, SVGProps } from 'react';

export interface MotifProps {
  size?: number | string;
  className?: string;
  /** Có nhãn thì hình tham gia cây trợ năng; mặc định chỉ trang trí. */
  label?: string;
}

export const color = (name: string) => `var(--color-toon-${name})`;
export const ink = color('night-deep');
export const line = {
  stroke: ink,
  strokeWidth: 2.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const;

export function svgProps(
  { size = 96, className, label }: MotifProps,
  viewBox = '0 0 96 96',
): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox,
    className,
    focusable: 'false',
    'aria-hidden': label ? undefined : true,
    'aria-label': label,
    role: label ? 'img' : undefined,
  };
}

/** Chỉ CSS, không timer JS; media query áp dụng cả ngoài vùng theme. */
export const motionCss = `
@keyframes celestial-ink-twinkle { 0%,100% { opacity: .45; transform: scale(.88); } 50% { opacity: 1; transform: scale(1); } }
@keyframes celestial-ink-orbit { to { transform: rotate(360deg); } }
[data-celestial-motion="twinkle"] { animation: celestial-ink-twinkle 4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
[data-celestial-motion="orbit"] { animation: celestial-ink-orbit 48s linear infinite; transform-origin: 48px 48px; }
@media (prefers-reduced-motion: reduce) { [data-celestial-motion] { animation: none !important; } }
`;

export const decorativeStyle: CSSProperties = { pointerEvents: 'none' };
