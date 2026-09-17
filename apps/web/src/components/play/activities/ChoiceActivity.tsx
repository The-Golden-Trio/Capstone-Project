import type { Activity } from '@datn/game-core';

const OPTION_KEYS = 'ABCDE';

export function ChoiceActivity({
  activity,
  onPick,
}: {
  activity: Activity;
  onPick: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {(activity.options ?? []).map((option, index) => (
        <button
          key={option}
          type="button"
          onClick={() => onPick(index)}
          className="flex w-full gap-[11px] rounded-[9px] border border-line bg-surf px-[15px] py-[13px] text-left text-[13.5px] leading-normal text-ink transition-colors hover:border-gold"
        >
          <span className="shrink-0 font-mono text-[11px] text-muted">
            {OPTION_KEYS[index]}
          </span>
          <span>{option}</span>
        </button>
      ))}
    </div>
  );
}
