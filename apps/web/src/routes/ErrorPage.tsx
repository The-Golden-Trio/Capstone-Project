import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { StarField } from '../components/layout/StarField';

/**
 * Lưới đỡ của router. Có trang này thì lỗi hiện ra chữ đọc được, thay vì
 * một màn hình trắng không manh mối nào.
 */
export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  // Dùng làm cả route `*` (không có lỗi nào) lẫn `errorElement`.
  const title = !error
    ? 'Không có màn hình nào ở địa chỉ này'
    : isRouteErrorResponse(error)
      ? `${error.status} — ${error.statusText}`
      : 'Có gì đó hỏng';

  const detail = !error
    ? window.location.pathname
    : error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? 'Đường dẫn này không dẫn tới đâu cả.'
        : String(error);

  return (
    <>
      <StarField />
      <div className="relative z-1 grid min-h-screen place-items-center p-6">
        <Card className="w-full mx-auto max-w-[560px]">
          <CardBody className="p-[30px]">
            <h1 className="mb-3 font-display text-[24px] font-semibold">
              {title}
            </h1>
            <pre className="mb-5 overflow-x-auto whitespace-pre-wrap rounded-lg bg-inset p-3.5 font-mono text-[12px] leading-relaxed text-ink-2">
              {detail}
            </pre>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="primary" onClick={() => navigate('/')}>
                Về tổng quan
              </Button>
              <Button onClick={() => window.location.reload()}>Tải lại</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
