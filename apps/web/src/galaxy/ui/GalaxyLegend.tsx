import { useState } from 'react';
import { galaxyData } from '../galaxy';
import { cx } from '../../lib/cx';

/** Chú giải góc trên-trái: màu hệ sao và ý nghĩa đường bay. Gập được. */
export function GalaxyLegend() {
  const [open, setOpen] = useState(true);

  return (
    <div className="galaxy-glass pointer-events-auto w-[218px] rounded-[11px] p-3.5 text-[12px] max-[900px]:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted"
        aria-expanded={open}
      >
        Chú giải
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="galaxy-rise mt-2.5">
          <ul className="m-0 grid list-none gap-[5px] p-0">
            {galaxyData().groups.map((g) => (
              <li key={g.short} className="flex items-center gap-2 text-ink-2">
                <span
                  className="h-[9px] w-[9px] shrink-0 rounded-full"
                  style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }}
                  aria-hidden="true"
                />
                <span className="truncate">{g.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 border-t border-line-2 pt-2.5 font-mono text-[10.5px] leading-[1.9] text-muted">
            <p className="m-0">
              <span className="text-gold">── ▶</span> thăng tiến lên
            </p>
            <p className="m-0">
              <span className="text-blue">╌╌╌</span> nghề tương tự
            </p>
            <p className="m-0">
              <span className="text-good">━━━</span> bay được ngay
            </p>
            <p className="m-0">
              <span className="text-signal">━━━</span> còn thiếu kỹ năng
            </p>
            <p className={cx('m-0 mt-1 text-[10px] leading-snug opacity-75')}>
              Mỗi hệ mặt trời = một nhóm nghề. Vòng trong = nghề vào từ đầu, càng ra xa càng senior.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
