import { Link } from 'react-router-dom';
import {
  CartoonPlanet,
  NightCard,
  NightSky,
  toonButtonClasses,
} from '@datn/ui';

export default function NotFoundPage() {
  return (
    <div className="theme-toon-night relative isolate grid min-h-dvh place-items-center px-5 py-12 text-center">
      <NightSky seed="404" scene="plain" />
      <main className="relative w-full max-w-md">
        <div aria-hidden className="mx-auto mb-6 w-fit -rotate-12">
          <CartoonPlanet size={160} seed="lost" ring />
        </div>
        <NightCard tape>
          <p className="font-toon text-lg font-bold text-toon-ink-soft">
            Lạc giữa ngân hà · 404
          </p>
          <h1 className="mt-3 font-toon text-3xl font-extrabold">
            Không có hành tinh nào ở đây
          </h1>
          <p className="mt-4 text-toon-ink-soft">
            Đường dẫn không tồn tại hoặc đã đổi. Về bản đồ để chọn một nghề khác
            nhé.
          </p>
          <Link
            to="/galaxy"
            className={toonButtonClasses({ className: 'mt-6' })}
          >
            Về bản đồ ngân hà
          </Link>
        </NightCard>
      </main>
    </div>
  );
}
