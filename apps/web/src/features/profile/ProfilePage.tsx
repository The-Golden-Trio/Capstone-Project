import { Link, useSearchParams } from 'react-router-dom';
import { profile } from '@datn/game-core';
import { ToonButton, LoadingBlock, ToonTabPanel, PillTabs } from '@datn/ui';
import { EmptyMessage, Foldout, PaperCard, ProfileCanvas } from './ProfileKit';
import { AchievementSeal, PlayerSeal } from './ProfileArt';

import { errorText, useMe, useRecord } from '../../api/hooks';
import type { Me, PlayerRecord } from '../../api/types';
import { AchievementsTab } from './AchievementsTab';
import { GoalsCard } from './GoalsCard';
import { JournalTab } from './JournalTab';
import { KeywordsCard } from './KeywordsCard';
import { PlayingCard } from './PlayingCard';
import { RiasecCard } from './RiasecCard';
import { SkillsCard } from './SkillsCard';
import { StatsTab } from './StatsTab';

const tabs = [
  { key: 'tong-quan', label: 'Tổng quan' },
  { key: 'thong-ke', label: 'Thống kê' },
  { key: 'thanh-tuu', label: 'Thành tựu' },
  { key: 'nhat-ky', label: 'Nhật ký' },
];

export default function ProfilePage() {
  const record = useRecord();
  const me = useMe();
  const [params, setParams] = useSearchParams();
  const tab =
    tabs.find((item) => item.key === params.get('tab'))?.key ?? 'tong-quan';

  if (record.isError || me.isError) {
    return (
      <EmptyMessage
        title="Chưa mở được hành trang"
        description={errorText(record.error ?? me.error)}
        action={
          <ToonButton
            onClick={() => {
              void record.refetch();
              void me.refetch();
            }}
          >
            Thử lại
          </ToonButton>
        }
      />
    );
  }
  if (!record.data || !me.data) {
    return <LoadingBlock text="Đang gom những dấu chân của bạn…" />;
  }

  const data = record.data;
  const sign = profile.zodiacOf(me.data.dateOfBirth);

  return (
    <ProfileCanvas>
      <ProfileHeader me={me.data} record={data} sign={sign} />
      <PillTabs
        idBase="profile"
        label="Các phần hành trang"
        items={tabs}
        value={tab}
        onChange={(next) =>
          setParams((current) => {
            current.set('tab', next);
            return current;
          })
        }
        // Bốn tab vừa một hàng ở 360 px: thu đệm ngang trên điện thoại thay vì cuộn.
        className="max-sm:gap-2 max-sm:[&>button]:px-2 max-sm:[&>button]:text-sm"
      />
      <ToonTabPanel
        idBase="profile"
        tabKey="tong-quan"
        active={tab === 'tong-quan'}
        className="space-y-6"
      >
        <PlayingCard playing={data.playing} />
        <SkillsCard record={data} sign={sign} />
        {/* Ba phần phụ gom vào một thẻ, mỗi phần là một dòng gập. */}
        <PaperCard className="px-4 py-2 sm:px-6">
          <div className="toon-rows">
            <Foldout title="Mục tiêu của bạn">
              <GoalsCard record={data} quizDone={me.data.quizDone} />
            </Foldout>
            <RiasecCard riasec={data.riasec} />
            <KeywordsCard record={data} />
          </div>
        </PaperCard>
      </ToonTabPanel>
      <ToonTabPanel
        idBase="profile"
        tabKey="thong-ke"
        active={tab === 'thong-ke'}
      >
        <StatsTab record={data} />
      </ToonTabPanel>
      <ToonTabPanel
        idBase="profile"
        tabKey="thanh-tuu"
        active={tab === 'thanh-tuu'}
      >
        <AchievementsTab achievements={data.achievements} />
      </ToonTabPanel>
      <ToonTabPanel
        idBase="profile"
        tabKey="nhat-ky"
        active={tab === 'nhat-ky'}
      >
        <JournalTab record={data} />
      </ToonTabPanel>
    </ProfileCanvas>
  );
}

function ProfileHeader({
  me,
  record,
  sign,
}: {
  me: Me;
  record: PlayerRecord;
  sign: profile.ZodiacSign | null;
}) {
  const pinned = record.achievements
    .filter((achievement) => achievement.pinned && achievement.earnedAt)
    .slice(0, 3);

  return (
    <PaperCard
      tape
      className="[&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:gap-5"
    >
      <PlayerSeal seed={me.id} size={88} />
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-toon text-xs font-bold uppercase tracking-wider">
          Hành trang riêng tư
        </p>
        <h1 className="mt-1 break-words font-toon text-4xl font-extrabold sm:text-5xl">
          {me.displayName}
        </h1>
        {sign && (
          <p className="mt-3 text-sm font-bold text-toon-maroon">
            {sign.name} · +12%{' '}
            {sign.buffs
              .map((id) => profile.softSkillGroup(id).short)
              .join(', ')}
          </p>
        )}
      </div>
      <div
        className="min-w-0 rounded-[14px] bg-toon-sand/45 px-3 py-2"
        aria-label="Huy hiệu ghim"
      >
        <p className="mb-2 font-toon text-sm font-bold">
          Huy hiệu ghim · {pinned.length}/3
        </p>
        <div className="flex flex-wrap gap-2">
          {pinned.map((achievement) => (
            <Link
              key={achievement.code}
              to="/profile?tab=thanh-tuu"
              aria-label={`Huy hiệu ghim: ${achievement.name}`}
              className="rounded-lg focus-visible:shadow-toon-focus"
            >
              <AchievementSeal
                kind={achievement.kind}
                label={achievement.name}
                size={44}
              />
            </Link>
          ))}
          {!pinned.length && (
            <Link
              to="/profile?tab=thanh-tuu"
              className="rounded text-xs underline focus-visible:shadow-toon-focus"
            >
              Chọn huy hiệu để ghim
            </Link>
          )}
        </div>
      </div>
    </PaperCard>
  );
}
