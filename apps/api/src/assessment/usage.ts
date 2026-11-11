/** Một dòng của sổ chi phí (ERD-07 `usage_cost`). */
export interface UsageRow {
  role: 'judge' | 'narrator';
  modelId: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number | null;
  succeeded: boolean;
}
