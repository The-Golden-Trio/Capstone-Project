import { Global, Logger, Module, OnModuleInit, Inject } from '@nestjs/common';
import { DEV_USER } from '../config/progression.config';
import { resolveSnapshotDir } from '../shared/paths';
import {
  SKILL_EVIDENCE_LOG_REPOSITORY,
  SKILL_REPOSITORY,
  USER_GRAPH_POSITION_REPOSITORY,
  USER_REPOSITORY,
  USER_SKILL_PROGRESS_REPOSITORY,
  type UserGraphPositionRepository,
  type UserRepository,
} from '../shared/repositories';
import { loadTaxonomy } from './data-files';
import {
  InMemorySkillEvidenceLogRepository,
  InMemorySkillRepository,
  InMemoryUserGraphPositionRepository,
  InMemoryUserRepository,
  InMemoryUserSkillProgressRepository,
} from './in-memory.repositories';

/**
 * Cắm adapter cho các repository port. Hiện tại: in-memory + snapshot JSON (apps/api/.data).
 * Khi chọn DB xong: thay các `useFactory` ở đây bằng adapter mới — service/controller không đổi.
 */
@Global()
@Module({
  providers: [
    { provide: SKILL_REPOSITORY, useFactory: () => new InMemorySkillRepository(loadTaxonomy()) },
    {
      provide: USER_SKILL_PROGRESS_REPOSITORY,
      useFactory: () => new InMemoryUserSkillProgressRepository(resolveSnapshotDir()),
    },
    {
      provide: SKILL_EVIDENCE_LOG_REPOSITORY,
      useFactory: () => new InMemorySkillEvidenceLogRepository(resolveSnapshotDir()),
    },
    { provide: USER_REPOSITORY, useFactory: () => new InMemoryUserRepository(resolveSnapshotDir()) },
    {
      provide: USER_GRAPH_POSITION_REPOSITORY,
      useFactory: () => new InMemoryUserGraphPositionRepository(resolveSnapshotDir()),
    },
  ],
  exports: [
    SKILL_REPOSITORY,
    USER_SKILL_PROGRESS_REPOSITORY,
    SKILL_EVIDENCE_LOG_REPOSITORY,
    USER_REPOSITORY,
    USER_GRAPH_POSITION_REPOSITORY,
  ],
})
export class PersistenceModule implements OnModuleInit {
  private readonly logger = new Logger(PersistenceModule.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(USER_GRAPH_POSITION_REPOSITORY) private readonly positions: UserGraphPositionRepository,
  ) {}

  /** Seed dev user + vị trí xuất phát (chỉ khi chưa có — giữ vị trí đã bay qua restart). */
  async onModuleInit(): Promise<void> {
    if (!(await this.users.findById(DEV_USER.userId))) {
      await this.users.upsert({ userId: DEV_USER.userId, displayName: DEV_USER.displayName });
      this.logger.log(`Seeded dev user ${DEV_USER.userId}`);
    }
    if (!(await this.positions.find(DEV_USER.userId))) {
      await this.positions.set(DEV_USER.userId, DEV_USER.startRoleCode);
      this.logger.log(`Seeded graph position ${DEV_USER.userId} → ${DEV_USER.startRoleCode}`);
    }
  }
}
