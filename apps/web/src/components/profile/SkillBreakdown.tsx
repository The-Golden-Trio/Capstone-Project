import type { SkillType } from '@datn/game-core';
import type { SkillBreakdown as SkillRow } from '../../api/schemas';
import { cx } from '../../lib/cx';
import { EmptyState } from '../ui/EmptyState';
import { SourceNote } from '../ui/Note';

/** Nhãn, màu chữ và màu thanh cho từng loại — cùng bộ màu với `SkillChips`. */
const TYPE: Record<
  SkillType,
  { label: string; hint: string; text: string; bar: string }
> = {
  hard: {
    label: 'Kỹ năng cứng',
    hint: 'kỹ thuật, công cụ',
    text: 'text-skill-hard',
    bar: 'bg-skill-hard',
  },
  soft: {
    label: 'Kỹ năng mềm',
    hint: 'cách làm việc với người',
    text: 'text-skill-soft',
    bar: 'bg-skill-soft',
  },
};

const ORDER: SkillType[] = ['hard', 'soft'];

function SkillLine({ skill, max }: { skill: SkillRow; max: number }) {
  const tone = TYPE[skill.skillType];
  return (
    <div>
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
            className={cx('block h-full rounded-sm', tone.bar)}
            style={{ width: `${(skill.points / max) * 100}%` }}
          />
        </span>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted">
          {skill.plus2}×+2 · {skill.neutral}×0 · {skill.minus1}×−1
        </span>
      </div>
    </div>
  );
}

/**
 * Điểm theo từng kỹ năng có tên, chia hai nhóm cứng / mềm.
 *
 * Bảng cấp bậc trả lời "đi được tới đâu"; bảng này trả lời "giỏi cái gì" —
 * hai câu khác nhau, và câu sau mới là thứ mang ra nói chuyện được với người
 * ngoài. Tách cứng / mềm vì đó là hai câu chuyện khác nhau khi kể về mình:
 * "biết SQL" và "biết hỏi đúng người" không cộng chung được. Số lần đạt từng
 * mốc hiện kèm để một kỹ năng 4 điểm từ hai lần +2 không bị nhầm với 4 điểm
 * từ bốn lần trung bình.
 */
export function SkillBreakdown({ skills }: { skills: SkillRow[] }) {
  if (skills.length === 0) {
    return (
      <EmptyState icon="◇">
        Chưa có kỹ năng nào được quan sát. Điểm kỹ năng đến từ nhiệm vụ chính.
      </EmptyState>
    );
  }

  // Một thang chung cho cả hai nhóm, để thanh dài ngắn so được với nhau.
  const max = Math.max(...skills.map((s) => s.points), 1);
  const groups = ORDER.map((type) => ({
    type,
    rows: skills.filter((s) => s.skillType === type),
  })).filter((g) => g.rows.length > 0);

  return (
    <>
      <div className="flex flex-col gap-4">
        {groups.map(({ type, rows }) => {
          const tone = TYPE[type];
          const total = rows.reduce((sum, s) => sum + s.points, 0);
          return (
            <section key={type}>
              <header className="mb-2 flex items-baseline justify-between gap-3">
                <span
                  className={cx(
                    'font-mono text-[9.5px] uppercase tracking-[0.11em]',
                    tone.text,
                  )}
                >
                  {tone.label}
                  <span className="ml-1.5 normal-case tracking-normal text-muted">
                    · {tone.hint}
                  </span>
                </span>
                <span
                  className={cx(
                    'shrink-0 font-mono text-[11px] font-bold tabular-nums',
                    tone.text,
                  )}
                >
                  {total} điểm
                </span>
              </header>
              <div className="flex flex-col gap-2.5">
                {rows.map((skill) => (
                  <SkillLine key={skill.skill} skill={skill} max={max} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <SourceNote className="mt-3.5">
        Mỗi mốc hành vi do máy chủ chấm lại từ chính câu trả lời của bạn:
        +2 được 2 điểm, 0 được 1, −1 không được điểm nào. Kỹ năng nào cứng,
        kỹ năng nào mềm là do bộ dữ liệu gắn nhãn sẵn.
      </SourceNote>
    </>
  );
}
