/**
 * Thiên hà xoắn ốc phía sau các vùng nghề: lõi sáng ở tâm bản đồ, ba nhánh
 * xoắn gồm vài nghìn hạt sao, xoay rất chậm. Vẽ một lần lên canvas (hạt
 * giống cố định nên lần nào cũng cùng hình), rồi chỉ dịch/phóng bằng CSS
 * transform theo bản đồ, nên kéo thả vẫn mượt trên máy yếu (NFR-13).
 */
import { forwardRef, useEffect, useRef } from 'react';
import { seededRandom } from '@datn/ui';

interface Props {
  /** Tâm thiên hà, toạ độ thế giới. */
  cx: number;
  cy: number;
  /** Bán kính thiên hà, đơn vị thế giới. */
  radius: number;
}

/** Độ phân giải canvas (px); bản đồ dùng để biết khi nào canvas bắt đầu vỡ hạt. */
export const SPIRAL_PIXELS = 1600;
const PIXELS = SPIRAL_PIXELS;

export const GalaxySpiral = forwardRef<HTMLDivElement, Props>(
  function GalaxySpiral({ cx, cy, radius }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return; // jsdom và trình duyệt không có canvas
      draw(ctx);
    }, []);

    const size = radius * 2;
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className="gx-spiral-world pointer-events-none absolute left-0 top-0 origin-top-left"
      >
        <div
          className="gx-spiral-intro absolute"
          style={{
            left: cx - radius,
            top: cy - radius,
            width: size,
            height: size,
          }}
        >
          <canvas
            ref={canvasRef}
            width={PIXELS}
            height={PIXELS}
            className="gx-spiral size-full"
          />
        </div>
      </div>
    );
  },
);

function draw(ctx: CanvasRenderingContext2D) {
  const P = PIXELS;
  const c = P / 2;
  const R = P / 2;
  const rand = seededRandom('jobquest-spiral-galaxy');
  const gauss = () => {
    // Box–Muller, đủ cho phân bố hạt.
    const u = Math.max(1e-6, rand());
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  ctx.clearRect(0, 0, P, P);
  ctx.globalCompositeOperation = 'lighter';

  // Quầng ngoài rất mờ để thiên hà hoà vào nền trời.
  const halo = ctx.createRadialGradient(c, c, 0, c, c, R);
  halo.addColorStop(0, 'rgba(120, 140, 220, 0.16)');
  halo.addColorStop(0.5, 'rgba(90, 110, 190, 0.06)');
  halo.addColorStop(1, 'rgba(60, 80, 160, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, P, P);

  const ARMS = 3;
  const WIND = 3.4;

  // Bụi nhánh: đốm lớn mờ theo các nhánh xoắn.
  for (let i = 0; i < 360; i++) {
    const arm = i % ARMS;
    const t = 0.08 + Math.pow(rand(), 0.8) * 0.92;
    const a = (arm / ARMS) * Math.PI * 2 + t * WIND + gauss() * 0.22;
    const r = t * R * 0.95;
    const x = c + Math.cos(a) * r + gauss() * 18;
    const y = c + Math.sin(a) * r + gauss() * 18;
    const s = 26 + rand() * 60 * (1 - t * 0.5);
    const hue = 220 + t * 70 + gauss() * 15; // xanh → tím → hồng ra rìa
    const g = ctx.createRadialGradient(x, y, 0, x, y, s);
    g.addColorStop(0, `hsla(${hue}, 60%, 68%, ${0.04 * (1 - t * 0.6)})`);
    g.addColorStop(1, `hsla(${hue}, 70%, 60%, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - s, y - s, s * 2, s * 2);
  }

  // Hạt sao: dày ở nhánh, ấm ở lõi, lạnh ra ngoài.
  // Ít hạt, nhỏ và mờ: thiên hà là nền, không tranh với hành tinh.
  for (let i = 0; i < 2200; i++) {
    const arm = i % ARMS;
    const t = 0.03 + Math.pow(rand(), 1.15) * 0.97;
    const spread = 0.12 + (1 - t) * 0.42;
    const a = (arm / ARMS) * Math.PI * 2 + t * WIND + gauss() * spread;
    const r = t * R * 0.97 + gauss() * 10;
    const x = c + Math.cos(a) * r;
    const y = c + Math.sin(a) * r;
    const warm = Math.max(0, 1 - t * 2.2);
    const hue = 45 * warm + (215 + rand() * 60) * (1 - warm);
    const light = 70 + rand() * 25;
    const alpha = (0.12 + rand() * 0.3) * (1 - t * 0.6);
    const s = 0.6 + rand() * 0.8;
    ctx.fillStyle = `hsla(${hue}, 85%, ${light}%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lõi sáng.
  const core = ctx.createRadialGradient(c, c, 0, c, c, R * 0.3);
  core.addColorStop(0, 'rgba(255, 246, 214, 0.55)');
  core.addColorStop(0.12, 'rgba(251, 230, 164, 0.3)');
  core.addColorStop(0.4, 'rgba(240, 182, 120, 0.1)');
  core.addColorStop(1, 'rgba(200, 140, 200, 0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, P, P);

  ctx.globalCompositeOperation = 'source-over';
}
