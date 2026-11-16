import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Mountains, StarField, buttonClasses } from '@datn/ui';

/** Lỗi không lường trước ở một màn: nói thẳng, giữ đường quay lại. */
export function RouteError() {
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : null;
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 text-center">
      <StarField seed="lost" />
      <div className="relative z-10 max-w-md">
        <p className="eyebrow">Mất tín hiệu</p>
        <h1 className="mt-2 text-3xl">Màn này vừa gặp sự cố</h1>
        <p className="mt-3 text-ink-muted">
          Tiến độ đã lưu của bạn không mất. Bạn tải lại trang hoặc quay về bản
          đồ nhé.
        </p>
        {detail && (
          <p className="mt-2 font-mono text-xs text-night-300">{detail}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            className={buttonClasses({ variant: 'secondary' })}
            onClick={() => window.location.reload()}
          >
            Tải lại
          </button>
          <Link to="/galaxy" className={buttonClasses()}>
            Về bản đồ
          </Link>
        </div>
      </div>
      <Mountains className="absolute inset-x-0 bottom-0 h-40" />
    </div>
  );
}
