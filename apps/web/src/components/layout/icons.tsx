/** Bộ icon một nét cho sidebar. Vẽ tay để khỏi kéo cả thư viện icon. */
const PATHS = {
  home: 'M3 9.5 10 3l7 6.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z',
  grid: 'M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z',
  user: 'M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3.5 17a6.5 6.5 0 0 1 13 0z',
  book: 'M4 3h8a3 3 0 0 1 3 3v11H7a3 3 0 0 0-3 3z',
  chart: 'M4 16V9M10 16V4M16 16v-5',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px] shrink-0 opacity-85"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
