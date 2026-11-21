import { profile, shift } from '@datn/game-core';
import type {
  CatalogueOccupation,
  LevelSummary,
  OccupationProfile,
} from '../types';
import { context, loadProfile, seedsFor } from './data';
import type { Player, SavedRun } from './store';
export const stateOf = (run: SavedRun) =>
  shift.fold(context(run.taskId), run.events);
export const completed = (p: Player, code: string, band: string): boolean => {
  const tasks = seedsFor(code, band);
  return (
    tasks.length > 0 &&
    tasks.every((t) =>
      p.runs.some((r) => r.taskId === t.id && stateOf(r).ended),
    )
  );
};
export function gateOpen(
  p: Player,
  gate: CatalogueOccupation['gate'],
): boolean {
  return (
    gate.kind === 'OPEN' ||
    p.runs.some((r) => {
      if (!stateOf(r).ended) return false;
      const seed = context(r.taskId).seed;
      const code = seed.level_ref.slice(0, seed.level_ref.lastIndexOf('.'));
      const band = Number(seed.level_ref.split('.').slice(-1)[0]?.slice(1));
      return (
        gate.roles.some((g) => g.code === code) &&
        band >= Number(gate.band.slice(1))
      );
    })
  );
}
export function conditions(
  p: Player,
  occupation: OccupationProfile,
  level: LevelSummary,
) {
  const previous = occupation.levels[level.levelNo - 2];
  return [
    ...(previous
      ? [
          {
            label: 'Xong tất cả màn chính ở cấp trước',
            met: completed(p, occupation.code, previous.band),
          },
        ]
      : []),
    ...Object.entries(level.requirement).map(([id, tier]) => {
      const skill = p.skills.find((s) => s.id === id);
      return {
        label: `${profile.SOFT_SKILL_GROUPS.find((g) => g.id === id)?.short ?? id} bậc ${tier}`,
        met:
          profile.tierProgress(skill?.points ?? 0, skill?.reachedTier ?? 0)
            .tier >= (tier ?? 0),
      };
    }),
  ];
}
export function overlay(
  p: Player | null,
  occupation: OccupationProfile,
): OccupationProfile {
  if (!p) return occupation;
  occupation.levels = occupation.levels.map((level) => {
    const enrol = p.enrolments.find(
      (e) => e.code === occupation.code && e.levelNo === level.levelNo,
    );
    const done = completed(p, occupation.code, level.band);
    const gate = gateOpen(p, occupation.gate);
    const unmet = conditions(p, occupation, level).filter((c) => !c.met);
    return {
      ...level,
      access: done
        ? 'COMPLETED'
        : enrol
          ? 'ENROLLED'
          : gate && !unmet.length
            ? 'OPEN'
            : 'LOCKED',
      enrolmentId: enrol?.id ?? null,
      lockedReason:
        done || enrol || (gate && !unmet.length)
          ? null
          : !gate && occupation.gate.kind === 'PREREQUISITE'
            ? `Cần xong cấp ${occupation.gate.band} ở một nghề đi trước: ${occupation.gate.roles.map((r) => r.name).join(', ')}`
            : unmet.map((c) => c.label).join('; '),
    };
  });
  return occupation;
}
export async function myOccupation(
  p: Player | null,
  code: string,
): Promise<CatalogueOccupation['my']> {
  const fresh: CatalogueOccupation['my'] = {
    status: 'NEW',
    currentLevel: null,
    highestCompleted: null,
  };
  if (!p) return fresh;
  const shown = p.showcase?.occupations[code];
  if (shown) return { ...shown };
  const enrolments = p.enrolments.filter((e) => e.code === code);
  const runs = p.runs.filter((r) =>
    context(r.taskId).seed.level_ref.startsWith(`${code}.`),
  );
  if (!enrolments.length && !runs.length) return fresh;
  // Chỉ tải hồ sơ nghề đã chạm tới; catalogue mới không tải cả 221 chunk.
  const occupation = await loadProfile(code);
  const done = occupation.levels.filter((l) => completed(p, code, l.band));
  const touched = [
    ...enrolments.map((e) => e.levelNo),
    ...runs.flatMap((r) => {
      const ref = context(r.taskId).seed.level_ref;
      return occupation.levels
        .filter((l) => `${code}.${l.band}` === ref)
        .map((l) => l.levelNo);
    }),
  ];
  return {
    status: done.length === occupation.levels.length ? 'COMPLETED' : 'PLAYING',
    currentLevel: touched.length ? Math.max(...touched) : null,
    highestCompleted: done.length
      ? Math.max(...done.map((l) => l.levelNo))
      : null,
  };
}
