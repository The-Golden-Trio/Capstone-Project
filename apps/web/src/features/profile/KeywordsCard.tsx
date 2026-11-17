import { MEDAL, ToonBadge, ToonProgress } from '@datn/ui';
import { EmptyMessage, Foldout } from './ProfileKit';

import type { PlayerRecord } from '../../api/types';

export function KeywordsCard({ record }: { record: PlayerRecord }) {
  const groups = [...new Set(record.keywords.map((keyword) => keyword.group))];
  return (
    <Foldout
      title="Kỹ năng nghề đã mang về"
      className="bg-toon-paper p-5 text-toon-ink shadow-toon"
    >
      <p className="mb-5 text-sm text-toon-ink-soft">
        Hoàn thành cấp nghề để nhận huy chương Làm quen, Thành thạo và Chuyên
        sâu.
      </p>
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
                      className="flex items-center gap-2 rounded-lg border border-toon-ink p-2"
                    >
                      <ToonBadge
                        tone={
                          keyword.level === 3
                            ? 'mustard'
                            : keyword.level === 2
                              ? 'sky'
                              : 'coral'
                        }
                      >
                        {keyword.level}
                      </ToonBadge>
                      <span className="max-w-48 text-xs">
                        {keyword.name}
                        <span className="mt-1 block text-toon-ink-soft">
                          {MEDAL[keyword.level].name}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  aria-label={`Kỹ năng nghề · ${group}`}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {([1, 2, 3] as const).map((level) => (
                    <ToonProgress
                      key={level}
                      label={MEDAL[level].name}
                      max={keywords.length}
                      value={
                        keywords.filter((keyword) => keyword.level === level)
                          .length
                      }
                      showValue
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyMessage
          className="grayscale opacity-60"
          title="chơi thêm để mở"
          description="Huy chương đầu tiên sẽ xuất hiện khi bạn hoàn thành một cấp."
        />
      )}
    </Foldout>
  );
}
