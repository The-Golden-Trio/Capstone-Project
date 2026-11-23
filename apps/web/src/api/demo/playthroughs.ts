import { shift } from '@datn/game-core';
import lamTot from '@datn/game-core/playthroughs/lam-tot.json';

/** Lượt chơi mẫu xem được trong demo, gọi bằng `?autoplay=<tên>`. */
export const AUTOPLAY_SCRIPTS = {
  lan: shift.PlaythroughSchema.parse(lamTot),
} as const;

export function autoplayScript(
  name: string | null,
  taskId: string | undefined,
): shift.Playthrough | null {
  const script = name
    ? (AUTOPLAY_SCRIPTS as Record<string, shift.Playthrough>)[name]
    : undefined;
  return script && script.seed === taskId ? script : null;
}

export const scriptForTask = (taskId: string | undefined) =>
  Object.entries(AUTOPLAY_SCRIPTS).find(
    ([, script]) => script.seed === taskId,
  )?.[0] ?? null;
