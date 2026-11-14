import type { ReactNode } from 'react';

/** Tiêu đề trang: một câu hỏi lớn, một câu giải thích. */
export function PageHeader({
  title,
  kicker,
  children,
}: {
  title: ReactNode;
  /** Dòng nhãn nhỏ in hoa đứng trên tiêu đề. */
  kicker?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {kicker && <p className="kicker m-0 mb-2">{kicker}</p>}
      <h1 className="text-balance font-display text-[clamp(24px,3.4vw,34px)] font-medium leading-[1.12] tracking-[-0.012em]">
        {title}
      </h1>
      {/* Đường kẻ có ngôi sao: dấu ngắt quen thuộc của bảng Celestial Night. */}
      <div
        className="my-3 flex items-center gap-2 text-gold"
        aria-hidden="true"
      >
        <span className="h-px w-9 bg-gold/60" />
        <span className="text-[9px] leading-none">✦</span>
        <span className="h-px w-28 bg-linear-to-r from-gold/60 to-transparent" />
      </div>
      {children && (
        <p className="m-0 max-w-[66ch] text-[14px] leading-relaxed text-muted">
          {children}
        </p>
      )}
    </div>
  );
}
