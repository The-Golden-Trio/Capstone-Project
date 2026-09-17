import type { SkillBreakdown as SkillRow } from '../../api/schemas';
import { EmptyState } from '../ui/EmptyState';
import { SourceNote } from '../ui/Note';

/**
 * Điểm theo từng kỹ năng có tên.
 *
 * Bảng cấp bậc trả lời "đi được tới đâu"; bảng này trả lời "giỏi cái gì" —
 * hai câu khác nhau, và câu sau mới là thứ mang ra nói chuyện được với người
 * ngoài. Số lần đạt từng mốc hiện kèm để một kỹ năng 4 điểm từ hai lần +2
 * không bị nhầm với 4 điểm từ bốn lần trung bình.
 */
export function SkillBreakdown({ skills }: { skills: SkillRow[] }) {
  if (skills.length === 0) {
    return (
      <EmptyState icon="◇">
        Chưa có kỹ năng nào được quan sát. Điểm kỹ năng đến từ nhiệm vụ chính.
      </EmptyState>
    );
  }

  const max = Math.max(...skills.map((s) => s.points), 1);

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {skills.map((skill) => (
          <div key={skill.skill}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-[13px] text-ink-2">
                {skill.skill}
              </span>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-gold-2">
                {skill.points} điểm
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-[7px] flex-1 overflow-hidden rounded-sm bg-inset">
                <i
                  className="block h-full rounded-sm bg-gold"
                  style={{ width: `${(skill.points / max) * 100}%` }}
                />
              </span>
              <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted">
                {skill.plus2}×+2 · {skill.neutral}×0 · {skill.minus1}×−1
              </span>
            </div>
          </div>
        ))}
      </div>

      <SourceNote className="mt-3.5">
        Mỗi mốc hành vi do máy chủ chấm lại từ chính câu trả lời của bạn:
        +2 được 2 điểm, 0 được 1, −1 không được điểm nào.
      </SourceNote>
    </>
  );
}
