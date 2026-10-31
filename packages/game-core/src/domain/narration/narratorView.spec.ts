/**
 * Phần kịch bản AI-4 được thấy.
 *
 * Điều đáng kiểm nhất: KHÔNG một chữ rubric nào lọt vào prompt, với MỌI kịch
 * bản và MỌI hoạt động trong bộ dữ liệu thật. Lọc theo danh sách cho phép thì
 * an toàn với trường mới, nhưng chỉ test này mới bắt được khi ai đó lỡ thêm
 * một trường có chứa đáp án vào danh sách cho phép.
 */
import { describe, expect, it } from 'vitest';
import { fixtureData } from '../../testing/fixture.js';
import { canonOrder, hiddenTexts, narratorView } from './narratorView.js';

const data = fixtureData();
const scenarios = Object.entries(data.scenarios);
const incident = data.scenarios['SWE_BACKEND_L3_S_INCIDENT'];

describe('không lộ rubric', () => {
  it.each(scenarios)('%s: mọi hoạt động, không chữ nào của phần chấm lọt vào', (_, scenario) => {
    for (const activity of canonOrder(scenario)) {
      const seen = JSON.stringify(narratorView(scenario, activity.activity_id));

      for (const a of scenario.activities) {
        for (const observe of a.observes)
          for (const anchor of Object.values(observe.anchors))
            expect(seen).not.toContain(anchor);
        for (const hint of a.hints) expect(seen).not.toContain(hint.text);
        if (a.summary) expect(seen).not.toContain(a.summary);
        if (a.choice_reason) expect(seen).not.toContain(a.choice_reason);
        for (const why of a.optionWhy ?? []) expect(seen).not.toContain(why);
      }
      for (const ending of scenario.endings) {
        expect(seen).not.toContain(ending.text);
        if (ending.condition.extra) expect(seen).not.toContain(ending.condition.extra);
      }
    }
  });

  it('không có khoá nào ngoài danh sách cho phép', () => {
    const view = narratorView(incident, 'a2');
    expect(Object.keys(view.activities[0]).sort()).toEqual(
      ['activity_id', 'closing_prompt', 'followup_goal', 'input_prompt', 'npc_line', 'setup', 'type'].sort(),
    );
  });
});

describe('chỉ tới hoạt động hiện tại', () => {
  it('theo thứ tự canon, không có hoạt động sau', () => {
    const view = narratorView(incident, 'a2');
    expect(view.activities.map((a) => a.activity_id)).toEqual(['a1', 'a2']);
    const a3 = incident.activities.find((a) => a.activity_id === 'a3');
    expect(JSON.stringify(view)).not.toContain(a3?.setup);
  });

  it('hoạt động không có trên chuỗi canon thì báo lỗi rõ ràng', () => {
    expect(() => narratorView(incident, 'khong-co')).toThrow(/khong-co/);
  });

  it('cùng đầu vào cho ra đúng một chuỗi — điều kiện để cache trúng', () => {
    expect(JSON.stringify(narratorView(incident, 'a3'))).toBe(
      JSON.stringify(narratorView(incident, 'a3')),
    );
  });
});

describe('nội dung ẩn cho R3', () => {
  const hidden = hiddenTexts(incident, 'a2');

  it('gồm rubric và kết cục', () => {
    const anchor = incident.activities[1].observes[0].anchors['+2'];
    expect(hidden).toContain(anchor);
    expect(hidden).toContain(incident.endings[0].text);
  });

  it('gồm sự kiện của hoạt động sau, không gồm hoạt động hiện tại', () => {
    const a2 = incident.activities.find((a) => a.activity_id === 'a2');
    const a3 = incident.activities.find((a) => a.activity_id === 'a3');
    expect(hidden).toContain(a3?.setup);
    expect(hidden).not.toContain(a2?.setup);
  });
});
