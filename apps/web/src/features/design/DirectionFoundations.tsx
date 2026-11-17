import { Logo, LogoMark, NightCard } from '@datn/ui';
import { contrastRatio } from './contrast';

/** Cặp màu chữ/nền đo từ token hiện hành; màu trang trí không mặc nhiên là màu chữ. */
export const TEXT_PAIRS = [
  { label: 'Chữ chính / giấy', foreground: '#1e1b18', background: '#fffaf0' },
  { label: 'Chữ phụ / giấy', foreground: '#4a433c', background: '#fffaf0' },
  { label: 'Chú thích / kem', foreground: '#665c52', background: '#f7ecd6' },
  { label: 'Giấy / trời đêm', foreground: '#fffaf0', background: '#142650' },
  { label: 'Giấy / thẻ đêm', foreground: '#fffaf0', background: '#213a73' },
  {
    label: 'Vàng sao / trời đêm',
    foreground: '#f6cf5e',
    background: '#142650',
  },
  { label: 'Mực / nút vàng', foreground: '#1e1b18', background: '#f0b63c' },
  { label: 'Mực / sao vàng', foreground: '#1e1b18', background: '#f6cf5e' },
];
const NIGHT_COLORS = [
  ['night', '#142650'],
  ['night-deep', '#0c1834'],
  ['night-soft', '#213a73'],
  ['night-line', '#3b5aa0'],
  ['star', '#f6cf5e'],
  ['star-soft', '#fbe6a4'],
  ['compass-red', '#ef6f5e'],
  ['planet', '#6fa8dc'],
] as const;
const DAY_COLORS = [
  ['ink', '#1e1b18'],
  ['ink-soft', '#4a433c'],
  ['ink-faint', '#665c52'],
  ['paper', '#fffaf0'],
  ['cream', '#f7ecd6'],
  ['sand', '#ead8b8'],
  ['shade', '#dcc6a0'],
  ['olive', '#6b7a4b'],
  ['olive-light', '#b9c58f'],
  ['olive-deep', '#56623a'],
  ['maroon', '#7a2c45'],
  ['rose', '#eea7b4'],
  ['coral', '#e2703f'],
  ['coral-light', '#f6b496'],
  ['mustard', '#f0b63c'],
  ['mustard-deep', '#c98d17'],
  ['sky', '#a6d2ea'],
  ['sky-deep', '#4f8db3'],
  ['lilac', '#b3acdf'],
  ['mint', '#a8dbb9'],
  ['mint-deep', '#3f8a5c'],
  ['wood', '#c98b4e'],
] as const;

export function LogoGuide() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <NightCard tone="night">
        <h3 className="mb-5 font-toon text-xl font-bold">Trên trời đêm</h3>
        <Logo size="lg" />
        <p className="mt-4 text-sm">
          Giữ la bàn navy và vàng sao. Không thêm glow hay đổi màu các cánh la
          bàn.
        </p>
      </NightCard>
      <NightCard>
        <h3 className="mb-5 font-toon text-xl font-bold">Trên giấy kem</h3>
        <Logo size="lg" tone="paper" />
        <p className="mt-4 text-sm text-toon-ink-soft">
          Wordmark navy; huy hiệu giữ nguyên màu. Chừa khoảng thở quanh logo,
          không kéo méo.
        </p>
      </NightCard>
      <NightCard className="sm:col-span-2">
        <h3 className="font-toon text-xl font-bold">Kích thước hiện hành</h3>
        <div className="mt-5 flex flex-wrap items-end gap-7">
          {[24, 30, 44].map((size) => (
            <figure key={size}>
              <LogoMark size={size} title={`La bàn ${size}px`} />
              <figcaption className="mt-3 text-xs">{size}px</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-sm text-toon-ink-soft">
          Logo nhỏ nhất hiện dùng huy hiệu 24px (size sm). Giữ viewBox vuông;
          bản 30/44px cho vùng rộng hơn.
        </p>
      </NightCard>
    </div>
  );
}

export function DirectionColors() {
  return (
    <div className="space-y-6">
      {(
        [
          ['Đêm · ngoài ca làm', NIGHT_COLORS],
          ['Ngày · trong ca làm', DAY_COLORS],
        ] as const
      ).map(([label, colors]) => (
        <NightCard key={label}>
          <h3 className="mb-5 font-toon text-xl font-bold">{label}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {colors.map(([name, hex]) => (
              <figure
                key={name}
                className="overflow-hidden rounded-xl border-2 border-toon-ink"
              >
                <div
                  aria-hidden
                  className="h-14 border-b-2 border-toon-ink"
                  style={{
                    backgroundColor: `var(--color-toon-${name}, ${hex})`,
                  }}
                />
                <figcaption className="p-3 font-mono text-xs">
                  <span className="block break-all">toon-{name}</span>
                  <span className="mt-1 block">{hex}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </NightCard>
      ))}
      <NightCard>
        <h3 className="font-toon text-xl font-bold">Chữ dễ đọc · WCAG AA</h3>
        <p className="mt-2 text-sm text-toon-ink-soft">
          Chữ thường cần ít nhất 4,5:1. Các cặp dưới đây được tính theo sRGB;
          màu nhấn dùng để tô hình không thay thế màu chữ.
        </p>
        <ul
          aria-label="Cặp màu chữ đạt AA"
          className="mt-5 grid gap-3 sm:grid-cols-2"
        >
          {TEXT_PAIRS.map((pair) => (
            <li
              key={pair.label}
              className="rounded-xl border-2 border-toon-ink p-4"
              style={{
                color: pair.foreground,
                backgroundColor: pair.background,
              }}
            >
              <p className="font-bold">{pair.label}</p>
              <p className="mt-1 font-mono text-sm">
                {contrastRatio(pair.foreground, pair.background).toFixed(2)}:1 ·
                AA
              </p>
            </li>
          ))}
        </ul>
      </NightCard>
    </div>
  );
}

export function DirectionType() {
  return (
    <NightCard>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold text-toon-ink-soft">
            Baloo 2 · tiêu đề và nút
          </h3>
          <p className="mt-4 font-toon text-4xl font-extrabold">
            Thử làm một nghề.
          </p>
          <p className="mt-3 text-sm text-toon-ink-soft">
            Đậm, ngắn, có dấu. Dùng một cấp chữ lớn nhất cho thông điệp của màn.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-toon-ink-soft">
            Nunito · nội dung
          </h3>
          <p className="mt-4 font-toon-body text-base leading-relaxed">
            Đọc dữ kiện, hỏi đồng nghiệp rồi chọn việc tiếp theo. Nội dung có
            khoảng thở, không dồn thành một khối dài.
          </p>
        </div>
      </div>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Tiêu đề màn', size: '32–48px', className: 'text-3xl' },
          { label: 'Tiêu đề khối', size: '24px', className: 'text-2xl' },
          { label: 'Nội dung', size: '16px', className: 'text-base' },
          { label: 'Chú thích', size: '12–14px', className: 'text-sm' },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-xl border-2 border-toon-ink bg-toon-cream p-4"
          >
            <dt className={`font-toon font-bold ${row.className}`}>
              {row.label}
            </dt>
            <dd className="mt-2 text-sm text-toon-ink-soft">{row.size}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-xs text-toon-ink-faint">
        Thang minh hoạ cho trang này; kiểm lại khả năng đọc ở từng khổ màn hình.
      </p>
    </NightCard>
  );
}
