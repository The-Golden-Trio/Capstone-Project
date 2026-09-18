/**
 * Chấm câu tự luận của nhiệm vụ phụ.
 *
 * Điều quan trọng nhất ở đây không phải là chấm giỏi, mà là KHÔNG đoán bừa:
 * gán một người vào hướng họ không hề chọn thì tệ hơn hẳn việc mời họ viết
 * lại rõ hơn.
 */
import { describe, expect, it } from 'vitest';
import { fixtureIndex } from '../testing/fixture.js';
import { MIN_ANSWER_LENGTH, keywords, matchChoice } from './sideQuestGrader.js';

const game = fixtureIndex();

const backend = game.data.roles.find((r) => r.role_code === 'SWE_BACKEND');
if (!backend) throw new Error('Bộ dữ liệu không còn SWE_BACKEND');

const events = game.eventsForRole(backend);
const event = events[0];

describe('rút từ khoá', () => {
  it('bỏ dấu tiếng Việt', () => {
    expect(keywords('Tối ưu truy vấn')).toContain('truy');
    expect(keywords('Tối ưu truy vấn')).toContain('van');
  });

  it('bỏ hư từ và từ quá ngắn', () => {
    const out = keywords('tôi sẽ làm việc của mình với các bạn');
    expect(out).not.toContain('cua');
    expect(out).not.toContain('voi');
    expect(out).not.toContain('se');
  });
});

describe('đọc ra hướng xử lý', () => {
  it('câu nhắc lại đúng chữ của một hướng thì ra hướng đó', () => {
    for (const choiceIndex of event.choices.map((_, i) => i)) {
      const match = matchChoice(event, event.choices[choiceIndex].text);
      expect(match).not.toBeNull();
      expect(match?.choiceIndex).toBe(choiceIndex);
    }
  });

  it('KHÔNG ĐOÁN BỪA khi câu không chạm vào hướng nào', () => {
    expect(matchChoice(event, 'Hôm nay trời nắng đẹp quá đi mất')).toBeNull();
  });

  it('câu quá ngắn thì không chấm', () => {
    const tooShort = 'a'.repeat(MIN_ANSWER_LENGTH - 1);
    expect(matchChoice(event, tooShort)).toBeNull();
    expect(matchChoice(event, '   ')).toBeNull();
  });

  it('cùng một câu luôn ra cùng một hướng', () => {
    const answer = event.choices[1].text;
    expect(matchChoice(event, answer)).toEqual(matchChoice(event, answer));
  });

  it('chỉ trả về hướng có thật trong dữ liệu', () => {
    for (const e of events) {
      for (const choice of e.choices) {
        const match = matchChoice(e, choice.text);
        if (!match) continue;
        expect(match.choiceIndex).toBeGreaterThanOrEqual(0);
        expect(match.choiceIndex).toBeLessThan(e.choices.length);
      }
    }
  });

  it('MỌI HƯỚNG ĐỀU CÓ TỪ KHOÁ ĐỂ CHẤM ĐƯỢC', () => {
    // Một hướng mà lời mô tả toàn hư từ thì không người chơi nào chạm tới
    // được — họ viết gì cũng sẽ bị đẩy sang hướng khác.
    for (const role of game.data.roles) {
      for (const e of game.eventsForRole(role)) {
        for (const choice of e.choices) {
          expect(keywords(choice.text).length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('nhắc lại lời của một hướng (đủ dài) thì ra đúng hướng ấy', () => {
    for (const role of game.data.roles) {
      for (const e of game.eventsForRole(role)) {
        for (const choice of e.choices) {
          // Có hướng viết rất ngắn ("Làm theo ý sếp", 14 ký tự) nên tự nó đã
          // dưới ngưỡng tối thiểu; thêm một câu giải thích cho đúng cách người
          // chơi thật sẽ viết.
          const answer = `${choice.text}. Mình chọn cách này.`;
          expect(matchChoice(e, answer)).not.toBeNull();
        }
      }
    }
  });
});
