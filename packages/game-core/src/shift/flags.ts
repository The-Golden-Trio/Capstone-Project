import type { FlagExpr } from './schema.js';

/** Xét điều kiện cờ. Điều kiện rỗng luôn đúng. */
export function matches(
  expr: FlagExpr | undefined,
  flags: ReadonlySet<string>,
): boolean {
  if (!expr) return true;
  if (expr.all && !expr.all.every((f) => flags.has(f))) return false;
  if (expr.any && expr.any.length > 0 && !expr.any.some((f) => flags.has(f)))
    return false;
  if (expr.none && expr.none.some((f) => flags.has(f))) return false;
  return true;
}

/** Mọi cờ mà một điều kiện nhắc tới (cho lint). */
export function flagsOf(expr: FlagExpr | undefined): string[] {
  if (!expr) return [];
  return [...(expr.all ?? []), ...(expr.any ?? []), ...(expr.none ?? [])];
}

/** Cờ của khúc mắc đã gỡ (A9). */
export const resolvedFlag = (concernId: string): string =>
  `resolved_${concernId}`;
