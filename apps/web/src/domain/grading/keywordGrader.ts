/**
 * Chấm câu gõ tự do bằng so khớp từ khoá — bản prototype.
 *
 * Bản thật để AI đọc câu trả lời rồi đối chiếu ba mốc hành vi trong
 * `observes[].anchors`. Cùng cơ chế, khác bộ óc: chỉ cần viết một
 * `aiGrader.ts` cũng implement `TextGrader` rồi đổi export ở cuối file này.
 */
import { normalizeVi } from '../format';
import type { Anchor, GradeTextInput, TextGrader } from './types';

/** Câu đã chuẩn hoá có chứa từ khoá nào trong danh sách không. */
const has = (normalized: string, ...words: string[]): boolean =>
  words.some((word) => normalized.includes(normalizeVi(word)));

type SkillGrader = (normalized: string, activityId: string) => Anchor;

const SKILL_GRADERS: Record<string, SkillGrader> = {
  'Giải quyết vấn đề': (text, activityId) => {
    // a4 là câu báo cáo: cần nêu nguyên nhân, mốc thời gian, và giữ chỗ ngờ.
    if (activityId === 'a4') {
      const cause = has(text, 'n+1', 'query', 'truy vấn', 'gọi db', 'batch');
      const when = has(
        text,
        'phút',
        'giờ',
        'trưa',
        'chiều',
        'hôm nay',
        'xong review',
      );
      const hedge = has(
        text,
        'chưa chắc',
        'cần kiểm',
        'đang chờ',
        'dự kiến',
        'nếu',
        'khoảng',
      );
      if (cause && when && hedge) return '+2';
      return cause || when ? '0' : '-1';
    }

    // Nâng cấu hình là né nguyên nhân, không phải sửa.
    if (
      has(
        text,
        'tăng ram',
        'tăng cpu',
        'nâng cấu hình',
        'tăng cấu hình',
        'timeout',
        'nới thời gian',
        'scale up',
      )
    ) {
      return '-1';
    }

    const named = has(text, 'n+1', 'n + 1', 'vòng lặp query');
    const fixed = has(
      text,
      'join',
      'batch',
      'eager',
      'query in',
      ' in (',
      'gộp',
      'một query',
      '1 query',
      'preload',
    );
    if (named && fixed) return '+2';
    return named || fixed || has(text, 'query', 'truy vấn') ? '0' : '-1';
  },

  'RESTful API Design': (text) => {
    if (has(text, 'trả toàn bộ', 'trả hết', 'tất cả đơn', 'toàn bộ lịch sử'))
      return '-1';
    return has(
      text,
      'phân trang',
      'pagination',
      'paging',
      'limit',
      'giới hạn',
      'offset',
      'cursor',
    )
      ? '+2'
      : '0';
  },

  Redis: (text) => {
    if (
      has(text, 'cache toàn bộ', 'cache cả response', 'cache hết', 'toàn bộ response')
    ) {
      return '-1';
    }
    return has(
      text,
      'đã đóng',
      'đã hoàn thành',
      'cũ',
      'không đổi',
      'bất biến',
      'đã xong',
      'ttl',
      'invalid',
      'hết hạn',
      'đánh đổi',
      'stale',
      'chưa cần',
    )
      ? '+2'
      : '0';
  },

  'Giao tiếp cơ bản trong team': (text) => {
    const what = has(text, '500', 'profile', 'avatar', 'ảnh đại diện', 'bug', 'lỗi');
    const how = has(text, 'join', 'truy vấn', 'query', 'sửa', 'test', 'pr', 'pull request');
    const doubt = has(
      text,
      'chưa chắc',
      'không chắc',
      'anh xem',
      'anh check',
      'em hỏi',
      'có đúng không',
      'liệu',
      'nên không',
    );
    if (what && how && doubt) return '+2';
    return (what && how) || (what && doubt) ? '0' : '-1';
  },
};

/**
 * "Bí mật" của từng kịch bản: người chơi tự nhận ra đây là lỗi thiết kế chờ
 * sẵn, không phải sự cố lẻ. Chạm được thì mở kết cục SECRET.
 */
const SECRET_TESTS: Record<string, (normalized: string) => boolean> = {
  SWE_BACKEND_L3_S_INCIDENT: (text) =>
    has(text, 'giới hạn', 'không giới hạn', 'limit', 'phân trang') &&
    has(
      text,
      'bất kỳ',
      'khách khác',
      'tài khoản nào',
      'ai cũng',
      'sẽ lại',
      'lặp lại',
      'còn ai',
      'người khác',
      'tương tự',
    ),
  SWE_BACKEND_L1_S_EXEC: (text) =>
    has(
      text,
      'chỗ khác',
      'endpoint khác',
      'chỗ nào nữa',
      'còn chỗ',
      'rà',
      'kiểm tra lại',
      'tương tự',
      'cùng kiểu',
      'giống vậy',
      'giống thế',
    ) &&
    has(
      text,
      'join',
      'null',
      'rỗng',
      'avatar',
      'ảnh',
      'lỗi này',
      'lỗi đó',
      'bug này',
      'kiểu này',
    ),
};

export const keywordGrader: TextGrader = {
  grade({ text, activityId, skill }: GradeTextInput): Anchor {
    const normalized = normalizeVi(text);
    const grader = SKILL_GRADERS[skill];
    if (grader) return grader(normalized, activityId);
    // Kỹ năng chưa có bộ chấm riêng: chỉ phân biệt "có viết gì đó" với "viết cho có".
    return text.length > 90 ? '0' : '-1';
  },

  hitsSecret({ text, scenarioKey }): boolean {
    const test = SECRET_TESTS[scenarioKey];
    return test ? test(normalizeVi(text)) : false;
  },
};

/** Bộ chấm mặc định của app. Đổi sang bộ chấm AI thì sửa đúng dòng này. */
export const defaultTextGrader: TextGrader = keywordGrader;
