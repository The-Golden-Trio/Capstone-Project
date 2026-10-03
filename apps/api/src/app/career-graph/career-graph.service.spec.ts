import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PROGRESSION } from '../config/progression.config';
import { loadRoleGraph, loadTaxonomy } from '../persistence/data-files';
import {
  InMemorySkillRepository,
  InMemoryUserGraphPositionRepository,
  InMemoryUserSkillProgressRepository,
} from '../persistence/in-memory.repositories';
import { CareerGraphService } from './career-graph.service';

function makeService() {
  const graph = loadRoleGraph();
  const positions = new InMemoryUserGraphPositionRepository(null);
  const progress = new InMemoryUserSkillProgressRepository(null);
  const skills = new InMemorySkillRepository(loadTaxonomy());
  const service = new CareerGraphService(graph, positions, progress, skills);
  return { service, positions, progress, graph };
}

describe('CareerGraphService', () => {
  it('role_graph.json: 22 node, 64 cạnh SIMILAR/PROGRESSES_TO, 39 alias ABSORBED', () => {
    const { graph } = makeService();
    expect(graph.nodes).toHaveLength(22);
    expect(graph.edges).toHaveLength(64);
    expect(graph.absorbed).toHaveLength(39);
    expect(new Set(graph.nodes.map((n) => n.roleGroup)).size).toBe(7);
  });

  it('getView: chỉ cạnh chạm current mới có unlock, node kề đánh dấu isAdjacent', async () => {
    const { service, positions } = makeService();
    await positions.set('u1', 'SWE_FRONTEND');
    const v = await service.getView('u1');
    expect(v.currentRoleCode).toBe('SWE_FRONTEND');
    expect(v.totalXp).toBe(0);
    const touching = v.edges.filter((e) => e.touchesCurrent);
    expect(touching.length).toBe(5); // 3 SIMILAR + 2 PROGRESSES_TO
    expect(touching.every((e) => e.unlock !== null)).toBe(true);
    expect(v.edges.filter((e) => !e.touchesCurrent).every((e) => e.unlock === null)).toBe(true);
    expect(v.nodes.find((n) => n.roleCode === 'SWE_MOBILE')?.isAdjacent).toBe(true);
    expect(v.nodes.find((n) => n.roleCode === 'DATA_DA')?.isAdjacent).toBe(false);
    expect(v.nodes.find((n) => n.roleCode === 'SWE_FRONTEND')?.isCurrent).toBe(true);
  });

  it('fly: từ chối node không kề, node không tồn tại, node hiện tại', async () => {
    const { service, positions } = makeService();
    await positions.set('u1', 'SWE_FRONTEND');
    await expect(service.fly('u1', 'DATA_DA')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.fly('u1', 'NOPE')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.fly('u1', 'SWE_FRONTEND')).rejects.toBeInstanceOf(BadRequestException);
    expect((await positions.find('u1'))?.currentRoleCode).toBe('SWE_FRONTEND');
  });

  it('fly: server tự kiểm unlock — thiếu điều kiện → 409 kèm chi tiết; đủ → đổi vị trí, KHÔNG trừ XP', async () => {
    const { service, positions, progress } = makeService();
    await positions.set('u1', 'SWE_FRONTEND');
    await expect(service.fly('u1', 'SWE_MOBILE')).rejects.toBeInstanceOf(ConflictException);

    // SWE_FRONTEND -> SWE_MOBILE: d=0.615 → fuel 62, required dart + react native (level >= 1 ⇒ xp >= 25)
    const need = PROGRESSION.LEVEL_K * PROGRESSION.REQUIRED_SKILL_MIN_LEVEL ** 2;
    await progress.addXp('u1', 'hard_dart', need);
    await progress.addXp('u1', 'hard_react_native', need);
    await progress.addXp('u1', 'hard_javascript', 12); // tổng 62
    const before = (await progress.findByUser('u1')).reduce((a, r) => a + r.xp, 0);
    expect(before).toBe(62);

    const v = await service.fly('u1', 'SWE_MOBILE');
    expect(v.currentRoleCode).toBe('SWE_MOBILE');
    expect((await positions.find('u1'))?.currentRoleCode).toBe('SWE_MOBILE');
    const after = (await progress.findByUser('u1')).reduce((a, r) => a + r.xp, 0);
    expect(after).toBe(before); // fuel là ngưỡng, không tiêu hao
    // cạnh actionable đổi theo vị trí mới
    expect(v.edges.filter((e) => e.actionable).every((e) => e.from === 'SWE_MOBILE' || e.to === 'SWE_MOBILE')).toBe(true);
  });
});
