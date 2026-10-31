/**
 * Prompt của AI-4: đúng thứ tự cho cache, không lộ rubric, không bị câu người
 * chơi phá vỡ khung.
 */
import { canonOrder, narratorView, type RuleViolation } from '@datn/game-core';
import { fixtureData } from '@datn/game-core/testing';
import { SAMPLE_ANSWERS, SAMPLE_SCENARIO_KEY, transcriptBefore } from '../testing/sample-turn';
import {
  buildNarratorMessages,
  regenerationMessages,
  seedText,
  type PromptTurn,
} from './narrator.prompt';
import { NARRATOR_PROFILE } from './narrator.profile';
import { NARRATOR_SYSTEM_PROMPT } from './prompts/narrator.v1';

const data = fixtureData();
const scenario = data.scenarios[SAMPLE_SCENARIO_KEY];

const turn = (activityId: string, answer: string): PromptTurn => ({
  view: narratorView(scenario, activityId),
  activityId,
  transcript: transcriptBefore(scenario, activityId),
  answer,
  followUpAllowed: true,
});

const allText = (messages: ReturnType<typeof buildNarratorMessages>) =>
  messages.flatMap((m) => m.parts.map((p) => p.text)).join('\n');

describe('thứ tự cho prompt cache', () => {
  it('hai người chơi khác nhau ở cùng hoạt động: phần đầu tới điểm cache giống hệt', () => {
    const a = buildNarratorMessages(turn('a2', SAMPLE_ANSWERS.dung_kich_ban));
    const b = buildNarratorMessages(turn('a2', SAMPLE_ANSWERS.lac_kich_ban));
    expect(a[0]).toEqual(b[0]);
    expect(a[1].parts[0]).toEqual(b[1].parts[0]);
    expect(a[1].parts[0].cacheBreakpoint).toBe(true);
    expect(a[1].parts[1].text).not.toBe(b[1].parts[1].text);
  });

  it('phần kịch bản của a2 là phần đầu của a3 — cache nối dài qua từng hoạt động', () => {
    const a2 = seedText(narratorView(scenario, 'a2'));
    const a3 = seedText(narratorView(scenario, 'a3'));
    expect(a3.startsWith(a2)).toBe(true);
    expect(a3.length).toBeGreaterThan(a2.length);
  });

  it('câu người chơi nằm SAU điểm cache, không bao giờ trước', () => {
    const [, user] = buildNarratorMessages(turn('a2', 'CÂU-ĐÁNH-DẤU'));
    expect(user.parts[0].text).not.toContain('CÂU-ĐÁNH-DẤU');
    expect(user.parts[1].text).toContain('CÂU-ĐÁNH-DẤU');
  });
});

describe('không lộ rubric — mọi kịch bản, mọi hoạt động, cả prompt', () => {
  it.each(Object.entries(data.scenarios))('%s', (_, s) => {
    for (const activity of canonOrder(s)) {
      const text = allText(
        buildNarratorMessages({
          view: narratorView(s, activity.activity_id),
          activityId: activity.activity_id,
          transcript: [],
          answer: 'x',
          followUpAllowed: true,
        }),
      );
      for (const a of s.activities) {
        for (const o of a.observes) for (const anchor of Object.values(o.anchors)) expect(text).not.toContain(anchor);
        for (const hint of a.hints) expect(text).not.toContain(hint.text);
      }
    }
  });
});

describe('câu người chơi là dữ liệu', () => {
  it('không đóng được thẻ để chèn lệnh ra ngoài', () => {
    const [, user] = buildNarratorMessages(turn('a2', SAMPLE_ANSWERS.tan_cong));
    const dynamic = user.parts[1].text;
    const lastAnswer = dynamic.slice(dynamic.lastIndexOf('<cau_nguoi_choi>'));
    // Chỉ còn đúng một thẻ đóng — của hệ thống, ở cuối. Thẻ người chơi gõ đã bị vô hiệu.
    expect(lastAnswer.match(/<\/cau_nguoi_choi>/g)).toHaveLength(1);
    expect(lastAnswer).toContain('‹/cau_nguoi_choi›');
  });

  it('cả system prompt lẫn message người dùng đều có chữ "json" — điều kiện của json_object', () => {
    const [system, user] = buildNarratorMessages(turn('a2', 'x'));
    expect(system.parts[0].text).toContain('json');
    expect(user.parts.map((p) => p.text).join('')).toContain('json');
  });

  it('system prompt không chứa gì riêng của một kịch bản', () => {
    for (const member of scenario.cast) expect(NARRATOR_SYSTEM_PROMPT).not.toContain(member.role_in_scene);
    expect(NARRATOR_SYSTEM_PROMPT).not.toMatch(/N\+1|orders|Redis/);
  });

  describe('quy tắc chung', () => {
    it('trần token trong prompt lấy từ call profile, không gõ tay', () => {
      expect(NARRATOR_SYSTEM_PROMPT).toContain(`không quá ${NARRATOR_PROFILE.maxOutputTokens} token`);
    });

    it('bắt viết số bằng chữ số, có ví dụ số viết bằng chữ để cấm', () => {
      expect(NARRATOR_SYSTEM_PROMPT).toMatch(/chữ số/);
      for (const bad of ['mười lăm', 'chín', 'năm trăm']) expect(NARRATOR_SYSTEM_PROMPT).toContain(`"${bad}"`);
    });

    it('cấm trả lời chuyện ngoài kịch bản và chửi bậy', () => {
      expect(NARRATOR_SYSTEM_PROMPT).toMatch(/ngoài kịch bản/);
      expect(NARRATOR_SYSTEM_PROMPT).toMatch(/Không chửi bậy/);
    });
  });
});

describe('bắt viết lại', () => {
  const violations: RuleViolation[] = [
    { rule: 'R1', detail: 'Số: 15', feedback: 'Bạn dùng số không có trong kịch bản: 15.' },
    { rule: 'R3', detail: 'Lặp lại nội dung ẩn: "join batch load eager load"', feedback: 'Câu vừa rồi nhắc tới nội dung người chơi chưa được thấy.' },
  ];

  it('nối vào cuối, phần đầu giữ nguyên', () => {
    const base = buildNarratorMessages(turn('a2', 'x'));
    const next = [...base, ...regenerationMessages('{"speaker":"an"}', violations)];
    expect(next.slice(0, 2)).toEqual(base);
    expect(next[2].role).toBe('assistant');
    expect(next[3].role).toBe('user');
  });

  it('nói luật nào bị vi phạm nhưng không nhắc lại cụm rubric bị lộ', () => {
    const [, feedback] = regenerationMessages('{}', violations);
    const text = feedback.parts[0].text;
    expect(text).toContain('R1');
    expect(text).toContain('15');
    expect(text).toContain('R3');
    expect(text).not.toContain('eager');
  });
});
