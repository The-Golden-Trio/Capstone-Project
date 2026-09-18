import type { RoleGraph } from '../shared/domain';
import { loadRoleGraph } from '../persistence/data-files';

/** Token DI cho graph read-only (seed 1 lần lúc bootstrap từ role_graph.json). */
export const ROLE_GRAPH = Symbol('RoleGraph');

export const roleGraphProvider = {
  provide: ROLE_GRAPH,
  useFactory: (): RoleGraph => loadRoleGraph(),
};
