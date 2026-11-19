import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ACHIEVEMENT_KINDS, ToonButton, useToast } from '@datn/ui';
import { Notice, PaperCard, CardHeading } from './ProfileKit';
import { AchievementSeal } from './ProfileArt';

import { api } from '../../api';
import { errorText, keys } from '../../api/hooks';
import type { Achievement } from '../../api/types';

export function AchievementsTab({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const [showLocked, setShowLocked] = useState(false);
  const [kind, setKind] = useState<Achievement['kind'] | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const pins = achievements
    .filter((achievement) => achievement.pinned && achievement.earnedAt)
    .map((achievement) => achievement.code);
  const pin = useMutation({
    mutationFn: (codes: string[]) => api.progress.pinAchievements(codes),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.record });
      toast({ tone: 'success', title: 'Đã cập nhật huy hiệu ghim' });
    },
  });
  return (
    <PaperCard>
      <CardHeading
        title={`Bộ sưu tập dấu mốc · ${achievements.filter((item) => item.earnedAt).length}/${achievements.length}`}
        description="Chạm huy hiệu đã mở để ghim hoặc bỏ ghim. Tối đa 3."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <ToonButton
          size="sm"
          variant="secondary"
          aria-pressed={kind === null}
          style={
            kind === null
              ? { backgroundColor: 'var(--color-toon-star)' }
              : undefined
          }
          onClick={() => setKind(null)}
        >
          Tất cả
        </ToonButton>
        {(Object.keys(ACHIEVEMENT_KINDS) as Achievement['kind'][]).map(
          (key) => (
            <ToonButton
              size="sm"
              variant="secondary"
              key={key}
              aria-pressed={kind === key}
              style={
                kind === key
                  ? { backgroundColor: 'var(--color-toon-star)' }
                  : undefined
              }
              onClick={() => setKind(key)}
            >
              <span
                aria-hidden
                className="mr-1 inline-block size-3 rounded-full border border-toon-ink"
                style={{
                  backgroundColor: ACHIEVEMENT_KINDS[key].color,
                }}
              />
              {ACHIEVEMENT_KINDS[key].name}
            </ToonButton>
          ),
        )}
      </div>
      {pins.length >= 3 && (
        <p role="status" className="mb-4 text-sm font-bold">
          Đã ghim đủ 3 huy hiệu. Bỏ một ghim để chọn huy hiệu khác.
        </p>
      )}
      {pin.isError && (
        <Notice tone="danger" className="mb-4">
          {errorText(pin.error)}
        </Notice>
      )}
      <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-bold">
        <input
          type="checkbox"
          checked={showLocked}
          onChange={(event) => setShowLocked(event.target.checked)}
          className="size-4 accent-toon-maroon focus-visible:shadow-toon-focus"
        />
        Xem cả huy hiệu chưa mở
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[...achievements]
          .sort(
            (a, b) => Number(Boolean(b.earnedAt)) - Number(Boolean(a.earnedAt)),
          )
          .filter(
            (achievement) =>
              (!kind || achievement.kind === kind) &&
              (showLocked || achievement.earnedAt),
          )
          .map((achievement) => (
            <article
              key={achievement.code}
              className="flex flex-col items-center rounded-2xl border-2 border-toon-ink bg-toon-cream p-4 text-center"
            >
              {achievement.pinned && achievement.earnedAt && (
                <span className="mb-2 rounded bg-toon-mustard px-2 text-xs font-bold">
                  GHIM
                </span>
              )}
              <button
                type="button"
                aria-label={`${achievement.pinned ? 'Bỏ ghim' : 'Ghim'} huy hiệu: ${achievement.name}`}
                disabled={
                  !achievement.earnedAt ||
                  pin.isPending ||
                  (!achievement.pinned && pins.length >= 3)
                }
                aria-pressed={achievement.pinned}
                className="rounded-full focus-visible:shadow-toon-focus disabled:cursor-default"
                onClick={() =>
                  pin.mutate(
                    achievement.pinned
                      ? pins.filter((code) => code !== achievement.code)
                      : [...pins, achievement.code],
                  )
                }
              >
                <AchievementSeal
                  kind={achievement.kind}
                  locked={!achievement.earnedAt}
                  label={achievement.name}
                />
              </button>
              <h3 className="mt-2 font-toon text-sm font-bold">
                {achievement.name}
              </h3>
              <details className="mt-2 text-xs text-toon-ink-soft">
                <summary className="cursor-pointer font-bold">
                  Điều kiện mở
                </summary>
                <p className="mt-2">{achievement.description}</p>
              </details>
              {/* Huy hiệu khoá đã có dấu khoá trên hình; chữ chỉ cho trình đọc màn hình. */}
              <p
                className={
                  achievement.earnedAt
                    ? 'my-3 text-xs text-toon-ink-soft'
                    : 'sr-only'
                }
              >
                {achievement.earnedAt
                  ? new Date(achievement.earnedAt).toLocaleDateString('vi-VN')
                  : 'Chưa mở khoá'}
              </p>
              {achievement.earnedAt && (
                <ToonButton
                  variant="ghost"
                  size="sm"
                  aria-pressed={achievement.pinned}
                  disabled={
                    pin.isPending || (!achievement.pinned && pins.length >= 3)
                  }
                  onClick={() =>
                    pin.mutate(
                      achievement.pinned
                        ? pins.filter((code) => code !== achievement.code)
                        : [...pins, achievement.code],
                    )
                  }
                >
                  {achievement.pinned ? 'Bỏ ghim' : 'Ghim'}
                </ToonButton>
              )}
            </article>
          ))}
      </div>
      {!achievements.some(
        (achievement) =>
          (!kind || achievement.kind === kind) &&
          (showLocked || achievement.earnedAt),
      ) && (
        <p className="mt-4 text-sm text-toon-ink-soft">
          {showLocked
            ? 'Chưa có huy hiệu trong nhóm này.'
            : 'Chưa có huy hiệu đã mở trong nhóm này.'}
        </p>
      )}
    </PaperCard>
  );
}
