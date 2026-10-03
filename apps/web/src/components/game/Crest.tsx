import {
  GLYPH_PATH,
  SHAPE_PATH,
  STROKED_GLYPHS,
  crest,
} from '../../domain/crest';
import { cx } from '../../lib/cx';

interface CrestProps {
  /** `npc_id`, id người chơi, hay `role_code` — gì cũng được, miễn ổn định. */
  seed: string;
  size?: number;
  /** Viền sáng lên, dùng cho nhân vật đang nói. */
  active?: boolean;
  className?: string;
}

/**
 * Huy hiệu nhân vật, vẽ bằng SVG ngay tại chỗ.
 *
 * Hình dáng, dấu và màu đều do `crest(seed)` quyết định nên không có tài
 * nguyên ảnh nào phải tải, và một NPC mới trong dữ liệu là tự có mặt.
 */
export function Crest({ seed, size = 36, active = false, className }: CrestProps) {
  const look = crest(seed);
  const clipId = `crest-clip-${seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const gradId = `crest-grad-${seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const stroked = STROKED_GLYPHS.has(look.glyph);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cx('shrink-0', active && 'crest-active', className)}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={SHAPE_PATH[look.shape]} />
        </clipPath>
        <linearGradient
          id={gradId}
          gradientTransform={`rotate(${look.angle} 0.5 0.5)`}
        >
          <stop offset="0%" stopColor={look.ink} stopOpacity="0.38" />
          <stop offset="100%" stopColor={look.ink} stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect width="100" height="100" fill={look.ground} />
        <rect width="100" height="100" fill={`url(#${gradId})`} />
        <path
          d={GLYPH_PATH[look.glyph]}
          fill={stroked ? 'none' : look.ink}
          stroke={stroked ? look.ink : 'none'}
          strokeWidth={stroked ? 7 : 0}
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>

      <path
        d={SHAPE_PATH[look.shape]}
        fill="none"
        stroke={look.ink}
        strokeWidth={active ? 5 : 3}
        opacity={active ? 0.95 : 0.55}
      />
    </svg>
  );
}
