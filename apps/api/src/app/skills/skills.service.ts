import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { AnchorHit, Skill, SkillType } from '../shared/domain';
import {
  SKILL_EVIDENCE_LOG_REPOSITORY,
  SKILL_REPOSITORY,
  USER_REPOSITORY,
  USER_SKILL_PROGRESS_REPOSITORY,
  type SkillEvidenceLogRepository,
  type SkillRepository,
  type UserRepository,
  type UserSkillProgressRepository,
} from '../shared/repositories';
import type { IngestEvidenceDto } from './dto/ingest-evidence.dto';
import { computeXp, levelFromXp, levelProgress } from './xp';

export type EvidenceStatus = 'applied' | 'duplicate' | 'unknown_skill';

export interface EvidenceResult {
  activityId: string;
  skill: string;
  skillId: string | null;
  status: EvidenceStatus;
  anchorHit: AnchorHit;
  effectiveAnchor: AnchorHit | null;
  xpDelta: number;
  xpTotal: number | null;
  level: number | null;
  warnings: string[];
}

export interface IngestResult {
  userId: string;
  sessionId: string;
  summary: { received: number; applied: number; duplicates: number; unknownSkills: number; xpGained: number };
  results: EvidenceResult[];
  /** Cảnh báo integrity gom lại (client gửi nhãn mâu thuẫn spec, thiếu quote, skill lạ). */
  warnings: string[];
}

export interface SkillProgressView {
  skillId: string;
  nameVn: string;
  type: SkillType;
  category: Skill['category'];
  xp: number;
  level: number;
  levelFloorXp: number;
  nextLevelXp: number;
  progress: number;
}

export interface UserProgressView {
  userId: string;
  totalXp: number;
  hard: SkillProgressView[];
  soft: SkillProgressView[];
}

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @Inject(SKILL_REPOSITORY) private readonly skills: SkillRepository,
    @Inject(USER_SKILL_PROGRESS_REPOSITORY) private readonly progress: UserSkillProgressRepository,
    @Inject(SKILL_EVIDENCE_LOG_REPOSITORY) private readonly evidenceLog: SkillEvidenceLogRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  listSkills(): Promise<Skill[]> {
    return this.skills.findAll();
  }

  /**
   * Nhận `evidence_emitted[]` (shape B3), resolve skill string → skillId, áp công thức XP,
   * upsert UserSkillProgress, append SkillEvidenceLog. Idempotent theo (sessionId, activityId, skillId).
   */
  async ingest(dto: IngestEvidenceDto): Promise<IngestResult> {
    if (!(await this.users.findById(dto.userId))) {
      throw new NotFoundException(`Không có user ${dto.userId}`);
    }

    const results: EvidenceResult[] = [];
    const warnings: string[] = [];
    let applied = 0;
    let duplicates = 0;
    let unknownSkills = 0;
    let xpGained = 0;

    for (const [i, item] of dto.evidence.entries()) {
      const activityId = item.activity_id ?? item.beat_id ?? '';
      const hintUsed = item.hint_used === true;
      const timeout = item.timeout === true;
      const tag = `evidence[${i}] (activity=${activityId || '?'}, skill="${item.skill}")`;

      if (!activityId) {
        warnings.push(`${tag}: thiếu activity_id — bỏ qua`);
        results.push(this.result(activityId, item.skill, null, 'unknown_skill', item.anchor_hit, null, 0, null, null, ['thiếu activity_id']));
        unknownSkills++;
        continue;
      }

      const skill = await this.skills.resolveByName(item.skill);
      if (!skill) {
        // Không crash — log unknown để người review bổ sung alias vào taxonomy.
        unknownSkills++;
        this.logger.warn(`Unknown skill string: "${item.skill}" (session=${dto.sessionId})`);
        warnings.push(`${tag}: không resolve được qua taxonomy — không cộng XP`);
        results.push(this.result(activityId, item.skill, null, 'unknown_skill', item.anchor_hit, null, 0, null, null, ['unknown skill']));
        continue;
      }

      if (await this.evidenceLog.exists(dto.sessionId, activityId, skill.skillId)) {
        duplicates++;
        const current = await this.progress.findOne(dto.userId, skill.skillId);
        results.push(
          this.result(activityId, item.skill, skill.skillId, 'duplicate', item.anchor_hit, null, 0, current?.xp ?? 0, levelFromXp(current?.xp ?? 0), [
            'đã ghi nhận trước đó — không cộng lại',
          ]),
        );
        continue;
      }

      const outcome = computeXp({ anchorHit: item.anchor_hit, hintUsed, timeout });
      const itemWarnings = [...outcome.warnings];
      if (!timeout && (item.quote === null || item.quote === undefined || item.quote.trim() === '')) {
        itemWarnings.push('quote trống trong khi timeout=false — B3 yêu cầu quote trích đúng chữ người chơi');
      }
      for (const w of itemWarnings) warnings.push(`${tag}: ${w}`);

      const row = await this.progress.addXp(dto.userId, skill.skillId, outcome.xpDelta);
      await this.evidenceLog.append({
        userId: dto.userId,
        sessionId: dto.sessionId,
        scenarioId: dto.scenarioId,
        roleCode: dto.roleCode,
        band: dto.band,
        activityId,
        skillId: skill.skillId,
        anchorHit: outcome.effectiveAnchor,
        quote: item.quote ?? null,
        hintUsed,
        timeout,
        xpDelta: outcome.xpDelta,
      });

      applied++;
      xpGained += outcome.xpDelta;
      results.push(
        this.result(activityId, item.skill, skill.skillId, 'applied', item.anchor_hit, outcome.effectiveAnchor, outcome.xpDelta, row.xp, levelFromXp(row.xp), itemWarnings),
      );
    }

    return {
      userId: dto.userId,
      sessionId: dto.sessionId,
      summary: { received: dto.evidence.length, applied, duplicates, unknownSkills, xpGained },
      results,
      warnings,
    };
  }

  /** Toàn bộ UserSkillProgress của user, group hard/soft, kèm level tính sẵn. */
  async getProgress(userId: string): Promise<UserProgressView> {
    if (!(await this.users.findById(userId))) {
      throw new NotFoundException(`Không có user ${userId}`);
    }
    const rows = await this.progress.findByUser(userId);
    const hard: SkillProgressView[] = [];
    const soft: SkillProgressView[] = [];
    let totalXp = 0;
    for (const r of rows) {
      const skill = await this.skills.findById(r.skillId);
      if (!skill) continue; // taxonomy đổi id — bỏ qua row mồ côi thay vì crash
      totalXp += r.xp;
      const lp = levelProgress(r.xp);
      const view: SkillProgressView = {
        skillId: skill.skillId,
        nameVn: skill.nameVn,
        type: skill.type,
        category: skill.category,
        xp: r.xp,
        ...lp,
      };
      (skill.type === 'hard' ? hard : soft).push(view);
    }
    const byXpDesc = (a: SkillProgressView, b: SkillProgressView) => b.xp - a.xp || a.nameVn.localeCompare(b.nameVn);
    hard.sort(byXpDesc);
    soft.sort(byXpDesc);
    return { userId, totalXp, hard, soft };
  }

  private result(
    activityId: string,
    skill: string,
    skillId: string | null,
    status: EvidenceStatus,
    anchorHit: AnchorHit,
    effectiveAnchor: AnchorHit | null,
    xpDelta: number,
    xpTotal: number | null,
    level: number | null,
    warnings: string[],
  ): EvidenceResult {
    return { activityId, skill, skillId, status, anchorHit, effectiveAnchor, xpDelta, xpTotal, level, warnings };
  }
}
