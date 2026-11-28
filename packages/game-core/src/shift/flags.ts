import type { FlagExpr, ShiftSeed } from './schema.js';

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

export function withDerivedFlags(
  flags: Set<string>,
  definitions: ShiftSeed['derived_flags'],
): Set<string> {
  const byFlag = new Map(definitions.map((rule) => [rule.flag, rule.any_of]));
  const visiting = new Set<string>();
  const evaluated = new Set<string>();
  function evaluate(flag: string): void {
    const expressions = byFlag.get(flag);
    if (!expressions || evaluated.has(flag)) return;
    if (visiting.has(flag)) throw new Error(`Cờ suy ra có vòng lặp: ${flag}`);
    visiting.add(flag);
    for (const dependency of expressions.flatMap(flagsOf)) evaluate(dependency);
    if (expressions.some((expr) => matches(expr, flags))) flags.add(flag);
    else flags.delete(flag);
    visiting.delete(flag);
    evaluated.add(flag);
  }
  for (const flag of byFlag.keys()) evaluate(flag);
  return flags;
}

/** Cờ của khúc mắc đã gỡ (A9). */
export const resolvedFlag = (concernId: string): string =>
  `resolved_${concernId}`;
