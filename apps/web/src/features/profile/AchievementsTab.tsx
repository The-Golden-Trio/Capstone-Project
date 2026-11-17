import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ACHIEVEMENT_KINDS, ToonButton, useToast } from '@datn/ui';
import { Notice, EmptyMessage, PaperCard, CardHeading } from './ProfileKit';
import { AchievementSeal } from './ProfileArt';

import { api } from '../../api';
import { errorText, keys } from '../../api/hooks';
import type { Achievement } from '../../api/types';

export function AchievementsTab({
  achievements,
}: {
  achievements: Achievement[];
}) {
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
        title="Bộ sưu tập dấu mốc"
        description={`${achievements.filter((achievement) => achievement.earnedAt).length}/${achievements.length} · Ghim tối đa 3.`}
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
              {ACHIEVEMENT_KINDS[key].name}
            </ToonButton>
          ),
        )}
      </div>
      {pin.isError && (
        <Notice tone="danger" className="mb-4">
          {errorText(pin.error)}
        </Notice>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[...achievements]
          .sort(
            (a, b) => Number(Boolean(b.earnedAt)) - Number(Boolean(a.earnedAt)),
          )
          .filter((achievement) => !kind || achievement.kind === kind)
          .map((achievement) => (
            <article
              key={achievement.code}
              className="flex flex-col items-center rounded-2xl border-2 border-toon-ink bg-toon-cream p-4 text-center"
            >
              <AchievementSeal
                kind={achievement.kind}
                locked={!achievement.earnedAt}
                label={achievement.name}
              />
              <h3 className="mt-2 text-sm font-semibold">{achievement.name}</h3>
              <details className="mt-2 text-xs text-toon-ink-soft">
                <summary className="cursor-pointer font-bold">
                  Điều kiện mở
                </summary>
                <p className="mt-2">{achievement.description}</p>
              </details>
              <p className="my-3 text-xs text-toon-ink-soft">
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
        (achievement) => !kind || achievement.kind === kind,
      ) && <EmptyMessage title="Chưa có huy hiệu trong nhóm này" />}
    </PaperCard>
  );
}
