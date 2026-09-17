import type { Scenario } from '@datn/game-core';

/**
 * Mất gì nếu không xong — và còn bao lâu.
 *
 * `context.stakes` và `context.time_pressure` vốn nằm sẵn trong bộ dữ liệu
 * nhưng chưa bao giờ hiện ra màn hình, nên người chơi không có cách nào biết
 * chuyện này quan trọng tới đâu. Đây là thứ biến một bài kiểm tra thành một
 * tình huống.
 */
export function StakesBar({ scenario }: { scenario: Scenario }) {
  const { stakes, time_pressure } = scenario.context;
  if (!stakes && !time_pressure) return null;

  return (
    <div className="pulse-stakes mb-4 rounded-r-[10px] border border-l-[3px] border-line-2 border-l-stakes bg-stakes-soft px-4 py-3">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.11em] text-stakes">
          Nếu không xong
        </span>
        {time_pressure && (
          <span className="rounded-full bg-stakes/15 px-2 py-[2px] font-mono text-[9.5px] text-stakes">
            {time_pressure}
          </span>
        )}
      </div>
      {stakes && (
        <p className="m-0 text-[13px] leading-relaxed text-ink-2">{stakes}</p>
      )}
    </div>
  );
}
