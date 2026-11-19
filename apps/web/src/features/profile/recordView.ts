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

/** Align group histories by run ID rather than by each group's array index. */
export function skillTimeline(
  skills: SoftSkillState[],
  journal: Array<{ runId: string; index: number }> = [],
) {
  const byRun = new Map<string, SoftSkillState['history'][number]>();
  for (const skill of skills)
    for (const event of chronological(skill.history))
      if (!byRun.has(event.runId)) byRun.set(event.runId, event);
  const runs = chronological([...byRun.values()]).map((event, i) => ({
    ...event,
    index: journal.find((entry) => entry.runId === event.runId)?.index ?? i + 1,
  }));
  const series = profile.SOFT_SKILL_GROUPS.map(({ id }) => {
    const events = new Map(
      chronological(skills.find((skill) => skill.id === id)?.history ?? []).map(
        (event) => [event.runId, event],
      ),
    );
    let previous: number | null = null;
    const points = runs.map((run) => {
      const event = events.get(run.runId);
      if (event) previous = event.total;
      return previous;
    });
    return { id, events, points };
  });
  return { runs, series };
}

export function historySummary(skills: SoftSkillState[]) {
  const { runs, series } = skillTimeline(skills);
  const eligible = series.filter(
    (group) => group.events.size >= profile.STRENGTH_MIN_SCENARIOS,
  );
  const positive = eligible
    .map((group) => ({
      id: group.id,
      count: [...group.events.values()].filter((event) => event.delta > 0)
        .length,
    }))
    .filter((group) => group.count > 0)
    .sort((a, b) => b.count - a.count)[0];
  const negative = eligible
    .map((group) => ({
      id: group.id,
      runIds: [...group.events.values()]
        .filter((event) => event.delta < 0)
        .map((event) => event.runId),
    }))
    .filter((group) => group.runIds.length > 0)
    .sort((a, b) => b.runIds.length - a.runIds.length)[0];
  return { count: runs.length, positive, negative };
}

export function keywordDepth(
  keywords: Array<{ group: string; level: 1 | 2 | 3 }>,
) {
  return [...new Set(keywords.map((keyword) => keyword.group))].map(
    (group) => ({
      group,
      counts: ([1, 2, 3] as const).map(
        (level) =>
          keywords.filter(
            (keyword) => keyword.group === group && keyword.level === level,
          ).length,
      ),
    }),
  );
}

export function riasecDifference(self: number | null, after: number | null) {
  return self !== null &&
    after !== null &&
    Number.isFinite(self) &&
    Number.isFinite(after)
    ? Math.round((after - self) * 10) / 10
    : null;
}
