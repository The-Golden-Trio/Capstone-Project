/**
 * Cửa vào của người đã đăng nhập.
 *
 * Yêu cầu: người mới được mời làm "Get to Know Me" trước. Nhưng cửa này phải
 * đi qua được đúng một lần — bấm "bỏ qua" cũng đặt `quizDone`, nên nếu cờ đó
 * không được tôn trọng thì người dùng kẹt trong vòng lặp chuyển hướng.
 */
import { describe, expect, it } from 'vitest';
import { decideGate, type GateInput } from './gate';

const at = (patch: Partial<GateInput> = {}): GateInput => ({
  status: 'authed',
  consentStatus: 'not_required',
  profileLoaded: true,
  contentLoaded: true,
  quizDone: true,
  pathname: '/',
  ...patch,
});

describe('cửa vào', () => {
  it('còn đang hỏi máy chủ thì chờ, chưa đẩy đi đâu', () => {
    expect(decideGate(at({ status: 'loading' }))).toEqual({ kind: 'wait' });
  });

  it('chưa đăng nhập thì về màn đăng nhập', () => {
    expect(decideGate(at({ status: 'anon' }))).toEqual({
      kind: 'redirect',
      to: '/login',
    });
  });

  it('đã tự vấn rồi thì vào thẳng', () => {
    expect(decideGate(at())).toEqual({ kind: 'allow' });
  });
});

describe('mời tự vấn lần đầu', () => {
  it('chưa làm thì dẫn về Get to Know Me', () => {
    expect(decideGate(at({ quizDone: false }))).toEqual({
      kind: 'redirect',
      to: '/quiz',
    });
  });

  it('đang ở trong phần tự vấn thì để yên, không chuyển hướng vòng quanh', () => {
    expect(decideGate(at({ quizDone: false, pathname: '/quiz' })).kind).toBe('allow');
    expect(
      decideGate(at({ quizDone: false, pathname: '/quiz/result' })).kind,
    ).toBe('allow');
  });

  it('bỏ qua (quizDone = true) thì không bị hỏi lại nữa', () => {
    expect(decideGate(at({ quizDone: true })).kind).toBe('allow');
  });

  it('chưa nạp xong hồ sơ thì chưa vội kết luận', () => {
    // Thiếu điều kiện này thì mỗi lần tải lại trang, người đã tự vấn vẫn bị
    // đá về quiz trong khoảnh khắc đầu tiên.
    expect(decideGate(at({ profileLoaded: false, quizDone: false })).kind).toBe(
      'allow',
    );
  });
});

describe('đồng ý của người giám hộ đứng trước', () => {
  it('dưới 16 tuổi chưa có đồng ý thì phải qua màn đồng ý trước', () => {
    expect(
      decideGate(at({ consentStatus: 'pending', quizDone: false })),
    ).toEqual({ kind: 'redirect', to: '/consent' });
  });

  it('đang ở màn đồng ý thì để yên', () => {
    expect(
      decideGate(at({ consentStatus: 'pending', pathname: '/consent' })).kind,
    ).toBe('allow');
  });

  it('đã có đồng ý thì tiếp tục sang bước tự vấn', () => {
    expect(decideGate(at({ consentStatus: 'granted', quizDone: false }))).toEqual(
      { kind: 'redirect', to: '/quiz' },
    );
  });

  it('chưa có nội dung game thì chờ, chưa vẽ gì', () => {
    expect(decideGate(at({ contentLoaded: false }))).toEqual({ kind: 'wait' });
  });

  it('nhưng cửa đồng ý của người giám hộ vẫn đứng trước cửa nội dung', () => {
    // Ràng buộc pháp lý phải xét trước mọi thứ khác, kể cả trước khi có dữ
    // liệu để vẽ.
    expect(
      decideGate(at({ contentLoaded: false, consentStatus: 'pending' })),
    ).toEqual({ kind: 'redirect', to: '/consent' });
  });
});
