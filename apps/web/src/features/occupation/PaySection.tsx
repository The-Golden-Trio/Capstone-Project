import type { PayInfo } from '../../api/types';
import { Wallet } from 'lucide-react';
import { ToonDisclosure } from '@datn/ui';
import { BriefText, PaperSection, compactDisclosure } from './Parts';
import { formatPay, formatYears } from './model';

export function PaySection({
  pay,
  index,
}: {
  pay: PayInfo | null;
  index?: number;
}) {
  const max = Math.max(
    1,
    pay?.high ?? 0,
    pay?.median ?? 0,
    pay?.low ?? 0,
    ...(pay?.byYears.map((p) => p.median) ?? []),
  );
  return (
    <PaperSection
      id="luong"
      title="Lương"
      index={index}
      icon={<Wallet size={20} />}
    >
      {!pay ? (
        <p className="text-sm text-toon-ink-faint">
          Chưa có số liệu lương đủ tin cậy.
        </p>
      ) : (
        <>
          <p className="text-sm font-semibold text-toon-ink-soft">
            {pay.basisLabel}
          </p>
          <dl className="grid grid-cols-3 divide-x-[1.5px] divide-toon-ink/12 rounded-[14px] bg-toon-sand/40">
            {(
              [
                ['Thấp', pay.low],
                ['Trung vị', pay.median],
                ['Cao', pay.high],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="min-w-0 px-3 py-3 sm:px-4">
                <dt className="text-xs font-bold text-toon-ink-faint">
                  {label}
                </dt>
                <dd className="mt-1 break-words font-toon text-base font-extrabold sm:text-lg">
                  {formatPay(value)}
                </dd>
              </div>
            ))}
          </dl>
          {pay.low !== null && pay.high !== null && (
            <div
              role="img"
              aria-label={`Khoảng lương: ${formatPay(pay.low)} đến ${formatPay(pay.high)}; trung vị ${formatPay(pay.median)}`}
              className="relative h-5 rounded-full border-2 border-toon-ink bg-toon-sand"
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
            // Lương theo số năm kinh nghiệm là một chuỗi: luôn mở, đọc từ trên xuống.
            <div>
              <h3 className="mb-3 font-toon text-base font-bold">
                Theo kinh nghiệm
              </h3>
              <ul className="space-y-3">
                {pay.byYears.map((p) => (
                  <li key={p.years}>
                    <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                      <span>{formatYears(p.years)}</span>
                      <span className="font-bold">{formatPay(p.median)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-toon-sand">
                      <div
                        className="h-full bg-toon-sky-deep"
                        style={{ width: `${(p.median / max) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-toon-ink-faint">
            Nguồn: {pay.source} · Dữ liệu {pay.dataYear}
          </p>
          {pay.note && <BriefText text={pay.note} />}
          {pay.publicSector && (
            <ToonDisclosure
              summary={pay.publicSector.label}
              className={compactDisclosure}
            >
              <p className="text-sm">
                {formatPay(pay.publicSector.low)} –{' '}
                {formatPay(pay.publicSector.high)}. Nguồn:{' '}
                {pay.publicSector.source}.
              </p>
            </ToonDisclosure>
          )}
        </>
      )}
    </PaperSection>
  );
}
