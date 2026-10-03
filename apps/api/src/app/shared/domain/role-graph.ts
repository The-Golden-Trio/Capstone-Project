export type EdgeType = 'SIMILAR' | 'PROGRESSES_TO';

export interface AbsorbedRole {
  roleCode: string;
  note: string | null;
}

/** Node = 1 role trong role_graph.json (read-only, seed 1 lần lúc bootstrap). */
export interface RoleNode {
  roleCode: string;
  nameVn: string;
  nameEn: string | null;
  roleGroup: string;
  bands: string | null;
  hasSkillData: boolean;
  skillIds: string[];
  absorbedRoles: AbsorbedRole[];
}

export interface RoleEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  /** 0..1 — SIMILAR: 1-weight; PROGRESSES_TO: 1-Jaccard (clamp >= 0.05). */
  distance: number;
  distanceMethod: string;
  requiredSkills: string[];
  sharedSkillCount: number;
  note: string | null;
}

export interface AbsorbedAlias {
  parentRoleCode: string;
  roleCode: string;
  note: string | null;
}

export interface RoleGraph {
  nodes: RoleNode[];
  edges: RoleEdge[];
  absorbed: AbsorbedAlias[];
}
