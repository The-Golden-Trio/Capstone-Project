import { Link, Outlet } from 'react-router-dom';
import { Logo } from '../components/layout/Logo';
import { StarField } from '../components/layout/StarField';
import { RequireAuth } from '../routes/RequireAuth';
import { PLAY_API_MODE } from './api/playApi';

/**
 * Cổng của luồng chơi mới (E10–E12).
 *
 * Gọi máy chủ thật (`http`): đi qua `RequireAuth` như mọi trang trong app.
 * Bản demo (`mock`): không cần đăng nhập hay máy chủ, chỉ một khung gọn có
 * nhãn "Dữ liệu mẫu" để người xem không nhầm với dữ liệu thật.
 */
export function PlayGate() {
  if (PLAY_API_MODE === 'http') return <RequireAuth />;

  return (
    <>
      <StarField />
      <div className="relative z-1 flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex min-h-[57px] items-center gap-3 border-b border-line-gold bg-linear-to-b from-bg to-bg/75 px-6 py-2.5 backdrop-blur-[8px] max-[900px]:px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <Logo className="h-[30px] w-[30px] drop-shadow-[0_2px_8px_rgba(212,176,106,.3)]" />
            <span className="font-display text-[19px] font-semibold leading-none tracking-[0.01em] max-[520px]:hidden">
              Job<span className="text-gold">Quest</span>
            </span>
          </Link>
          <span className="flex-1" />
          <DemoBadge />
        </header>
        <main className="w-full flex-1 px-6 pb-10 pt-6 max-[900px]:px-4">
          <Outlet />
        </main>
      </div>
    </>
  );
}

/** Nhãn bắt buộc ở mọi màn của bản demo. */
export function DemoBadge() {
  if (PLAY_API_MODE !== 'mock') return null;
  return (
    <span
      title="Bản demo chạy trong trình duyệt: một kịch bản mẫu, chấm tự luận giả lập, chưa lưu lên máy chủ."
      className="rounded-full border border-gold/50 bg-gold-soft px-2.5 py-1 font-label text-[10px] uppercase tracking-[0.16em] text-gold-2"
    >
      Dữ liệu mẫu
    </span>
  );
}
