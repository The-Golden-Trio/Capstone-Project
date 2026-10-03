import { useMatches } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { StarField } from './StarField';
import { Topbar } from './Topbar';
import { XpBar } from './XpBar';

/** Route nào cần cả khung hình thì tự khai ở `handle`. */
export interface FullBleedHandle {
  fullBleed: true;
}

const isFullBleed = (handle: unknown): boolean =>
  typeof handle === 'object' &&
  handle !== null &&
  (handle as FullBleedHandle).fullBleed === true;

/**
 * Khung ứng dụng: nền sao, thanh đầu trang, rồi nội dung chiếm trọn bề ngang.
 *
 * Không còn thanh bên. Điều hướng dồn lên header, còn hồ sơ nhân vật và tài
 * khoản chuyển vào trang Hành trang — thanh bên vốn chiếm 248px cố định chỉ
 * để giữ vài đường dẫn, mà những màn đáng xem nhất (bản đồ ngân hà, bản đồ
 * nghề) lại là loại càng rộng càng tốt.
 */
export function AppShell() {
  // Bản đồ cần cả khung hình: bỏ lề, bỏ giới hạn bề ngang.
  const fullBleed = useMatches().some((m) => isFullBleed(m.handle));

  return (
    <>
      <StarField />
      {/*
        Trang bản đồ khoá đúng chiều cao khung hình và không cuộn: trước đây
        nó tự tính `100dvh - 57px` cho thanh đầu trang, và chỉ cần lệch một
        hai pixel là trang tràn ra, thanh cuộn hiện lên, bề ngang hụt đi,
        canvas đo lại — rồi lặp. Để bố cục co dãn quyết định thì không còn
        con số nào để lệch.
      */}
      <div
        className={
          fullBleed
            ? 'relative z-1 flex h-dvh flex-col overflow-hidden'
            : 'relative z-1 flex min-h-screen flex-col'
        }
      >
        <Topbar />
        <main
          className={
            fullBleed
              ? 'relative min-h-0 flex-1 pb-[var(--xp-bar-h)]'
              : 'w-full flex-1 px-6 pb-[calc(var(--xp-bar-h)+24px)] pt-6 max-[900px]:px-4'
          }
        >
          <Outlet />
        </main>

        {/* Thanh kinh nghiệm bám đáy, có ở mọi trang trong app. */}
        <XpBar />
      </div>
    </>
  );
}
