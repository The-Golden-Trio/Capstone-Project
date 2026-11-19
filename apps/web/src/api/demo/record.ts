import { profile } from '@datn/game-core';
import type {
  PlayerRecord,
  EarnedKeyword,
  RiasecAxis,
  LikeLevel,
} from '../types';
import { baseCatalogue, context, loadProfile, runPathLabel } from './data';
import { achievementCatalogue } from './content';
import { conditions, stateOf } from './rules';
import { islandOf } from './progress';
import { summaryOf } from './play';
import type { Player } from './store';
export async function buildRecord(p: Player): Promise<PlayerRecord> {
  const ended = p.runs.filter((r) => stateOf(r).ended);
  // Đảm bảo các ca vừa kết thúc đã có điểm mẫu, dù người chơi chưa mở tổng kết.
  for (const r of ended) await summaryOf(p, r);
  const playing = await Promise.all(
    p.enrolments.map(async (e) => {
      const island = await islandOf(p, e);
      const occupation = await loadProfile(e.code),
        next = occupation.levels[e.levelNo];
      return {
        occupationCode: e.code,
        occupationName: occupation.name,
        group: occupation.group,
        regionId: occupation.regionId,
        levelNo: e.levelNo,
        levelTitle: island.level.title,
        enrolmentId: e.id,
        done: island.progress.done,
        total: island.progress.total,
        nextLevel: next
          ? {
              levelNo: next.levelNo,
              conditions: conditions(p, occupation, next),
            }
          : null,
        lastPlayedAt:
          p.runs.filter((r) => r.enrolmentId === e.id).slice(-1)[0]?.at ?? e.at,
      };
    }),
  );
  const keywords = new Map<string, EarnedKeyword>();
  for (const r of ended) {
    const seed = context(r.taskId).seed;
    const code = seed.level_ref.slice(0, seed.level_ref.lastIndexOf('.'));
    const o = baseCatalogue.occupations.find((o) => o.code === code)!;
    for (const k of r.grade?.keywordsGained ?? []) {
      const prev = keywords.get(k.id);
      if (!prev || prev.level < k.level)
        keywords.set(k.id, { ...k, group: o.group, regionId: o.regionId });
    }
  }
  const taps = Object.fromEntries(
    profile.RIASEC_AXES.map((axis) => [axis, [] as LikeLevel[]]),
  ) as Record<RiasecAxis, LikeLevel[]>;
  const minutesByRegion: PlayerRecord['stats']['minutesByRegion'] = {};
  const tried = new Set<string>(),
    groups = new Set<string>();
  const favourites: Array<{ text: string; likes: number }> = [];
  let minutes = 0;
  for (const r of ended) {
    const seed = context(r.taskId).seed;
    const code = seed.level_ref.slice(0, seed.level_ref.lastIndexOf('.'));
    const o = baseCatalogue.occupations.find((o) => o.code === code)!;
    tried.add(code);
    groups.add(o.group);
    const duration = Math.max(1, Math.round(seed.clock.budget / 2));
    minutes += duration;
    minutesByRegion[o.regionId] = (minutesByRegion[o.regionId] ?? 0) + duration;
    const answers = Object.values(r.reflection ?? {});
    if (profile.isStraightLined(answers)) continue;
    const summary = await summaryOf(p, r);
    for (const prompt of summary.reflection.prompts) {
      const tap = r.reflection?.[prompt.key];
      if (!tap) continue;
      // Contract không có trục trên ReflectionPrompt; demo gán theo kiểu hành động
      // thực sự đã làm (giao tiếp S, tài liệu/phân tích I, điều phối E, còn lại C).
      let axis: RiasecAxis = 'I';
      if (prompt.key.startsWith('action:')) {
        const action = summary.story.actions.filter((a) => !a.cut)[
          Number(prompt.key.split(':')[1])
        ];
        const kind = seed.actions.find((a) => a.label === action?.label)?.kind;
        axis =
          kind === 'talk' || kind === 'message'
            ? 'S'
            : kind === 'meeting'
              ? 'E'
              : kind === 'write' || kind === 'rewrite'
                ? 'C'
                : 'I';
      }
      taps[axis].push(tap);
      if (tap === 3) favourites.push({ text: prompt.recap, likes: tap });
    }
  }
  const extra = p.showcase;
  if (extra) {
    for (const [axis, list] of Object.entries(extra.taps))
      taps[axis as RiasecAxis].push(...(list ?? []));
    for (const k of extra.keywords)
      if (!keywords.has(k.id)) keywords.set(k.id, k);
    for (const [region, m] of Object.entries(extra.minutesByRegion)) {
      minutesByRegion[region as keyof typeof minutesByRegion] =
        (minutesByRegion[region as keyof typeof minutesByRegion] ?? 0) +
        (m ?? 0);
      minutes += m ?? 0;
    }
    for (const code of Object.keys(extra.occupations)) tried.add(code);
    for (const g of extra.groups) groups.add(g);
    favourites.push(...extra.favourites);
  }
  const counts = {
    kham_pha: tried.size,
    thanh_thao: p.skills.filter(
      (s) => profile.keptTier(s.points, s.reachedTier) >= 1,
    ).length,
    tien_bo: ended.length,
    tu_soi: ended.filter(
      (r) => r.reflection && Object.keys(r.reflection).length,
    ).length,
    kien_tri: new Set(ended.map((r) => r.at.slice(0, 10))).size,
  };
  if (extra)
    for (const [kind, n] of Object.entries(extra.counts))
      counts[kind as keyof typeof counts] = Math.max(
        counts[kind as keyof typeof counts],
        n ?? 0,
      );
  return {
    softSkills: p.skills,
    riasec: {
      self: p.quiz?.selfReported ?? null,
      afterTrying: Object.fromEntries(
        profile.RIASEC_AXES.map((axis) => [
          axis,
          { mean: profile.axisMean(taps[axis]), count: taps[axis].length },
        ]),
      ) as PlayerRecord['riasec']['afterTrying'],
    },
    goals: p.goals,
    interests: p.interests,
    playing,
    keywords: [...keywords.values()],
    stats: {
      scenarios: Math.max(ended.length, extra?.scenarios ?? 0),
      minutes,
      occupationsTried: tried.size,
      occupationsTotal: baseCatalogue.occupations.length,
      groupsVisited: groups.size,
      minutesByRegion,
      // Cùng một việc thích ở nhiều ca chỉ hiện một lần.
      favouriteTasks: [
        ...new Map(favourites.map((f) => [f.text, f])).values(),
      ].slice(0, 5),
    },
    achievements: achievementCatalogue.map(({ threshold, ...a }) => ({
      ...a,
      earnedAt:
        counts[a.kind] >= threshold ? (ended.slice(-1)[0]?.at ?? null) : null,
      pinned: p.pinned.includes(a.code),
    })),
    journal: ended.map((r, index) => ({
      runId: r.id,
      date: r.at,
      path: runPathLabel(r.taskId),
      index: index + 1,
      title: context(r.taskId).seed.title,
      score: r.grade?.score ?? null,
      deltas: (r.grade?.softSkills ?? []).map((s) => ({
        id: s.id,
        delta: s.delta,
      })),
    })),
  };
}
