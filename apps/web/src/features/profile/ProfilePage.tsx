import { useSearchParams } from 'react-router-dom';
import { profile } from '@datn/game-core';
import {
  ToonBadge,
  ToonButton,
  LoadingBlock,
  ToonTabPanel,
  PillTabs,
  StickerBadge,
} from '@datn/ui';
import { EmptyMessage, PaperCard, ProfileCanvas } from './ProfileKit';
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
        <GoalsCard record={data} quizDone={me.data.quizDone} />
        <RiasecCard riasec={data.riasec} />
        <KeywordsCard record={data} />
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
        <p className="mt-3 text-sm text-toon-ink-soft">
          Riêng tư, lưu dấu mỗi lần thử.
        </p>
        {sign && (
          <div className="mt-3 flex flex-wrap gap-2">
            <ToonBadge tone="sky" className="-rotate-2 self-center">
              {sign.symbol}
              {'\uFE0E'} {sign.name}
            </ToonBadge>
            {sign.buffs.map((id) => (
              <span
                key={id}
                className="inline-flex max-w-full items-center gap-1"
              >
                <StickerBadge
                  size={68}
                  label={`${profile.softSkillGroup(id).short}: +12% điểm cộng`}
                >
                  +12%
                </StickerBadge>
                <span className="max-w-28 text-xs font-bold text-toon-ink-soft">
                  {profile.softSkillGroup(id).short} · điểm cộng
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
      {pinned.length > 0 && (
        <div className="flex gap-1" aria-label="Thành tựu đã ghim">
          {pinned.map((achievement) => (
            <AchievementSeal
              key={achievement.code}
              kind={achievement.kind}
              label={achievement.name}
              size={52}
            />
          ))}
        </div>
      )}
    </PaperCard>
  );
}
