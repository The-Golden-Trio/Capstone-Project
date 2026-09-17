import { useEffect, useRef, useState } from 'react';

/**
 * Đếm ngược tới `deadline` (epoch ms). `null` là không có đếm ngược.
 *
 * `onExpire` chỉ gọi đúng một lần cho mỗi mốc — bản prototype để
 * `setInterval` sống qua các lần render nên có lúc bắn trùng.
 */
export function useCountdown(
  deadline: number | null,
  onExpire: () => void,
): number | null {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const firedRef = useRef<number | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (deadline === null) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0 && firedRef.current !== deadline) {
        firedRef.current = deadline;
        onExpireRef.current();
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [deadline]);

  return secondsLeft;
}
