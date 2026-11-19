import { profile } from '@datn/game-core';
import { Foldout } from './ProfileKit';
import { riasecDifference } from './recordView';
import type { PlayerRecord } from '../../api/types';

export function RiasecCard({ riasec }: { riasec: PlayerRecord['riasec'] }) {
  return (
    <Foldout
      title="Bạn thích kiểu việc nào?"
      className="text-toon-ink shadow-toon"
    >
      <p className="mb-4 text-sm text-toon-ink-soft">
        Hai góc nhìn: điều tự kể và cảm nhận sau khi thử. Bản nháp này không
        phải kết luận về bạn.
      </p>
      <figure aria-label="Sở thích RIASEC: tự kể và sau khi thử">
        <figcaption className="mb-4 flex flex-wrap gap-4 text-xs font-bold">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-3 rounded border-2 border-toon-ink bg-toon-sky"
            />
            Tự kể
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-3 rounded border-2 border-toon-ink bg-toon-mustard"
            />
            Sau khi thử
          </span>
          <span>Thang 1–3</span>
        </figcaption>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {profile.RIASEC_AXES.map((axis) => {
            const self = riasec.self?.[axis] ?? null;
            const samples = riasec.afterTrying[axis];
            const after = samples.count > 0 ? samples.mean : null;
            const difference = riasecDifference(self, after);
            const label = profile.RIASEC_INFO[axis].name;
            return (
              <div key={axis} className="min-w-0 text-center">
                <p
                  className="mb-2 min-h-5 text-sm font-bold text-toon-maroon"
                  aria-label={`Chênh lệch ${label}`}
                >
                  {difference === null
                    ? '—'
                    : `${difference < 0 ? '−' : '+'}${Math.abs(difference).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`}
                </p>
                <div className="mx-auto flex h-36 max-w-24 items-end justify-center gap-3 border-b-2 border-toon-ink px-2">
                  {[
                    { name: 'Tự kể', value: self, color: 'bg-toon-sky' },
                    {
                      name: 'Sau khi thử',
                      value: after,
                      color: 'bg-toon-mustard',
                    },
                  ].map((bar) => (
                    <div
                      key={bar.name}
                      className="flex h-full min-w-0 flex-1 flex-col justify-end"
                    >
                      <span className="mb-1 text-xs font-bold tabular-nums">
                        {bar.value === null
                          ? '—'
                          : bar.value.toLocaleString('vi-VN', {
                              maximumFractionDigits: 1,
                            })}
                      </span>
                      <div
                        role="img"
                        aria-label={`${label}, ${bar.name}: ${bar.value === null ? 'chưa có dữ liệu' : `${bar.value} trên 3`}`}
                        className={`w-full rounded-t-lg border-2 border-toon-ink ${bar.value === null ? 'border-dashed bg-toon-sand' : bar.color}`}
                        style={{
                          height:
                            bar.value === null
                              ? 8
                              : `${(Math.max(0, Math.min(3, bar.value)) / 3) * 100}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <h3 className="mt-2 font-toon text-sm font-bold">{label}</h3>
                <p className="mt-1 text-xs text-toon-ink-soft">
                  {after === null
                    ? 'Chưa có việc đã thử'
                    : `Dựa trên ${samples.count} việc`}
                </p>
              </div>
            );
          })}
        </div>
      </figure>
      <p className="mt-5 text-xs text-toon-ink-soft">
        Số chênh lệch = sau khi thử − tự kể. Dấu +: thấy thích hơn; dấu −: thấy
        thích ít hơn. Dấu —: chưa có đủ hai góc nhìn.
      </p>
      <p className="mt-2 text-xs text-toon-ink-soft">
        Sau mỗi ca, bạn kể việc nào mình thích. Điểm chấm ca không quyết định
        các cột này.
      </p>
    </Foldout>
  );
}
