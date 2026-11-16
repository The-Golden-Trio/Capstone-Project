import { cn } from '../lib/cn';

/**
 * Vòng quỹ đạo: một ngôi sao nhỏ chạy quanh vòng tròn. Dùng thay spinner
 * tròn mặc định, ở nút đang gửi và màn chờ AI.
 */
export function OrbitSpinner({
  size = 20,
  className,
  label = 'Đang tải',
}: {
  size?: number;
  className?: string;
  /** Đọc cho trình đọc màn hình; truyền `null` khi đã có chữ bên cạnh. */
  label?: string | null;
}) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border border-current opacity-25"
      />
      <span
        aria-hidden
        className="absolute inset-0 animate-orbit"
        style={{ transformOrigin: '50% 50%' }}
      >
        <span
          className="absolute left-1/2 top-0 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-current shadow-[0_0_8px_currentColor]"
          style={{
            width: Math.max(4, size / 5),
            height: Math.max(4, size / 5),
          }}
        />
      </span>
    </span>
  );
}

/** Màn chờ toàn khung: sao quay và một dòng chữ. */
export function LoadingBlock({
  text = 'Đang tải…',
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-gold-300',
        className,
      )}
    >
      <OrbitSpinner size={36} label={null} />
      <p className="text-sm text-ink-muted" role="status">
        {text}
      </p>
    </div>
  );
}
