import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  keywordGrader,
  mulberry32,
  newSeed,
  pointsEarned,
  runReducer,
  startRun,
  type EngineDeps,
  type FollowupLine,
  type Scenario,
  type RunAction,
  type RunState,
  type SkillType,
} from '@datn/game-core';
import { ContentService } from '../content/content.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import type { CompleteRunDto } from './dto/run.dto';

export interface StartedRun {
  runId: string;
  scenarioKey: string;
  /** Máy khách phải chơi bằng đúng hạt giống này, nếu không lượt chạy lại sẽ lệch. */
  seed: number;
  roleCode: string;
  band: string;
}

export interface CompletedRun {
  runId: string;
  endingId: string;
  endingType: string;
  pointsAwarded: number;
  /** Tổng điểm ở cấp bậc đó sau khi cộng. */
  bandPoints: number;
  /** Cấp bậc vừa mở ra nhờ lượt chơi này, nếu có. */
  unlockedBand: string | null;
  /** Lần chơi lại không cộng điểm, nhưng vẫn xem được kết cục. */
  alreadyScored: boolean;
  evidence: Array<{
    activityId: string;
    skill: string;
    skillType: SkillType;
    anchor: string;
    capped: boolean;
    why: string;
    quote: string | null;
    timeout: boolean;
  }>;
}

/**
 * Điểm kỹ năng sinh ra ở đây, và chỉ ở đây.
 *
 * Máy khách chơi tại chỗ để phản hồi tức thì, nhưng thứ nó gửi lên không phải
 * điểm — mà là chuỗi hành động đã bấm. Máy chủ chạy lại đúng chuỗi đó qua
 * cùng một máy chạy màn chơi, với cùng hạt giống nó đã phát lúc mở màn, rồi
 * tự chấm lấy. Sửa gì trong trình duyệt cũng không đổi được kết quả: muốn
 * điểm cao thì phải trả lời hay, không phải sửa số.
 */
@Injectable()
export class RunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
    private readonly content: ContentService,
  ) {}

  /**
   * Phụ thuộc cho một lần chạy lại.
   *
   * Kịch bản được đưa vào chứ engine không tự đi tìm. Nhờ vậy chỗ này sẽ là
   * nơi duy nhất cần đổi khi nội dung chuyển hẳn sang database: chạy lại bằng
   * đúng bản đã ghim cho lượt chơi ấy, không phải bản mới nhất.
   */
  private deps(
    scenario: Scenario,
    followupLine: (activityId: string) => FollowupLine | undefined,
    seed: number,
  ): EngineDeps {
    return {
      scenario,
      followupLine,
      grader: keywordGrader,
      rng: mulberry32(seed),
      // Hết giờ là do máy khách gửi hành động TIMEOUT; máy chủ không đếm giờ hộ.
      now: () => Date.now(),
    };
  }

  /* ── Mở màn ──────────────────────────────────────────────────────── */

  async start(userId: string, scenarioKey: string): Promise<StartedRun> {
    // Ghim phiên bản nội dung ngay lúc mở màn: từ giây này lượt chơi là bất
    // biến, nội dung có được seed bản mới thì lượt đang dở vẫn chấm đúng.
    const contentVersion = await this.content.activeVersion();
    const index = await this.content.indexAt(contentVersion);

    const entry = index.findScenarioByKey(scenarioKey);
    if (!entry) throw new NotFoundException('Không có kịch bản này');

    const { role_code: roleCode, band } = entry.scenario.job;
    const role = index.findRole(roleCode);
    if (!role) throw new NotFoundException('Không có nghề này');

    // Chỗ cấm cửa thật: chưa đủ điểm ở cấp trước thì không mở được màn này.
    const unlocked = await this.progress.isUnlocked(userId, role, band);
    if (!unlocked) {
      throw new ForbiddenException(
        `Cấp bậc ${band} chưa mở. Hãy hoàn thành cấp bậc trước đó.`,
      );
    }

    const seed = newSeed();
    const run = await this.prisma.scenarioRun.create({
      data: {
        userId,
        scenarioKey,
        roleCode,
        band,
        seed: BigInt(seed),
        contentVersion,
      },
    });

    return { runId: run.id, scenarioKey, seed, roleCode, band };
  }

  /* ── Chấm ────────────────────────────────────────────────────────── */

  async complete(
    userId: string,
    runId: string,
    dto: CompleteRunDto,
  ): Promise<CompletedRun> {
    const run = await this.prisma.scenarioRun.findUnique({
      where: { id: runId },
    });
    if (!run || run.userId !== userId) {
      throw new NotFoundException('Không tìm thấy lượt chơi');
    }
    if (run.completedAt) {
      throw new BadRequestException('Lượt chơi này đã được chấm rồi');
    }

    // Cùng một bảng tra cho cả việc chạy lại lẫn việc gắn loại kỹ năng vào
    // bằng chứng: đúng phiên bản nội dung mà lượt chơi này đã ghim.
    const playedIndex = await this.content.indexAt(run.contentVersion);

    const final = await this.replay(
      run.scenarioKey,
      run.contentVersion,
      Number(run.seed),
      dto.actions as RunAction[],
    );

    if (final.phase !== 'ended' || !final.ending) {
      throw new BadRequestException(
        'Chuỗi hành động không dẫn tới kết cục nào — lượt chơi chưa xong.',
      );
    }

    const points = pointsEarned(final);
    const ending = final.ending;

    // Chỉ lần chơi đầu của mỗi kịch bản mới được cộng điểm; chơi lại là để
    // xem lại, không phải để cày.
    const previouslyScored = await this.prisma.scenarioRun.findFirst({
      where: {
        userId,
        scenarioKey: run.scenarioKey,
        NOT: { completedAt: null },
      },
      select: { id: true },
    });
    const awards = previouslyScored ? 0 : points;

    const evidence = final.evidence.map((e) => ({
      activityId: e.activityId,
      skill: e.skill,
      anchor: e.anchor,
      capped: e.capped,
      why: e.why,
      quote: e.quote,
      timeout: e.timeout,
    }));

    // Một giao dịch: bằng chứng, kết cục và điểm cùng vào hoặc cùng không.
    const bandSkill = await this.prisma.$transaction(async (tx) => {
      await tx.scenarioRun.update({
        where: { id: run.id },
        data: {
          completedAt: new Date(),
          endingId: ending.ending_id,
          endingType: ending.type,
          pointsAwarded: awards,
          rating: dto.rating ?? null,
          actions: dto.actions,
          evidence: { createMany: { data: evidence } },
        },
      });

      return tx.userBandSkill.upsert({
        where: {
          userId_roleCode_band: {
            userId,
            roleCode: run.roleCode,
            band: run.band,
          },
        },
        create: {
          userId,
          roleCode: run.roleCode,
          band: run.band,
          points: awards,
        },
        update: { points: { increment: awards } },
      });
    });

    return {
      runId: run.id,
      endingId: ending.ending_id,
      endingType: ending.type,
      pointsAwarded: awards,
      bandPoints: bandSkill.points,
      unlockedBand: await this.progress.unlockedAfter(
        userId,
        run.roleCode,
        run.band,
      ),
      alreadyScored: Boolean(previouslyScored),
      // Bảng RunEvidence chỉ giữ tên kỹ năng; loại tra từ nội dung. Tra ở
      // ĐÚNG phiên bản lượt chơi đã ghim, cùng bản vừa dùng để chạy lại — nếu
      // không, bảng tổng kết có thể nói một kỹ năng là "mềm" trong khi lúc
      // chơi nó được chấm như "cứng".
      evidence: evidence.map((e) => ({
        ...e,
        skillType: playedIndex.skillTypeOf(e.skill),
      })),
    };
  }

  /**
   * Chạy lại một chuỗi hành động từ đầu.
   *
   * Tách riêng ra vì đây là phần đáng kiểm nhất của cả hệ thống, và vì máy
   * chủ phải chạy nó y hệt cách máy khách đã chạy.
   */
  private async replay(
    scenarioKey: string,
    contentVersion: number,
    seed: number,
    actions: RunAction[],
  ): Promise<RunState> {
    // Đúng phiên bản đã ghim, không phải bản mới nhất. Đây là điều khiến việc
    // chấm bằng chạy lại còn đúng sau khi nội dung đổi.
    const index = await this.content.indexAt(contentVersion);
    const entry = index.findScenarioByKey(scenarioKey);
    if (!entry) throw new NotFoundException('Không có kịch bản này');

    const followupLine = await this.content.followupLookup(
      contentVersion,
      scenarioKey,
    );
    const deps = this.deps(entry.scenario, followupLine, seed);
    let state: RunState;
    try {
      state = startRun(scenarioKey, deps);
    } catch {
      throw new NotFoundException('Không có kịch bản này');
    }

    for (const action of actions) {
      try {
        state = runReducer(state, action, deps);
      } catch {
        // Hành động trỏ tới activity không tồn tại chẳng hạn.
        throw new BadRequestException('Chuỗi hành động không hợp lệ');
      }
      if (state.phase === 'ended') break;
    }
    return state;
  }

  /* ── Lịch sử ─────────────────────────────────────────────────────── */

  async history(userId: string) {
    const runs = await this.prisma.scenarioRun.findMany({
      where: { userId, NOT: { completedAt: null } },
      orderBy: { completedAt: 'desc' },
      include: { evidence: true },
      take: 50,
    });

    // Nhan đề lấy theo bản đang phục vụ chứ không theo bản đã ghim: đây chỉ là
    // nhãn cho danh sách lịch sử, còn bản đã ghim thì dành cho việc chấm.
    const index = await this.content.index();

    return runs.map((run) => ({
      id: run.id,
      scenarioKey: run.scenarioKey,
      scenarioTitle:
        index.findScenarioByKey(run.scenarioKey)?.scenario.scenario_title ??
        run.scenarioKey,
      roleCode: run.roleCode,
      band: run.band,
      completedAt: run.completedAt?.toISOString() ?? null,
      endingId: run.endingId,
      endingType: run.endingType,
      pointsAwarded: run.pointsAwarded,
      rating: run.rating,
      evidence: run.evidence.map((e) => ({
        activityId: e.activityId,
        skill: e.skill,
        skillType: index.skillTypeOf(e.skill),
        anchor: e.anchor,
        capped: e.capped,
        why: e.why,
        quote: e.quote,
        timeout: e.timeout,
      })),
    }));
  }
}
