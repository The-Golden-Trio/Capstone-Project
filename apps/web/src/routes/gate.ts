import type { ConsentStatus } from '../api/schemas';

/**
 * Quyết định xem một người đã đăng nhập được vào thẳng, hay phải ghé đâu trước.
 *
 * Tách khỏi `RequireAuth` vì đây là phần đáng kiểm nhất của cái cổng, mà kiểm
 * nó bằng cách dựng cả khung ứng dụng thì vừa chậm vừa dễ rơi vào vòng lặp
 * render. Là hàm thuần thì cho cùng đầu vào luôn ra cùng đáp án.
 *
 * Thứ tự xét có ý nghĩa: đồng ý của người giám hộ đứng trước tự vấn, vì đó là
 * ràng buộc pháp lý (Nghị định 13/2023/NĐ-CP) chứ không phải một bước dẫn dắt.
 */
export interface GateInput {
  status: 'loading' | 'authed' | 'anon';
  consentStatus: ConsentStatus | null;
  /** Đã nạp xong hồ sơ chơi chưa — chưa xong thì chưa kết luận gì. */
  profileLoaded: boolean;
  /**
   * Đã nạp xong nội dung game chưa.
   *
   * Nội dung nay nằm trong database, nên nó tới sau một vòng mạng chứ không
   * có sẵn lúc nạp mã như trước. Không chờ ở đây thì mọi màn bên trong phải
   * tự chịu trạng thái "chưa có dữ liệu" — chờ một chỗ rẻ hơn nhiều so với
   * rải `if (!index)` khắp nơi.
   */
  contentLoaded: boolean;
  quizDone: boolean;
  pathname: string;
}

export type GateDecision =
  | { kind: 'wait' }
  | { kind: 'redirect'; to: '/login' | '/consent' | '/quiz' }
  | { kind: 'allow' };

export function decideGate(input: GateInput): GateDecision {
  // Còn đang hỏi máy chủ thì chưa kết luận: đá sang /login lúc này sẽ văng cả
  // những người đang có phiên hợp lệ, mỗi lần họ tải lại trang.
  if (input.status === 'loading') return { kind: 'wait' };

  if (input.status === 'anon') return { kind: 'redirect', to: '/login' };

  if (input.consentStatus === 'pending' && input.pathname !== '/consent') {
    return { kind: 'redirect', to: '/consent' };
  }

  // Chưa có nội dung thì chưa vẽ gì được: bản đồ nghề, các đảo, màn chơi đều
  // đọc từ đó. Đứng sau cửa đồng ý của người giám hộ vì đó là ràng buộc pháp
  // lý, phải xét trước mọi thứ khác.
  if (!input.contentLoaded) return { kind: 'wait' };

  // Lần đầu vào thì mời tự vấn trước: bản đồ nghề chỉ có nghĩa khi hệ thống
  // biết đôi chút về người chơi. Bấm "bỏ qua" cũng đặt `quizDone`, nên đây là
  // một cửa đi qua đúng một lần chứ không phải rào chắn.
  if (
    input.profileLoaded &&
    !input.quizDone &&
    !input.pathname.startsWith('/quiz')
  ) {
    return { kind: 'redirect', to: '/quiz' };
  }

  return { kind: 'allow' };
}
