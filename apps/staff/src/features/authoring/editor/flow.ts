import type { ActivityContent } from '../../../api/types';

/**
 * Thứ tự activity theo luồng: từ activity mở đầu, đi theo `forwardTo`.
 * Activity không với tới được nối vào cuối để vẫn thấy trên sơ đồ.
 */
export function flowOrder(activities: ActivityContent[]): number[] {
  const byKey = new Map(activities.map((a, i) => [a.key, i]));
  const order: number[] = [];
  const seen = new Set<number>();
  let i = activities.findIndex((a) => a.isOrigin);
  while (i >= 0 && !seen.has(i)) {
    order.push(i);
    seen.add(i);
    const next = activities[i].forwardTo;
    i = next ? (byKey.get(next) ?? -1) : -1;
  }
  activities.forEach((_, j) => {
    if (!seen.has(j)) order.push(j);
  });
  return order;
}

/** Activity này có nằm trên đường đi từ activity mở đầu không. */
export function reachable(activities: ActivityContent[]): Set<number> {
  const byKey = new Map(activities.map((a, i) => [a.key, i]));
  const out = new Set<number>();
  let i = activities.findIndex((a) => a.isOrigin);
  while (i >= 0 && !out.has(i)) {
    out.add(i);
    const next = activities[i].forwardTo;
    i = next ? (byKey.get(next) ?? -1) : -1;
  }
  return out;
}
