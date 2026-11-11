/**
 * Cụm từ cho bộ phán giả, theo seed. Chỉ để chạy trọn luồng khi dev và test;
 * không phải luật chấm (xem `fakes.ts`).
 */
import type { FakeCheckRules, FakeEventRules } from './fakes.js';

export const FAKE_RULES: Record<string, FakeCheckRules> = {
  'SWE_BACKEND.L3.m2': {
    support_biet_tim_ra_loi: ['tìm ra lỗi', 'đang sửa', 'sửa xong', 'thấy lỗi'],
    hua_bao_lai: ['báo lại', 'em báo chị', 'gọi báo chị'],
    hua_chac_trua: ['trưa là xong', 'chắc chắn trưa xong'],
    cho_cau_noi_voi_khach: ['chị nói khách', 'nói với khách là'],
    nguyen_nhan_da_noi_voi_mentor: ['vòng lặp', '901 lần', 'n+1'],
    da_loai_db_bang_chung: ['khách ít đơn', 'không phải db', 'cpu'],
    xin_duyet: ['duyệt giúp', 'anh duyệt cho em', 'cho em đưa lên'],
    'bv.bo_vong_lap': ['bỏ vòng lặp', 'một truy vấn', 'gom'],
    'bv.phan_trang': ['phân trang', 'giới hạn'],
    'bv.giu_app_cu': ['app cũ', 'không gửi số trang'],
    'gc.h4': ['không giới hạn', 'trả hết đơn'],
    'email.co_cach_kiem': ['theo dõi', 'kiểm tra sau'],
    'email.co_rollback': ['rollback', 'lùi lại'],
    'n3.co_cach_kiem': ['theo dõi', 'kiểm tra sau', 'monitor'],
    'n3.co_rollback': ['rollback', 'lùi lại', 'deploy lại bản cũ'],
  },
};

export const FAKE_EVENTS: Record<string, FakeEventRules> = {
  'SWE_BACKEND.L3.m2': {
    'su_kien.duyet': ['duyệt'],
    'su_kien.staging_ok': ['staging'],
  },
};
