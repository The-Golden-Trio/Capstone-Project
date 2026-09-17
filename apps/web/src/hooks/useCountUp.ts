import { useEffect, useState } from 'react';

/**
 * Đếm từ 0 lên `target`.
 *
 * Điểm nhảy thẳng ra con số cuối thì không ai thấy mình vừa được gì; đếm lên
 * làm phần thưởng có sức nặng. Người bật "giảm chuyển động" thì hiện luôn số
 * cuối, không đếm.
 */
export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(target);
      return;
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setValue(target);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      // Chậm dần về cuối, nên con số "đậu" lại chứ không phanh gấp.
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
