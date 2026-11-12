/** Archetype mở theo cấp (spec-scenario-KHOI1 A3, D-22). */
export const ARCHETYPE_MIN_LEVEL = {
  S_EXEC: 1,
  S_AMBIG: 2,
  S_INCIDENT: 3,
  S_CONFLICT: 4,
  S_REVIEW: 4,
  S_DECISION: 6,
} as const;
export type Archetype = keyof typeof ARCHETYPE_MIN_LEVEL;

export const archetypesFor = (levelNo: number): Archetype[] =>
  (Object.keys(ARCHETYPE_MIN_LEVEL) as Archetype[]).filter(
    (a) => ARCHETYPE_MIN_LEVEL[a] <= levelNo,
  );

/** openapi `SituationOptions.companyTypes`. */
export const COMPANY_TYPES = [
  'OUTSOURCING',
  'PRODUCT_LOCAL',
  'ENTERPRISE_BANK',
  'BIGTECH_FDI',
] as const;
