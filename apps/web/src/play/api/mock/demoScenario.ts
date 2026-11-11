/**
 * Kịch bản duy nhất của bản demo: SWE_BACKEND_L1_S_EXEC (Back-end L1, năm bug
 * ưu tiên thấp). Phủ đủ bốn loại hoạt động và có một lượt đào sâu.
 *
 * `demo-scenario.json` trích từ `packages/game-core/data/game-data.json`. Sinh
 * lại sau `pnpm data:build`, chạy ở gốc repo:
 *
 *   node -e 'const d=require("./packages/game-core/data/game-data.json");const k="SWE_BACKEND_L1_S_EXEC";require("fs").writeFileSync("apps/web/src/play/api/mock/demo-scenario.json",JSON.stringify({scenarioKey:k,scenario:d.scenarios[k]},null,2)+"\n")'
 */
import { ScenarioSchema, type Scenario } from '@datn/game-core';
import raw from './demo-scenario.json';

export const DEMO_SCENARIO_KEY: string = raw.scenarioKey;

let parsed: Scenario | null = null;

/** Kiểm bằng đúng schema của game-core, một lần. */
export function demoScenario(): Scenario {
  parsed ??= ScenarioSchema.parse(raw.scenario);
  return parsed;
}

/** Bản demo chỉ chơi được đúng một kịch bản. */
export const isDemoScenario = (scenarioKey: string): boolean =>
  scenarioKey === DEMO_SCENARIO_KEY;
