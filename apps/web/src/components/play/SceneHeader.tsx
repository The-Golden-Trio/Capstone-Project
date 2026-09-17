import type { Scenario } from '@datn/game-core';
import { Crest } from '../game/Crest';

/** Kiểu tình huống, dịch sang lời người đọc được. */
const ARCHETYPE_LABEL: Record<string, string> = {
  S_INCIDENT: 'Sự cố',
  S_EXEC: 'Việc thường ngày',
  S_CONFLICT: 'Va chạm',
  S_AMBIGUITY: 'Yêu cầu mơ hồ',
  S_DEADLINE: 'Chạy hạn',
};

/**
 * Đầu màn chơi: bạn là ai, đang ở đâu, và đây là chuyện gì.
 *
 * Trước đây chỗ này chỉ có tên kịch bản và một cái nhãn ghi "prioritizing".
 * Ba dữ liệu dưới đây vốn đã nằm sẵn trong bộ dữ liệu mà chưa bao giờ được
 * hiện ra: `job.title_vn`, `job.years_experience`, `context.scenario_archetype`.
 */
export function SceneHeader({ scenario }: { scenario: Scenario }) {
  const { job, context } = scenario;
  const archetype =
    ARCHETYPE_LABEL[context.scenario_archetype] ?? context.scenario_archetype;

  return (
    <header className="mb-4 rounded-[12px] border border-line bg-[var(--accent-soft)] p-4">
      <div className="flex items-start gap-3.5">
        <Crest seed={job.role_code} size={46} active />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--accent)]/15 px-2 py-[3px] font-mono text-[9.5px] uppercase tracking-[0.11em] text-[var(--accent)]">
              {archetype}
            </span>
            <span className="font-mono text-[10px] text-muted">
              {context.estimated_minutes} phút
            </span>
          </div>

          <h1 className="text-balance font-display text-[19px] font-semibold leading-snug">
            {scenario.scenario_title}
          </h1>

          {/* Vai của người chơi trong cảnh này — "bạn đang là ai". */}
          <p className="m-0 mt-1.5 text-[12.5px] leading-snug text-ink-2">
            Bạn đang là <b className="font-semibold text-[var(--accent)]">
              {job.title_vn ?? job.role_name_vn}
            </b>
            {job.years_experience && ` · ${job.years_experience} năm kinh nghiệm`}
            {` · ${job.band}`}
          </p>
        </div>
      </div>
    </header>
  );
}
