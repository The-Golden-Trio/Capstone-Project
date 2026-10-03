import type { Scenario } from '@datn/game-core';

/**
 * Cảnh này đang đo cái gì.
 *
 * Bộ dữ liệu chia sẵn `skills_hard` và `skills_soft`, và mỗi mốc quan sát còn
 * gắn `skill_type`. Hiện ra hai màu khác nhau thì người chơi biết mình đang
 * được nhìn ở khía cạnh nào — kỹ thuật hay cách làm việc với người.
 *
 * Nói trước như vậy không phải lộ đáp án: mốc hành vi vẫn phụ thuộc vào việc
 * trả lời ra sao, chỉ là người chơi không còn bị chấm trong bóng tối.
 */
export function SkillChips({ scenario }: { scenario: Scenario }) {
  const { skills_hard, skills_soft } = scenario.context;
  if (skills_hard.length === 0 && skills_soft.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.11em] text-muted">
        Cảnh này nhìn vào
      </p>
      <div className="flex flex-wrap gap-1.5">
        {skills_hard.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-skill-hard-soft px-2.5 py-1 font-mono text-[10px] text-skill-hard"
          >
            {skill}
          </span>
        ))}
        {skills_soft.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-skill-soft-soft px-2.5 py-1 font-mono text-[10px] text-skill-soft"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
