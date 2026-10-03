interface CountdownBarProps {
  secondsLeft: number;
  totalSeconds: number;
}

/** Đồng hồ của hoạt động quick action. Hết giờ là tính không hành động. */
export function CountdownBar({ secondsLeft, totalSeconds }: CountdownBarProps) {
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  return (
    <div className="mb-[18px] flex items-center gap-[13px] rounded-[9px] bg-signal-soft px-3.5 py-[11px]">
      <span
        className="font-mono text-[22px] font-bold leading-none tabular-nums text-signal"
        role="timer"
        aria-live="off"
      >
        00:{String(secondsLeft).padStart(2, '0')}
      </span>
      <div className="flex-1">
        <div className="text-[12.5px] leading-snug text-signal">
          Hết giờ thì tính là không hành động
        </div>
        <div className="mt-[7px] h-1 overflow-hidden rounded-sm bg-white/15">
          <i
            className="block h-full rounded-sm bg-signal transition-[width] duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
