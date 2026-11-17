import { profile } from '@datn/game-core';
import { cn } from '@datn/ui';
import { Foldout } from './ProfileKit';

import type { PlayerRecord } from '../../api/types';

export function RiasecCard({ riasec }: { riasec: PlayerRecord['riasec'] }) {
  const hasAfter = profile.RIASEC_AXES.some(
    (axis) =>
      riasec.afterTrying[axis].count > 0 &&
      riasec.afterTrying[axis].mean !== null,
  );
  const hasData = riasec.self !== null || hasAfter;
  const items = profile.RIASEC_AXES.map((axis) => ({
    key: axis,
    label: profile.RIASEC_INFO[axis].name,
    self: riasec.self?.[axis] ?? null,
    after:
      riasec.afterTrying[axis].count > 0 ? riasec.afterTrying[axis].mean : null,
    count: riasec.afterTrying[axis].count,
  }));

  return (
    <Foldout
      title="Bạn thích kiểu việc nào?"
      className="bg-toon-paper p-5 text-toon-ink shadow-toon"
    >
      <p className="mb-5 text-sm text-toon-ink-soft">
        Hai góc nhìn: điều tự kể và cảm nhận sau những việc đã thử. Đây là bản
        nháp để bạn tự xem lại.
      </p>
      <div className={cn(!hasData && 'grayscale opacity-50')}>
        <figure aria-label="Sở thích RIASEC" className="space-y-4">
          <figcaption className="mb-4 flex flex-wrap gap-3 text-xs font-bold">
            <span className="rounded-lg border-2 border-toon-ink bg-toon-sky px-2 py-1">
              Tự kể · thang 1–3
            </span>
            <span className="rounded-lg border-2 border-toon-ink bg-toon-star px-2 py-1">
              Sau khi thử · thang 1–3
            </span>
          </figcaption>
          {items.map((item) => (
            <div key={item.key}>
              <h3 className="mb-1 font-toon font-bold">{item.label}</h3>
              {[
                { name: 'Tự kể', value: item.self, tone: 'bg-toon-sky' },
                {
                  name: 'Sau khi thử',
                  value: item.after,
                  tone: 'bg-toon-star',
                },
              ].map((bar) => (
                <div
                  key={bar.name}
                  className="mb-1 flex items-center gap-3 text-xs"
                >
                  <span className="w-24 shrink-0">{bar.name}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-toon-ink bg-toon-sand">
                    <div
                      className={cn('h-full', bar.tone)}
                      style={{
                        width:
                          bar.value === null
                            ? '0%'
                            : `${Math.max(0, Math.min(1, (bar.value - 1) / 2)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 shrink-0 tabular-nums">
                    {bar.value === null
                      ? '—'
                      : bar.value.toLocaleString('vi-VN', {
                          maximumFractionDigits: 1,
                        })}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </figure>
      </div>
      {!hasData && (
        <p className="mt-3 text-center text-sm text-toon-ink-soft">
          chơi thêm để mở
        </p>
      )}
      <ul className="mt-4 grid gap-2 text-xs text-toon-ink-soft sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.key}>
            {item.label} ·{' '}
            {item.after !== null
              ? `dựa trên ${item.count} việc`
              : 'chơi thêm để mở'}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-toon-ink-soft">
        Sau mỗi ca, bạn kể việc nào mình thích. Điểm chấm ca không quyết định
        các thanh này.
      </p>
    </Foldout>
  );
}
