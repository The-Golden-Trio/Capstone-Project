/**
 * CL-05 `ContentValidator`: kiểm tự động trước khi nộp (FR-23, AD-04). Mỗi
 * luật là một hàm có tên để dễ đổi khi game design chốt thêm (D-95). Luật lấy
 * từ `occupation-data/specs/spec-scenario-KHOI1.md` (A3, A7, A12, A13) và
 * openapi `ScenarioContent`; phần thang điểm theo D-116 (0/1/2), không theo
 * thang +2/0/−1 cũ của spec.
 */
import type {
  ScenarioContent,
  TaskTypeValue,
} from '../dto/scenario-content.schema';

export interface FailedRule {
  rule: string;
  path: string;
  message: string;
}

/** openapi `CheckReport`. */
export interface CheckReport {
  passed: boolean;
  failedRules: FailedRule[];
}

export interface ValidationContext {
  /** Số cấp của task (L1 → 1). */
  levelNo: number;
  /** Năng lực tác giả đã chọn cho scenario (`scenario_skill`). Rỗng = chưa chọn. */
  skillIds: string[];
}

type Rule = (c: ScenarioContent, ctx: ValidationContext) => FailedRule[];

const fail = (rule: string, path: string, message: string): FailedRule => ({
  rule,
  path,
  message,
});

const CLOSED: TaskTypeValue[] = ['CHOICE', 'ORDERING', 'PRIORITIZING'];

/** Phút ước lượng của mỗi dạng task (spec A7 "Ngân sách thời lượng"). */
const MINUTES: Record<TaskTypeValue, number> = {
  FREE_TEXT: 2,
  CHOICE: 1,
  PRIORITIZING: 1.5,
  ORDERING: 2,
};

export const followupCap = (levelNo: number) =>
  levelNo <= 2 ? 2 : levelNo <= 5 ? 3 : 4;
export const closedActivityCap = (levelNo: number) =>
  levelNo <= 2 ? 3 : levelNo <= 5 ? 1 : 0;

/**
 * Thời lượng ước tính theo spec A7. Khi DE cho phép nhiều dạng task, CA sẽ
 * chọn một trong số đó (FR-35), nên tính cả trường hợp nhẹ nhất và nặng nhất
 * (07 A22+).
 */
export function estimateMinutes(c: ScenarioContent): {
  min: number;
  max: number;
} {
  const followups = c.activities.reduce(
    (s, a) => s + (a.followupLimit ?? 0),
    0,
  );
  let min = 2 + 1.5 * followups;
  let max = min;
  for (const a of c.activities) {
    const costs = a.allowedTypes.map((t) => MINUTES[t]);
    min += Math.min(...costs);
    max += Math.max(...costs);
  }
  return { min, max };
}

const rules: Record<string, Rule> = {
  ACTIVITY_COUNT: (c) =>
    c.activities.length >= 3 && c.activities.length <= 4
      ? []
      : [
          fail(
            'ACTIVITY_COUNT',
            'activities',
            'Scenario cần 3–4 activity (D-21)',
          ),
        ],

  UNIQUE_KEYS: (c) => {
    const out: FailedRule[] = [];
    const seen = new Set<string>();
    c.activities.forEach((a, i) => {
      if (seen.has(a.key))
        out.push(
          fail(
            'UNIQUE_KEYS',
            `activities[${i}].key`,
            `Khoá activity "${a.key}" bị trùng`,
          ),
        );
      seen.add(a.key);
      const items = new Set<string>();
      (a.items ?? []).forEach((it, j) => {
        if (items.has(it.key))
          out.push(
            fail(
              'UNIQUE_KEYS',
              `activities[${i}].items[${j}].key`,
              `Khoá "${it.key}" bị trùng`,
            ),
          );
        items.add(it.key);
      });
      const comps = new Set<string>();
      a.rubric.forEach((r, j) => {
        if (comps.has(r.competencyId))
          out.push(
            fail(
              'UNIQUE_KEYS',
              `activities[${i}].rubric[${j}]`,
              'Một năng lực chỉ có một tiêu chí trong mỗi activity',
            ),
          );
        comps.add(r.competencyId);
      });
    });
    const npcs = new Set<string>();
    (c.cast ?? []).forEach((m, i) => {
      if (npcs.has(m.npcKey))
        out.push(
          fail(
            'UNIQUE_KEYS',
            `cast[${i}].npcKey`,
            `NPC "${m.npcKey}" bị trùng`,
          ),
        );
      npcs.add(m.npcKey);
    });
    return out;
  },

  ONE_ORIGIN_ACTIVITY: (c) => {
    const n = c.activities.filter((a) => a.isOrigin).length;
    return n === 1
      ? []
      : [
          fail(
            'ONE_ORIGIN_ACTIVITY',
            'activities',
            `Cần đúng 1 activity gốc, đang có ${n}`,
          ),
        ];
  },

  FORWARD_POINTER_VALID: (c) => {
    const keys = new Set(c.activities.map((a) => a.key));
    return c.activities.flatMap((a, i) =>
      a.forwardTo && !keys.has(a.forwardTo)
        ? [
            fail(
              'FORWARD_POINTER_VALID',
              `activities[${i}].forwardTo`,
              `Trỏ tới activity "${a.forwardTo}" không có thật`,
            ),
          ]
        : a.forwardTo === a.key
          ? [
              fail(
                'FORWARD_POINTER_VALID',
                `activities[${i}].forwardTo`,
                'Activity không được trỏ về chính nó',
              ),
            ]
          : [],
    );
  },

  ONE_FINAL_ACTIVITY: (c) => {
    const n = c.activities.filter((a) => !a.forwardTo).length;
    return n === 1
      ? []
      : [
          fail(
            'ONE_FINAL_ACTIVITY',
            'activities',
            `Cần đúng 1 activity kết thúc (forwardTo rỗng), đang có ${n}`,
          ),
        ];
  },

  ALL_ACTIVITIES_REACHABLE: (c) => {
    const origin = c.activities.find((a) => a.isOrigin);
    if (!origin) return [];
    const byKey = new Map(c.activities.map((a) => [a.key, a]));
    const visited = new Set<string>();
    let cur: (typeof c.activities)[number] | undefined = origin;
    while (cur && !visited.has(cur.key)) {
      visited.add(cur.key);
      cur = cur.forwardTo ? byKey.get(cur.forwardTo) : undefined;
    }
    if (cur && visited.has(cur.key))
      return [
        fail(
          'ALL_ACTIVITIES_REACHABLE',
          'activities',
          'Chuỗi activity có vòng lặp',
        ),
      ];
    return c.activities.flatMap((a, i) =>
      visited.has(a.key)
        ? []
        : [
            fail(
              'ALL_ACTIVITIES_REACHABLE',
              `activities[${i}]`,
              `Activity "${a.key}" không tới được từ activity gốc`,
            ),
          ],
    );
  },

  SKILL_IN_SCOPE: (c, ctx) => {
    if (!ctx.skillIds.length)
      return [
        fail('SKILL_IN_SCOPE', 'skills', 'Chưa chọn năng lực cho scenario'),
      ];
    const allowed = new Set(ctx.skillIds);
    const out: FailedRule[] = [];
    c.activities.forEach((a, i) =>
      a.rubric.forEach((r, j) => {
        if (!allowed.has(r.competencyId))
          out.push(
            fail(
              'SKILL_IN_SCOPE',
              `activities[${i}].rubric[${j}].competencyId`,
              'Tiêu chí dùng năng lực ngoài phạm vi scenario',
            ),
          );
      }),
    );
    (c.randomEvents ?? []).forEach((e, i) => {
      if (!allowed.has(e.targetCompetencyId))
        out.push(
          fail(
            'SKILL_IN_SCOPE',
            `randomEvents[${i}].targetCompetencyId`,
            'Sự kiện nhắm năng lực ngoài phạm vi scenario',
          ),
        );
    });
    return out;
  },

  FREE_TEXT_FOLLOWUP_GOAL: (c) =>
    c.activities.flatMap((a, i) =>
      a.allowedTypes.includes('FREE_TEXT') &&
      (!a.followupGoal?.trim() || !a.defaultFollowup?.trim())
        ? [
            fail(
              'FREE_TEXT_FOLLOWUP_GOAL',
              `activities[${i}]`,
              'Activity tự luận cần mục tiêu hỏi thêm và câu hỏi thêm mặc định (FR-22)',
            ),
          ]
        : [],
    ),

  FOLLOWUP_ONLY_FREE_TEXT: (c) =>
    c.activities.flatMap((a, i) =>
      !a.allowedTypes.includes('FREE_TEXT') &&
      ((a.followupLimit ?? 0) > 0 || (a.hints?.length ?? 0) > 0)
        ? [
            fail(
              'FOLLOWUP_ONLY_FREE_TEXT',
              `activities[${i}]`,
              'Chỉ activity tự luận mới có hỏi thêm và gợi ý',
            ),
          ]
        : [],
    ),

  FOLLOWUP_CAP_BAND: (c, ctx) => {
    const total = c.activities.reduce((s, a) => s + (a.followupLimit ?? 0), 0);
    const cap = followupCap(ctx.levelNo);
    return total <= cap
      ? []
      : [
          fail(
            'FOLLOWUP_CAP_BAND',
            'activities',
            `Tổng lượt hỏi thêm ${total} vượt trần ${cap} của cấp L${ctx.levelNo}`,
          ),
        ];
  },

  CLOSED_ACTIVITY_CAP_BAND: (c, ctx) => {
    const closed = c.activities.filter(
      (a) => !a.allowedTypes.includes('FREE_TEXT'),
    ).length;
    const cap = closedActivityCap(ctx.levelNo);
    return closed <= cap
      ? []
      : [
          fail(
            'CLOSED_ACTIVITY_CAP_BAND',
            'activities',
            `${closed} activity chỉ cho câu đóng, vượt trần ${cap} của cấp L${ctx.levelNo}`,
          ),
        ];
  },

  CLOSED_ITEMS_PRESENT: (c) =>
    c.activities.flatMap((a, i) => {
      const items = a.items ?? [];
      const path = `activities[${i}].items`;
      const out: FailedRule[] = [];
      const types = a.allowedTypes.filter((t) => CLOSED.includes(t));
      if (types.length > 1)
        out.push(
          fail(
            'CLOSED_ITEMS_PRESENT',
            `activities[${i}].allowedTypes`,
            'Mỗi activity chỉ cho tối đa một dạng câu đóng (dùng chung danh sách mục)',
          ),
        );
      if (types.includes('CHOICE')) {
        if (items.length !== 3)
          out.push(
            fail(
              'CLOSED_ITEMS_PRESENT',
              path,
              'Câu chọn một cần đúng 3 phương án',
            ),
          );
        if (items.some((it) => it.score === undefined))
          out.push(
            fail('CLOSED_ITEMS_PRESENT', path, 'Mỗi phương án cần điểm 0/1/2'),
          );
      }
      if (types.includes('ORDERING')) {
        if (items.length < 4 || items.length > 6)
          out.push(
            fail('CLOSED_ITEMS_PRESENT', path, 'Câu sắp thứ tự cần 4–6 bước'),
          );
        const pos = items.map((it) => it.correctPosition);
        if (
          pos.some((p) => p === undefined) ||
          new Set(pos).size !== items.length
        )
          out.push(
            fail(
              'CLOSED_ITEMS_PRESENT',
              path,
              'Mỗi bước cần một vị trí đúng, không trùng',
            ),
          );
      }
      if (types.includes('PRIORITIZING')) {
        if (items.length < 4 || items.length > 6)
          out.push(
            fail('CLOSED_ITEMS_PRESENT', path, 'Câu chọn ưu tiên cần 4–6 mục'),
          );
        if (items.some((it) => !it.pickRule || !it.note?.trim()))
          out.push(
            fail(
              'CLOSED_ITEMS_PRESENT',
              path,
              'Mỗi mục cần luật chọn và ghi chú',
            ),
          );
        if (!items.some((it) => it.pickRule === 'MUST'))
          out.push(
            fail(
              'CLOSED_ITEMS_PRESENT',
              path,
              'Cần ít nhất một mục bắt buộc chọn',
            ),
          );
      }
      return out;
    }),

  ESTIMATED_MINUTES_RANGE: (c) => {
    const { min, max } = estimateMinutes(c);
    return min >= 10 && max <= 15
      ? []
      : [
          fail(
            'ESTIMATED_MINUTES_RANGE',
            'activities',
            `Thời lượng ước tính ${min}–${max} phút, cần nằm trong 10–15`,
          ),
        ];
  },

  REQUIRED_TEXT: (c) => {
    const out: FailedRule[] = [];
    for (const field of ['intro', 'situation', 'stakes'] as const)
      if (!c[field]?.trim())
        out.push(fail('REQUIRED_TEXT', field, 'Chưa viết'));
    c.activities.forEach((a, i) => {
      if (!a.setup?.trim())
        out.push(
          fail(
            'REQUIRED_TEXT',
            `activities[${i}].setup`,
            'Chưa viết bối cảnh activity',
          ),
        );
    });
    return out;
  },

  RANDOM_EVENT_ACTIVITY_VALID: (c) => {
    const keys = new Set(c.activities.map((a) => a.key));
    return (c.randomEvents ?? []).flatMap((e, i) =>
      keys.has(e.activityKey)
        ? []
        : [
            fail(
              'RANDOM_EVENT_ACTIVITY_VALID',
              `randomEvents[${i}].activityKey`,
              `Activity "${e.activityKey}" không có thật`,
            ),
          ],
    );
  },

  ENDING_TYPES: (c) => {
    const count = (t: string) => c.endings.filter((e) => e.type === t).length;
    const out: FailedRule[] = [];
    if (count('GOOD') !== 1)
      out.push(fail('ENDING_TYPES', 'endings', 'Cần đúng 1 kết cục GOOD'));
    if (count('BAD') !== 1)
      out.push(fail('ENDING_TYPES', 'endings', 'Cần đúng 1 kết cục BAD'));
    if (count('PARTIAL') > 2)
      out.push(fail('ENDING_TYPES', 'endings', 'Tối đa 2 kết cục PARTIAL'));
    if (count('SECRET') > 1)
      out.push(fail('ENDING_TYPES', 'endings', 'Tối đa 1 kết cục SECRET'));
    return out;
  },

  ENDING_CATCH_ALL: (c) => {
    const last = [...c.endings].sort((a, b) => b.priority - a.priority)[0];
    return last && last.minTotalScore == null && !last.extraBehaviour
      ? []
      : [
          fail(
            'ENDING_CATCH_ALL',
            'endings',
            'Kết cục có priority lớn nhất phải không có điều kiện (bắt mọi trường hợp còn lại)',
          ),
        ];
  },

  SECRET_PRIORITY_1: (c) =>
    c.endings.flatMap((e, i) =>
      e.type === 'SECRET' && e.priority !== 1
        ? [
            fail(
              'SECRET_PRIORITY_1',
              `endings[${i}].priority`,
              'Kết cục SECRET luôn có priority 1',
            ),
          ]
        : e.type === 'SECRET' &&
            (!e.extraBehaviour?.trim() || !e.reveals?.trim())
          ? [
              fail(
                'SECRET_PRIORITY_1',
                `endings[${i}]`,
                'Kết cục SECRET cần hành vi điều kiện và điều người chơi nhận ra',
              ),
            ]
          : [],
    ),

  EXTRA_ONLY_SECRET: (c) =>
    c.endings.flatMap((e, i) =>
      e.type !== 'SECRET' && e.extraBehaviour?.trim()
        ? [
            fail(
              'EXTRA_ONLY_SECRET',
              `endings[${i}].extraBehaviour`,
              'Chỉ kết cục SECRET được có hành vi điều kiện',
            ),
          ]
        : [],
    ),

  UNIQUE_PRIORITY: (c) =>
    new Set(c.endings.map((e) => e.priority)).size === c.endings.length
      ? []
      : [fail('UNIQUE_PRIORITY', 'endings', 'Hai kết cục trùng priority')],
};

export const CONTENT_RULES = Object.keys(rules);

/** Hàm thuần: chạy mọi luật. */
export function validateContent(
  content: ScenarioContent,
  ctx: ValidationContext,
): CheckReport {
  const failedRules = Object.values(rules).flatMap((rule) =>
    rule(content, ctx),
  );
  return { passed: failedRules.length === 0, failedRules };
}
