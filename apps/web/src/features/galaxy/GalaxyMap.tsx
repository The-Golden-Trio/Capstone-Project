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
  useMemo,
  useRef,
  useState,
} from 'react';
import { regionColor } from '@datn/ui';
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

  const regionIds = useMemo(
    () => [...new Set(layout.regions.map((r) => r.id))],
    [layout],
  );

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
      <defs>
        {regionIds.map((id) => {
          const c = regionColor(id);
          return (
            <g key={id}>
              <radialGradient id={`nebula-${id}`}>
                <stop offset="0" stopColor={c} stopOpacity="0.2" />
                <stop offset="0.55" stopColor={c} stopOpacity="0.07" />
                <stop offset="1" stopColor={c} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`planet-${id}`} cx="35%" cy="32%" r="75%">
                <stop offset="0" stopColor="#f8f6ee" stopOpacity="0.95" />
                <stop offset="0.28" stopColor={c} />
                <stop offset="1" stopColor="#0a1026" />
              </radialGradient>
            </g>
          );
        })}
        <radialGradient id="halo-gold">
          <stop offset="0.55" stopColor="#f0d79a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f0d79a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g ref={worldRef}>
        {layout.regions.map((r) => (
          <circle
            key={r.id}
            cx={r.x}
            cy={r.y}
            r={r.radius * 1.15}
            fill={`url(#nebula-${r.id})`}
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
            stroke={regionColor(g.regionId)}
            strokeOpacity={detail === 'far' ? 0.12 : 0.22}
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {ordered.map((p) => (
          <PlanetNode
            key={p.occupation.code}
            p={p}
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
              fontWeight={600}
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
              fill="#f8f6ee"
              fontFamily="var(--font-display)"
              fontSize={58}
              fontWeight={600}
              style={{ pointerEvents: 'none', paintOrder: 'stroke' }}
              stroke="#0a1026"
              strokeWidth={10}
              strokeOpacity={0.55}
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
  return (
    <text
      x={p.x}
      y={p.y + p.r + labelOffset(detail, selected)}
      textAnchor="middle"
      fill={selected ? '#f6e6bf' : '#e3e9f1'}
      fillOpacity={locked && !selected ? 0.7 : 1}
      fontSize={labelFont(detail, selected)}
      fontWeight={selected ? 700 : 500}
      stroke="#0a1026"
      strokeWidth={selected && detail === 'far' ? 8 : 3.5}
      strokeOpacity={0.85}
      style={{ paintOrder: 'stroke' }}
    >
      {p.occupation.shortName}
    </text>
  );
}

function PlanetNode({
  p,
  detail,
  selected,
  dim,
  suggested,
}: {
  p: PlacedOccupation;
  detail: Detail;
  selected: boolean;
  dim: boolean;
  suggested: boolean;
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
      {/* Vùng bấm rộng hơn hành tinh cho ngón tay. */}
      <circle r={Math.max(p.r + 8, 18)} fill="transparent" />
      {(selected || suggested) && (
        <circle
          r={p.r * (selected ? 2.6 : 2.1)}
          fill="url(#halo-gold)"
          opacity={selected ? 0.9 : 0.55}
        />
      )}
      {o.playable && !dim && (
        <circle
          r={p.r + 3.5}
          fill="none"
          stroke={regionColor(o.regionId)}
          strokeOpacity={0.45}
          strokeWidth={1}
        />
      )}
      <circle r={p.r} fill={`url(#planet-${o.regionId})`} />
      {status === 'PLAYING' && (
        <circle
          r={p.r + 6}
          fill="none"
          stroke="#f0d79a"
          strokeWidth={1.6}
          strokeDasharray="4 3"
          className="origin-center animate-orbit"
          style={{ animationDuration: '9s', transformBox: 'fill-box' }}
        />
      )}
      {status === 'COMPLETED' && (
        <path
          transform={`translate(${-6} ${-p.r - 14}) scale(0.5)`}
          d="M12 0C12.9 7.2 14.2 9.8 24 12 14.2 14.2 12.9 16.8 12 24 11.1 16.8 9.8 14.2 0 12 9.8 9.8 11.1 7.2 12 0Z"
          fill="#f0d79a"
        />
      )}
      {locked && detail !== 'far' && (
        <g transform={`translate(${p.r * 0.55} ${p.r * 0.35})`} fill="#c7d2e0">
          <rect x={-3.5} y={-1} width={7} height={5.5} rx={1} />
          <path
            d="M-2.2 -1 v-1.6 a2.2 2.2 0 0 1 4.4 0 v1.6"
            fill="none"
            stroke="#c7d2e0"
            strokeWidth={1.1}
          />
        </g>
      )}
    </g>
  );
}
