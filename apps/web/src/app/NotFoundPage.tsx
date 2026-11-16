import { Link } from 'react-router-dom';
import { Moon, Mountains, StarField, buttonClasses } from '@datn/ui';

export default function NotFoundPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 text-center">
      <StarField seed="404" />
      <div className="relative z-10 max-w-md">
        <Moon size={64} className="mx-auto animate-float" />
        <p className="eyebrow mt-6">Lạc giữa ngân hà</p>
        <h1 className="mt-2 text-4xl">Không có hành tinh nào ở đây</h1>
        <p className="mt-3 text-ink-muted">
          Đường dẫn này không tồn tại hoặc đã đổi. Quay về bản đồ để chọn một
          nghề khác nhé.
        </p>
        <Link to="/galaxy" className={buttonClasses({ className: 'mt-6' })}>
          Về bản đồ ngân hà
        </Link>
      </div>
      <Mountains className="absolute inset-x-0 bottom-0 h-44" />
    </div>
  );
}
