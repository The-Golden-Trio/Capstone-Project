import { useState } from 'react';
import { Link } from 'react-router-dom';
import { profile } from '@datn/game-core';
import { ToonProgress, cn } from '@datn/ui';
import { Notice, PaperCard, CardHeading } from './ProfileKit';
import { SkillRadar } from './ProfileArt';

import type { PlayerRecord } from '../../api/types';
import { radarValue, skillEvidence } from './recordView';
import { SkillHistory } from './SkillHistory';
const number = (value: number) => value.toLocaleString('vi-VN');
export function SkillsCard({
  record,
  sign,
}: {
  record: PlayerRecord;
  sign: profile.ZodiacSign | null;
}) {
  const [selected, setSelected] = useState<profile.SoftSkillId | null>(null);
  const axes = profile.SOFT_SKILL_GROUPS.map((group) => ({
    key: group.id,
    label: group.short,
    starred: sign?.buffs.includes(group.id),
  }));
  const values = Object.fromEntries(
    record.softSkills.map((skill) => [skill.id, radarValue(skill)]),
  );
  const hasData = record.softSkills.some((skill) => skill.scenarios > 0);
  return (
    <PaperCard>
      <CardHeading
        title="Những kỹ năng đã luyện"
        description="Chạm nhóm kỹ năng để xem từng lần thử."
      />
      <div className="grid items-center gap-4 lg:grid-cols-2">
        <div
          className={cn(
            'min-w-0 text-center',
            !hasData && 'grayscale opacity-50',
          )}
        >
          <SkillRadar
            axes={axes}
            values={values}
            highlight={selected ?? undefined}
          />
          {!hasData && (
            <p className="text-sm text-toon-ink-soft">chơi thêm để mở</p>
          )}
        </div>
        <div className="min-w-0 space-y-4">
          {profile.SOFT_SKILL_GROUPS.map((group) => {
            const skill = record.softSkills.find(
              (entry) => entry.id === group.id,
            );
            const progress = profile.tierProgress(
              skill?.points ?? 0,
              skill?.reachedTier ?? 0,
            );
            return (
              <div key={group.id}>
                <button
                  type="button"
                  className="mb-2 flex w-full items-start justify-between gap-3 rounded text-left text-sm focus-visible:shadow-toon-focus"
                  aria-expanded={selected === group.id}
                  aria-controls={
                    selected === group.id
                      ? `skill-detail-${group.id}`
                      : undefined
                  }
                  onClick={() =>
                    setSelected(selected === group.id ? null : group.id)
                  }
                >
                  <span>
                    {group.name}
                    {sign?.buffs.includes(group.id) && (
                      <span className="text-toon-maroon"> ·</span>
                    )}
                  </span>
                  <span className="shrink-0 text-toon-maroon">
                    Bậc {progress.tier}
                  </span>
                </button>
                <ToonProgress
                  label={group.name}
                  value={progress.ratio}
                  max={1}
                  labelHidden
                />
                <p className="mt-1 text-xs text-toon-ink-soft">
                  {number(skill?.points ?? 0)} / 10.000 ·{' '}
                  {progress.nextAt === null
                    ? 'Bậc tối đa'
                    : `Bậc ${progress.tier + 1} ở ${number(progress.nextAt)}`}
                </p>
                {selected === group.id && (
                  <div
                    id={`skill-detail-${group.id}`}
                    className="mt-3 rounded-lg bg-toon-cream p-3"
                  >
                    <ul className="list-inside list-disc space-y-2 text-xs text-toon-ink-soft">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="my-3 text-xs text-toon-ink-soft">
                      Các mục con không có điểm riêng.
                    </p>
                    <SkillHistory
                      key={group.id}
                      history={skill?.history ?? []}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <details className="mt-6 rounded-xl border-2 border-toon-ink bg-toon-cream p-4">
        <summary className="cursor-pointer font-toon font-bold">
          Dấu vết từ các ca đã chơi
        </summary>
        <div className="mt-4 space-y-3">
          {(['positive', 'negative'] as const).map((direction) => {
            const evidence = skillEvidence(record.softSkills, direction);
            return (
              <div key={direction}>
                <h3 className="text-sm font-semibold">
                  {direction === 'positive' ? 'Đã làm tốt' : 'Cần luyện thêm'}
                </h3>
                {evidence.length ? (
                  <ul className="mt-2 space-y-2 text-sm text-toon-ink-soft">
                    {evidence.map(({ id, events }) => (
                      <li key={id}>
                        {profile.softSkillGroup(id).short}:{' '}
                        {direction === 'positive' ? 'được cộng' : 'bị trừ'}{' '}
                        trong{' '}
                        {events.slice(-2).map((event, index) => (
                          <span key={event.runId}>
                            {index > 0 && ', '}
                            <Link
                              className="underline"
                              to={`/play/${event.runId}/summary`}
                            >
                              {event.title} ({event.delta > 0 ? '+' : '−'}
                              {number(Math.abs(event.delta))})
                            </Link>
                          </span>
                        ))}
                        .
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-toon-ink-soft">
                    {record.softSkills.some(
                      (skill) =>
                        skill.scenarios >= profile.STRENGTH_MIN_SCENARIOS,
                    )
                      ? 'Chưa có biến động điểm theo hướng này.'
                      : `chơi thêm để mở · cần ít nhất ${profile.STRENGTH_MIN_SCENARIOS} ca được chấm cho một nhóm`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </details>
      <Notice tone="ai" className="mt-5">
        <p>
          Điểm phản ánh câu trả lời trong tình huống đã chơi, không kết luận về
          con người bạn.
        </p>
        {sign && (
          <p className="mt-2">{`${sign.name}: +12% phần điểm cộng cho ${sign.buffs.map((id) => profile.softSkillGroup(id).short).join(' và ')}; không nhân phần bị trừ.`}</p>
        )}
      </Notice>
    </PaperCard>
  );
}
