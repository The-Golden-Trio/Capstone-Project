import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cx } from '../../lib/cx';
import { Rail } from './Rail';
import { StarField } from './StarField';
import { Topbar } from './Topbar';

/**
 * Khung ứng dụng: nền sao, sidebar, topbar, vùng nội dung.
 *
 * Dưới 900px sidebar trượt ra từ trái; `scrim` phải nằm ngoài luồng lưới ở
 * MỌI bề ngang, nếu không trên desktop nó thành một ô lưới thật và đẩy
 * sidebar sang cột hai.
 */
export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();

  // Đổi trang thì đóng ngăn kéo — nếu không nó che mất màn mới trên điện thoại.
  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <>
      <StarField />
      <div
        className={cx(
          'relative z-1 grid min-h-screen',
          'max-[900px]:grid-cols-1 min-[900px]:grid-cols-[248px_1fr]',
        )}
      >
        {navOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 min-[900px]:hidden"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={cx(
            'border-r border-line-2 bg-rail',
            'max-[900px]:fixed max-[900px]:left-0 max-[900px]:top-0 max-[900px]:z-60 max-[900px]:h-screen max-[900px]:w-[248px] max-[900px]:transition-transform',
            'min-[900px]:sticky min-[900px]:top-0 min-[900px]:h-screen min-[900px]:overflow-y-auto',
            navOpen
              ? 'max-[900px]:translate-x-0 max-[900px]:shadow-lift'
              : 'max-[900px]:-translate-x-full',
          )}
        >
          <Rail onNavigate={() => setNavOpen(false)} />
        </aside>

        <div className="flex min-w-0 flex-col">
          <Topbar onOpenNav={() => setNavOpen(true)} />
          <div className="w-full max-w-[1100px] p-[26px] max-[900px]:p-[18px]">
            <Outlet />
          </div>
          <footer className="mt-auto border-t border-line-2 px-[26px] py-5 text-[12px] leading-relaxed text-muted">
            Dữ liệu sinh từ{' '}
            <code className="font-mono text-[11px]">
              dataset_22_roles_enriched_v3.json
            </code>{' '}
            +{' '}
            <code className="font-mono text-[11px]">
              occupation-data/scenarios/**
            </code>{' '}
            bằng <code className="font-mono text-[11px]">node docs/data/build.mjs</code>.
            Chấm câu gõ tự do hiện dùng so khớp từ khoá, chưa gọi AI.
          </footer>
        </div>
      </div>
    </>
  );
}
