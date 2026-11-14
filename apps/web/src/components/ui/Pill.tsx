import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type PillTone = 'neutral' | 'gold' | 'good' | 'signal' | 'locked';

const TONE: Record<PillTone, string> = {
  neutral: 'border border-blue/35 bg-chip/70 text-ink-2',
  gold: 'border border-gold/30 bg-gold-soft text-gold-2',
  good: 'bg-good-soft text-good',
  signal: 'bg-signal-soft text-signal',
  locked: 'border border-line bg-transparent text-muted',
};

interface PillProps {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}

export function Pill({ tone = 'neutral', children, className }: PillProps) {
  return (
    <span
      className={cx(
        'whitespace-nowrap rounded-full px-2.5 py-[3px] text-[9.5px] font-semibold uppercase tracking-[0.1em]',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
