import { profile } from '@datn/game-core';
import { ApiError, type ProgressService } from '../port';
import type { IslandMap, OnboardSlide } from '../types';
import { context, loadProfile, seedsFor } from './data';
import { companies } from './content';
import { overlay, stateOf } from './rules';
import {
  now,
  player,
  save,
  service,
  uid,
  type Enrolment,
  type Player,
} from './store';
import { buildRecord } from './record';
export async function islandOf(p: Player, e: Enrolment): Promise<IslandMap> {
  const occupation = overlay(p, await loadProfile(e.code));
  const level = occupation.levels[e.levelNo - 1];
  const tasks = seedsFor(e.code, level.band);
  const ctx = tasks[0] ? context(tasks[0].id) : null;
  const mainQuests = tasks.map((t) => {
    const runs = p.runs.filter((r) => r.taskId === t.id);
    const latest = runs.slice(-1)[0];
    const done = runs.some((r) => stateOf(r).ended);
    return {
      taskId: t.id,
      title: t.title,
      situation: t.situation,
      goal: t.goal,
      // Độ dài ca trong truyện: ngân sách điểm × số phút của 1 điểm (A1).
      minutes: t.clock.budget * (context(t.id).pack.minutes_per_point ?? 5),
      status: done
        ? ('DONE' as const)
        : latest
          ? ('IN_PROGRESS' as const)
          : ('NEW' as const),
      runId: latest?.id ?? null,
      bestScore: runs.reduce<number | null>(
        (best, r) =>
          r.grade?.score != null ? Math.max(best ?? 0, r.grade.score) : best,
        null,
      ),
    };
  });
  const slides: OnboardSlide[] = [
    {
      title: 'Chào mừng',
      frame: 'Culture',
      lines: [
        `Chào mừng bạn đến ${e.company.name}.`,
        e.company.blurb,
        ctx?.pack.team ??
          'Mọi người chia sẻ tiến độ và hỗ trợ nhau khi gặp việc mới.',
      ],
    },
    {
      title: 'Một ngày ở đây',
      frame: 'Xem trước công việc',
      lines: level.tasks.length ? level.tasks : [occupation.summary],
    },
    {
      title: 'Những người bạn sẽ gặp',
      frame: 'Connection',
      lines: ctx
        ? ctx.seed.cast.map((c) => `${c.name}: ${c.relation}`)
        : [
            'Người hướng dẫn giúp bạn làm quen với công việc.',
            'Đồng đội và người nhận kết quả cần bạn cập nhật tiến độ rõ ràng.',
          ],
    },
    {
      title: 'Vai của bạn',
      frame: 'Clarification',
      lines: [
        level.title,
        level.coreOutput ??
          ctx?.pack.level_scope ??
          'Làm trong phạm vi được giao và hỏi khi vượt quyền quyết định.',
        `Trọng tâm: ${level.focus.map((id) => profile.softSkillGroup(id).short).join(', ')}.`,
        `Sau cấp này: ${level.outputKeywords.map((k) => k.name).join(', ') || 'Làm quen với cách làm việc của nghề.'}`,
      ],
    },
    {
      title: 'Quy định cần giữ',
      frame: 'Compliance',
      lines: ctx?.pack.rules.map((r) => r.text) ?? [
        'Giữ kín thông tin cá nhân và dữ liệu của tổ chức.',
        'Hỏi người phụ trách trước khi làm việc vượt quyền.',
        'Báo sớm khi gặp sai sót hoặc không kịp tiến độ.',
      ],
    },
    {
      title: 'Điều nên biết trước',
      frame: 'Xem trước công việc',
      lines: occupation.downsides,
    },
  ];
  return {
    enrolmentId: e.id,
    occupationCode: e.code,
    occupationName: occupation.name,
    regionId: occupation.regionId,
    level,
    company: e.company,
    onboard: {
      slides,
      hrOpen: `Chào bạn, mình sẽ dẫn bạn làm quen với ${e.company.name}.`,
      hrClose: 'Bạn có thể xem lại phần giới thiệu bất cứ lúc nào.',
      seen: e.seen,
    },
    mainQuests,
    sideQuests: [],
    progress: {
      done: mainQuests.filter((q) => q.status === 'DONE').length,
      total: mainQuests.length,
    },
  };
}
export const progress: ProgressService = {
  enrol: service(async (code, levelNo) => {
    const p = player(),
      occupation = overlay(p, await loadProfile(code));
    const level = occupation.levels.find((l) => l.levelNo === levelNo);
    if (!level)
      throw new ApiError(404, 'LEVEL_NOT_FOUND', 'Không tìm thấy cấp này.');
    const existing = p.enrolments.find(
      (e) => e.code === code && e.levelNo === levelNo,
    );
    if (existing) return islandOf(p, existing);
    if (level.access === 'LOCKED')
      throw new ApiError(
        403,
        'LEVEL_LOCKED',
        level.lockedReason ?? 'Cấp này chưa mở.',
      );
    const envs = occupation.environments;
    const total = envs.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * total;
    const env = envs.find((e) => (roll -= e.weight) < 0) ?? envs[0];
    const options = companies(env?.name ?? 'Văn phòng');
    const e: Enrolment = {
      id: uid(),
      code,
      levelNo,
      band: level.band,
      company: options[Math.floor(Math.random() * options.length)],
      seen: false,
      at: now(),
    };
    p.enrolments.push(e);
    save();
    return islandOf(p, e);
  }),
  island: service((id) => {
    const p = player(),
      e = p.enrolments.find((e) => e.id === id);
    if (!e)
      throw new ApiError(
        404,
        'ENROLMENT_NOT_FOUND',
        'Không tìm thấy lần vào nghề này.',
      );
    return islandOf(p, e);
  }),
  markOnboardSeen: service((id) => {
    const e = player().enrolments.find((e) => e.id === id);
    if (!e)
      throw new ApiError(
        404,
        'ENROLMENT_NOT_FOUND',
        'Không tìm thấy lần vào nghề này.',
      );
    e.seen = true;
    save();
  }),
  record: service(() => buildRecord(player())),
  updateGoals: service((goals) => {
    const p = player();
    p.goals = goals;
    if (p.quiz) p.quiz.goals = goals;
    save();
  }),
  pinAchievements: service((codes) => {
    player().pinned = [...new Set(codes)].slice(0, 3);
    save();
  }),
};
