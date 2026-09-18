import { randomUUID } from 'node:crypto';
import type {
  Skill,
  SkillEvidenceLog,
  User,
  UserGraphPosition,
  UserSkillProgress,
} from '../shared/domain';
import type {
  SkillEvidenceLogRepository,
  SkillRepository,
  UserGraphPositionRepository,
  UserRepository,
  UserSkillProgressRepository,
} from '../shared/repositories';
import { JsonSnapshotStore } from './json-snapshot.store';

const normalizeKey = (raw: string): string => raw.trim().replace(/\s+/g, ' ').toLowerCase();

/** Taxonomy là read-only, load từ JSON — không cần snapshot. */
export class InMemorySkillRepository implements SkillRepository {
  private readonly byId = new Map<string, Skill>();
  private readonly byName = new Map<string, Skill>();

  constructor(skills: Skill[]) {
    for (const s of skills) {
      this.byId.set(s.skillId, s);
      this.byName.set(normalizeKey(s.nameVn), s);
      for (const a of s.aliases) {
        const k = normalizeKey(a);
        if (!this.byName.has(k)) this.byName.set(k, s);
      }
    }
  }

  async findAll(): Promise<Skill[]> {
    return [...this.byId.values()];
  }

  async findById(skillId: string): Promise<Skill | null> {
    return this.byId.get(skillId) ?? null;
  }

  async resolveByName(raw: string): Promise<Skill | null> {
    if (typeof raw !== 'string' || !raw.trim()) return null;
    return this.byName.get(normalizeKey(raw)) ?? null;
  }
}

export class InMemoryUserSkillProgressRepository implements UserSkillProgressRepository {
  private readonly store: JsonSnapshotStore<UserSkillProgress>;

  constructor(snapshotDir: string | null) {
    this.store = new JsonSnapshotStore<UserSkillProgress>(snapshotDir, 'user_skill_progress');
  }

  private key(userId: string, skillId: string): string {
    return `${userId}::${skillId}`;
  }

  async findByUser(userId: string): Promise<UserSkillProgress[]> {
    return this.store.values().filter((r) => r.userId === userId);
  }

  async findOne(userId: string, skillId: string): Promise<UserSkillProgress | null> {
    return this.store.get(this.key(userId, skillId)) ?? null;
  }

  async addXp(userId: string, skillId: string, delta: number): Promise<UserSkillProgress> {
    if (delta < 0) throw new Error('XP không bao giờ giảm — delta phải >= 0');
    const k = this.key(userId, skillId);
    const current = this.store.get(k);
    const next: UserSkillProgress = {
      userId,
      skillId,
      xp: (current?.xp ?? 0) + delta,
      updatedAt: new Date().toISOString(),
    };
    return this.store.set(k, next);
  }
}

export class InMemorySkillEvidenceLogRepository implements SkillEvidenceLogRepository {
  private readonly store: JsonSnapshotStore<SkillEvidenceLog>;

  constructor(snapshotDir: string | null) {
    this.store = new JsonSnapshotStore<SkillEvidenceLog>(snapshotDir, 'skill_evidence_log');
  }

  private key(sessionId: string, activityId: string, skillId: string): string {
    return `${sessionId}::${activityId}::${skillId}`;
  }

  async exists(sessionId: string, activityId: string, skillId: string): Promise<boolean> {
    return this.store.has(this.key(sessionId, activityId, skillId));
  }

  async append(entry: Omit<SkillEvidenceLog, 'id' | 'createdAt'>): Promise<SkillEvidenceLog> {
    const k = this.key(entry.sessionId, entry.activityId, entry.skillId);
    if (this.store.has(k)) {
      throw new Error(`Evidence trùng khoá (${entry.sessionId}, ${entry.activityId}, ${entry.skillId})`);
    }
    const row: SkillEvidenceLog = { ...entry, id: randomUUID(), createdAt: new Date().toISOString() };
    return this.store.set(k, row);
  }

  async findByUser(userId: string): Promise<SkillEvidenceLog[]> {
    return this.store.values().filter((r) => r.userId === userId);
  }
}

export class InMemoryUserRepository implements UserRepository {
  private readonly store: JsonSnapshotStore<User>;

  constructor(snapshotDir: string | null) {
    this.store = new JsonSnapshotStore<User>(snapshotDir, 'users');
  }

  async findById(userId: string): Promise<User | null> {
    return this.store.get(userId) ?? null;
  }

  async upsert(user: User): Promise<User> {
    return this.store.set(user.userId, user);
  }
}

export class InMemoryUserGraphPositionRepository implements UserGraphPositionRepository {
  private readonly store: JsonSnapshotStore<UserGraphPosition>;

  constructor(snapshotDir: string | null) {
    this.store = new JsonSnapshotStore<UserGraphPosition>(snapshotDir, 'user_graph_position');
  }

  async find(userId: string): Promise<UserGraphPosition | null> {
    return this.store.get(userId) ?? null;
  }

  async set(userId: string, currentRoleCode: string): Promise<UserGraphPosition> {
    return this.store.set(userId, { userId, currentRoleCode, updatedAt: new Date().toISOString() });
  }
}
