import { useState } from 'react';
import type { EvidenceView, RunHistoryItem } from '../../api/schemas';
import { cx } from '../../lib/cx';
import { EmptyState } from '../ui/EmptyState';
import { Pill } from '../ui/Pill';

const ENDING_TONE: Record<string, 'good' | 'signal' | 'gold' | 'neutral'> = {
  GOOD: 'good',
  BAD: 'signal',
  SECRET: 'gold',
  PARTIAL: 'neutral',
};

const ANCHOR_STYLE: Record<string, string> = {
  '+2': 'text-good',
  '0': 'text-muted',
  '-1': 'text-signal',
};

function EvidenceRow({ evidence }: { evidence: EvidenceView }) {
  return (
    <div className="mb-3 border-l-2 border-line pl-3">
      <div className="mb-0.5 flex flex-wrap items-baseline gap-2">
        <span
          className={cx(
            'font-mono text-[11px] font-bold',
            ANCHOR_STYLE[evidence.anchor],
          )}
        >
          {evidence.anchor}
        </span>
        <span className="font-mono text-[10.5px] text-muted">
          {evidence.skill}
        </span>
        {evidence.capped && <Pill tone="gold">đã xem gợi ý</Pill>}
        {evidence.timeout && <Pill tone="signal">hết giờ</Pill>}
      </div>
      <div className="text-[13px] leading-relaxed text-ink-2">
        {evidence.why}.
      </div>
      {evidence.quote && (
        <div className="mt-1 text-[12.5px] italic leading-relaxed text-muted [overflow-wrap:anywhere]">
          “{evidence.quote.slice(0, 160)}
          {evidence.quote.length > 160 ? '…' : ''}”
        </div>
      )}
    </div>
  );
}

/**
 * Lịch sử các lượt chơi đã hoàn thành.
 *
 * Trước đây phần tổng kết này hiện đúng một lần ở màn kết thúc rồi mất. Giữ
 * lại được là vì máy chủ chấm và lưu bằng chứng, nên đây cũng là chỗ đối
 * chiếu: điểm ở bảng kỹ năng đến từ đúng những dòng này.
 */
export function RunHistory({ runs }: { runs: RunHistoryItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (runs.length === 0) {
    return (
      <EmptyState icon="◷">
        Chưa hoàn thành nhiệm vụ chính nào. Đây là nơi duy nhất sinh ra điểm kỹ
        năng.
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {runs.map((run) => {
        const open = openId === run.id;
        return (
          <div
            key={run.id}
            className="overflow-hidden rounded-[10px] border border-line-2 bg-panel"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : run.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Pill tone={ENDING_TONE[run.endingType ?? ''] ?? 'neutral'}>
                    {run.endingType ?? '—'}
                  </Pill>
                  <span className="font-mono text-[10.5px] text-muted">
                    {run.roleCode} · {run.band}
                  </span>
                </div>
                <div className="truncate text-[13.5px] font-semibold text-ink">
                  {run.scenarioTitle}
                </div>
                <div className="mt-0.5 font-mono text-[10.5px] text-muted">
                  {run.completedAt?.slice(0, 10) ?? '—'} ·{' '}
                  {run.evidence.length} mốc hành vi
                </div>
              </div>

              <span className="shrink-0 text-right">
                <span className="block font-mono text-[13px] font-bold tabular-nums text-gold-2">
                  {run.pointsAwarded > 0 ? `+${run.pointsAwarded}` : '0'}
                </span>
                <span className="block font-mono text-[9.5px] text-muted">
                  {run.pointsAwarded > 0 ? 'điểm' : 'chơi lại'}
                </span>
              </span>

              <span
                className="shrink-0 font-mono text-[11px] text-muted"
                aria-hidden="true"
              >
                {open ? '▲' : '▼'}
              </span>
            </button>

            {open && (
              <div className="border-t border-line-2 px-4 py-3">
                {run.evidence.map((evidence, index) => (
                  <EvidenceRow
                    key={`${evidence.activityId}-${evidence.skill}-${index}`}
                    evidence={evidence}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
