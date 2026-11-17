import { FlaskConical } from 'lucide-react';
import { Tooltip } from '@datn/ui';
import { HYBRID_SOURCES, apiMode, sourceOf, usesSampleData } from '../api';

const NAMES: Record<keyof typeof HYBRID_SOURCES, string> = {
  auth: 'Đăng nhập',
  account: 'Tài khoản',
  catalogue: 'Danh mục nghề',
  quiz: 'Get to know me',
  progress: 'Tiến độ, hồ sơ',
  play: 'Ca làm (AI giả)',
  feedback: 'Đánh giá, góp ý',
};

/**
 * Nhãn trung thực: phần nào của màn đang chạy bằng dữ liệu mẫu thì nói rõ,
 * để không ai nhầm số liệu mẫu là kết quả thật.
 */
export function SampleDataPill() {
  if (!usesSampleData && apiMode !== 'demo') return null;
  const sample = (Object.keys(NAMES) as Array<keyof typeof NAMES>)
    .filter((k) => sourceOf(k) === 'demo')
    .map((k) => NAMES[k]);
  return (
    <Tooltip content={`Đang dùng dữ liệu mẫu: ${sample.join(', ')}.`}>
      <span
        tabIndex={0}
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-warning/40 bg-warning-deep/40 px-2.5 text-[11px] font-semibold text-warning"
      >
        <FlaskConical size={13} aria-hidden />
        <span className="hidden sm:inline">Dữ liệu mẫu</span>
      </span>
    </Tooltip>
  );
}
