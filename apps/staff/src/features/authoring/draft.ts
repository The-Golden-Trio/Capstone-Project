/** Sửa bất biến một `ScenarioContent` trong state React. */
import type { ActivityContent, ScenarioContent } from '../../api/types';

export function produce(
  content: ScenarioContent,
  recipe: (draft: ScenarioContent) => void,
): ScenarioContent {
  const draft = structuredClone(content);
  recipe(draft);
  return draft;
}

/** Ghi `value` vào đường dẫn kiểu `activities[1].rubric`. */
export function setAtPath(
  content: ScenarioContent,
  path: string,
  value: unknown,
): ScenarioContent {
  const tokens = path.match(/[^.[\]]+/g) ?? [];
  return produce(content, (draft) => {
    let cur = draft as unknown as Record<string, unknown>;
    for (const t of tokens.slice(0, -1))
      cur = cur[Array.isArray(cur) ? Number(t) : t] as Record<string, unknown>;
    const last = tokens[tokens.length - 1];
    if (last !== undefined)
      cur[Array.isArray(cur) ? Number(last) : last] = value;
  });
}

export function emptyActivity(
  key: string,
  competencyId: string,
): ActivityContent {
  return {
    key,
    isOrigin: false,
    forwardTo: null,
    setup: '',
    npcLine: '',
    inputPrompt: '',
    jobScope: '',
    closingLine: '',
    allowedTypes: ['FREE_TEXT'],
    items: [],
    followupLimit: 1,
    followupGoal: '',
    defaultFollowup: '',
    hints: [],
    rubric: [
      {
        competencyId,
        anchor2: '',
        anchor1: '',
        anchor0: '',
        counterproductiveSigns: '',
      },
    ],
  };
}

/** Khoá activity mới chưa dùng: a1, a2… */
export function nextKey(existing: string[], prefix: string): string {
  for (let i = 1; ; i++)
    if (!existing.includes(`${prefix}${i}`)) return `${prefix}${i}`;
}
