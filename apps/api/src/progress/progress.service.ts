import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GAME,
  POINTS,
  UNLOCK_AT,
  bandLabel,
  bandsOf,
  findRole,
  hasScenario,
  isBandOpen,
  pointsByType,
  shortRoleName,
  skillTypeOf,
  type Anchor,
  type Role,
  type SkillType,
} from '@datn/game-core';
import { PrismaService } from '../prisma/prisma.service';

export interface BandProgress {
  band: string;
  label: string;
  points: number;
  /** Máy chủ quyết định, không phải giao diện. */
  unlocked: boolean;
  /** Cấp bậc này đã dựng nhiệm vụ chính chưa. */
  hasScenario: boolean;
  /** Còn thiếu bao nhiêu điểm ở cấp trước để mở cấp này. */
  pointsToUnlock: number;
  /** Người chơi đã bấm "vào học" cấp bậc này chưa. */
  enrolled: boolean;
  /** Đã hoàn thành nhiệm vụ chính ở cấp bậc này chưa. */
  completed: boolean;
}

export interface RoleProgress {
  roleCode: string;
  roleName: string;
  bands: BandProgress[];
  totalPoints: number;
}

export interface SkillBreakdown {
  skill: string;
  skillType: SkillType;
  points: number;
  plus2: number;
  neutral: number;
  minus1: number;
}

export interface TimelinePoint {
  date: string;
  points: number;
  cumulative: number;
}

export interface ProgressSummary {
  totalPoints: number;
  /** Hai phần của `totalPoints`: kỹ thuật và cách làm việc với người. */
  hardPoints: number;
  softPoints: number;
  runsCompleted: number;
  eventsPlayed: number;
  quizDone: boolean;
  roles: RoleProgress[];
  skills: SkillBreakdown[];
  timeline: TimelinePoint[];
}

/**
 * Nguồn sự thật về "cấp bậc nào đã mở".
 *
 * Giao diện cũng chạy `isBandOpen` để làm mờ những chỗ chưa tới, nhưng đó là
 * trình bày. Chỗ cấm cửa thật nằm ở đây, và `RunsService` hỏi qua hàm này
 * trước khi cho mở một màn chơi.
 */
@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /** Bảng tra (nghề, cấp bậc) -> điểm, cho một người chơi. */
  private async skillMap(userId: string): Promise<Map<string, number>> {
    const rows = await this.prisma.userBandSkill.findMany({
      where: { userId },
      select: { roleCode: true, band: true, points: true },
    });
    return new Map(rows.map((r) => [`${r.roleCode}:${r.band}`, r.points]));
  }

  private pointsAt(
    skills: Map<string, number>,
    roleCode: string,
    band: string,
  ): number {
    return skills.get(`${roleCode}:${band}`) ?? 0;
  }

  /** Người này đã mở được cấp bậc đó chưa. */
  async isUnlocked(
    userId: string,
    role: Role,
    band: string,
  ): Promise<boolean> {
    const skills = await this.skillMap(userId);
    return isBandOpen(role, band, (b) =>
      this.pointsAt(skills, role.role_code, b),
    );
  }

  /** Người này đã bấm "vào học" cấp bậc đó chưa. */
  async isEnrolled(
    userId: string,
    roleCode: string,
    band: string,
  ): Promise<boolean> {
    const row = await this.prisma.enrollment.findUnique({
      where: { userId_roleCode_band: { userId, roleCode, band } },
      select: { id: true },
    });
    return row !== null;
  }

  /** Cấp bậc kế đã mở chưa sau khi cộng điểm — để giao diện báo mừng đúng lúc. */
  async unlockedAfter(
    userId: string,
    roleCode: string,
    band: string,
  ): Promise<string | null> {
    const role = findRole(roleCode);
    if (!role) return null;

    const list = bandsOf(role);
    const next = list[list.indexOf(band) + 1];
    if (!next) return null;

    return (await this.isUnlocked(userId, role, next)) ? next : null;
  }

  /** Khoá "nghề:cấp" của những cấp bậc đã ghi danh. */
  private async enrolledKeys(userId: string): Promise<Set<string>> {
    const rows = await this.prisma.enrollment.findMany({
      where: { userId },
      select: { roleCode: true, band: true },
    });
    return new Set(rows.map((r) => `${r.roleCode}:${r.band}`));
  }

  /** Khoá "nghề:cấp" của những cấp bậc đã chơi xong nhiệm vụ chính. */
  private async completedKeys(userId: string): Promise<Set<string>> {
    const rows = await this.prisma.scenarioRun.findMany({
      where: { userId, NOT: { completedAt: null } },
      select: { roleCode: true, band: true },
    });
    return new Set(rows.map((r) => `${r.roleCode}:${r.band}`));
  }

  /**
   * Tiến trình của đúng một nghề — kể cả nghề chưa từng chạm tới.
   *
   * `summary()` chỉ liệt kê nghề đã có điểm, nên roadmap không dùng được: nó
   * phải vẽ được cả lộ trình của một nghề hoàn toàn mới.
   */
  async roleProgress(
    userId: string,
    roleCode: string,
  ): Promise<RoleProgress | null> {
    const role = findRole(roleCode);
    if (!role) return null;

    const [skills, enrolledKeys, completedKeys] = await Promise.all([
      this.skillMap(userId),
      this.enrolledKeys(userId),
      this.completedKeys(userId),
    ]);

    return buildRoleProgress(role, {
      pointsAt: (b) => this.pointsAt(skills, roleCode, b),
      enrolledKeys,
      completedKeys,
    });
  }

  /**
   * Ghi danh một cấp bậc.
   *
   * Vẫn kiểm cấp bậc đã mở chưa: ghi danh là cửa của giao diện, còn cửa thật
   * vẫn là điểm kỹ năng. Ghi danh lại lần nữa thì không sao, không tạo bản ghi
   * thừa.
   */
  async enroll(userId: string, roleCode: string, band: string): Promise<void> {
    const role = findRole(roleCode);
    if (!role) throw new NotFoundException('Không có nghề này');
    if (!bandsOf(role).includes(band)) {
      throw new NotFoundException('Nghề này không có cấp bậc đó');
    }
    if (!(await this.isUnlocked(userId, role, band))) {
      throw new ForbiddenException(
        `Cấp bậc ${band} chưa mở. Hãy hoàn thành cấp bậc trước đó.`,
      );
    }

    await this.prisma.enrollment.upsert({
      where: { userId_roleCode_band: { userId, roleCode, band } },
      create: { userId, roleCode, band },
      update: {},
    });
  }

  async summary(userId: string): Promise<ProgressSummary> {
    const [skills, profile, runs, evidence] = await Promise.all([
      this.skillMap(userId),
      this.prisma.gameProfile.findUnique({ where: { userId } }),
      this.prisma.scenarioRun.findMany({
        where: { userId, NOT: { completedAt: null } },
        select: {
          id: true,
          scenarioKey: true,
          completedAt: true,
          pointsAwarded: true,
        },
        orderBy: { completedAt: 'asc' },
      }),
      this.prisma.runEvidence.findMany({
        where: { run: { userId, NOT: { completedAt: null } } },
        select: { runId: true, skill: true, anchor: true },
      }),
    ]);

    // Chỉ lần chơi đầu của mỗi kịch bản được cộng điểm (xem RunsService), nên
    // thống kê kỹ năng cũng chỉ đếm bằng chứng của đúng những lượt đó — để
    // "cứng + mềm" bằng đúng `totalPoints`, và chơi lại không làm bảng phình ra.
    const scoredRunIds = new Set<string>();
    const seenScenario = new Set<string>();
    for (const run of runs) {
      if (seenScenario.has(run.scenarioKey)) continue;
      seenScenario.add(run.scenarioKey);
      scoredRunIds.add(run.id);
    }
    const scored = evidence
      .filter((row) => scoredRunIds.has(row.runId))
      .map((row) => ({
        skill: row.skill,
        skillType: skillTypeOf(row.skill),
        anchor: row.anchor as Anchor,
      }));
    const byType = pointsByType(scored);

    // Chỉ liệt kê nghề người chơi đã chạm tới — bản đồ đầy đủ nằm ở trang khác.
    const touched = new Set(
      [...skills.keys()].map((key) => key.split(':')[0]),
    );

    const [enrolledKeys, completedKeys] = await Promise.all([
      this.enrolledKeys(userId),
      this.completedKeys(userId),
    ]);

    const roles: RoleProgress[] = GAME.roles
      .filter((role) => touched.has(role.role_code))
      .map((role) =>
        buildRoleProgress(role, {
          pointsAt: (b) => this.pointsAt(skills, role.role_code, b),
          enrolledKeys,
          completedKeys,
        }),
      );

    return {
      totalPoints: [...skills.values()].reduce((sum, n) => sum + n, 0),
      hardPoints: byType.hard,
      softPoints: byType.soft,
      runsCompleted: runs.length,
      eventsPlayed: profile?.eventsPlayed ?? 0,
      quizDone: profile?.quizDone ?? false,
      roles,
      skills: summariseSkills(scored),
      timeline: buildTimeline(runs),
    };
  }
}

/** Điểm theo từng kỹ năng có tên — "mình thật ra giỏi cái gì". */
function summariseSkills(
  evidence: Array<{ skill: string; skillType: SkillType; anchor: Anchor }>,
): SkillBreakdown[] {
  const bySkill = new Map<string, SkillBreakdown>();

  for (const row of evidence) {
    const entry = bySkill.get(row.skill) ?? {
      skill: row.skill,
      skillType: row.skillType,
      points: 0,
      plus2: 0,
      neutral: 0,
      minus1: 0,
    };
    entry.points += POINTS[row.anchor];
    if (row.anchor === '+2') entry.plus2 += 1;
    else if (row.anchor === '0') entry.neutral += 1;
    else entry.minus1 += 1;
    bySkill.set(row.skill, entry);
  }

  return [...bySkill.values()].sort((a, b) => b.points - a.points);
}

/** Điểm cộng dồn theo ngày, để vẽ đường tiến bộ. */
function buildTimeline(
  runs: Array<{ completedAt: Date | null; pointsAwarded: number }>,
): TimelinePoint[] {
  const byDate = new Map<string, number>();
  for (const run of runs) {
    if (!run.completedAt) continue;
    const date = run.completedAt.toISOString().slice(0, 10);
    byDate.set(date, (byDate.get(date) ?? 0) + run.pointsAwarded);
  }

  let cumulative = 0;
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, points]) => {
      cumulative += points;
      return { date, points, cumulative };
    });
}


/**
 * Dựng lộ trình cấp bậc của một nghề.
 *
 * Tách thành hàm thuần vì cả `summary()` lẫn `roleProgress()` đều cần đúng
 * phép tính này — để hai chỗ tự tính riêng là kiểu sai chỉ lộ ra khi hai màn
 * hình nói hai điều khác nhau về cùng một cấp bậc.
 */
function buildRoleProgress(
  role: Role,
  ctx: {
    pointsAt: (band: string) => number;
    enrolledKeys: Set<string>;
    completedKeys: Set<string>;
  },
): RoleProgress {
  const list = bandsOf(role);

  const bands: BandProgress[] = list.map((band, index) => {
    const previous = index > 0 ? list[index - 1] : null;
    const key = `${role.role_code}:${band}`;
    return {
      band,
      label: bandLabel(band),
      points: ctx.pointsAt(band),
      unlocked: isBandOpen(role, band, ctx.pointsAt),
      hasScenario: hasScenario(role.role_code, band),
      pointsToUnlock: previous
        ? Math.max(0, UNLOCK_AT - ctx.pointsAt(previous))
        : 0,
      enrolled: ctx.enrolledKeys.has(key),
      completed: ctx.completedKeys.has(key),
    };
  });

  return {
    roleCode: role.role_code,
    roleName: shortRoleName(role),
    bands,
    totalPoints: bands.reduce((sum, b) => sum + b.points, 0),
  };
}
