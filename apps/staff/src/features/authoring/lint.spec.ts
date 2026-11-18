import { describe, expect, it } from 'vitest';
import type { ActivityContent, ScenarioContent } from '../../api/types';
import {
  activityIndexOfPath,
  countByTab,
  lintContent,
  sentencesOf,
  tabOfPath,
} from './lint';

const C1 = '00000000-0000-4000-8000-000000000001';
const C2 = '00000000-0000-4000-8000-000000000002';
const C3 = '00000000-0000-4000-8000-000000000003';

const anchor = 'Nêu đủ các bước, kèm lý do và rủi ro của từng bước';

function activity(
  key: string,
  forwardTo: string | null,
  competencyId: string,
  patch: Partial<ActivityContent> = {},
): ActivityContent {
  return {
    key,
    isOrigin: key === 'a1',
    forwardTo,
    setup: 'Log ghi hỏi cơ sở dữ liệu 901 lần.',
    npcLine: 'Sáng nay API chậm hẳn. Em xem giúp anh được không?',
    inputPrompt: 'Bạn làm gì tiếp?',
    jobScope: 'Được tự sửa code của mình; không tự deploy khi chưa được duyệt.',
    closingLine: 'Ừ, làm tiếp đi.',
    allowedTypes: ['FREE_TEXT'],
    items: [],
    rubric: [
      { competencyId, anchor2: anchor, anchor1: anchor, anchor0: anchor },
    ],
    ...patch,
  };
}

function content(patch: Partial<ScenarioContent> = {}): ScenarioContent {
  return {
    intro: 'Bạn là lập trình viên back-end.',
    situation:
      'API lịch sử đơn chậm giữa giờ cao điểm. Thường 0,2 giây, sáng nay 4 giây.',
    stakes: 'Khách không xem được đơn.',
    cast: [
      {
        npcKey: 'lead',
        roleInScene: 'Trưởng nhóm',
        pressure: 'Cần sửa trước trưa.',
      },
      { npcKey: 'pm', roleInScene: 'PM', pressure: 'Khách đang phàn nàn.' },
    ],
    activities: [
      activity('a1', 'a2', C1, {
        allowedTypes: ['CHOICE'],
        items: [
          { key: 'o1', text: 'Xem log', score: 2, why: 'Có dữ kiện' },
          { key: 'o2', text: 'Restart', score: 0, why: 'Che lỗi' },
        ],
      }),
      activity('a2', 'a3', C2),
      activity('a3', null, C3),
    ],
    endings: [
      { type: 'GOOD', priority: 1, text: 'Tốt' },
      { type: 'BAD', priority: 2, text: 'Chưa tốt' },
    ],
    ...patch,
  };
}

const ids = (c: ScenarioContent) => lintContent(c).map((h) => h.id);

describe('lintContent', () => {
  it('bản soạn theo đúng hướng dẫn không có gợi ý', () => {
    expect(lintContent(content())).toEqual([]);
  });

  it('nhắc số NPC ngoài 2–6 và NPC thiếu áp lực', () => {
    const c = content({
      cast: [{ npcKey: 'lead', roleInScene: 'Trưởng nhóm' }],
    });
    expect(ids(c)).toEqual(
      expect.arrayContaining(['CAST_COUNT', 'CAST_PRESSURE']),
    );
  });

  it('nhắc activity kết không cho tự luận và màn không có dạng đóng', () => {
    const base = content();
    const c = content({
      activities: [
        activity('a1', 'a2', C1),
        activity('a2', 'a3', C2),
        activity('a3', null, C3, {
          allowedTypes: ['ORDERING'],
          items: [{ key: 'o1', text: 'Bước 1', correctPosition: 1, why: 'x' }],
        }),
      ],
    });
    expect(ids(c)).toContain('END_WRITTEN');
    expect(ids(c)).not.toContain('NO_CLOSED_FORMAT');
    const allFree = content({
      activities: base.activities.map((a) => ({
        ...a,
        allowedTypes: ['FREE_TEXT'],
      })),
    });
    expect(ids(allFree)).toContain('NO_CLOSED_FORMAT');
  });

  it('nhắc phương án thiếu lý do, thiếu điểm, thiếu mục 2 hoặc 0', () => {
    const withItems = (items: ActivityContent['items']) =>
      content({
        activities: [
          activity('a1', 'a2', C1, { allowedTypes: ['CHOICE'], items }),
          activity('a2', 'a3', C2),
          activity('a3', null, C3),
        ],
      });
    expect(ids(withItems([{ key: 'o1', text: 'A', score: 2 }]))).toContain(
      'ITEM_REASON',
    );
    expect(ids(withItems([{ key: 'o1', text: 'A', why: 'x' }]))).toContain(
      'CHOICE_SCORE_MISSING',
    );
    expect(
      ids(
        withItems([
          { key: 'o1', text: 'A', score: 2, why: 'x' },
          { key: 'o2', text: 'B', score: 1, why: 'y' },
        ]),
      ),
    ).toContain('CHOICE_PROFILE');
  });

  it('nhắc mốc chấm quá ngắn', () => {
    const c = content({
      activities: [
        activity('a1', 'a2', C1, {
          rubric: [
            {
              competencyId: C1,
              anchor2: 'Giao tiếp tốt',
              anchor1: anchor,
              anchor0: anchor,
            },
          ],
        }),
        activity('a2', 'a3', C1),
        activity('a3', null, C1),
      ],
    });
    const hints = lintContent(c);
    expect(hints.find((h) => h.id === 'ANCHOR_SHORT')?.path).toBe(
      'activities[0].rubric[0]',
    );
  });

  it('nhắc câu hỏi không ở cuối, câu quá dài, câu hỏi kiến thức, phạm vi một vế', () => {
    const c = content({
      activities: [
        activity('a1', 'a2', C1, {
          allowedTypes: ['CHOICE'],
          items: [
            { key: 'o1', text: 'A', score: 2, why: 'x' },
            { key: 'o2', text: 'B', score: 0, why: 'y' },
          ],
          npcLine: 'Em xem được không? Anh đang họp.',
          closingLine: 'a'.repeat(130) + '.',
          inputPrompt: 'Lỗi này tên là gì?',
          jobScope: 'Được tự sửa code.',
        }),
        activity('a2', 'a3', C2),
        activity('a3', null, C3),
      ],
    });
    expect(ids(c)).toEqual(
      expect.arrayContaining([
        'QUESTION_LAST',
        'BEAT_TOO_LONG',
        'KNOWLEDGE_QUESTION',
        'JOB_SCOPE_LIMITS',
      ]),
    );
  });

  it('nhắc tình huống ngoài 2–4 câu và kết cục bí mật thiếu hành vi', () => {
    const c = content({
      situation: 'API chậm.',
      endings: [
        { type: 'SECRET', priority: 1, text: 'Bí mật' },
        { type: 'GOOD', priority: 2, text: 'Tốt' },
      ],
    });
    expect(ids(c)).toEqual(
      expect.arrayContaining(['SITUATION_LENGTH', 'SECRET_BEHAVIOUR']),
    );
  });
});

describe('đường dẫn và đếm', () => {
  it('ánh xạ đường dẫn sang tab và chỉ số activity', () => {
    expect(tabOfPath('activities[2].items[0]')).toBe('activities');
    expect(tabOfPath('randomEvents[0]')).toBe('events');
    expect(tabOfPath('situation')).toBe('intro');
    expect(activityIndexOfPath('activities[2].rubric[0]')).toBe(2);
    expect(activityIndexOfPath('cast[0]')).toBeNull();
  });

  it('đếm gợi ý theo tab', () => {
    const counts = countByTab(
      lintContent(content({ cast: [], situation: 'Một câu.' })),
    );
    expect(counts.cast).toBe(1);
    expect(counts.intro).toBe(1);
  });

  it('tách câu theo dấu kết câu và xuống dòng', () => {
    expect(sentencesOf('A. B? C!\nD')).toEqual(['A.', 'B?', 'C!', 'D']);
  });
});
