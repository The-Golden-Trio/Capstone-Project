import type { ReactNode } from 'react';

/** Tiêu đề trang: một câu hỏi lớn, một câu giải thích. */
export function PageHeader({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-[22px]">
      <h1 className="mb-1.5 text-balance font-display text-[clamp(22px,3vw,29px)] font-semibold leading-tight tracking-[-0.01em]">
        {title}
      </h1>
      {children && (
        <p className="m-0 max-w-[66ch] text-[14px] leading-relaxed text-muted">
          {children}
        </p>
      )}
    </div>
  );
}
