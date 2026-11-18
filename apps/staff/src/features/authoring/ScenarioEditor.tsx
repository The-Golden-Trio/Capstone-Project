import { TabPanel, Tabs } from '@datn/ui';
import { HintCount } from '../shared/Guidance';
import { ActivitiesTab } from './editor/ActivitiesTab';
import { CastTab } from './editor/CastTab';
import { EndingsTab } from './editor/EndingsTab';
import { EventsTab } from './editor/EventsTab';
import { IntroTab } from './editor/IntroTab';
import type { EditorProps } from './editor/shared';
import { SideQuestsTab } from './editor/SideQuestsTab';
import { countByTab, type EditorTab } from './lint';

export type { EditorProps, SkillName } from './editor/shared';

/**
 * D03: sửa `ScenarioContent` (FR-22). Tab xếp theo khối của seed trong
 * research (B bối cảnh, C cast, D luồng màn). Gợi ý soạn chạy ở client và
 * không chặn nộp; luật cấu trúc (con trỏ, trần theo cấp, thời lượng) do máy
 * chủ kiểm ở nút "Kiểm tra".
 */
export function ScenarioEditor({
  tab,
  onTabChange,
  openActivity,
  onOpenActivity,
  ...props
}: EditorProps & {
  tab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  openActivity: number;
  onOpenActivity: (index: number) => void;
}) {
  const { content, hints } = props;
  const counts = countByTab(hints);
  const label = (text: string, id: EditorTab) => (
    <>
      {text}
      <HintCount n={counts[id]} />
    </>
  );
  return (
    <div className="staff-paper paper rounded-lg p-4 sm:p-6">
      <Tabs
        idBase="editor"
        label="Phần nội dung"
        value={tab}
        onChange={onTabChange}
        items={[
          { key: 'intro', label: label('Bối cảnh', 'intro') },
          {
            key: 'cast',
            label: label(`Nhân vật (${content.cast?.length ?? 0})`, 'cast'),
          },
          {
            key: 'activities',
            label: label(
              `Luồng màn (${content.activities.length})`,
              'activities',
            ),
          },
          {
            key: 'events',
            label: label(
              `Sự kiện (${content.randomEvents?.length ?? 0})`,
              'events',
            ),
          },
          {
            key: 'endings',
            label: label(`Kết cục (${content.endings.length})`, 'endings'),
          },
          {
            key: 'sideQuests',
            label: label(
              `Nhiệm vụ phụ (${content.sideQuests?.length ?? 0})`,
              'sideQuests',
            ),
          },
        ]}
      />
      <TabPanel active idBase="editor" tabKey={tab}>
        {tab === 'intro' && <IntroTab {...props} />}
        {tab === 'cast' && <CastTab {...props} />}
        {tab === 'activities' && (
          <ActivitiesTab
            {...props}
            open={openActivity}
            onOpen={onOpenActivity}
          />
        )}
        {tab === 'events' && <EventsTab {...props} />}
        {tab === 'endings' && <EndingsTab {...props} />}
        {tab === 'sideQuests' && <SideQuestsTab {...props} />}
      </TabPanel>
    </div>
  );
}
