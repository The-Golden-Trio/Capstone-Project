import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RoleGraph, Skill } from '../shared/domain';
import { resolveDataDir } from '../shared/paths';

interface TaxonomyFile {
  skills: Array<{
    skill_id: string;
    name_vn: string;
    type: 'hard' | 'soft';
    category: 'language' | 'framework' | 'tool' | null;
    aliases: string[];
  }>;
}

/** Đọc occupation-data/output/skills_taxonomy.json (snake_case) → domain Skill[]. */
export function loadTaxonomy(dataDir = resolveDataDir()): Skill[] {
  const file = JSON.parse(readFileSync(join(dataDir, 'skills_taxonomy.json'), 'utf-8')) as TaxonomyFile;
  return file.skills.map((s) => ({
    skillId: s.skill_id,
    nameVn: s.name_vn,
    type: s.type,
    category: s.category,
    aliases: s.aliases ?? [],
  }));
}

/** Đọc occupation-data/output/role_graph.json (đã camelCase sẵn). */
export function loadRoleGraph(dataDir = resolveDataDir()): RoleGraph {
  const file = JSON.parse(readFileSync(join(dataDir, 'role_graph.json'), 'utf-8')) as RoleGraph;
  return { nodes: file.nodes, edges: file.edges, absorbed: file.absorbed ?? [] };
}
