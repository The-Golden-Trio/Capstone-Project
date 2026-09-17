import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';
import { CONSTELLATION_EDGES, type EdgeKind } from '@datn/game-core';

export interface ConstellationLine {
  key: string;
  kind: EdgeKind;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Cạnh có chạm hành tinh đang chọn không. */
  hot: boolean;
}

export interface ConstellationBox {
  width: number;
  height: number;
  lines: ConstellationLine[];
}

/**
 * Đo vị trí thật của các hành tinh rồi tính toạ độ đường nối.
 *
 * Phải đo sau khi bố cục xong nên dùng `useLayoutEffect`; `ResizeObserver`
 * lo phần đổi kích thước — chính xác hơn và ít việc hơn so với bắt sự kiện
 * `resize` toàn cửa sổ như bản prototype.
 */
export function useConstellationLines(
  wrapRef: RefObject<HTMLElement | null>,
  activeRoleCode: string | null,
): ConstellationBox {
  const [box, setBox] = useState<ConstellationBox>({
    width: 0,
    height: 0,
    lines: [],
  });

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const bounds = wrap.getBoundingClientRect();
    const centerOf = (roleCode: string) => {
      const planet = wrap.querySelector<HTMLElement>(
        `[data-role="${roleCode}"] .planet`,
      );
      if (!planet) return null;
      const rect = planet.getBoundingClientRect();
      return {
        x: rect.left - bounds.left + rect.width / 2,
        y: rect.top - bounds.top + rect.height / 2,
      };
    };

    const lines: ConstellationLine[] = [];
    for (const edge of CONSTELLATION_EDGES) {
      const from = centerOf(edge.a);
      const to = centerOf(edge.b);
      if (!from || !to) continue;
      lines.push({
        key: `${edge.a}|${edge.b}`,
        kind: edge.kind,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        hot: activeRoleCode === edge.a || activeRoleCode === edge.b,
      });
    }

    setBox({ width: bounds.width, height: bounds.height, lines });
  }, [wrapRef, activeRoleCode]);

  useLayoutEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [measure, wrapRef]);

  return box;
}
