import { useMatches } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { StarField } from './StarField';
import { Topbar } from './Topbar';

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
      <div className="relative z-1 flex min-h-screen flex-col">
        <Topbar />
        <main
          className={
            fullBleed
              ? 'relative flex-1'
              : 'w-full flex-1 px-6 py-6 max-[900px]:px-4'
          }
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}
