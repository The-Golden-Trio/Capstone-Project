import { MEDAL, ToonBadge } from '@datn/ui';
import { EmptyMessage, Foldout } from './ProfileKit';
import { keywordDepth } from './recordView';
import type { PlayerRecord } from '../../api/types';

const colors = ['bg-toon-coral-light', 'bg-toon-sky', 'bg-toon-mustard'];
export function KeywordsCard({ record }: { record: PlayerRecord }) {
  const depth = keywordDepth(record.keywords);
  return (
    <Foldout title="Kỹ năng nghề đã mang về">
      <p className="mb-4 text-sm text-toon-ink-soft">
        Hoàn thành cấp nghề để nhận huy chương Làm quen, Thành thạo và Chuyên
        sâu.
      </p>
      <ul
        aria-label="Màu mức kỹ năng nghề"
        className="mb-5 flex flex-wrap gap-4 text-xs font-bold"
      >
        {([1, 2, 3] as const).map((level) => (
          <li key={level} className="flex items-center gap-2">
            <span
              aria-hidden
              className={`size-3 rounded border-2 border-toon-ink ${colors[level - 1]}`}
            />
            {MEDAL[level].name}
          </li>
        ))}
      </ul>
      {depth.length ? (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            {depth.map(({ group }) => (
              <section key={group}>
                <h3 className="mb-2 font-toon font-bold">{group}</h3>
                <ul className="flex flex-wrap gap-2">
                  {record.keywords
                    .filter((keyword) => keyword.group === group)
                    .map((keyword) => (
                      <li
                        key={keyword.id}
                        className="flex max-w-full items-start gap-2 rounded-xl border-2 border-toon-ink bg-toon-paper p-2 text-xs"
                      >
                        <ToonBadge
                          tone={
                            keyword.level === 3
                              ? 'mustard'
                              : keyword.level === 2
                                ? 'sky'
                                : 'paper'
                          }
                        >
                          {keyword.level}
                        </ToonBadge>
                        <span className="min-w-0 break-words">
                          {keyword.name}
                          <span className="mt-1 block text-toon-ink-soft">
                            {MEDAL[keyword.level].name}
                          </span>
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
          <figure
            aria-label="Độ sâu kỹ năng nghề theo nhóm ngành"
            className="rounded-2xl border-2 border-toon-ink bg-toon-paper p-4"
          >
            <figcaption className="font-toon text-lg font-bold">
              Độ sâu theo nhóm ngành
            </figcaption>
            <ul className="mt-4 space-y-4">
              {depth.map(({ group, counts }) => {
                const total = counts.reduce((a, n) => a + n, 0);
                return (
                  <li key={group}>
                    <p className="mb-1 text-sm font-bold">
                      {group} · {total}
                    </p>
                    <div
                      role="img"
                      aria-label={`${group}: ${counts.map((count, i) => `${MEDAL[(i + 1) as 1 | 2 | 3].name} ${count}`).join(', ')}`}
                      className="flex h-7 overflow-hidden rounded-lg border-2 border-toon-ink"
                    >
                      {counts.map(
                        (count, i) =>
                          count > 0 && (
                            <span
                              key={i}
                              className={`flex items-center justify-center text-xs font-bold text-toon-ink ${colors[i]}`}
                              style={{ width: `${(count / total) * 100}%` }}
                            >
                              {count}
                            </span>
                          ),
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-toon-ink-soft">
              Mỗi phần là số kỹ năng ở mức tương ứng, không phải điểm đánh giá
              con người.
            </p>
          </figure>
        </div>
      ) : (
        <EmptyMessage
          title="Chơi thêm để mở"
          description="Keyword được ghi khi bạn hoàn thành cấp nghề."
        />
      )}
    </Foldout>
  );
}
