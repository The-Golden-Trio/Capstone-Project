/**
 * Bản đồ ngân hà 2D bằng SVG. Kéo để di chuyển, cuộn hoặc chụm hai ngón để
 * phóng to. Di chuyển ghi thẳng vào thuộc tính `transform` (không setState
 * mỗi khung hình) để mượt trên điện thoại yếu (NFR-13); chỉ khi qua ngưỡng
 * phóng to mới vẽ lại để đổi mức chi tiết của nhãn.
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { InkStar, regionColor, seededRandom } from '@datn/ui';
import type { GalaxyLayout, PlacedOccupation } from './layout';

type Detail = 'far' | 'mid' | 'near';
const detailOf = (k: number): Detail =>
  k < 0.5 ? 'far' : k < 1.15 ? 'mid' : 'near';
const MIN_K = 0.18;
const MAX_K = 3.2;

export interface GalaxyMapHandle {
  fit: () => void;
  zoomBy: (factor: number) => void;
  flyTo: (code: string, k?: number) => void;
}

interface Props {
  layout: GalaxyLayout;
  selected: string | null;
  onSelect: (code: string | null) => void;
  /** Nghề khớp tìm kiếm hay bộ lọc; `null` là không lọc. */
  highlight: Set<string> | null;
  /** Nghề được gợi ý từ Get to know me. */
  suggested: Set<string>;
  className?: string;
}

export const GalaxyMap = forwardRef<GalaxyMapHandle, Props>(function GalaxyMap(
  { layout, selected, onSelect, highlight, suggested, className },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const view = useRef({ x: 0, y: 0, k: 0.4 });
  const [detail, setDetail] = useState<Detail>('far');
  const anim = useRef<number | null>(null);

  // Nghề được chọn vẽ sau cùng để nhãn của nó nằm trên các hành tinh khác.
  const ordered = useMemo(() => {
    if (!selected) return layout.occupations;
    const rest = layout.occupations.filter(
      (p) => p.occupation.code !== selected,
    );
    const sel = layout.occupations.find((p) => p.occupation.code === selected);
    return sel ? [...rest, sel] : rest;
  }, [layout.occupations, selected]);

  // Nhãn chồng nhau thì khó đọc: chỉ giữ nhãn không đè lên nhãn ưu tiên hơn
  // (nghề đang chọn, nghề gợi ý, nghề có màn chơi, rồi tới các nghề còn lại).
  const labelled = useMemo(
    () =>
      pickLabels(layout.occupations, detail, selected, highlight, suggested),
    [layout.occupations, detail, selected, highlight, suggested],
  );

  const apply = useCallback(() => {
    const { x, y, k } = view.current;
    worldRef.current?.setAttribute(
      'transform',
      `translate(${x} ${y}) scale(${k})`,
    );
    setDetail((d) => {
      const next = detailOf(k);
      return d === next ? d : next;
    });
  }, []);

  const size = () => {
    const r = svgRef.current?.getBoundingClientRect();
    return { w: r?.width ?? 800, h: r?.height ?? 600 };
  };

  const animateTo = useCallback(
    (target: { x: number; y: number; k: number }, ms = 650) => {
      if (anim.current) cancelAnimationFrame(anim.current);
      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const from = { ...view.current };
      const start = performance.now();
      const tick = (now: number) => {
        const t = reduce ? 1 : Math.min(1, (now - start) / ms);
        const e = 1 - (1 - t) ** 3;
        view.current = {
          x: from.x + (target.x - from.x) * e,
          y: from.y + (target.y - from.y) * e,
          k: from.k + (target.k - from.k) * e,
        };
        apply();
        if (t < 1) anim.current = requestAnimationFrame(tick);
      };
      anim.current = requestAnimationFrame(tick);
    },
    [apply],
  );

  const fitView = useCallback(
    (animate = true) => {
      const { w, h } = size();
      const b = layout.bounds;
      const k = Math.min(w / (b.maxX - b.minX), h / (b.maxY - b.minY)) * 0.96;
      const target = {
        k,
        x: w / 2 - ((b.minX + b.maxX) / 2) * k,
        y: h / 2 - ((b.minY + b.maxY) / 2) * k,
      };
      if (animate) animateTo(target);
      else {
        view.current = target;
        apply();
      }
    },
    [layout, animateTo, apply],
  );

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      const v = view.current;
      const k = Math.min(MAX_K, Math.max(MIN_K, v.k * factor));
      const ratio = k / v.k;
      view.current = {
        k,
        x: px - (px - v.x) * ratio,
        y: py - (py - v.y) * ratio,
      };
      apply();
    },
    [apply],
  );

  useImperativeHandle(
    ref,
    () => ({
      fit: () => fitView(true),
      zoomBy: (f) => {
        const { w, h } = size();
        const v = view.current;
        const k = Math.min(MAX_K, Math.max(MIN_K, v.k * f));
        animateTo(
          {
            k,
            x: w / 2 - ((w / 2 - v.x) / v.k) * k,
            y: h / 2 - ((h / 2 - v.y) / v.k) * k,
          },
          260,
        );
      },
      flyTo: (code, k = 1.5) => {
        const p = layout.occupations.find((o) => o.occupation.code === code);
        if (!p) return;
        const { w, h } = size();
        // Chừa chỗ cho panel thông tin bên phải trên màn rộng.
        const cx = w > 900 ? w * 0.38 : w / 2;
        const cy = w > 900 ? h / 2 : h * 0.36;
        animateTo({ k, x: cx - p.x * k, y: cy - p.y * k });
      },
    }),
    [fitView, animateTo, layout],
  );

  // Vừa khung lúc đầu và khi đổi kích thước cửa sổ.
  useEffect(() => {
    fitView(false);
    const ro = new ResizeObserver(() => fitView(false));
    if (svgRef.current) ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, [fitView]);

  // Cuộn chuột: cần listener không passive để chặn cuộn trang.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      zoomAt(
        Math.exp(-e.deltaY * 0.0015),
        e.clientX - r.left,
        e.clientY - r.top,
      );
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  // Kéo và chụm hai ngón.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    moved: number;
    pinch: number | null;
    /** Nghề dưới ngón tay lúc bắt đầu chạm: sau `setPointerCapture`, `pointerup` luôn trỏ về svg. */
    code: string | null;
  }>({
    moved: 0,
    pinch: null,
    code: null,
  });

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (anim.current) cancelAnimationFrame(anim.current);
    const code =
      (e.target as Element).closest('[data-code]')?.getAttribute('data-code') ??
      null;
    svgRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1)
      gesture.current = { moved: 0, pinch: null, code };
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const r = svgRef.current?.getBoundingClientRect();
      if (gesture.current.pinch && r) {
        zoomAt(
          dist / gesture.current.pinch,
          (a.x + b.x) / 2 - r.left,
          (a.y + b.y) / 2 - r.top,
        );
      }
      gesture.current.pinch = dist;
      gesture.current.moved += 10;
      return;
    }
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    gesture.current.moved += Math.abs(dx) + Math.abs(dy);
    view.current.x += dx;
    view.current.y += dy;
    apply();
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.pinch = null;
    if (pointers.current.size === 0 && gesture.current.moved < 6) {
      onSelect(gesture.current.code);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 60;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => (view.current.x += step),
      ArrowRight: () => (view.current.x -= step),
      ArrowUp: () => (view.current.y += step),
      ArrowDown: () => (view.current.y -= step),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
      apply();
    } else if (e.key === '+' || e.key === '=') {
      const { w, h } = size();
      zoomAt(1.25, w / 2, h / 2);
    } else if (e.key === '-') {
      const { w, h } = size();
      zoomAt(0.8, w / 2, h / 2);
    }
  };

  const motifId = `galaxy-${useId().replace(/:/g, '')}`;
  const stars = useMemo(() => {
    const rand = seededRandom('galaxy-cartoon-stars');
    return Array.from({ length: 36 }, (_, i) => ({
      x: 2 + rand() * 96,
      y: 3 + rand() * 94,
      size: i % 6 === 0 ? 15 : 6 + rand() * 5,
    }));
  }, []);

  return (
    <svg
      ref={svgRef}
      role="application"
      aria-label="Bản đồ ngân hà nghề nghiệp. Kéo để di chuyển, cuộn để phóng to. Dùng chế độ danh sách nếu bạn dùng bàn phím hay trình đọc màn hình."
      tabIndex={0}
      className={className}
      style={{ touchAction: 'none', cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <style>{`
        @keyframes galaxy-ink-orbit { to { transform: rotate(360deg); } }
        @keyframes galaxy-ink-pick { 0% { transform: scale(.84); } 55% { transform: scale(1.12); } 100% { transform: scale(1); } }
        .galaxy-ink-orbit { animation: galaxy-ink-orbit 24s linear infinite; transform-origin: 0 0; }
        .galaxy-ink-pick { animation: galaxy-ink-pick .45s ease-out both; transform-origin: 0 0; }
        .galaxy-ink-star path { vector-effect: none; stroke-width: 4; }
        @media (prefers-reduced-motion: reduce) {
          .galaxy-ink-orbit, .galaxy-ink-pick { animation: none; }
        }
      `}</style>
      <defs>
        <symbol id={`${motifId}-star`} viewBox="0 0 96 96">
          <InkStar size={96} className="galaxy-ink-star" />
        </symbol>
        <symbol id={`${motifId}-surface`} viewBox="-1 -1 2 2">
          <path
            d="M0-1A1 1 0 0 1 0 1C.65.65.65-.65 0-1Z"
            fill="#0c1834"
            fillOpacity=".28"
          />
          <ellipse
            cx="-.35"
            cy="-.4"
            rx=".18"
            ry=".1"
            transform="rotate(-30 -.35 -.4)"
            fill="#fffaf0"
          />
        </symbol>
      </defs>
      <rect width="100%" height="100%" fill="#142650" />
      <g aria-hidden="true" pointerEvents="none" opacity=".65">
        {stars.map((star, i) => (
          <use
            key={i}
            href={`#${motifId}-star`}
            x={`${star.x}%`}
            y={`${star.y}%`}
            width={star.size}
            height={star.size}
          />
        ))}
      </g>

      <g ref={worldRef}>
        {layout.regions.map((r) => (
          <path
            key={r.id}
            d={regionBlob(r.id, r.radius)}
            transform={`translate(${r.x} ${r.y})`}
            fill={regionColor(r.id)}
            fillOpacity=".075"
            stroke={regionColor(r.id)}
            strokeOpacity=".3"
            strokeWidth="1.5"
            strokeDasharray="6 9"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />
        ))}

        {/* Đường chòm sao nối các nghề trong cùng nhóm. */}
        {layout.groups.map((g) => (
          <polyline
            key={g.name}
            points={orderAround(g.members, g.x, g.y)
              .map((m) => `${m.x},${m.y}`)
              .join(' ')}
            fill="none"
            stroke="#3b5aa0"
            strokeDasharray="3 6"
            strokeOpacity={detail === 'far' ? 0.65 : 0.85}
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {ordered.map((p) => (
          <PlanetNode
            key={p.occupation.code}
            p={p}
            motifId={motifId}
            detail={detail}
            selected={selected === p.occupation.code}
            dim={highlight !== null && !highlight.has(p.occupation.code)}
            suggested={suggested.has(p.occupation.code)}
          />
        ))}

        {/* Nhãn vẽ thành lớp riêng sau mọi hành tinh để không bị hành tinh khác che. */}
        <g style={{ pointerEvents: 'none' }}>
          {ordered
            .filter((p) => labelled.has(p.occupation.code))
            .map((p) => (
              <PlanetLabel
                key={p.occupation.code}
                p={p}
                detail={detail}
                selected={selected === p.occupation.code}
              />
            ))}
        </g>

        {detail === 'mid' &&
          layout.groups.map((g) => (
            <text
              key={g.name}
              x={g.x}
              y={g.y - g.radius - 8}
              textAnchor="middle"
              fill={regionColor(g.regionId)}
              fillOpacity={0.85}
              fontSize={19}
              fontFamily="var(--font-toon)"
              stroke="#0c1834"
              strokeWidth={5}
              paintOrder="stroke"
              fontWeight={800}
              letterSpacing="0.06em"
              style={{ textTransform: 'uppercase', pointerEvents: 'none' }}
            >
              {g.name}
            </text>
          ))}

        {detail === 'far' &&
          layout.regions.map((r) => (
            <text
              key={r.id}
              x={r.x}
              y={r.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={regionColor(r.id)}
              fontFamily="var(--font-toon)"
              fontSize={58}
              fontWeight={800}
              style={{
                textTransform: 'uppercase',
                pointerEvents: 'none',
                paintOrder: 'stroke',
              }}
              stroke="#0c1834"
              strokeWidth={10}
            >
              {r.name}
            </text>
          ))}
      </g>
    </svg>
  );
});

/** Sắp thành viên theo góc quanh tâm nhóm để đường chòm sao không cắt nhau. */
function orderAround(members: PlacedOccupation[], cx: number, cy: number) {
  return [...members].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx),
  );
}

function labelFont(detail: Detail, selected: boolean) {
  return selected
    ? detail === 'far'
      ? 30
      : detail === 'mid'
        ? 17
        : 13
    : detail === 'mid'
      ? 15
      : 11;
}

function wantsLabel(
  detail: Detail,
  selected: boolean,
  dim: boolean,
  suggested: boolean,
) {
  return (
    selected || (detail === 'near' && !dim) || (suggested && detail !== 'far')
  );
}

/** Chọn những nghề được hiện nhãn sao cho các nhãn không đè lên nhau. */
export function pickLabels(
  occupations: PlacedOccupation[],
  detail: Detail,
  selected: string | null,
  highlight: Set<string> | null,
  suggested: Set<string>,
): Set<string> {
  const rank = (p: PlacedOccupation) => {
    const c = p.occupation.code;
    if (c === selected) return 0;
    if (suggested.has(c)) return 1;
    if (p.occupation.playable) return 2;
    return 3;
  };
  const candidates = occupations
    .filter((p) => {
      const c = p.occupation.code;
      return wantsLabel(
        detail,
        c === selected,
        highlight !== null && !highlight.has(c),
        suggested.has(c),
      );
    })
    .sort((a, b) => rank(a) - rank(b));
  type Box = [number, number, number, number];
  const overlaps = (a: Box, b: Box) =>
    a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  // Hành tinh cũng là vật cản: nhãn không được nằm đè lên hành tinh khác.
  const planets = occupations.map((p) => ({
    code: p.occupation.code,
    box: [p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r] as Box,
  }));
  const boxes: Box[] = [];
  const out = new Set<string>();
  for (const p of candidates) {
    const sel = p.occupation.code === selected;
    const fs = labelFont(detail, sel);
    // Chừa khoảng đệm để hai nhãn không dính sát nhau.
    const pad = fs * 0.3;
    const w = p.occupation.shortName.length * fs * 0.56 + 2 * pad;
    const h = fs * 1.2 + 2 * pad;
    const cy = p.y + p.r + labelOffset(detail, sel) - fs * 0.35;
    const box: Box = [p.x - w / 2, cy - h / 2, p.x + w / 2, cy + h / 2];
    const blocked =
      boxes.some((b) => overlaps(box, b)) ||
      planets.some((o) => o.code !== p.occupation.code && overlaps(box, o.box));
    if (blocked && !sel) continue;
    boxes.push(box);
    out.add(p.occupation.code);
  }
  return out;
}

function labelOffset(detail: Detail, selected: boolean) {
  return selected && detail === 'far' ? 34 : 15;
}

function PlanetLabel({
  p,
  detail,
  selected,
}: {
  p: PlacedOccupation;
  detail: Detail;
  selected: boolean;
}) {
  const locked =
    p.occupation.gate.kind === 'PREREQUISITE' &&
    p.occupation.my.status === 'NEW';
  const fs = labelFont(detail, selected);
  const y = p.y + p.r + labelOffset(detail, selected);
  const width = p.occupation.shortName.length * fs * 0.56 + fs * 0.6;
  return (
    <g data-planet-label={p.occupation.code}>
      {selected && (
        <rect
          x={p.x - width / 2}
          y={y - fs * 1.25}
          width={width}
          height={fs * 1.8}
          rx={fs * 0.28}
          fill="#fffaf0"
          stroke="#0c1834"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <text
        x={p.x}
        y={y}
        textAnchor="middle"
        fill={selected ? '#1e1b18' : '#fffaf0'}
        fillOpacity={locked && !selected ? 0.7 : 1}
        fontFamily="var(--font-toon)"
        fontSize={fs}
        fontWeight={selected ? 800 : 700}
        stroke={selected ? 'none' : '#0c1834'}
        strokeWidth={3.5}
        style={{ paintOrder: 'stroke' }}
      >
        {p.occupation.shortName}
      </text>
    </g>
  );
}

function PlanetNode({
  p,
  detail,
  selected,
  dim,
  suggested,
  motifId,
}: {
  p: PlacedOccupation;
  detail: Detail;
  selected: boolean;
  dim: boolean;
  suggested: boolean;
  motifId: string;
}) {
  const o = p.occupation;
  const locked = o.gate.kind === 'PREREQUISITE' && o.my.status === 'NEW';
  const status = o.my.status;
  return (
    <g
      data-code={o.code}
      transform={`translate(${p.x} ${p.y})`}
      opacity={dim ? 0.16 : locked ? 0.55 : 1}
      style={{ cursor: 'pointer' }}
    >
      <title>{o.shortName}</title>
      {/* Vùng bấm giữ nguyên để thao tác bằng ngón tay không đổi. */}
      <circle r={Math.max(p.r + 8, 18)} fill="transparent" />
      <g className={selected ? 'galaxy-ink-pick' : undefined}>
        {(selected || suggested) && (
          <circle
            r={p.r + (selected ? 7 : 5)}
            fill="none"
            stroke="#f6cf5e"
            strokeWidth={selected ? 3.5 : 1.5}
            strokeDasharray={selected ? undefined : '2 4'}
            vectorEffect="non-scaling-stroke"
          />
        )}
        {o.playable && !dim && (
          <ellipse
            rx={p.r * 1.55}
            ry={p.r * 0.5}
            transform="rotate(-24)"
            fill="#f6cf5e"
            stroke="#0c1834"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <circle
          r={p.r}
          fill={regionColor(o.regionId)}
          stroke="#0c1834"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <use
          href={`#${motifId}-surface`}
          x={-p.r}
          y={-p.r}
          width={p.r * 2}
          height={p.r * 2}
          pointerEvents="none"
        />
        {status === 'PLAYING' && (
          <circle
            r={p.r + 11}
            fill="none"
            stroke="#f6cf5e"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            vectorEffect="non-scaling-stroke"
            className="galaxy-ink-orbit"
          />
        )}
        {status === 'COMPLETED' && (
          <use
            href={`#${motifId}-star`}
            x={-7}
            y={-p.r - 18}
            width={14}
            height={14}
          />
        )}
        {locked && detail !== 'far' && (
          <g
            transform={`translate(${p.r * 0.55} ${p.r * 0.35})`}
            stroke="#0c1834"
            strokeWidth="1.3"
            strokeLinejoin="round"
          >
            <path d="M-2.2-1v-1.6a2.2 2.2 0 0 1 4.4 0V-1" fill="none" />
            <rect
              x={-3.5}
              y={-1}
              width={7}
              height={5.5}
              rx={1}
              fill="#fffaf0"
            />
          </g>
        )}
      </g>
    </g>
  );
}

/** Mười hai điểm uốn mềm, luôn giữ cùng hình dáng theo mã vùng. */
function regionBlob(seed: string, radius: number) {
  const rand = seededRandom(`galaxy-region-${seed}`);
  const points = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r = radius * (0.91 + rand() * 0.16);
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  const midpoint = (a: number[], b: number[]) => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];
  const start = midpoint(points[11], points[0]);
  return `M${start.join(' ')} ${points.map((p, i) => `Q${p.join(' ')} ${midpoint(p, points[(i + 1) % points.length]).join(' ')}`).join(' ')}Z`;
}
