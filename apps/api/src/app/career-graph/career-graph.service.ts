import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { AbsorbedAlias, RoleEdge, RoleGraph, RoleNode } from '../shared/domain';
import {
  SKILL_REPOSITORY,
  USER_GRAPH_POSITION_REPOSITORY,
  USER_SKILL_PROGRESS_REPOSITORY,
  type SkillRepository,
  type UserGraphPositionRepository,
  type UserSkillProgressRepository,
} from '../shared/repositories';
import { levelFromXp } from '../skills/xp';
import { ROLE_GRAPH } from './role-graph.provider';
import { checkUnlock, fuelCost, isTraversableFrom, otherEnd, touchesNode, type UnlockCheck } from './unlock';

export interface GraphNodeView extends RoleNode {
  isCurrent: boolean;
  /** Có cạnh trực tiếp tới node hiện tại (1-hop) và bay được theo chiều cạnh. */
  isAdjacent: boolean;
}

export interface GraphEdgeView extends RoleEdge {
  fuelCost: number;
  requiredSkillNames: string[];
  touchesCurrent: boolean;
  /** Chạm current + đi được theo chiều → mới có nút bay. */
  actionable: boolean;
  /** Chỉ tính cho cạnh actionable; cạnh khác = null. */
  unlock: UnlockCheck | null;
}

export interface CareerGraphView {
  userId: string;
  currentRoleCode: string;
  totalXp: number;
  nodes: GraphNodeView[];
  edges: GraphEdgeView[];
  absorbed: AbsorbedAlias[];
  roleGroups: string[];
}

interface UserSkillSnapshot {
  totalXp: number;
  levelOf(skillId: string): number;
  nameOf(skillId: string): string;
}

@Injectable()
export class CareerGraphService {
  private readonly logger = new Logger(CareerGraphService.name);
  private readonly nodeByCode: Map<string, RoleNode>;

  constructor(
    @Inject(ROLE_GRAPH) private readonly graph: RoleGraph,
    @Inject(USER_GRAPH_POSITION_REPOSITORY) private readonly positions: UserGraphPositionRepository,
    @Inject(USER_SKILL_PROGRESS_REPOSITORY) private readonly progress: UserSkillProgressRepository,
    @Inject(SKILL_REPOSITORY) private readonly skills: SkillRepository,
  ) {
    this.nodeByCode = new Map(graph.nodes.map((n) => [n.roleCode, n]));
    this.logger.log(`Role graph loaded: ${graph.nodes.length} node, ${graph.edges.length} edge, ${graph.absorbed.length} absorbed alias`);
  }

  async getView(userId: string): Promise<CareerGraphView> {
    const position = await this.positions.find(userId);
    if (!position) throw new NotFoundException(`User ${userId} chưa có vị trí trên graph`);
    return this.buildView(userId, position.currentRoleCode);
  }

  /**
   * Bay tới node kề. Server tự kiểm lại: node tồn tại → có cạnh 1-hop đi được → unlock() đạt.
   * Đây là chỗ DUY NHẤT ghi ở phần graph, và chỉ ghi UserGraphPosition — không đụng XP.
   */
  async fly(userId: string, targetRoleCode: string): Promise<CareerGraphView> {
    const position = await this.positions.find(userId);
    if (!position) throw new NotFoundException(`User ${userId} chưa có vị trí trên graph`);
    const current = position.currentRoleCode;

    if (!this.nodeByCode.has(targetRoleCode)) {
      throw new NotFoundException(`Không có role ${targetRoleCode} trên graph`);
    }
    if (targetRoleCode === current) {
      throw new BadRequestException(`Đang ở ${current} rồi`);
    }

    const edge = this.graph.edges.find(
      (e) => isTraversableFrom(e, current) && otherEnd(e, current) === targetRoleCode,
    );
    if (!edge) {
      throw new BadRequestException(`${targetRoleCode} không kề ${current} — cần bay qua các hành tinh liền kề trước`);
    }

    const snapshot = await this.snapshotUser(userId);
    const unlock = checkUnlock(edge, snapshot.totalXp, snapshot);
    if (!unlock.unlocked) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `Chưa đủ điều kiện bay ${current} → ${targetRoleCode}`,
        unlock,
      });
    }

    await this.positions.set(userId, targetRoleCode);
    this.logger.log(`${userId} bay ${current} → ${targetRoleCode} (fuel ${unlock.fuelHave}/${unlock.fuelNeed})`);
    return this.buildView(userId, targetRoleCode);
  }

  private async buildView(userId: string, currentRoleCode: string): Promise<CareerGraphView> {
    const snapshot = await this.snapshotUser(userId);
    const adjacent = new Set<string>();

    const edges: GraphEdgeView[] = this.graph.edges.map((e) => {
      const touches = touchesNode(e, currentRoleCode);
      const actionable = isTraversableFrom(e, currentRoleCode);
      if (actionable) adjacent.add(otherEnd(e, currentRoleCode));
      return {
        ...e,
        fuelCost: fuelCost(e),
        requiredSkillNames: e.requiredSkills.map((id) => snapshot.nameOf(id)),
        touchesCurrent: touches,
        actionable,
        unlock: actionable ? checkUnlock(e, snapshot.totalXp, snapshot) : null,
      };
    });

    const nodes: GraphNodeView[] = this.graph.nodes.map((n) => ({
      ...n,
      isCurrent: n.roleCode === currentRoleCode,
      isAdjacent: adjacent.has(n.roleCode),
    }));

    return {
      userId,
      currentRoleCode,
      totalXp: snapshot.totalXp,
      nodes,
      edges,
      absorbed: this.graph.absorbed,
      roleGroups: [...new Set(this.graph.nodes.map((n) => n.roleGroup))].sort(),
    };
  }

  private async snapshotUser(userId: string): Promise<UserSkillSnapshot> {
    const rows = await this.progress.findByUser(userId);
    const xpBySkill = new Map(rows.map((r) => [r.skillId, r.xp]));
    const totalXp = rows.reduce((acc, r) => acc + r.xp, 0);
    const names = new Map((await this.skills.findAll()).map((s) => [s.skillId, s.nameVn]));
    return {
      totalXp,
      levelOf: (skillId) => levelFromXp(xpBySkill.get(skillId) ?? 0),
      nameOf: (skillId) => names.get(skillId) ?? skillId,
    };
  }
}
