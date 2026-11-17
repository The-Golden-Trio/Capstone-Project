import type { PayInfo } from '../../api/types';
import { BriefText, PaperSection } from './Parts';
import { formatPay, formatYears } from './model';

export function PaySection({ pay }: { pay: PayInfo | null }) {
  const max = Math.max(
    1,
    pay?.high ?? 0,
    pay?.median ?? 0,
    pay?.low ?? 0,
    ...(pay?.byYears.map((p) => p.median) ?? []),
  );
  return (
    <PaperSection id="luong" title="Lương">
      {!pay ? (
        <p className="text-sm text-toon-ink-faint">
          Chưa có số liệu lương đủ tin cậy.
        </p>
      ) : (
        <>
          <p className="text-sm font-semibold text-toon-ink-soft">
            {pay.basisLabel}
          </p>
          <dl className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ['Thấp', pay.low],
                ['Trung vị', pay.median],
                ['Cao', pay.high],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border-2 border-toon-ink bg-toon-cream p-3"
              >
                <dt className="text-xs font-bold text-toon-ink-faint">
                  {label}
                </dt>
                <dd className="mt-1 font-toon text-lg font-extrabold">
                  {formatPay(value)}
                </dd>
              </div>
            ))}
          </dl>
          {pay.low !== null && pay.high !== null && (
            <div
              role="img"
              aria-label={`Khoảng lương: ${formatPay(pay.low)} đến ${formatPay(pay.high)}; trung vị ${formatPay(pay.median)}`}
              className="relative h-6 rounded-full border-[3px] border-toon-ink bg-toon-sand"
            >
              <span
                className="absolute inset-y-0 rounded-full border-x-2 border-toon-ink bg-toon-sky"
                style={{
                  left: `${(pay.low / max) * 100}%`,
                  width: `${(Math.max(0, pay.high - pay.low) / max) * 100}%`,
                }}
              />
              {pay.median !== null && (
                <span
                  className="absolute -top-2 h-8 w-2 rounded-full border-2 border-toon-ink bg-toon-star"
                  style={{
                    left: `min(calc(100% - 8px), ${(pay.median / max) * 100}%)`,
                  }}
                />
              )}
            </div>
          )}
          {pay.byYears.length > 0 && (
            <details>
              <summary className="w-fit cursor-pointer rounded-md font-bold focus-visible:shadow-toon-focus">
                Theo kinh nghiệm
              </summary>
              <ul className="mt-4 space-y-4">
                {pay.byYears.map((p) => (
                  <li key={p.years}>
                    <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                      <span>{formatYears(p.years)}</span>
                      <span className="font-bold">{formatPay(p.median)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border-2 border-toon-ink bg-toon-sand">
                      <div
                        className="h-full bg-toon-sky-deep"
                        style={{ width: `${(p.median / max) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <p className="text-xs text-toon-ink-faint">
            Nguồn: {pay.source} · Dữ liệu {pay.dataYear}
          </p>
          {pay.note && <BriefText text={pay.note} />}
          {pay.publicSector && (
            <details>
              <summary className="w-fit cursor-pointer rounded-md text-sm font-bold focus-visible:shadow-toon-focus">
                {pay.publicSector.label}
              </summary>
              <p className="mt-2 text-sm">
                {formatPay(pay.publicSector.low)} –{' '}
                {formatPay(pay.publicSector.high)}. Nguồn:{' '}
                {pay.publicSector.source}.
              </p>
            </details>
          )}
        </>
      )}
    </PaperSection>
  );
}
