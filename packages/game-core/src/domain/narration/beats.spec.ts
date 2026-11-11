/**
 * R1–R4 bản nhịp (D-130) trên một cảnh của seed Back-end L3 m2: anh mentor
 * nhắn chat, chị support có mặt trong kênh.
 */
import { describe, expect, it } from 'vitest';
import {
  BEAT_MAX_CHARS,
  beatsJsonSchema,
  checkBeats,
  type Beat,
  type BeatsCheckContext,
} from './beats.js';

const card =
  '[mentor] Sang, 36 tuổi. Vai trong màn: mentor của người chơi. Biết: API lịch sử đơn chậm từ 8:00: thường 0,2 giây, giờ hơn 4 giây; release module thanh toán lúc 14:00.';

const ctx = (over: Partial<BeatsCheckContext> = {}): BeatsCheckContext => ({
  task: 'reply',
  lead: 'mentor',
  speakers: ['mentor', 'support'],
  questionAllowed: true,
  maxBeats: 5,
  visibleTexts: [card, 'Em xem log thấy query tăng theo số đơn ạ.'],
  hiddenTexts: [
    'Nguyên nhân: lấy chi tiết từng đơn trong một vòng lặp',
    'Minh Phát doạ huỷ hợp đồng nếu trưa còn chậm',
  ],
  finishReason: 'stop',
  ...over,
});

const beat = (
  text: string,
  speaker = 'mentor',
  expression: Beat['expression'] = 'binh_thuong',
): Beat => ({ speaker, text, expression });
const reply = (beats: Beat[], question_by: string | null = null) =>
  JSON.stringify({ beats, question_by });
const rulesOf = (raw: string, over?: Partial<BeatsCheckContext>) =>
  checkBeats(raw, ctx(over)).violations.map((v) => v.rule);

describe('lượt hợp lệ', () => {
  it('đáp rồi hỏi một câu ở nhịp cuối', () => {
    const raw = reply(
      [
        beat('Ừ, query tăng theo số đơn là đáng ngờ.', 'mentor', 'suy_nghi'),
        beat('Em coi thêm chỗ nào nữa?'),
      ],
      'mentor',
    );
    expect(checkBeats(raw, ctx())).toMatchObject({
      violations: [],
      output: { question_by: 'mentor' },
    });
  });

  it('lời cảnh không biểu cảm; model ghi mã cho cảnh thì bỏ đi, không bắt viết lại', () => {
    const raw = reply([
      beat('Bạn thấy anh Sang gõ nhanh vào khung chat.', 'canh', 'vui'),
      beat('Ừ, gửi anh log nha.'),
    ]);
    const check = checkBeats(raw, ctx());
    expect(check.violations).toEqual([]);
    expect(check.output?.beats[0].expression).toBeNull();
  });

  it('mốc giờ chỉ cho phép phần giờ, không cho phép phút tuỳ ý', () => {
    expect(rulesOf(reply([beat('Cho anh 45 phút thôi.')]))).toEqual(['R1']);
  });

  it('mốc "8:00" trong thẻ thì nói "8 giờ" được', () => {
    expect(rulesOf(reply([beat('Từ 8 giờ sáng là chậm rồi.')]))).toEqual([]);
  });

  it('được dùng số và tên có trong thẻ', () => {
    expect(
      rulesOf(
        reply([
          beat('Từ 8:00 tới giờ hơn 4 giây rồi, mà 14:00 anh phải release.'),
        ]),
      ),
    ).toEqual([]);
  });
});

describe('R1 — không bịa tên, số', () => {
  it('bắt số không có nguồn', () => {
    expect(rulesOf(reply([beat('Anh cho em 30 phút nha.')]))).toEqual(['R1']);
  });

  it('bắt tên người không có nguồn', () => {
    expect(rulesOf(reply([beat('Để anh hỏi Tuấn bên DBA.')]))).toEqual(['R1']);
  });
});

describe('R2 — câu hỏi', () => {
  it('hai câu hỏi trong một lượt', () => {
    expect(
      rulesOf(reply([beat('Em chắc chưa?'), beat('Log nói gì?')], 'mentor')),
    ).toContain('R2');
  });

  it('câu hỏi không ở nhịp cuối', () => {
    expect(
      rulesOf(
        reply([beat('Em chắc chưa?'), beat('Gửi anh log nha.')], 'mentor'),
      ),
    ).toEqual(['R2']);
  });

  it('câu hỏi lại kiểu "vậy hả?" cũng là câu hỏi', () => {
    expect(
      rulesOf(reply([beat('Vậy hả?')]), { questionAllowed: false }),
    ).toEqual(['R2', 'R2']);
  });

  it('lời cảnh không bao giờ hỏi', () => {
    expect(
      rulesOf(
        reply([beat('Bạn có nghe điện thoại reo không?', 'canh', null)], null),
      ),
    ).toContain('R2');
  });

  it('chỉ nhân vật engine giao được hỏi', () => {
    expect(
      rulesOf(
        reply([beat('Em ơi bên đó sao rồi?', 'support', 'lo_lang')], 'support'),
      ),
    ).toEqual(['R2']);
  });

  it('question_by phải khớp người hỏi', () => {
    expect(rulesOf(reply([beat('Ừ, gửi anh log nha.')], 'mentor'))).toEqual([
      'R2',
    ]);
    expect(rulesOf(reply([beat('Em coi chỗ nào nữa?')], null))).toEqual(['R2']);
  });

  it('probe phải có đúng một câu hỏi của người hỏi', () => {
    expect(
      rulesOf(reply([beat('Ừ, anh coi ghi chú rồi.')]), { task: 'probe' }),
    ).toEqual(['R2']);
    expect(
      rulesOf(reply([beat('Em dựa vào đâu để loại khả năng đó?')], 'mentor'), {
        task: 'probe',
      }),
    ).toEqual([]);
  });

  it('probe vẫn hỏi được dù cờ hỏi tắt — engine giao probe tức là cho hỏi', () => {
    expect(
      rulesOf(reply([beat('Em dựa vào đâu vậy?')], 'mentor'), {
        task: 'probe',
        questionAllowed: false,
      }),
    ).toEqual([]);
  });
});

describe('R3 — không lộ nội dung ẩn', () => {
  it('bắt cụm lặp lại nguyên nhân mà nhân vật chưa được nói', () => {
    const check = checkBeats(
      reply([beat('Chắc là lấy chi tiết từng đơn trong vòng lặp đó em.')]),
      ctx(),
    );
    expect(check.violations.map((v) => v.rule)).toEqual(['R3']);
    expect(check.violations[0].feedback).not.toContain('vòng lặp');
  });
});

describe('R3 — không khen chê người chơi', () => {
  it.each([
    'Em làm kỹ lắm, anh yên tâm.',
    'Ừ, cách so sánh đó hợp lý.',
    'Ừ, logic đó đúng.',
    'Em giỏi ghê.',
  ])('bắt "%s"', (text) => {
    expect(rulesOf(reply([beat(text)]))).toEqual(['R3']);
  });

  it('xác nhận dữ kiện mình biết thì được (D4)', () => {
    expect(
      rulesOf(reply([beat('Ừ, đúng là query tăng theo số đơn.')])),
    ).toEqual([]);
  });

  it('không bắt chữ nằm trong một từ khác', () => {
    expect(rulesOf(reply([beat('Anh đang dí release, em coi giùm.')]))).toEqual(
      [],
    );
  });
});

describe('R4 — đúng khuôn', () => {
  it('không phải json, rỗng, bị cắt', () => {
    expect(rulesOf('Sang gật đầu.')).toEqual(['R4']);
    expect(rulesOf('')).toEqual(['R4']);
    expect(rulesOf('{"beats": [', { finishReason: 'length' })).toEqual(['R4']);
  });

  it('nhịp quá dài', () => {
    expect(rulesOf(reply([beat('à '.repeat(BEAT_MAX_CHARS))]))).toEqual(['R4']);
  });

  it('quá số nhịp engine giao', () => {
    expect(
      rulesOf(reply([beat('Ừ.'), beat('Được.')]), { maxBeats: 1 }),
    ).toEqual(['R4']);
  });

  it('biểu cảm ngoài bộ 8 mã hay bị bỏ trống: ép về binh_thuong, không bắt viết lại (Seed C3, E8)', () => {
    const odd = checkBeats(
      JSON.stringify({
        beats: [{ speaker: 'mentor', text: 'Ừ.', expression: 'tuc_gian' }],
        question_by: null,
      }),
      ctx(),
    );
    const blank = checkBeats(reply([beat('Ừ.', 'mentor', null)]), ctx());
    for (const check of [odd, blank]) {
      expect(check.violations).toEqual([]);
      expect(check.output?.beats[0].expression).toBe('binh_thuong');
    }
  });

  it('người nói không có mặt', () => {
    expect(rulesOf(reply([beat('Chào em.', 'khach')]))).toEqual(['R4']);
  });

  it('dấu ngoặc nhọn của chỗ giữ tên lọt ra lời', () => {
    expect(rulesOf(reply([beat('Ừ, {ten} gửi anh log nha.')]))).toEqual(['R4']);
  });

  it('thừa trường', () => {
    expect(
      rulesOf(
        JSON.stringify({ beats: [beat('Ừ.')], question_by: null, score: 2 }),
      ),
    ).toEqual(['R4']);
  });
});

describe('JSON Schema gửi nhà cung cấp', () => {
  it('người nói và người hỏi là enum các slot có mặt; cảnh không được hỏi', () => {
    const schema = beatsJsonSchema(['mentor', 'support'], 2);
    expect(schema.properties.beats.items.properties.speaker.enum).toEqual([
      'mentor',
      'support',
      'canh',
    ]);
    expect(schema.properties.question_by.enum).toEqual([
      'mentor',
      'support',
      null,
    ]);
    expect(schema.properties.beats.maxItems).toBe(2);
    expect(schema.additionalProperties).toBe(false);
  });
});
