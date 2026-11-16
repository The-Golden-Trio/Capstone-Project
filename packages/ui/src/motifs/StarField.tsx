import { useMemo } from 'react';
import { cn } from '../lib/cn';
import { between, seededRandom } from '../lib/seed';
import { SPARKLE_PATH } from './Sparkle';

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  gold: boolean;
}

interface Glint {
  x: number;
  y: number;
  s: number;
  d: number;
}

/**
 * Bầu trời sao vẽ một lần bằng SVG (không canvas, không vòng lặp JS): các
 * chấm sao tĩnh, vài sao vàng, và một ít sao bốn cánh lấp lánh bằng CSS.
 * Cùng `seed` thì cùng bầu trời. Tắt chuyển động khi người dùng chọn giảm
 * chuyển động.
 */
export function StarField({
  seed = 'jobquest',
  density = 1,
  glints = 9,
  className,
  fixed = false,
}: {
  seed?: string;
  /** 1 là mật độ chuẩn cho nền trang; 0.4 cho thẻ nhỏ. */
  density?: number;
  glints?: number;
  className?: string;
  /** Phủ cả màn hình, đứng yên khi cuộn. */
  fixed?: boolean;
}) {
  const { stars, sparkles } = useMemo(() => {
    const rand = seededRandom(seed);
    const count = Math.round(170 * density);
    const stars: Star[] = Array.from({ length: count }, () => {
      const big = rand() > 0.94;
      return {
        x: rand() * 100,
        y: rand() * 100,
        r: big ? between(rand, 0.9, 1.5) : between(rand, 0.25, 0.75),
        o: between(rand, 0.25, 0.95),
        gold: rand() > 0.82,
      };
    });
    const sparkles: Glint[] = Array.from({ length: glints }, () => ({
      x: between(rand, 3, 97),
      y: between(rand, 3, 90),
      s: between(rand, 7, 16),
      d: between(rand, 0, 4.5),
    }));
    return { stars, sparkles };
  }, [seed, density, glints]);

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none overflow-hidden',
        fixed ? 'fixed inset-0 -z-10' : 'absolute inset-0',
        className,
      )}
    >
      {/* Không viewBox: toạ độ phần trăm, bán kính px, nên sao luôn tròn. */}
      <svg className="absolute inset-0 h-full w-full">
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill={s.gold ? '#f0d79a' : '#f8f6ee'}
            opacity={s.o}
          />
        ))}
      </svg>
      {sparkles.map((g, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={g.s}
          height={g.s}
          className="absolute animate-twinkle text-gold-300"
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            animationDelay: `${g.d}s`,
            filter: 'drop-shadow(0 0 6px rgb(240 215 154 / 0.7))',
          }}
        >
          <path d={SPARKLE_PATH} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
