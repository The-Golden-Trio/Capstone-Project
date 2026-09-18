import { NotFoundException } from '@nestjs/common';
import { PROGRESSION } from '../config/progression.config';
import {
  InMemorySkillEvidenceLogRepository,
  InMemorySkillRepository,
  InMemoryUserRepository,
  InMemoryUserSkillProgressRepository,
} from '../persistence/in-memory.repositories';
import { loadTaxonomy } from '../persistence/data-files';
import type { IngestEvidenceDto } from './dto/ingest-evidence.dto';
import { SkillsService } from './skills.service';

/** Fixture lấy từ scenario-golden/SWE_BACKEND_L3.json (context.skills_hard / skills_soft). */
const GOLDEN = {
  roleCode: 'SWE_BACKEND',
  band: 'L3',
  scenarioId: 'SWE_BACKEND_L3:Tối ưu hóa các API bị chậm',
  skills: { hard: ['Redis', 'RESTful API Design'], soft: ['Giải quyết vấn đề', 'Làm việc độc lập'] },
};

function makeService() {
  const users = new InMemoryUserRepository(null);
  const progress = new InMemoryUserSkillProgressRepository(null);
  const log = new InMemorySkillEvidenceLogRepository(null);
  const skills = new InMemorySkillRepository(loadTaxonomy());
  const service = new SkillsService(skills, progress, log, users);
  return { service, users, progress, log };
}

function dto(evidence: IngestEvidenceDto['evidence'], sessionId = 's1'): IngestEvidenceDto {
  return { userId: 'u1', sessionId, scenarioId: GOLDEN.scenarioId, roleCode: GOLDEN.roleCode, band: GOLDEN.band, evidence };
}

describe('SkillsService.ingest', () => {
  it('404 khi user không tồn tại', async () => {
    const { service } = makeService();
    await expect(service.ingest(dto([]))).rejects.toBeInstanceOf(NotFoundException);
  });

  it('resolve skill string golden → skillId, cộng XP đúng bảng 1.3', async () => {
    const { service, users } = makeService();
    await users.upsert({ userId: 'u1', displayName: 'U' });
    const r = await service.ingest(
      dto([
        { activity_id: 'a1', skill: 'Làm việc độc lập', anchor_hit: '+2', quote: 'tôi tự xem log trước', hint_used: false, timeout: false },
        { activity_id: 'a2', skill: 'RESTful API Design', anchor_hit: '0', quote: 'pagination', hint_used: false, timeout: false },
        { activity_id: 'a3', skill: 'Redis', anchor_hit: '-1', quote: 'cache hết', hint_used: false, timeout: false },
        { activity_id: 'a4', skill: 'Giải quyết vấn đề', anchor_hit: '+2', quote: 'đo lại p95', hint_used: true, timeout: false },
      ]),
    );
    expect(r.summary).toEqual({ received: 4, applied: 4, duplicates: 0, unknownSkills: 0, xpGained: 10 + 3 + 0 + 3 });
    expect(r.results.map((x) => x.skillId)).toEqual(['soft_lam_viec_doc_lap', 'hard_restful_api_design', 'hard_redis', 'soft_giai_quyet_van_de']);
    // +2 với hint → ép về 0 + cảnh báo
    expect(r.results[3].effectiveAnchor).toBe('0');
    expect(r.results[3].xpDelta).toBe(PROGRESSION.BASE_XP * PROGRESSION.ZERO_ANCHOR_RATIO);
    expect(r.warnings.some((w) => w.includes('A9'))).toBe(true);
  });

  it('idempotent: gọi lại cùng (sessionId, activityId, skill) không cộng XP 2 lần', async () => {
    const { service, users, progress } = makeService();
    await users.upsert({ userId: 'u1', displayName: 'U' });
    const ev = [{ activity_id: 'a1', skill: 'Redis', anchor_hit: '+2' as const, quote: 'x', hint_used: false, timeout: false }];
    await service.ingest(dto(ev));
    const second = await service.ingest(dto(ev));
    expect(second.summary.duplicates).toBe(1);
    expect(second.summary.applied).toBe(0);
    expect((await progress.findOne('u1', 'hard_redis'))?.xp).toBe(10);
    // session khác → cộng bình thường
    const third = await service.ingest(dto(ev, 's2'));
    expect(third.summary.applied).toBe(1);
    expect((await progress.findOne('u1', 'hard_redis'))?.xp).toBe(20);
  });

  it('skill lạ → không crash, đánh dấu unknown_skill; alias casing khác vẫn resolve', async () => {
    const { service, users } = makeService();
    await users.upsert({ userId: 'u1', displayName: 'U' });
    const r = await service.ingest(
      dto([
        { activity_id: 'a1', skill: 'Kỹ năng bịa ra', anchor_hit: '+2', quote: 'x', hint_used: false, timeout: false },
        { activity_id: 'a1', skill: 'javascript', anchor_hit: '+2', quote: 'x', hint_used: false, timeout: false },
        { beat_id: 'a2', skill: 'ReactJS', anchor_hit: '+2', quote: 'x', hint_used: false, timeout: false },
      ]),
    );
    expect(r.results[0].status).toBe('unknown_skill');
    expect(r.results[1]).toMatchObject({ status: 'applied', skillId: 'hard_javascript' });
    expect(r.results[2]).toMatchObject({ status: 'applied', skillId: 'hard_react_js', activityId: 'a2' });
  });

  it('timeout → 0 XP, quote null hợp lệ (A11); quote trống khi không timeout → cảnh báo', async () => {
    const { service, users } = makeService();
    await users.upsert({ userId: 'u1', displayName: 'U' });
    const r = await service.ingest(
      dto([
        { activity_id: 'a1', skill: 'Redis', anchor_hit: '-1', quote: null, hint_used: false, timeout: true },
        { activity_id: 'a2', skill: 'Redis', anchor_hit: '+2', quote: null, hint_used: false, timeout: false },
      ]),
    );
    expect(r.results[0]).toMatchObject({ status: 'applied', xpDelta: 0, warnings: [] });
    expect(r.results[1].warnings.some((w) => w.includes('quote'))).toBe(true);
  });

  it('getProgress group hard/soft + level tính sẵn + totalXp', async () => {
    const { service, users } = makeService();
    await users.upsert({ userId: 'u1', displayName: 'U' });
    for (let i = 0; i < 3; i++) {
      await service.ingest(dto([{ activity_id: `a${i}`, skill: 'Redis', anchor_hit: '+2', quote: 'x', hint_used: false, timeout: false }]));
    }
    await service.ingest(dto([{ activity_id: 'b1', skill: 'Giải quyết vấn đề', anchor_hit: '0', quote: 'x', hint_used: false, timeout: false }]));
    const p = await service.getProgress('u1');
    expect(p.totalXp).toBe(33);
    expect(p.hard).toHaveLength(1);
    expect(p.hard[0]).toMatchObject({ skillId: 'hard_redis', xp: 30, level: 1, category: 'tool' });
    expect(p.soft[0]).toMatchObject({ skillId: 'soft_giai_quyet_van_de', xp: 3, level: 0 });
  });
});
