import {
  EmptyState,
  MEDAL,
  Medal,
  Panel,
  PanelHeader,
  StackedBar,
} from '@datn/ui';
import type { PlayerRecord } from '../../api/types';

export function KeywordsCard({ record }: { record: PlayerRecord }) {
  const groups = [...new Set(record.keywords.map((keyword) => keyword.group))];
  return (
    <Panel padding="lg">
      <PanelHeader
        title="Kỹ năng nghề đã mang về"
        description="Hoàn thành cấp nghề để nhận huy chương Làm quen, Thành thạo và Chuyên sâu."
      />
      {groups.length ? (
        <div className="space-y-6">
          {groups.map((group) => {
            const keywords = record.keywords.filter(
              (keyword) => keyword.group === group,
            );
            return (
              <section key={group}>
                <h3 className="mb-3 text-base font-semibold">{group}</h3>
                <div className="mb-4 flex flex-wrap gap-3">
                  {keywords.map((keyword) => (
                    <div
                      key={keyword.id}
                      className="flex items-center gap-2 rounded-lg border border-line p-2"
                    >
                      <Medal level={keyword.level} size={32} />
                      <span className="max-w-48 text-xs">
                        {keyword.name}
                        <span className="mt-1 block text-ink-faint">
                          {MEDAL[keyword.level].name}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
                <StackedBar
                  label={`Kỹ năng nghề · ${group}`}
                  items={([1, 2, 3] as const).map((level) => ({
                    key: String(level),
                    label: MEDAL[level].name,
                    value: keywords.filter((keyword) => keyword.level === level)
                      .length,
                    color: MEDAL[level].color,
                  }))}
                />
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState
          className="grayscale opacity-60"
          title="chơi thêm để mở"
          description="Huy chương đầu tiên sẽ xuất hiện khi bạn hoàn thành một cấp."
        />
      )}
    </Panel>
  );
}
