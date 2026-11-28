import { TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { profile } from '@datn/game-core';
import { ToonDisclosure, ToonProgress, cn } from '@datn/ui';
import { Notice, PaperCard, CardHeading } from './ProfileKit';
import { SkillRadar } from './ProfileArt';

import type { PlayerRecord } from '../../api/types';
import {
  radarValue,
  skillEvidence,
  historySummary,
  skillTimeline,
} from './recordView';
import { SkillTrends } from './SkillTrends';
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
  const summary = historySummary(record.softSkills);
  const timeline = skillTimeline(record.softSkills, record.journal);
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
                      <span
                        className="text-toon-maroon"
                        aria-label={`Thưởng ${sign.name} +12%`}
                      >
                        {' '}
                        ★ {sign.name} +12%
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-toon-maroon">
                    Bậc {progress.tier}
                  </span>
                </button>
                {/* Thanh và nhãn cùng một thước: điểm hiện có so với ngưỡng bậc kế. */}
                <ToonProgress
                  label={group.name}
                  value={
                    progress.nextAt === null
                      ? 1
                      : (skill?.points ?? 0) / progress.nextAt
                  }
                  max={1}
                  labelHidden
                />
                <p className="mt-1 text-xs text-toon-ink-soft">
                  {progress.nextAt === null
                    ? `${number(skill?.points ?? 0)} điểm · bậc tối đa`
                    : `${number(skill?.points ?? 0)} / ${number(progress.nextAt)} điểm · tới bậc ${progress.tier + 1}`}
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <section
        aria-label="Tóm tắt lịch sử kỹ năng"
        className="toon-inset mt-6 p-4 text-sm"
      >
        <h3 className="font-toon text-lg font-bold">
          Sau {summary.count} ca có lịch sử điểm
        </h3>
        <p className="mt-2 flex items-start gap-2">
          <TrendingUp
            size={16}
            strokeWidth={2.6}
            aria-hidden
            className="mt-0.5 shrink-0 text-toon-mint-deep"
          />
          <span>
            <strong>Đang mạnh lên:</strong>{' '}
            {summary.positive
              ? `${profile.softSkillGroup(summary.positive.id).short} được cộng ở ${summary.positive.count}/${summary.count} ca.`
              : 'Chưa có nhóm đủ lịch sử để tóm tắt điểm cộng.'}
          </span>
        </p>
        <p className="mt-2 flex items-start gap-2">
          <TrendingDown
            size={16}
            strokeWidth={2.6}
            aria-hidden
            className="mt-0.5 shrink-0 text-toon-coral"
          />
          <span>
            <strong>Còn chững lại:</strong>{' '}
            {summary.negative ? (
              <>
                {profile.softSkillGroup(summary.negative.id).short} bị trừ ở{' '}
                {summary.negative.runIds.map((id, i) => (
                  <span key={id}>
                    {i > 0 && ', '}
                    <Link
                      to={`/play/${id}/summary`}
                      className="rounded font-bold underline focus-visible:shadow-toon-focus"
                    >
                      #{timeline.runs.find((run) => run.runId === id)?.index}
                    </Link>
                  </span>
                ))}
                .
              </>
            ) : (
              'Chưa có nhóm đủ lịch sử với ca bị trừ điểm.'
            )}
          </span>
        </p>
        <p className="mt-2 text-xs text-toon-ink-soft">
          Tóm tắt từ lịch sử; mỗi nhóm cần ít nhất{' '}
          {profile.STRENGTH_MIN_SCENARIOS} ca được chấm.
        </p>
      </section>
      <SkillTrends
        skills={record.softSkills}
        journal={record.journal}
        value={selected ?? undefined}
        onChange={setSelected}
      />
      <ToonDisclosure
        summary="Dấu vết từ các ca đã chơi"
        className="mt-4 border-t-[1.5px] border-toon-ink/12 pt-2"
      >
        <div className="space-y-3">
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
      </ToonDisclosure>
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
