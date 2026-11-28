/**
 * Bản đồ ngân hà 2D bằng SVG. Kéo để di chuyển, cuộn hoặc chụm hai ngón để
 * phóng to. Di chuyển ghi thẳng vào thuộc tính `transform` (không setState
 * mỗi khung hình) để mượt trên điện thoại yếu (NFR-13); chỉ khi qua ngưỡng
 * phóng to mới vẽ lại để đổi mức chi tiết của nhãn.
 */
import {
  forwardRef,
  memo,
  startTransition,
  useLayoutEffect,
  useCallback,
  useEffect,
  useImperativeHandle,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  InkStar,
  ToonStatus,
  regionColor,
  seededRandom,
  type ToonStatusKind,
} from '@datn/ui';
import type { RegionId } from '../../api/types';
import type { GalaxyLayout, PlacedGroup, PlacedOccupation } from './layout';
import { GalaxySpiral, SPIRAL_PIXELS } from './GalaxySpiral';
import './galaxy.css';

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
  /** Vùng đang được soi: tinh vân của vùng sáng lên, vùng khác lùi lại. */
  focusRegion?: RegionId | null;
  /** Bấm vào tinh vân (chỗ trống trong một vùng) để soi vùng đó. */
  onRegion?: (id: RegionId) => void;
  className?: string;
}

export const GalaxyMap = forwardRef<GalaxyMapHandle, Props>(function GalaxyMap(
  {
    layout,
    selected,
    onSelect,
    highlight,
    suggested,
    focusRegion = null,
    onRegion,
    className,
  },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  // Lớp trời phía sau: dịch chậm hơn bản đồ (thị sai) để có chiều sâu.
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<SVGGElement>(null);
  const spiralRef = useRef<HTMLDivElement>(null);
  const spiralSize = useRef(2000);
  const skyRef = useRef<HTMLDivElement>(null);
  // Thẻ rê chuột giữ state riêng (TipLayer): đổi hành tinh đang rê không
  // vẽ lại cả bản đồ.
  const setHover = useRef<HoverSetter>(noop);

  // Tâm và bán kính thiên hà: lõi nằm giữa vòng sáu vùng.
  const galaxy = useMemo(() => {
    const rs = layout.regions;
    const cx = rs.reduce((t, r) => t + r.x, 0) / Math.max(1, rs.length);
    const cy = rs.reduce((t, r) => t + r.y, 0) / Math.max(1, rs.length);
    const radius =
      Math.max(...rs.map((r) => Math.hypot(r.x - cx, r.y - cy) + r.radius)) *
      1.15;
    return { cx, cy, radius };
  }, [layout.regions]);
  spiralSize.current = galaxy.radius * 2;
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
    const spiral = spiralRef.current;
    if (spiral) {
      // Canvas thiên hà có độ phân giải cố định: zoom gần thì mờ dần rồi tắt
      // hẳn, để không lộ ô pixel và không tốn công ghép lớp.
      const zoomPx = (k * spiralSize.current) / SPIRAL_PIXELS;
      const fade = Math.max(0, Math.min(1, (2.2 - zoomPx) / 1));
      spiral.style.opacity = String(fade);
      spiral.style.visibility = fade === 0 ? 'hidden' : 'visible';
      if (fade > 0)
        spiral.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k})`;
    }
    // Sao nền dịch bằng transform (ghép lớp trên GPU), không đổi
    // background-position (bắt trình duyệt vẽ lại cả màn mỗi khung hình).
    const wrap = (v: number, tile: number) =>
      (((v % tile) + tile) % tile) - tile;
    if (farRef.current)
      farRef.current.style.transform = `translate3d(${wrap(x * 0.04, 240)}px, ${wrap(y * 0.04, 240)}px, 0)`;
    if (nearRef.current)
      nearRef.current.style.transform = `translate3d(${wrap(x * 0.1, 380)}px, ${wrap(y * 0.1, 380)}px, 0)`;
    if (bandRef.current) {
      const clamp = (v: number) => Math.max(-90, Math.min(90, v));
      bandRef.current.style.transform = `translate3d(${clamp(x * 0.03)}px, ${clamp(y * 0.03)}px, 0)`;
    }
    inkRef.current?.setAttribute(
      'transform',
      `translate(${((((x * 0.16) % 400) + 400) % 400) - 200} ${((((y * 0.16) % 300) + 300) % 300) - 150})`,
    );
    // Qua ngưỡng phóng to thì vẽ lại nhãn và 221 hành tinh: cho chạy nền để
    // không giật khung hình đang zoom.
    const next = detailOf(k);
    startTransition(() => setDetail((d) => (d === next ? d : next)));
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

  const fitTarget = useCallback(() => {
    const { w, h } = size();
    const b = layout.bounds;
    // Chừa chỗ cho bảng tìm kiếm nổi phía trên và nút phóng to phía dưới.
    const top = w >= 640 ? 120 : 112;
    const bottom = 56;
    const ah = Math.max(120, h - top - bottom);
    const k = Math.min(w / (b.maxX - b.minX), ah / (b.maxY - b.minY)) * 0.96;
    return {
      k,
      x: w / 2 - ((b.minX + b.maxX) / 2) * k,
      y: top + ah / 2 - ((b.minY + b.maxY) / 2) * k,
    };
  }, [layout]);

  const fitView = useCallback(
    (animate = true) => {
      const target = fitTarget();
      if (animate) animateTo(target);
      else {
        view.current = target;
        apply();
      }
    },
    [fitTarget, animateTo, apply],
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

  // Lúc mở: camera bay từ xa vào toàn cảnh. Sau đó chỉ vừa khung lại khi
  // kích thước thật sự đổi (ResizeObserver cũng gọi một lần lúc bắt đầu).
  const intro = useRef(true);
  useEffect(() => {
    const target = fitTarget();
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (intro.current && !reduce) {
      intro.current = false;
      const { w, h } = size();
      const k0 = target.k * 0.3;
      view.current = {
        k: k0,
        x: w / 2 - galaxy.cx * k0,
        y: h / 2 - galaxy.cy * k0,
      };
      apply();
      animateTo(target, 2400);
    } else {
      view.current = target;
      apply();
    }
    let last = size();
    const ro = new ResizeObserver(() => {
      const now = size();
      if (Math.abs(now.w - last.w) < 2 && Math.abs(now.h - last.h) < 2) return;
      last = now;
      fitView(false);
    });
    if (svgRef.current) ro.observe(svgRef.current);
    return () => ro.disconnect();
    // Chỉ chạy lại khi bố cục đổi; galaxy, apply, animateTo cùng nguồn layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!prev) {
      // Rê chuột (không kéo): trời nhích theo con trỏ, hành tinh hiện thẻ.
      const r = svgRef.current?.getBoundingClientRect();
      if (!r || !r.width || e.pointerType === 'touch') return;
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      skyRef.current?.style.setProperty(
        '--mx',
        ((px / r.width) * 2 - 1).toFixed(3),
      );
      skyRef.current?.style.setProperty(
        '--my',
        ((py / r.height) * 2 - 1).toFixed(3),
      );
      const code =
        (e.target as Element)
          .closest('[data-code]')
          ?.getAttribute('data-code') ?? null;
      setHover.current((h) =>
        !code
          ? null
          : h?.code === code && Math.abs(h.x - px) < 6 && Math.abs(h.y - py) < 6
            ? h
            : { code, x: px, y: py },
      );
      return;
    }
    setHover.current(null);
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
      const code = gesture.current.code;
      // Chạm chỗ trống thì đóng thông tin nghề; nếu chưa chọn nghề nào và chỗ
      // chạm nằm trong tinh vân của một vùng thì soi vùng đó.
      if (!code && !selected && onRegion) {
        const r = svgRef.current?.getBoundingClientRect();
        const v = view.current;
        const hit = r
          ? nebulaAt(
              layout.groups,
              (e.clientX - r.left - v.x) / v.k,
              (e.clientY - r.top - v.y) / v.k,
            )
          : null;
        if (hit) onRegion(hit);
      }
      onSelect(code);
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
    return Array.from({ length: 30 }, (_, i) => ({
      x: -10 + rand() * 120,
      y: -10 + rand() * 120,
      size: i % 6 === 0 ? 15 : 6 + rand() * 5,
      delay: -rand() * 5,
    }));
  }, []);

  const nebulae = useMemo(() => nebulaBlobs(layout.groups), [layout.groups]);

  return (
    <div className={className}>
      <div ref={skyRef} className="gx-sky" aria-hidden="true">
        <div ref={bandRef} className="gx-band">
          <div className="gx-band__glow" />
          <div className="gx-band__dust" />
        </div>
        <div ref={farRef} className="gx-stars gx-stars--far" />
        <div ref={nearRef} className="gx-stars gx-stars--near" />
        <div className="gx-comet" />
      </div>
      <GalaxySpiral
        ref={spiralRef}
        cx={galaxy.cx}
        cy={galaxy.cy}
        radius={galaxy.radius}
      />
      <svg
        ref={svgRef}
        role="application"
        aria-label="Bản đồ ngân hà nghề nghiệp. Kéo để di chuyển, cuộn để phóng to. Dùng chế độ danh sách nếu bạn dùng bàn phím hay trình đọc màn hình."
        tabIndex={0}
        className="absolute inset-0 h-full w-full focus-visible:outline-none"
        style={{ touchAction: 'none', cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover.current(null)}
        onKeyDown={onKeyDown}
      >
        <style>{`
        @keyframes galaxy-ink-orbit { to { transform: rotate(360deg); } }
        @keyframes galaxy-ink-pick { 0% { transform: scale(.84); } 55% { transform: scale(1.12); } 100% { transform: scale(1); } }
        .galaxy-ink-orbit { animation: galaxy-ink-orbit 24s linear infinite; transform-origin: 0 0; }
        .galaxy-ink-pick { animation: galaxy-ink-pick .45s ease-out both; transform-origin: 0 0; }
        .galaxy-ink-star path { vector-effect: none; stroke-width: 4; }
        .gx-planet-hit:hover + .gx-planet-body { transform: scale(1.12); }
        .gx-planet-body { transition: transform .2s cubic-bezier(.3,1.6,.5,1); }
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
          {layout.regions.map((r) => (
            <radialGradient key={r.id} id={`${motifId}-neb-${r.id}`}>
              <stop offset="0" stopColor={regionColor(r.id)} stopOpacity=".5" />
              <stop
                offset=".45"
                stopColor={regionColor(r.id)}
                stopOpacity=".2"
              />
              <stop offset="1" stopColor={regionColor(r.id)} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        <g aria-hidden="true" pointerEvents="none" opacity=".6">
          <g ref={inkRef}>
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
        </g>

        <g ref={worldRef}>
          {/* Vùng nghề là tinh vân mờ biên quanh các chòm của nó, không có
            đường viền: hai vùng gần nhau hoà màu thay vì cắt nhau. */}
          <g pointerEvents="none">
            {layout.regions.map((r, ri) => (
              <g
                key={r.id}
                className="gx-neb-region"
                opacity={
                  focusRegion === null ? 0.6 : focusRegion === r.id ? 1 : 0.14
                }
              >
                <g
                  className="gx-intro-fade"
                  style={{ animationDelay: `${0.5 + ri * 0.18}s` }}
                >
                  {nebulae
                    .filter((b) => b.regionId === r.id)
                    .map((b) => (
                      <g key={b.key}>
                        {b.puffs.map((p, i) => (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r={p.r}
                            fill={`url(#${motifId}-neb-${r.id})`}
                          />
                        ))}
                      </g>
                    ))}
                </g>
              </g>
            ))}
          </g>

          {/* Đường chòm sao nối các nghề trong cùng nhóm. */}
          <g className="gx-intro-fade" style={{ animationDelay: '1.6s' }}>
            {layout.groups.map((g) => (
              <polyline
                key={g.name}
                points={orderAround(g.members, g.x, g.y)
                  .map((m) => `${m.x},${m.y}`)
                  .join(' ')}
                fill="none"
                stroke={
                  focusRegion === g.regionId
                    ? regionColor(g.regionId)
                    : '#3b5aa0'
                }
                strokeDasharray="3 6"
                strokeOpacity={
                  focusRegion && focusRegion !== g.regionId
                    ? 0.3
                    : detail === 'far'
                      ? 0.35
                      : 0.55
                }
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          {ordered.map((p) => (
            <PlanetNode
              key={p.occupation.code}
              p={p}
              motifId={motifId}
              detail={detail}
              selected={selected === p.occupation.code}
              dim={highlight !== null && !highlight.has(p.occupation.code)}
              suggested={suggested.has(p.occupation.code)}
              introDelay={
                0.7 +
                (Math.hypot(p.x - galaxy.cx, p.y - galaxy.cy) / galaxy.radius) *
                  1.3
              }
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
                opacity={focusRegion && focusRegion !== g.regionId ? 0.2 : 0.75}
                fontSize={15}
                fontFamily="var(--font-toon)"
                stroke="#0c1834"
                strokeOpacity={0.6}
                strokeWidth={3}
                paintOrder="stroke"
                fontWeight={700}
                style={{ pointerEvents: 'none' }}
              >
                {g.name}
              </text>
            ))}

          {detail === 'far' &&
            layout.regions.map((r) => {
              // Nhãn vùng đẩy ra rìa ngoài (xa tâm thiên hà) để không đè hành tinh.
              const dx = r.x - galaxy.cx;
              const dy = r.y - galaxy.cy;
              const d = Math.hypot(dx, dy) || 1;
              const lx = r.x + (dx / d) * r.radius * 0.4;
              const ly = r.y + (dy / d) * r.radius * 0.4;
              return (
                <text
                  key={r.id}
                  x={lx}
                  y={ly}
                  className="gx-intro-fade"

                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={regionColor(r.id)}
                  opacity={focusRegion && focusRegion !== r.id ? 0.22 : 1}
                  fontFamily="var(--font-toon)"
                  fontSize={56}
                  fontWeight={800}
                  letterSpacing="0.05em"
                  style={{
                    textTransform: 'uppercase',
                    pointerEvents: 'none',
                    paintOrder: 'stroke',
                    animationDelay: '1.4s',
                  }}
                  stroke="#0c1834"
                  strokeWidth={10}
                >
                  {r.name}
                </text>
              );
            })}
        </g>
      </svg>
      <TipLayer setter={setHover} svg={svgRef} layout={layout} />
    </div>
  );
});

interface NebulaBlob {
  key: string;
  regionId: RegionId;
  delay: number;
  puffs: Array<{ x: number; y: number; r: number }>;
}

/**
 * Mỗi chòm (nhóm nghề) là ba bốn "làn khói" tròn đặt lệch nhau theo hạt giống
 * cố định, nên tinh vân có hình hữu cơ nhưng cùng danh mục thì cùng hình.
 */
function nebulaBlobs(groups: PlacedGroup[]): NebulaBlob[] {
  return groups.map((g) => {
    const rand = seededRandom(`nebula-${g.name}`);
    const base = Math.max(g.radius, 40);
    const puffs = [{ x: g.x, y: g.y, r: base * 2 }];
    const n = 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * 1.2;
      const d = base * (0.45 + rand() * 0.5);
      puffs.push({
        x: g.x + Math.cos(a) * d,
        y: g.y + Math.sin(a) * d,
        r: base * (1.1 + rand() * 0.6),
      });
    }
    return {
      key: g.name,
      regionId: g.regionId,
      delay: -rand() * 12,
      puffs,
    };
  });
}

/** Vùng có tinh vân phủ lên điểm (x, y) của thế giới, nếu có. */
function nebulaAt(
  groups: PlacedGroup[],
  x: number,
  y: number,
): RegionId | null {
  let best: { id: RegionId; d: number } | null = null;
  for (const g of groups) {
    const d = Math.hypot(g.x - x, g.y - y) / Math.max(g.radius, 40);
    if (d < 1.6 && (!best || d < best.d)) best = { id: g.regionId, d };
  }
  return best?.id ?? null;
}

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

const PlanetNode = memo(function PlanetNode({
  p,
  detail,
  selected,
  dim,
  suggested,
  motifId,
  introDelay = 0,
}: {
  p: PlacedOccupation;
  detail: Detail;
  selected: boolean;
  dim: boolean;
  suggested: boolean;
  motifId: string;
  introDelay?: number;
}) {
  const o = p.occupation;
  const locked = o.gate.kind === 'PREREQUISITE' && o.my.status === 'NEW';
  const status = o.my.status;
  // Nghề có màn chơi hay đã thử thì toả sáng; nghề đang chơi thì quầng đập.
  const glow = !dim && (o.playable || status !== 'NEW');
  // Nghề chưa có màn chơi và chưa thử chỉ là chấm màu vùng, không viền,
  // không vân: 221 hành tinh viền đậm như nhau làm bản đồ rối mắt.
  const quiet =
    !o.playable && status === 'NEW' && !selected && !suggested && !locked;
  return (
    <g
      data-code={o.code}
      transform={`translate(${p.x} ${p.y})`}
      opacity={dim ? 0.16 : locked ? 0.55 : 1}
      style={{ cursor: 'pointer' }}
    >
      {glow && (
        <circle
          r={p.r * (status === 'PLAYING' ? 3.2 : 2.6)}
          fill={`url(#${motifId}-neb-${o.regionId})`}
          pointerEvents="none"
          className={status === 'PLAYING' ? 'gx-pulse' : undefined}
        />
      )}
      {/* Vùng bấm giữ nguyên để thao tác bằng ngón tay không đổi. */}
      <circle
        className="gx-planet-hit"
        r={Math.max(p.r + 8, 18)}
        fill="transparent"
      />
      <g
        className="gx-planet-body gx-intro-pop"
        style={{ transformOrigin: '0 0', animationDelay: `${introDelay}s` }}
      >
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
          {quiet ? (
            <circle
              r={p.r * 0.5}
              fill={regionColor(o.regionId)}
              opacity={0.8}
            />
          ) : (
            <>
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
            </>
          )}
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
    </g>
  );
});

/** Thẻ nổi khi rê chuột lên một hành tinh: tên, nhóm, trạng thái bằng ký hiệu. */
function PlanetTip({
  code,
  x,
  y,
  svg,
  layout,
}: {
  code: string;
  x: number;
  y: number;
  svg: React.RefObject<SVGSVGElement | null>;
  layout: GalaxyLayout;
}) {
  const p = layout.occupations.find((o) => o.occupation.code === code);
  if (!p) return null;
  const o = p.occupation;
  const width = svg.current?.clientWidth ?? 800;
  const left = x > width - 280 ? x - 268 : x + 18;
  const kind: ToonStatusKind =
    o.my.status === 'COMPLETED'
      ? 'done'
      : o.my.status === 'PLAYING'
        ? 'playing'
        : o.gate.kind === 'PREREQUISITE'
          ? 'locked'
          : o.playable
            ? 'open'
            : 'soon';
  return (
    <div
      aria-hidden="true"
      className="gx-tip pointer-events-none absolute z-20 w-[250px] rounded-[16px] bg-toon-paper/95 p-3 text-toon-ink shadow-soft-lg backdrop-blur-sm"
      style={{ left, top: y + 16 }}
    >
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-toon-ink-soft">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: regionColor(o.regionId) }}
        />
        {o.group}
      </p>
      <p className="mt-0.5 font-toon text-base font-extrabold leading-snug">
        {o.shortName}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <ToonStatus
          kind={kind}
          label={
            o.my.status === 'PLAYING' && o.my.currentLevel
              ? `Đang chơi · cấp ${o.my.currentLevel}`
              : undefined
          }
        />
        <span className="text-[11px] font-semibold text-toon-ink-faint">
          {o.levelCount} cấp
        </span>
      </div>
    </div>
  );
}

type Hover = { code: string; x: number; y: number } | null;
/** Trước khi TipLayer gắn setter thật, rê chuột không làm gì. */
const noop: HoverSetter = () => undefined;
type HoverSetter = (next: Hover | ((prev: Hover) => Hover)) => void;

function TipLayer({
  setter,
  svg,
  layout,
}: {
  setter: React.RefObject<HoverSetter>;
  svg: React.RefObject<SVGSVGElement | null>;
  layout: GalaxyLayout;
}) {
  const [hover, setHover] = useState<Hover>(null);
  useLayoutEffect(() => {
    setter.current = setHover;
  }, [setter]);
  if (!hover) return null;
  return (
    <PlanetTip
      code={hover.code}
      x={hover.x}
      y={hover.y}
      svg={svg}
      layout={layout}
    />
  );
}
