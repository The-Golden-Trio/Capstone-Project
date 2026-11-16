import type { Achievement, Company, QuizForm, RatingCriterion } from '../types';
import { baseCatalogue } from './data';
const cluster1 = [
  ['I', 'Điện thoại bỗng chạy chậm, bạn mày mò tìm cho ra nguyên nhân'],
  ['S', 'Giảng lại bài cho một bạn cùng lớp chưa hiểu'],
  ['C', 'Sắp xếp lại thư mục ảnh và tài liệu trong máy cho gọn gàng'],
  ['A', 'Làm slide thuyết trình thật đẹp và khác mọi người'],
  ['R', 'Lắp một kệ sách hay mô hình theo hướng dẫn trong hộp'],
  ['E', 'Thuyết phục cả nhóm làm theo ý tưởng của mình'],
] as const;
const cluster2 = [
  ['I', 'Đọc để hiểu vì sao có cầu vồng, nhật thực hay động đất'],
  ['S', 'Lắng nghe và an ủi một người bạn đang buồn'],
  ['C', 'Ghi chi tiêu hằng tháng vào một bảng và giữ cho nó luôn đúng'],
  ['A', 'Vẽ tranh, chụp ảnh, dựng video hay viết truyện của riêng mình'],
  ['R', 'Tự tay sửa chiếc xe đạp hay cái quạt bị hỏng ở nhà'],
  ['E', 'Đứng ra lo buổi sinh nhật hay chuyến đi chơi của lớp'],
] as const;
export const quizForm: QuizForm = {
  cards: [
    ...cluster1.map(([axis, text]) => ({
      id: `c1-${axis}`,
      cluster: 1 as const,
      axis,
      text,
    })),
    ...cluster2.map(([axis, text]) => ({
      id: `c2-${axis}`,
      cluster: 2 as const,
      axis,
      text,
    })),
    ...baseCatalogue.regions.map((r) => ({
      id: `c3-${r.id}`,
      cluster: 3 as const,
      regionId: r.id,
      text: r.card,
    })),
  ],
  // Danh sách có sẵn trong prototype ban-thu-get-to-know-me.html.
  interests: [
    'Chơi game',
    'Đọc sách, truyện',
    'Xem phim',
    'Nghe nhạc, chơi nhạc',
    'Vẽ',
    'Chụp ảnh, quay video',
    'Thể thao',
    'Nấu ăn',
    'Du lịch',
    'Công nghệ, máy tính',
    'Lắp ráp, sửa đồ',
    'Viết lách',
    'Học ngoại ngữ',
    'Buôn bán nhỏ',
    'Tình nguyện',
    'Nuôi thú cưng',
    'Khoa học, thiên văn',
    'Thời trang',
    'Làm nội dung mạng xã hội',
    'Cờ, giải đố',
  ],
  goals: [
    {
      id: 'g1',
      question: 'Ước mơ của bạn là gì?',
      label: 'Đích xa',
      options: [
        'Làm ra thứ được nhiều người dùng',
        'Có thu nhập tốt, lo được cho gia đình',
        'Giúp đỡ được nhiều người',
        'Tự làm chủ, có công ty riêng',
        'Đi nhiều nơi, trải nghiệm thế giới',
      ],
    },
    {
      id: 'g2',
      question: 'Vì sao điều đó quan trọng với bạn?',
      label: 'Vì',
      options: [
        'Lo được cho gia đình',
        'Được làm điều mình thích',
        'Thấy mình có ích',
        'Được tự quyết định',
        'Được người khác công nhận',
      ],
    },
    {
      id: 'g3',
      question: 'Bạn muốn mình giỏi lên ở điều gì?',
      label: 'Cần giỏi lên',
      options: [
        'Tự tin nói trước đám đông',
        'Giỏi một kỹ năng chuyên môn',
        'Quản lý thời gian tốt hơn',
        'Tiếng Anh',
        'Làm việc nhóm ăn ý hơn',
      ],
    },
    {
      id: 'g4',
      question: 'Điều gì có thể cản bạn?',
      label: 'Có thể cản',
      options: [
        'Chưa biết bắt đầu từ đâu',
        'Thiếu thời gian',
        'Dễ bỏ cuộc giữa chừng',
        'Ngại hỏi người khác',
        'Gia đình muốn mình theo hướng khác',
      ],
    },
    {
      id: 'g5',
      question:
        'Khi gặp chuyện khó trong cuộc sống, bạn thường tìm đến đâu để nghỉ ngơi, hay điều gì giúp bạn vượt qua?',
      label: 'Khi gặp khó',
      options: [
        'Về với gia đình',
        'Tâm sự với bạn bè',
        'Ở một mình, làm điều mình thích',
        'Ra ngoài vận động',
        'Nghĩ tới mục tiêu của mình',
      ],
    },
  ],
};
const reasons = {
  R: 'Bạn nói bạn thích tự tay lắp và sửa, nghề này có nhiều việc với thiết bị và vật liệu.',
  I: 'Bạn nói bạn thích lần ra nguyên nhân, nghề này làm việc đó mỗi ngày.',
  A: 'Bạn nói bạn thích làm ra thứ mới, nghề này có nhiều dịp thử ý tưởng.',
  S: 'Bạn nói bạn thích hỗ trợ người khác, nghề này có nhiều cuộc gặp và lắng nghe.',
  E: 'Bạn nói bạn thích đứng ra điều phối, nghề này có nhiều việc kết nối cả nhóm.',
  C: 'Bạn nói bạn thích sắp xếp và kiểm tra, nghề này thường cần giữ thông tin chính xác.',
};
export { reasons };
// Tên hư cấu, tái dùng hai tổ chức cho mỗi loại hình; kind lấy từ môi trường nghề.
export function companies(kind: string): Company[] {
  const stem = /bệnh viện|y tế|phòng khám|Nhà thuốc|cấp cứu/i.test(kind)
    ? ['An Diệp', 'Mây Trắng']
    : /Trường|đại học|thư viện|trung tâm ngoại ngữ/i.test(kind)
      ? ['Sao Mai Nhỏ', 'Vườn Tri Thức']
      : /Nhà máy|xưởng|công trường|nông|mỏ/i.test(kind)
        ? ['Xưởng Lá Xanh', 'Cánh Đồng Sao']
        : /khách sạn|nhà hàng|cửa hàng|dịch vụ|vận tải/i.test(kind)
          ? ['Hiên Nắng', 'Bến Mây']
          : ['Quỹ Đạo Nhỏ', 'Hạt Mầm Số'];
  return stem.map((name) => ({
    name,
    kind,
    blurb: `Tổ chức hư cấu dùng để trải nghiệm nghề trong JobQuest. Loại hình: ${kind}.`,
  }));
}
export const criteria: RatingCriterion[] = [
  { code: 'SALARY', name: 'Lương', low: 'Thấp', high: 'Cao' },
  { code: 'PRESSURE', name: 'Áp lực', low: 'Ít áp lực', high: 'Rất áp lực' },
  { code: 'DIFFICULTY', name: 'Độ khó', low: 'Dễ', high: 'Khó' },
  {
    code: 'WORK_LIFE_BALANCE',
    name: 'Cân bằng công việc – cuộc sống',
    low: 'Khó cân bằng',
    high: 'Dễ cân bằng',
  },
  {
    code: 'ENJOYMENT',
    name: 'Mức yêu thích',
    low: 'Không thích',
    high: 'Rất thích',
  },
];
export const achievementCatalogue: Array<
  Omit<Achievement, 'earnedAt' | 'pinned'> & { threshold: number }
> = [
  ...[1, 3, 5, 10].map((threshold, i) => ({
    code: `explore-${threshold}`,
    name: ['Bước chân đầu', 'Ba lối rẽ', 'Năm hành tinh', 'Người thám hiểm'][i],
    description: `Trải nghiệm ${threshold} nghề.`,
    kind: 'kham_pha' as const,
    threshold,
  })),
  ...[1, 3, 7].map((threshold) => ({
    code: `master-${threshold}`,
    name: `Dấu mốc kỹ năng ${threshold}`,
    description: `Có ${threshold} nhóm kỹ năng đạt bậc 1.`,
    kind: 'thanh_thao' as const,
    threshold,
  })),
  ...[1, 3, 5].map((threshold) => ({
    code: `grow-${threshold}`,
    name: `Tiến thêm ${threshold} bước`,
    description: `Hoàn thành ${threshold} ca làm.`,
    kind: 'tien_bo' as const,
    threshold,
  })),
  ...[1, 3, 5].map((threshold) => ({
    code: `reflect-${threshold}`,
    name: `Nhìn lại ${threshold} lần`,
    description: `Trả lời tự soi sau ${threshold} ca.`,
    kind: 'tu_soi' as const,
    threshold,
  })),
  ...[2, 5, 10].map((threshold) => ({
    code: `persist-${threshold}`,
    name: `Giữ nhịp ${threshold} ngày`,
    description: `Chơi ca làm trong ${threshold} ngày khác nhau.`,
    kind: 'kien_tri' as const,
    threshold,
  })),
];
