import { Panel, PanelHeader } from '@datn/ui';
import type { PayInfo } from '../../api/types';
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
    <Panel id="luong" className="scroll-mt-36">
      <PanelHeader title="Lương" description={pay?.basisLabel} />
      {!pay ? (
        <p className="text-sm text-ink-muted">
          Chưa có số liệu lương đủ tin cậy.
        </p>
      ) : (
        <div className="space-y-5">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                ['Thấp', pay.low],
                ['Trung vị', pay.median],
                ['Cao', pay.high],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-night-900/60 p-3">
                <dt className="text-xs text-ink-faint">{label}</dt>
                <dd className="mt-1 text-base font-semibold">
                  {formatPay(value)}
                </dd>
              </div>
            ))}
          </dl>
          {pay.low !== null && pay.high !== null && (
            <div
              role="img"
              aria-label={`Khoảng lương: ${formatPay(pay.low)} đến ${formatPay(pay.high)}; trung vị ${formatPay(pay.median)}`}
              className="relative h-3 rounded-full bg-night-950"
            >
              <span
                className="absolute h-3 rounded-full bg-info/50"
                style={{
                  left: `${(pay.low / max) * 100}%`,
                  width: `${(Math.max(0, pay.high - pay.low) / max) * 100}%`,
                }}
              />
              {pay.median !== null && (
                <span
                  className="absolute -top-1 h-5 w-1 rounded bg-ink"
                  style={{
                    left: `min(calc(100% - 4px), ${(pay.median / max) * 100}%)`,
                  }}
                />
              )}
            </div>
          )}
          {pay.byYears.length > 0 && (
            <div>
              <h3 className="mb-3 text-base">Theo kinh nghiệm</h3>
              <ul className="space-y-3">
                {pay.byYears.map((p) => (
                  <li key={p.years} className="text-sm">
                    <div className="mb-1 flex flex-wrap justify-between gap-1">
                      <span className="text-ink-muted">
                        {formatYears(p.years)}
                      </span>
                      <span>{formatPay(p.median)}</span>
                    </div>
                    <div className="h-2 rounded bg-night-950">
                      <div
                        className="h-2 rounded bg-info/60"
                        style={{ width: `${(p.median / max) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-ink-faint">
            Nguồn: {pay.source} · Dữ liệu {pay.dataYear}
          </p>
          {pay.note && <p className="text-sm text-ink-muted">{pay.note}</p>}
          {pay.publicSector && (
            <p className="border-t border-line pt-4 text-sm text-ink-muted">
              {pay.publicSector.label}: {formatPay(pay.publicSector.low)} –{' '}
              {formatPay(pay.publicSector.high)}. Nguồn:{' '}
              {pay.publicSector.source}.
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}
