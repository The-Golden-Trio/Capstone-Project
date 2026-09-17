import { bandLabel, formatVnd, type Role } from '@datn/game-core';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Note, SourceNote } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import { cx } from '../../lib/cx';

/** "Thu nhập": bảng lương theo cấp bậc và lý do người trong nghề hay nghỉ. */
export function PayTab({ role, band }: { role: Role; band: string }) {
  return (
    <>
      <div className="mb-3.5 overflow-x-auto rounded-[10px] border border-line bg-surf">
        <table className="w-full min-w-[440px] border-collapse text-[13.5px]">
          <thead>
            <tr>
              {['Cấp bậc', 'Tên gọi', 'Lương TB', 'Nguồn'].map((head, i) => (
                <th
                  key={head}
                  className={cx(
                    'whitespace-nowrap border-b border-line bg-panel px-4 py-[11px] font-mono text-[10px] font-semibold uppercase tracking-[0.09em] text-muted',
                    i === 2 ? 'text-right' : 'text-left',
                  )}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {role.salary_by_band.map((row) => (
              <tr
                key={row.band}
                className={cx(row.band === band && 'bg-gold-soft')}
              >
                <td className="border-b border-line-2 px-4 py-[11px] align-middle text-ink-2">
                  <b className="font-semibold text-ink">{row.band}</b>
                </td>
                <td className="border-b border-line-2 px-4 py-[11px] align-middle text-ink-2">
                  {row.label ?? bandLabel(row.band)}
                </td>
                <td className="border-b border-line-2 px-4 py-[11px] text-right align-middle font-mono text-[12.5px] tabular-nums text-ink-2">
                  {formatVnd(row.salary_avg)}
                </td>
                <td className="border-b border-line-2 px-4 py-[11px] align-middle">
                  <Pill tone={row.evidence_level === 'A_VERIFIED' ? 'good' : 'neutral'}>
                    {row.evidence_level ?? '—'}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {role.salary_note && <Note className="mb-3.5">{role.salary_note}</Note>}

      {role.reasons_to_leave.length > 0 && (
        <Card>
          <CardHeader title="Người làm nghề này hay nghỉ vì">
            {role.work_life_evidence && (
              <Pill tone="good">{role.work_life_evidence}</Pill>
            )}
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-[7px]">
              {role.reasons_to_leave.map((reason) => (
                <div
                  key={reason.label}
                  className="grid items-center gap-[11px] [grid-template-columns:1fr_84px_44px]"
                >
                  <span className="text-[12.5px] text-ink-2">{reason.label}</span>
                  <span className="h-[7px] overflow-hidden rounded-sm bg-inset">
                    <i
                      className="block h-full rounded-sm bg-gold"
                      style={{ width: `${Math.min(100, reason.pct * 3)}%` }}
                    />
                  </span>
                  <span className="text-right font-mono text-[10.5px] tabular-nums text-ink-2">
                    {reason.pct}%
                  </span>
                </div>
              ))}
            </div>
            <SourceNote className="mt-3.5">
              Tự đánh giá bởi chính người làm nghề tại VN, n=1.839 · khảo sát
              ITviec 2025-2026
            </SourceNote>
          </CardBody>
        </Card>
      )}
    </>
  );
}
