import { useId } from 'react';
import { cn } from '../lib/cn';

/** Huy hiệu la bàn của nhóm: bốn hướng nghề giữa quỹ đạo và các vì sao. */
export function LogoMark({
  size = 32,
  className,
  title,
}: {
  size?: number;
  className?: string;
  /** Có title thì đọc như ảnh; mặc định trang trí bên cạnh wordmark. */
  title?: string;
}) {
  const titleId = `${useId()}-logo-title`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
      focusable="false"
      className={cn('shrink-0', className)}
    >
      {title && <title id={titleId}>{title}</title>}
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="#102b49"
        stroke="#e6c56e"
        strokeWidth="5"
      />
      {/* Vành trong ngắt ở bốn dấu hướng, các vạch chéo như mặt la bàn. */}
      <g fill="none" stroke="#d6b661" strokeWidth="1.2">
        <path d="M107 21A79.3 79.3 0 0 1 179 93M179 107A79.3 79.3 0 0 1 107 179M93 179A79.3 79.3 0 0 1 21 107M21 93A79.3 79.3 0 0 1 93 21" />
        <path
          d="m43 43 5 5m104 104 5 5M43 157l5-5m104-104 5-5"
          strokeWidth="2"
        />
      </g>
      <g fill="#f6d775">
        <path d="m100 16 1.5 2.5L104 20l-2.5 1.5L100 24l-1.5-2.5L96 20l2.5-1.5ZM100 176l1.5 2.5 2.5 1.5-2.5 1.5-1.5 2.5-1.5-2.5-2.5-1.5 2.5-1.5ZM20 96l1.5 2.5L24 100l-2.5 1.5L20 104l-1.5-2.5L16 100l2.5-1.5ZM180 96l1.5 2.5 2.5 1.5-2.5 1.5-1.5 2.5-1.5-2.5-2.5-1.5 2.5-1.5Z" />
        <path d="m79 36 .7 3.3L82 40l-2.3.7L79 44l-.7-3.3L76 40l2.3-.7ZM45 70l.6 2.4L48 73l-2.4.6L45 76l-.6-2.4L42 73l2.4-.6ZM154 82l.6 2.4 2.4.6-2.4.6-.6 2.4-.6-2.4-2.4-.6 2.4-.6ZM75 150l.6 2.4 2.4.6-2.4.6-.6 2.4-.6-2.4-2.4-.6 2.4-.6Z" />
        <circle cx="122" cy="43" r="1.2" />
        <circle cx="54" cy="117" r="1.1" />
        <circle cx="159" cy="121" r="1" />
        <circle cx="132" cy="149" r="1" />
      </g>
      <g fill="#90bddc">
        <circle cx="59" cy="56" r="1.2" />
        <circle cx="138" cy="53" r=".7" />
        <circle cx="36" cy="91" r=".8" />
        <circle cx="136" cy="85" r=".8" />
        <circle cx="153" cy="137" r="1.2" />
        <path
          d="M72 59v1.5m51 81v1m-14 19v1.5"
          stroke="#90bddc"
          strokeWidth=".8"
        />
      </g>
      {/* Quỹ đạo ở sau kim; hành tinh nằm trên nhánh dưới bên trái. */}
      <ellipse
        cx="100"
        cy="100"
        rx="74"
        ry="28"
        transform="rotate(-24 100 100)"
        fill="none"
        stroke="#e6c56e"
        strokeWidth="1.6"
        strokeDasharray="3.4 3.4"
      />
      <circle
        cx="42"
        cy="133"
        r="6.3"
        fill="#78b4df"
        stroke="#3f689e"
        strokeWidth="2"
      />
      <path
        d="m74 74 26 15 26-15-15 26 15 26-26-15-26 15 15-26Z"
        fill="#4c79b7"
      />
      <path
        d="m100 34 11 54 29 12-29 12-11 38-11-38-29-12 29-12Z"
        fill="#f6d775"
      />
      <path d="m89 112 11 38 11-38Z" fill="#ef6f5e" />
      <circle
        cx="100"
        cy="100"
        r="7.5"
        fill="#102b49"
        stroke="#d6b04c"
        strokeWidth="2.5"
      />
      <circle cx="100" cy="100" r="2.6" fill="#fffaf0" />
    </svg>
  );
}

/** Dấu la bàn và wordmark Cinzel; màu phẳng trên nền đêm hoặc giấy kem. */
export function Logo({
  size = 'md',
  className,
  tagline = false,
  tone = 'night',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Hiện câu "Try the job before you pick the career." dưới chữ. */
  tagline?: boolean;
  tone?: 'night' | 'paper';
}) {
  const mark = { sm: 24, md: 30, lg: 44 }[size];
  const text = { sm: 'text-[15px]', md: 'text-lg', lg: 'text-3xl' }[size];
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={mark} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-wordmark font-bold tracking-[0.16em]',
            tone === 'night' ? 'text-toon-star' : 'text-toon-night',
            text,
          )}
        >
          JOBQUEST
        </span>
        {tagline && (
          <span
            className={cn(
              'mt-1.5 font-wordmark text-[10px] tracking-[0.22em]',
              tone === 'night' ? 'text-toon-star-soft' : 'text-toon-ink-soft',
            )}
          >
            TRY THE JOB BEFORE YOU PICK THE CAREER
          </span>
        )}
      </span>
    </span>
  );
}
