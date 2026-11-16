import { useSearchParams } from 'react-router-dom';
import { profile } from '@datn/game-core';
import {
  Badge,
  Button,
  HexBadge,
  EmptyState,
  LoadingBlock,
  Panel,
  PlayerEmblem,
  TabPanel,
  Tabs,
} from '@datn/ui';
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
      <EmptyState
        title="Chưa mở được hành trang"
        description={errorText(record.error ?? me.error)}
        action={
          <Button
            onClick={() => {
              void record.refetch();
              void me.refetch();
            }}
          >
            Thử lại
          </Button>
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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <ProfileHeader me={me.data} record={data} sign={sign} />
      <Tabs
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
        className="overflow-x-auto"
      />
      <TabPanel
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
      </TabPanel>
      <TabPanel idBase="profile" tabKey="thong-ke" active={tab === 'thong-ke'}>
        <StatsTab record={data} />
      </TabPanel>
      <TabPanel
        idBase="profile"
        tabKey="thanh-tuu"
        active={tab === 'thanh-tuu'}
      >
        <AchievementsTab achievements={data.achievements} />
      </TabPanel>
      <TabPanel idBase="profile" tabKey="nhat-ky" active={tab === 'nhat-ky'}>
        <JournalTab record={data} />
      </TabPanel>
    </div>
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
    <Panel as="div" padding="lg" className="flex flex-wrap items-center gap-4">
      <PlayerEmblem seed={me.id} size={88} />
      <div className="min-w-0 flex-1 basis-48">
        <p className="eyebrow">Hành trang riêng tư</p>
        <h1 className="mt-1 break-words font-display text-3xl sm:text-5xl">
          {me.displayName}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Mỗi lần thử để lại một điều bạn đã làm. Chỉ bạn xem được hành trang
          này.
        </p>
        {sign && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>
              {sign.symbol}
              {'\uFE0E'} {sign.name}
            </Badge>
            {sign.buffs.map((id) => (
              <Badge key={id}>
                ★ {profile.softSkillGroup(id).short} +12% điểm cộng
              </Badge>
            ))}
          </div>
        )}
      </div>
      {pinned.length > 0 && (
        <div className="flex gap-1" aria-label="Thành tựu đã ghim">
          {pinned.map((achievement) => (
            <HexBadge
              key={achievement.code}
              kind={achievement.kind}
              label={achievement.name}
              size={52}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
