import { useState } from 'react';
import {
  Button,
  Panel,
  gold,
  night,
  palette,
  REGION_COLORS,
  MEDAL,
  status,
} from '@datn/ui';
import { compositeOnNight, contrastRatio } from './contrast';

type Swatch = { name: string; hex: string; role: string; source?: string };
const regionNames = {
  ky_thuat: 'Kỹ thuật, sản xuất',
  suc_khoe: 'Sức khoẻ, giáo dục',
  kinh_doanh: 'Kinh doanh, quản lý',
  cong_nghe: 'Công nghệ, khoa học',
  sang_tao: 'Sáng tạo, truyền thông',
  dich_vu: 'Dịch vụ, vận hành',
};

export function ColorExamples() {
  const semantic: Swatch[] = [
    { name: 'ink', hex: palette.ivory, role: 'Nội dung chính' },
    { name: 'ink-muted', hex: palette.mist, role: 'Nội dung phụ' },
    { name: 'ink-faint', hex: night[300], role: 'Chú thích, metadata' },
    { name: 'ink-inverse', hex: palette.deepSpace, role: 'Chữ trên nền vàng' },
    { name: 'accent', hex: gold[500], role: 'Hành động chính' },
    { name: 'accent-soft', hex: gold[300], role: 'Tiến độ của bạn' },
    {
      name: 'line',
      hex: compositeOnNight(night[400], 0.26),
      source: '#5D7EA8 · 26%',
      role: 'Viền phân nhóm',
    },
    {
      name: 'line-strong',
      hex: compositeOnNight(night[400], 0.5),
      source: '#5D7EA8 · 50%',
      role: 'Viền điều khiển',
    },
    {
      name: 'line-gold',
      hex: compositeOnNight(gold[500], 0.42),
      source: '#D4B06A · 42%',
      role: 'Viền nhấn',
    },
    {
      name: 'surface',
      hex: compositeOnNight(night[800], 0.5),
      source: '#142B52 · 50%',
      role: 'Mặt thẻ',
    },
    {
      name: 'surface-strong',
      hex: compositeOnNight(night[800], 0.82),
      source: '#142B52 · 82%',
      role: 'Mặt nổi',
    },
    {
      name: 'surface-sunken',
      hex: compositeOnNight(night[950], 0.55),
      source: '#060A1A · 55%',
      role: 'Mặt chìm',
    },
    { name: 'paper', hex: '#f8f6ee', role: 'Tài liệu trong ca' },
    { name: 'paper-shade', hex: '#ece6d4', role: 'Bóng giấy' },
    { name: 'paper-ink', hex: '#1a2238', role: 'Chữ trên giấy ngà' },
  ];
  const statuses: Swatch[] = Object.entries(status).flatMap(([name, hex]) => [
    {
      name,
      hex,
      role: (
        {
          success: 'Đã hoàn thành',
          warning: 'Cần chú ý',
          danger: 'Lỗi, thao tác xoá',
          info: 'Thông tin, nhãn AI',
        } as const
      )[name as keyof typeof status],
    },
    {
      name: `${name}-deep`,
      hex: (
        {
          success: '#1f5547',
          warning: '#5c3a17',
          danger: '#5a2430',
          info: '#1f3a63',
        } as const
      )[name as keyof typeof status],
      role: 'Nền thông báo cùng trạng thái',
    },
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-line bg-night-950/50 p-4 text-sm text-ink-muted">
        <p>
          Mọi tỉ lệ bên dưới đo với <code className="text-ink">#0A1026</code>.
          Chữ thường cần ≥ 4,5:1, chữ lớn ≥ 3:1. Màu nền không dùng làm chữ trên
          nền đêm.
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          Màu có alpha được pha trên nền đêm trước khi đo; hex hiển thị là màu
          sau pha. Đo từng token không thay cho kiểm tra toàn bộ màn hình.
        </p>
      </div>
      <SwatchGroup
        title="Night · không gian và độ sâu"
        swatches={Object.entries(night).map(([step, hex]) => ({
          name: `night-${step}`,
          hex,
          role:
            Number(step) >= 800
              ? 'Nền và mặt thẻ'
              : Number(step) >= 400
                ? 'Độ sâu, viền và minh hoạ'
                : 'Chữ và ánh sáng',
        }))}
      />
      <SwatchGroup
        title="Gold · điểm đến và tiến độ"
        swatches={Object.entries(gold).map(([step, hex]) => ({
          name: `gold-${step}`,
          hex,
          role:
            Number(step) >= 700
              ? 'Nền nhấn'
              : Number(step) >= 400
                ? 'Hành động chính, tiến độ'
                : 'Ánh sáng và nhãn nhấn',
        }))}
      />
      <SwatchGroup title="Vai trò ngữ nghĩa" swatches={semantic} />
      <SwatchGroup
        title="Trạng thái · chữ luôn đi cùng màu"
        swatches={statuses}
      />
      <SwatchGroup
        title="Sáu vùng nghề · cố định trên mọi biểu đồ"
        swatches={Object.entries(REGION_COLORS).map(([id, hex]) => ({
          name: id,
          hex,
          role: regionNames[id as keyof typeof regionNames],
        }))}
      />
      <SwatchGroup
        title="Huy chương · mức kỹ năng nghề"
        swatches={([1, 2, 3] as const).flatMap((level) => [
          {
            name: `medal-${level}`,
            hex: MEDAL[level].color,
            role: MEDAL[level].name,
          },
          {
            name: `medal-${level}-deep`,
            hex: MEDAL[level].deep,
            role: `Bóng huy chương ${MEDAL[level].name}`,
          },
        ])}
      />
    </div>
  );
}

function SwatchGroup({
  title,
  swatches,
}: {
  title: string;
  swatches: Swatch[];
}) {
  return (
    <section>
      <h3 className="mb-4 text-lg">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {swatches.map((swatch) => (
          <ColorSwatch key={swatch.name} swatch={swatch} />
        ))}
      </div>
    </section>
  );
}

function ColorSwatch({ swatch }: { swatch: Swatch }) {
  const ratio = contrastRatio(swatch.hex);
  return (
    <figure className="min-w-0 overflow-hidden rounded-lg border border-line bg-night-950/50">
      <div
        className="h-14 border-b border-line"
        style={{ background: swatch.hex }}
      />
      <figcaption className="space-y-1.5 p-3">
        <p className="break-all font-mono text-[11px] font-semibold text-ink">
          {swatch.name}
        </p>
        <p className="font-mono text-[10px] uppercase text-ink-muted">
          {swatch.hex} · {ratio.toFixed(2)}:1
        </p>
        <p className="text-[10px] text-ink-faint">{swatch.role}</p>
        {swatch.source && (
          <p className="text-[9px] text-ink-faint">Nguồn {swatch.source}</p>
        )}
        <p className="border-t border-line pt-2 text-[10px] text-ink-faint">
          {ratio >= 4.5
            ? 'AA · chữ thường'
            : ratio >= 3
              ? 'AA · chỉ chữ lớn'
              : 'Dùng nền / trang trí'}
        </p>
      </figcaption>
    </figure>
  );
}

export function TypographyExamples() {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <p className="mb-3 font-mono text-[10px] text-ink-faint">
            DISPLAY / PLAYFAIR DISPLAY / 600
          </p>
          <p className="font-display text-3xl leading-snug sm:text-4xl">
            Thử làm một nghề trước khi chọn nghề
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="mb-3 font-mono text-[10px] text-ink-faint">
            SANS / MONTSERRAT / 400–600
          </p>
          <p className="text-base leading-relaxed">
            Thử làm một nghề trước khi chọn nghề. Hỏi đồng nghiệp, cân nhắc cách
            làm, rồi tự cảm nhận điều mình muốn thử tiếp.
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            Đọc rõ ở màn hình nhỏ: dữ liệu, kết quả, câu hỏi và những dấu tiếng
            Việt.
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="mb-3 font-mono text-[10px] text-ink-faint">
            WORDMARK / CINZEL / LATIN ONLY
          </p>
          <p className="break-words font-wordmark text-3xl tracking-[0.15em] text-gilded sm:text-4xl">
            JOBQUEST
          </p>
          <p className="mt-3 text-xs text-ink-faint">
            Cinzel không có bộ dấu tiếng Việt; chỉ dùng cho logo Latin và số.
            Câu mẫu tiếng Việt dùng hai font ở trên.
          </p>
        </div>
      </div>
      <div className="space-y-4 border-t border-line pt-6">
        {[
          {
            label: 'Display lớn · 48 / 58',
            className: 'font-display text-4xl sm:text-5xl',
          },
          {
            label: 'Tiêu đề trang · 36 / 44',
            className: 'font-display text-3xl sm:text-4xl',
          },
          {
            label: 'Tiêu đề phần · 24 / 32',
            className: 'font-display text-2xl',
          },
          { label: 'Tiêu đề thẻ · 20 / 28', className: 'font-display text-xl' },
          { label: 'Nội dung · 15 / 24', className: 'font-sans text-[15px]' },
          {
            label: 'Nhãn · 13 / 20',
            className: 'font-sans text-[13px] font-semibold',
          },
          {
            label: 'Chú thích · 12 / 18',
            className: 'font-sans text-xs text-ink-faint',
          },
        ].map((sample) => (
          <div
            key={sample.label}
            className="grid gap-2 border-b border-line pb-4 sm:grid-cols-[170px_minmax(0,1fr)]"
          >
            <p className="pt-1 font-mono text-[10px] text-ink-faint">
              {sample.label}
            </p>
            <p className={sample.className}>Thử nghề, hiểu thêm một chút.</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-baseline gap-6">
        <span className="eyebrow">Nhãn trên tiêu đề</span>
        <span className="tabular font-display text-3xl text-gold-200">
          3.400 / 10.000
        </span>
        <code className="text-xs text-ink-faint">Số có độ rộng cố định</code>
      </div>
    </div>
  );
}

export function ShapeExamples() {
  const [variant, setVariant] = useState<
    'glass' | 'solid' | 'outline' | 'paper' | 'sunken'
  >('glass');
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {[
          { name: 'xs', px: 4 },
          { name: 'sm', px: 6 },
          { name: 'md', px: 10 },
          { name: 'lg', px: 14 },
          { name: 'xl', px: 20 },
          { name: '2xl', px: 28 },
        ].map(({ name, px }) => (
          <figure key={name}>
            <div
              className="aspect-square border border-line-strong bg-night-800"
              style={{ borderRadius: px }}
            />
            <figcaption className="mt-3 text-center text-xs text-ink-faint">
              {name} · {px}px
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            name: 'Panel',
            shadow: 'shadow-panel',
            text: 'Thẻ thông tin trên nền sao.',
          },
          {
            name: 'Lift',
            shadow: 'shadow-lift',
            text: 'Lớp nổi cần tách khỏi nền.',
          },
          {
            name: 'Glow',
            shadow: 'shadow-glow',
            text: 'Phần thưởng hoặc tiến độ của bạn.',
          },
          {
            name: 'Glow cool',
            shadow: 'shadow-glow-cool',
            text: 'Ánh trăng cho minh hoạ.',
          },
        ].map((sample) => (
          <div
            key={sample.name}
            className={`rounded-xl border border-line bg-night-800/50 p-5 ${sample.shadow}`}
          >
            <h3 className="text-lg">{sample.name}</h3>
            <p className="mt-2 text-sm text-ink-muted">{sample.text}</p>
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-4 text-lg">Bề mặt và khung</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {(['glass', 'solid', 'outline', 'paper', 'sunken'] as const).map(
            (value) => (
              <Button
                key={value}
                size="sm"
                variant={variant === value ? 'secondary' : 'ghost'}
                aria-pressed={variant === value}
                onClick={() => setVariant(value)}
              >
                {value}
              </Button>
            ),
          )}
        </div>
        <Panel as="div" variant={variant} frame={variant !== 'paper'}>
          <p className="text-base font-semibold">Một thẻ có khoảng thở</p>
          <p className="mt-2 text-sm">
            Thử từng bề mặt để xem độ tương phản của chữ và đường viền.
          </p>
        </Panel>
      </div>
    </div>
  );
}
