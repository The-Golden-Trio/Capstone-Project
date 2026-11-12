import type { ScenarioContent } from '../dto/scenario-content.schema';
import { ScenarioContentSchema } from '../dto/scenario-content.schema';
import {
  CONTENT_RULES,
  estimateMinutes,
  validateContent,
} from './content-validator';
import { sampleContent } from './sample-content';

const K1 = '00000000-0000-4000-8000-000000000001';
const K2 = '00000000-0000-4000-8000-000000000002';
const ctx = { levelNo: 3, skillIds: [K1, K2] };

const base = (): ScenarioContent => sampleContent([K1, K2]);
const rulesOf = (c: ScenarioContent, c2 = ctx) =>
  validateContent(c, c2).failedRules.map((f) => f.rule);

describe('ContentValidator', () => {
  it('nội dung mẫu đạt mọi luật và đúng schema openapi', () => {
    expect(ScenarioContentSchema.safeParse(base()).success).toBe(true);
    expect(validateContent(base(), ctx)).toEqual({
      passed: true,
      failedRules: [],
    });
    expect(estimateMinutes(base())).toEqual({ min: 12.5, max: 12.5 });
  });

  const cases: Array<[string, (c: ScenarioContent) => void, typeof ctx?]> = [
    ['ACTIVITY_COUNT', (c) => c.activities.splice(2)],
    ['UNIQUE_KEYS', (c) => (c.activities[2].key = 'a2')],
    ['ONE_ORIGIN_ACTIVITY', (c) => (c.activities[1].isOrigin = true)],
    ['FORWARD_POINTER_VALID', (c) => (c.activities[0].forwardTo = 'zz')],
    ['ONE_FINAL_ACTIVITY', (c) => (c.activities[1].forwardTo = null)],
    [
      'ALL_ACTIVITIES_REACHABLE',
      (c) => {
        c.activities[0].forwardTo = 'a3';
      },
    ],
    [
      'SKILL_IN_SCOPE',
      (c) =>
        (c.activities[0].rubric[0].competencyId =
          '00000000-0000-4000-8000-000000000009'),
    ],
    ['FREE_TEXT_FOLLOWUP_GOAL', (c) => (c.activities[0].followupGoal = '')],
    [
      'FOLLOWUP_ONLY_FREE_TEXT',
      (c) => {
        c.activities[0].allowedTypes = ['CHOICE'];
      },
    ],
    [
      'FOLLOWUP_CAP_BAND',
      (c) => {
        c.activities[0].followupLimit = 2;
      },
    ],
    [
      'CLOSED_ACTIVITY_CAP_BAND',
      (c) => {
        for (const a of c.activities.slice(0, 2)) {
          a.allowedTypes = ['CHOICE'];
          a.followupLimit = 0;
          a.hints = [];
          a.items = [0, 1, 2].map((i) => ({
            key: `o${i}`,
            text: 'x',
            score: 1 as const,
          }));
        }
      },
    ],
    [
      'CLOSED_ITEMS_PRESENT',
      (c) => {
        c.activities[0].allowedTypes = ['FREE_TEXT', 'ORDERING'];
        c.activities[0].items = [{ key: 's1', text: 'x' }];
      },
    ],
    [
      'ESTIMATED_MINUTES_RANGE',
      (c) => {
        c.activities.push({ ...c.activities[2], key: 'a4', forwardTo: null });
        c.activities[2].forwardTo = 'a4';
      },
      { levelNo: 7, skillIds: [K1, K2] },
    ],
    ['REQUIRED_TEXT', (c) => (c.stakes = '')],
    [
      'RANDOM_EVENT_ACTIVITY_VALID',
      (c) =>
        (c.randomEvents = [
          {
            activityKey: 'nope',
            chance: 0.2,
            text: 'x',
            prompt: 'x',
            targetCompetencyId: K1,
            anchor2: 'x',
            anchor1: 'x',
            anchor0: 'x',
          },
        ]),
    ],
    ['ENDING_TYPES', (c) => (c.endings[1].type = 'PARTIAL')],
    ['ENDING_CATCH_ALL', (c) => (c.endings[2].minTotalScore = 1)],
    ['SECRET_PRIORITY_1', (c) => (c.endings[0].reveals = '')],
    ['EXTRA_ONLY_SECRET', (c) => (c.endings[1].extraBehaviour = 'x')],
    ['UNIQUE_PRIORITY', (c) => (c.endings[1].priority = 1)],
  ];

  it('mỗi luật có một ca trượt', () => {
    expect(new Set(cases.map(([r]) => r))).toEqual(new Set(CONTENT_RULES));
  });

  it.each(cases.map(([rule, mutate, c2]) => ({ rule, mutate, c2 })))(
    '$rule trượt khi vi phạm',
    ({ rule, mutate, c2 }) => {
      const content = base();
      mutate(content);
      expect(rulesOf(content, c2 ?? ctx)).toContain(rule);
    },
  );

  it('chưa chọn năng lực thì SKILL_IN_SCOPE trượt', () => {
    expect(rulesOf(base(), { levelNo: 3, skillIds: [] })).toContain(
      'SKILL_IN_SCOPE',
    );
  });
});
