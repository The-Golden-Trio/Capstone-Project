/**
 * R1–R4 trên kịch bản thật "Tối ưu hóa các API bị chậm", hoạt động a2: người
 * chơi vừa chẩn đoán lỗi N+1, An (senior) phản hồi và có thể hỏi đào sâu.
 */
import { describe, expect, it } from 'vitest';
import { fixtureData } from '../../testing/fixture.js';
import { hiddenTexts, narratorView, textsOf } from './narratorView.js';
import {
  FOLLOW_UP_MAX_CHARS,
  followUpLengthStats,
  checkNarration,
  narrationJsonSchema,
  type NarrationCheckContext,
} from './rules.js';

const incident = fixtureData().scenarios['SWE_BACKEND_L3_S_INCIDENT'];
const view = narratorView(incident, 'a2');
const answer =
  'Em nghĩ là lỗi N+1: lấy danh sách đơn xong lại query từng đơn. Em sẽ gộp lại bằng một câu join, và hỏi chị Hoa bên DBA xem có cần thêm index không.';

const ctx = (over: Partial<NarrationCheckContext> = {}): NarrationCheckContext => ({
  visibleTexts: [...textsOf(view), answer],
  hiddenTexts: hiddenTexts(incident, 'a2'),
  castIds: incident.cast.map((c) => c.npc_id),
  finishReason: 'stop',
  ...over,
});

const reply = (o: { speaker?: string; follow_up: string }) =>
  JSON.stringify({ speaker: o.speaker ?? 'an', follow_up: o.follow_up });

const rulesOf = (raw: string, over?: Partial<NarrationCheckContext>) =>
  checkNarration(raw, ctx(over)).violations.map((v) => v.rule);

describe('câu hợp lệ', () => {
  it('qua cả bốn luật', () => {
    const check = checkNarration(
      reply({
        follow_up:
          'Ừ, N+1 là đúng rồi. 900 đơn mà mỗi đơn một query thì chậm là phải. Thế nếu sau này có khách còn nhiều đơn hơn nữa thì endpoint này sẽ ra sao?',
      }),
      ctx(),
    );
    expect(check.violations).toEqual([]);
    expect(check.output?.speaker).toBe('an');
  });

  it('được nhắc tên và số mà chính người chơi đã viết', () => {
    expect(rulesOf(reply({ follow_up: 'Ok, em ping chị Hoa bên DBA luôn đi.' }))).toEqual([]);
  });
});

describe('R1 — không bịa tên, số', () => {
  it('bắt số không có trong kịch bản', () => {
    const check = checkNarration(reply({ follow_up: 'Em sửa trong 15 phút nữa nhé, anh đợi.' }), ctx());
    expect(check.violations.map((v) => v.rule)).toEqual(['R1']);
    expect(check.violations[0].detail).toContain('15');
  });

  it('coi "4.2" và "4,2" là cùng một số', () => {
    expect(rulesOf(reply({ follow_up: 'Từ 200ms lên 4,2s là quá lâu với app mobile.' }))).toEqual([]);
  });

  it('bắt tên người không có trong kịch bản', () => {
    const check = checkNarration(reply({ follow_up: 'Anh vừa hỏi Hùng, cũng thấy y như em nói.' }), ctx());
    expect(check.violations.map((v) => v.rule)).toEqual(['R1']);
    expect(check.violations[0].detail).toContain('Hùng');
  });

  it('bắt tên công nghệ bịa ra — bịa công nghệ là bịa sự thật về nơi làm việc', () => {
    const check = checkNarration(reply({ follow_up: 'Bên mình đang đẩy log qua Kafka mà.' }), ctx());
    expect(check.violations[0]?.detail).toContain('Kafka');
  });

  it('từ viết tắt chung (DB, API, QA) không bị coi là tên bịa — tìm ra khi chạy thử', () => {
    expect(rulesOf(reply({ follow_up: 'Ừ, mỗi đơn một lần chạm DB thì API chậm là phải, QA cũng đang báo.' }))).toEqual([]);
  });

  it('không coi chữ viết hoa đầu câu là tên riêng', () => {
    expect(rulesOf(reply({ follow_up: 'Được. Làm đi, xong ping anh.' }))).toEqual([]);
  });

  it('nhận tên nhân vật dù khác hoa thường (npc_id viết thường)', () => {
    expect(rulesOf(reply({ follow_up: 'Ừ, để anh báo Linh một câu.' }))).toEqual([]);
  });

  it('so tên giữ nguyên dấu: tên bịa "Minh" không được nhận nhờ chữ "mình"', () => {
    // Kịch bản có chữ "mình" ở nhiều chỗ. Bỏ dấu để so thì "Minh" lọt qua.
    expect(JSON.stringify(view)).toContain('mình');
    const check = checkNarration(reply({ follow_up: 'Để anh hỏi Minh xem sao.' }), ctx());
    expect(check.violations[0]?.detail).toContain('Minh');
  });
});

describe('R2 — một ý, nhiều nhất một câu hỏi', () => {
  it('chấp nhận một câu hỏi đơn', () => {
    expect(rulesOf(reply({ follow_up: 'Em định test thế nào?' }))).toEqual([]);
  });

  it('chấp nhận lời dẫn không phải câu hỏi', () => {
    expect(rulesOf(reply({ follow_up: 'Ừ, anh nghe rồi. Em kể anh nghe cách em định test đi.' }))).toEqual([]);
  });

  it('lời dẫn rồi câu hỏi trong cùng một follow_up vẫn là một ý', () => {
    expect(rulesOf(reply({ follow_up: 'Chuẩn. Thế em định test thế nào?' }))).toEqual([]);
  });

  it('từ chối hai câu hỏi — engine chỉ đếm một lượt đào sâu', () => {
    expect(rulesOf(reply({ follow_up: 'Em test thế nào? Và rollback ra sao?' }))).toEqual(['R2']);
  });

  it('từ chối câu hỏi nằm giữa rồi còn nói tiếp', () => {
    expect(rulesOf(reply({ follow_up: 'Em test thế nào? Anh muốn nghe kỹ.' }))).toEqual(['R2']);
  });

  it('chấp nhận dấu ngoặc kép sau dấu hỏi', () => {
    expect(rulesOf(reply({ follow_up: '“Thế em định đo lại bằng cách nào?”' }))).toEqual([]);
  });
});

describe('R3 — không lộ nội dung ẩn', () => {
  it('bắt câu lặp lại nguyên cụm của mốc +2', () => {
    const check = checkNarration(
      reply({ follow_up: 'Em có tính tới join / batch load / eager load không?' }),
      ctx(),
    );
    expect(check.violations.map((v) => v.rule)).toEqual(['R3']);
  });

  it('lời nhắc cho model không nhắc lại cụm bị lộ', () => {
    const [violation] = checkNarration(
      reply({ follow_up: 'Em có tính tới join / batch load / eager load không?' }),
      ctx(),
    ).violations;
    expect(violation.detail).toContain('eager');
    expect(violation.feedback).not.toContain('eager');
  });

  it('bắt câu kể trước sự kiện của hoạt động sau', () => {
    const a3 = incident.activities.find((a) => a.activity_id === 'a3');
    const spoiler = (a3?.setup ?? '').slice(0, 120);
    expect(rulesOf(reply({ follow_up: spoiler.replace(/\?/g, '.') }))).toContain('R3');
  });

  it('GIỚI HẠN ĐÃ BIẾT: không bắt được khi chính mục tiêu đào sâu đã chứa đáp án', () => {
    // Mục tiêu của a2 nói "giới hạn dữ liệu trả về cho tài khoản nhiều đơn" —
    // cũng là mốc +2 của kỹ năng RESTful API Design. AI-4 được thấy mục tiêu,
    // nên cụm này hợp lệ với R3. Chỗ chặn là system prompt ("câu hỏi phải mở")
    // và log review, không phải luật — và gốc của vấn đề là cách viết mục tiêu.
    expect(
      rulesOf(reply({ follow_up: 'Endpoint có nên giới hạn dữ liệu trả về cho tài khoản nhiều đơn không?' })),
    ).toEqual([]);
  });
});

describe('R4 — đúng khuôn', () => {
  it('không phải JSON', () => {
    expect(rulesOf('An gật đầu.')).toEqual(['R4']);
  });

  it('nội dung rỗng — lỗi đã biết của chế độ JSON bên DeepSeek', () => {
    expect(rulesOf('')).toEqual(['R4']);
  });

  it('bị cắt vì chạm giới hạn token', () => {
    expect(rulesOf('{"speaker":"an","follow_up":"Ừ', { finishReason: 'length' })).toEqual(['R4']);
  });

  it('nhân vật không có trong kịch bản', () => {
    expect(rulesOf(reply({ speaker: 'minh', follow_up: 'Ok.' }))).toEqual(['R4']);
  });

  it('thừa trường', () => {
    expect(rulesOf(JSON.stringify({ speaker: 'an', follow_up: null, score: 2 }))).toEqual(['R4']);
  });

  it('quá dài', () => {
    expect(rulesOf(reply({ follow_up: 'à '.repeat(FOLLOW_UP_MAX_CHARS) }))).toEqual(['R4']);
  });

  it('không còn trường narration — gộp vào follow_up', () => {
    expect(rulesOf(JSON.stringify({ speaker: 'an', narration: 'Ừ.', follow_up: 'Em test thế nào?' }))).toEqual(['R4']);
  });

  it('follow_up là null cũng sai khuôn — không được hỏi thì không gọi AI-4', () => {
    expect(rulesOf(JSON.stringify({ speaker: 'an', follow_up: null }))).toEqual(['R4']);
  });

  it('chấp nhận JSON bọc trong ```json', () => {
    expect(rulesOf('```json\n' + reply({ follow_up: 'Ok, làm đi.' }) + '\n```')).toEqual([]);
  });
});

describe('JSON Schema gửi nhà cung cấp', () => {
  it('speaker là enum nhân vật, không cho thêm trường', () => {
    const schema = narrationJsonSchema(['an', 'linh']);
    expect(schema.properties.speaker.enum).toEqual(['an', 'linh']);
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(['speaker', 'follow_up']);
  });
});

describe('followUpLengthStats', () => {
  it('không có câu nào thì không có thống kê', () => {
    expect(followUpLengthStats([])).toBeNull();
  });

  it('đếm ký tự và âm tiết, lấy p50 và p95', () => {
    const texts = Array.from({ length: 20 }, (_, i) => 'a '.repeat(i + 1).trim());
    const stats = followUpLengthStats(texts);
    expect(stats?.count).toBe(20);
    expect(stats?.syllables).toEqual({ mean: 10.5, p50: 10, p95: 19, max: 20 });
    expect(stats?.chars.max).toBe(39);
  });
});
