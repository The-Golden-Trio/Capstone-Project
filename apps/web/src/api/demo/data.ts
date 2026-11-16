import { shift } from '@datn/game-core';
import { ApiError } from '../port';
import type { Catalogue, OccupationProfile } from '../types';
import catalogueJson from './fixtures/catalogue.json';
import shiftJson from './fixtures/shift-seeds.json';
import { clone } from './store';
export const baseCatalogue = catalogueJson as Catalogue;
const loaders = import.meta.glob<{ default: OccupationProfile }>(
  './fixtures/profiles/*.json',
);
export async function loadProfile(code: string): Promise<OccupationProfile> {
  const load = loaders[`./fixtures/profiles/${code}.json`];
  if (!load)
    throw new ApiError(404, 'OCCUPATION_NOT_FOUND', 'Không tìm thấy nghề này.');
  return clone((await load()).default);
}
// Kiểm schema seed thay vì ép kiểu nội dung game.
export const seeds = Object.values(shiftJson.seeds).map((s) =>
  shift.ShiftSeedSchema.parse(s),
);
export function context(taskId: string): shift.ShiftContext {
  const seed = seeds.find((s) => s.id === taskId);
  if (!seed)
    throw new ApiError(
      404,
      'TASK_NOT_FOUND',
      'Nhiệm vụ này chưa có màn chơi trong demo.',
    );
  const pack = shift.LevelPackSchema.parse(
    shiftJson.packs[seed.level_ref as keyof typeof shiftJson.packs],
  );
  return { seed, pack };
}
export const seedsFor = (code: string, band: string) =>
  seeds.filter((s) => s.level_ref === `${code}.${band}`);

/** "Công nghệ thông tin › Lập trình viên Back-end › cấp L3" từ mã seed `SWE_BACKEND.L3.m2`. */
export function runPathLabel(taskId: string): string {
  const m = /^(.+?)\.(L\d+)\./.exec(taskId);
  if (!m) return taskId;
  const o = baseCatalogue.occupations.find((x) => x.code === m[1]);
  return o
    ? `${o.group} › ${o.shortName} › cấp ${m[2]}`
    : `${m[1]} › cấp ${m[2]}`;
}
