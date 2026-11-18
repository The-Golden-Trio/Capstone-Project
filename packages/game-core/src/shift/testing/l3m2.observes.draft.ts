/**
 * NHÁP DO AI SOẠN ĐỂ TEST. CHƯA DE DUYỆT. KHÔNG PHẢI NỘI DUNG ĐÃ CHỐT.
 *
 * `observes` thử cho màn SWE_BACKEND.L3.m2 (Seed mẫu Back-end L3 m2, bản 4,
 * chưa có khối E). Chỉ dùng để chạy thử đường chấm checklist; seed thật không
 * đọc file này và không được sửa theo nó. Khi DE soạn `observes` thật, xoá file.
 *
 * Mã mục con tra ở `occupation-data/specs/spec-checklist-softskill.md`; mục
 * chọn theo luật E1 (3–6 mục, một mục mỗi nhóm trùng). `signs` viết theo ví dụ
 * E1, chỉ dùng dữ kiện có trong seed (f1–f10, nhật ký staging, lời hứa).
 *
 * `from: ["n3"]` của 1.1 đã gồm email: artefact `email_an` là bài nộp của nút n3.
 */
import type { ObserveItem } from '../grading/observe.js';

export const L3M2_OBSERVES_DRAFT: readonly ObserveItem[] = [
  {
    // Nhóm 4 · Phân tích, nguyên nhân gốc
    sub: '4.2',
    from: ['n2', 'pha'],
    signs: {
      A: 'nêu nguyên nhân là API lấy chi tiết từng đơn trong một vòng lặp, kèm số liệu trong màn: 901 lần hỏi cơ sở dữ liệu cho khách MP-0042 (900 đơn)',
      B: 'loại khả năng "DB quá tải giờ cao điểm" bằng dữ kiện: khách chỉ có 3 đơn cùng giờ vẫn nhanh (4 lần hỏi)',
      C: 'nêu cách kiểm để chắc nguyên nhân, ví dụ chạy thử trên staging sau khi sửa và so số lần hỏi cơ sở dữ liệu',
      not: [
        '"Chắc DB quá tải" hay "chắc server yếu" mà không có dữ kiện nào của màn không phải nguyên nhân kèm bằng chứng',
        'chỉ chép lại câu anh An nói ở đầu ca ("API chậm từ 8 giờ") không phải nguyên nhân',
      ],
    },
  },
  {
    // Nhóm 7 · Trung thực, nhận lỗi, báo sớm
    sub: '7.1',
    from: ['n2', 'n3'],
    signs: {
      A: 'báo anh An (hoặc kênh #su-co) về sự cố và nguyên nhân tìm ra',
      B: 'nhận phần của mình: API lịch sử đơn do mình viết ba tuần trước, gọi cơ sở dữ liệu trong vòng lặp và không giới hạn số đơn trả về',
      C: 'nêu việc cụ thể để sửa hoặc để lần sau không lặp lại, ví dụ thêm phân trang, test với khách có nhiều đơn',
      not: [
        '"Chắc DB có vấn đề" không phải là nhận lỗi',
        'chỉ nói "API chậm" mà không nói đó là phần mình viết thì chưa đủ B',
      ],
    },
  },
  {
    // Nhóm 1 · Chia sẻ thông tin, cập nhật đúng lúc
    sub: '1.5',
    from: ['pha', 'n1'],
    signs: {
      A: 'chủ động báo chị Linh (người đang chờ để trả lời khách Minh Phát) rằng bên kỹ thuật đã thấy lỗi, đang sửa hoặc đã sửa xong',
      B: 'nói hiện trạng cụ thể: đã tìm ra nguyên nhân (vòng lặp gọi cơ sở dữ liệu), đang viết bản vá hoặc đã chạy thử trên staging',
      C: 'hẹn mốc báo tiếp: một giờ cụ thể (ví dụ 11:30) hoặc khi có tin (sửa xong, anh An duyệt)',
      not: [
        'chỉ nói "em đang xem" không nêu hiện trạng thì chưa đủ B',
        'hứa chắc "trưa xong" là hứa kết quả, không phải cập nhật hiện trạng',
      ],
    },
  },
  {
    // Nhóm 7 · Đáng tin cậy, giữ lời hứa (không chọn 5.5: cùng nhóm trùng)
    sub: '7.4',
    from: ['pha'],
    signs: {
      A: 'cam kết nói rõ làm gì và khi nào, ví dụ "em báo chị lúc 11:30" hoặc "có tin anh An duyệt em báo chị ngay"',
      B: 'nói điều kiện hoặc giới hạn trong tầm kiểm soát, ví dụ "nếu chạy thử staging ổn" hoặc "còn chờ anh An duyệt"',
      C: 'nói sẽ báo lại thế nào nếu không kịp, ví dụ "nếu chưa xong em nhắn chị trước 11:30"',
      not: [
        '"Dạ chắc trưa xong" là hứa chắc không điều kiện (cờ C7), không phải điều kiện',
        '"Em sẽ cố" mà không nói khi nào thì chưa đủ A',
      ],
    },
  },
  {
    // Nhóm 1 · Viết rõ ràng, ngắn gọn
    sub: '1.1',
    from: ['n3'],
    signs: {
      A: 'phần đầu email nêu điều chính: nguyên nhân (API gọi cơ sở dữ liệu trong vòng lặp, 901 lần cho MP-0042) và hướng xử lý',
      B: 'nói rõ anh An cần làm gì, ví dụ duyệt để đưa bản sửa lên production',
      C: 'kèm con số từ màn, ví dụ 901 lần hỏi giảm còn 2, 4,40 giây còn 0,18 giây',
      not: [
        'mở đầu dài về bối cảnh rồi mới tới nguyên nhân ở cuối thì chưa đạt A; câu chào và xin lỗi làm phiền không tính là mở đầu chậm',
      ],
    },
  },
];
