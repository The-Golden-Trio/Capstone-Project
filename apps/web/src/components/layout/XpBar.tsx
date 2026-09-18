import { useEffect, useRef, useState } from 'react';
import { UNLOCK_AT, bandLabel } from '@datn/game-core';
import { useJourneyStore } from '../../store/journeyStore';
import { useProgressStore } from '../../store/progressStore';
import { cx } from '../../lib/cx';
import { DEFAULT_THEME, roleTheme, themeVars } from '../../domain/roleTheme';

/** Con số chạy dần tới đích thay vì nhảy phắt. */
const COUNT_MS = 700;

/**
 * Thanh kinh nghiệm, luôn nằm ở đáy màn hình.
 *
 * Điểm kỹ năng là thứ quyết định mở được nghề nào tới cấp nào, nhưng trước
 * đây nó chỉ hiện ở vài trang: làm xong một nhiệm vụ rồi cũng không thấy gì
 * nhúc nhích. Đặt cố định ở đáy thì mọi việc người chơi làm đều có chỗ để
 * hiện ra ngay.
 *
 * Thanh này chỉ đọc; không có cách nào ghi điểm từ phía máy khách. Nó theo
 * dõi `totalPoints` và tự ăn mừng mỗi khi con số ấy lớn lên, bất kể điểm đến
 * từ nhiệm vụ phụ hay từ một màn kịch bản.
 */
export function XpBar() {
  const summary = useProgressStore((s) => s.summary);
  const load = useProgressStore((s) => s.load);
  const { roleCode, band } = useJourneyStore();

  // Thanh này có mặt ở mọi trang, kể cả những trang không đụng tới tiến trình,
  // nên nó tự đi hỏi một lần thay vì trông chờ trang nào đó hỏi hộ.
  useEffect(() => {
    if (!summary) void load();
  }, [summary, load]);

  const total = summary?.totalPoints ?? 0;

  // Cấp bậc đang đứng, để biết còn bao xa tới mốc mở cấp kế.
  const roleProgress = summary?.roles.find((r) => r.roleCode === roleCode);
  const current = roleProgress?.bands.find((b) => b.band === band) ?? null;
  const points = current?.points ?? 0;
  const pct = Math.min(100, (points / UNLOCK_AT) * 100);

  const theme = roleCode ? roleTheme(roleCode) : DEFAULT_THEME;

  const [shown, setShown] = useState(total);
  const [gained, setGained] = useState(0);
  const previous = useRef(total);

  /* ── Con số chạy dần, và một nhịp ăn mừng khi vừa được cộng ── */
  useEffect(() => {
    const from = previous.current;
    previous.current = total;

    if (from === total) {
      setShown(total);
      return;
    }

    if (total > from) setGained(total - from);

    const startedAt = performance.now();
    let frame = 0;

    const step = () => {
      const t = Math.min(1, (performance.now() - startedAt) / COUNT_MS);
      // ease-out: nhanh lúc đầu, chậm dần về đích
      setShown(Math.round(from + (total - from) * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [total]);

  // Dòng "+N" chỉ nán lại một lát rồi tự tắt.
  useEffect(() => {
    if (!gained) return;
    const id = window.setTimeout(() => setGained(0), 2200);
    return () => window.clearTimeout(id);
  }, [gained]);

  // Chưa tải xong tiến trình thì chưa có gì để nói.
  if (!summary) return null;

  return (
    <div className="xp-bar" style={themeVars(theme)}>
      <div className="xp-bar-inner">
        <span className="xp-bar-label">Điểm kỹ năng</span>

        <span className={cx('xp-bar-total', gained > 0 && 'is-gaining')}>
          {shown}
          {gained > 0 && <i className="xp-bar-gain">+{gained}</i>}
        </span>

        {current ? (
          <>
            <div className="xp-track xp-bar-track">
              <i
                className={cx('xp-fill', gained > 0 && 'is-gaining')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="xp-bar-place">
              {current.band} · {bandLabel(current.band)}
              <b className="xp-bar-frac">
                {points}/{UNLOCK_AT}
              </b>
            </span>
          </>
        ) : (
          <span className="xp-bar-place xp-bar-hint">
            Vào một nghề để bắt đầu tích điểm
          </span>
        )}
      </div>
    </div>
  );
}
