import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ACHIEVEMENT_KINDS,
  Button,
  Callout,
  Chip,
  EmptyState,
  HexBadge,
  Panel,
  PanelHeader,
  useToast,
} from '@datn/ui';
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
    <Panel padding="lg">
      <PanelHeader
        title="Bộ sưu tập dấu mốc"
        description={`Đã mở ${achievements.filter((achievement) => achievement.earnedAt).length}/${achievements.length} · Ghim tối đa 3 huy hiệu ở đầu hành trang.`}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Chip selected={kind === null} onClick={() => setKind(null)}>
          Tất cả
        </Chip>
        {(Object.keys(ACHIEVEMENT_KINDS) as Achievement['kind'][]).map(
          (key) => (
            <Chip
              key={key}
              selected={kind === key}
              onClick={() => setKind(key)}
            >
              {ACHIEVEMENT_KINDS[key].name}
            </Chip>
          ),
        )}
      </div>
      {pin.isError && (
        <Callout tone="danger" className="mb-4">
          {errorText(pin.error)}
        </Callout>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {achievements
          .filter((achievement) => !kind || achievement.kind === kind)
          .map((achievement) => (
            <article
              key={achievement.code}
              className="flex flex-col items-center rounded-xl border border-line p-4 text-center"
            >
              <HexBadge
                kind={achievement.kind}
                locked={!achievement.earnedAt}
                label={achievement.name}
              />
              <h3 className="mt-2 text-sm font-semibold">{achievement.name}</h3>
              <p className="mt-2 flex-1 text-xs text-ink-faint">
                {achievement.description}
              </p>
              <p className="my-3 text-xs text-ink-muted">
                {achievement.earnedAt
                  ? new Date(achievement.earnedAt).toLocaleDateString('vi-VN')
                  : 'Chưa mở khoá'}
              </p>
              {achievement.earnedAt && (
                <Button
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
                </Button>
              )}
            </article>
          ))}
      </div>
      {!achievements.some(
        (achievement) => !kind || achievement.kind === kind,
      ) && <EmptyState title="Chưa có huy hiệu trong nhóm này" />}
    </Panel>
  );
}
