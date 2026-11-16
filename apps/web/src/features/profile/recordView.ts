import { profile } from '@datn/game-core';
import type { SoftSkillState } from '../../api/types';

/** Giữ đúng thứ tự thời gian, kể cả khi API trả sự kiện mới nhất trước. */
export const chronological = (history: SoftSkillState['history']) =>
  [...history].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
export function skillEvidence(
  skills: SoftSkillState[],
  direction: 'positive' | 'negative',
) {
  return skills
    .filter((skill) => skill.scenarios >= profile.STRENGTH_MIN_SCENARIOS)
    .flatMap((skill) => {
      const events = chronological(skill.history).filter((event) =>
        direction === 'positive' ? event.delta > 0 : event.delta < 0,
      );
      return events.length ? [{ id: skill.id, events }] : [];
    });
}
/** Ô cuối có thể chưa đủ 30 phút; không làm mất thời gian lẻ. */
export function timeCells(minutes: number) {
  const safe = Number.isFinite(minutes) ? Math.max(0, minutes) : 0;
  return Array.from({ length: Math.ceil(safe / 30) }, (_, index) =>
    Math.min(30, safe - index * 30),
  );
}

/** Trục radar dừng ở 5, giữ bậc đã đạt dù điểm bị trừ. */
export function radarValue(
  skill: Pick<SoftSkillState, 'points' | 'reachedTier'>,
) {
  const progress = profile.tierProgress(skill.points, skill.reachedTier);
  return Math.min(
    profile.MAX_TIER,
    progress.tier + (progress.tier < profile.MAX_TIER ? progress.ratio : 0),
  );
}

/** Rải đủ một sao cho mỗi nghề trong một cụm, giữ vị trí ổn định giữa các lần render. */
export function constellationPoints(count: number): Array<[number, number]> {
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const radius = Math.sqrt((index + 0.5) / count);
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    return [
      110 + Math.cos(angle) * radius * 90,
      80 + Math.sin(angle) * radius * 56,
    ];
  });
}
