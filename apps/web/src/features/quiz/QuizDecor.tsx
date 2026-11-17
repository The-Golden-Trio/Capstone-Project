import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { InkStar, NightCard, ToonButton, cn } from '@datn/ui';
import type { QuizForm, QuizAnswers } from '../../api/types';

export function QuizNotice({
  title,
  children,
  retry,
  loading = false,
}: {
  title: string;
  children?: ReactNode;
  retry?: () => void;
  loading?: boolean;
}) {
  return (
    <NightCard className="mt-8 text-center">
      <div role={loading ? 'status' : undefined}>
        <h1 className="font-toon text-2xl font-extrabold">{title}</h1>
        {children && (
          <div className="mt-3 text-sm text-toon-ink-soft">{children}</div>
        )}
        {retry && (
          <ToonButton className="mt-5" onClick={retry}>
            Thử lại
          </ToonButton>
        )}
      </div>
    </NightCard>
  );
}

export function QuizChip({
  selected,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button
      {...props}
      type="button"
      aria-pressed={selected}
      className={cn(
        'min-h-11 max-w-full rounded-full border-[3px] border-toon-ink px-3 py-2 text-left font-toon text-sm font-bold break-words text-toon-ink focus-visible:outline-none focus-visible:shadow-toon-focus disabled:cursor-not-allowed disabled:bg-toon-shade disabled:text-toon-ink-faint',
        selected
          ? 'bg-toon-star shadow-toon-sm'
          : 'bg-toon-paper hover:bg-toon-cream',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function QuizStars({
  cards,
  answers,
}: {
  cards: QuizForm['cards'];
  answers: QuizAnswers['cards'];
}) {
  return (
    <div className="my-5 grid grid-cols-3 gap-3">
      {[1, 2, 3].map((cluster) => {
        const group = cards.filter((c) => c.cluster === cluster);
        const done = group.filter((c) => answers[c.id] !== undefined).length;
        return (
          <div key={cluster}>
            <p className="mb-2 text-xs font-bold text-toon-star-soft">
              Cụm {cluster}
            </p>
            <div
              role="progressbar"
              aria-label={`Cụm ${cluster}`}
              aria-valuemin={0}
              aria-valuemax={group.length}
              aria-valuenow={done}
              className="flex flex-wrap gap-0.5"
            >
              {group.map((c) => (
                <InkStar
                  key={c.id}
                  size={16}
                  className="sm:size-5"
                  variant="round5"
                  fill={
                    answers[c.id] !== undefined
                      ? 'var(--color-toon-star)'
                      : 'var(--color-toon-paper)'
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function QuizMessage({
  children,
  title,
  className,
  tone,
}: {
  children?: ReactNode;
  title?: string;
  className?: string;
  tone?: 'danger' | 'warning';
}) {
  return (
    <div
      className={cn(
        'rounded-xl border-[3px] border-toon-ink p-4 text-sm text-toon-ink',
        tone === 'danger' ? 'bg-toon-coral-light' : 'bg-toon-cream',
        className,
      )}
    >
      {title && <p className="font-bold">{title}</p>}
      {children && <div className={title ? 'mt-2' : undefined}>{children}</div>}
    </div>
  );
}
