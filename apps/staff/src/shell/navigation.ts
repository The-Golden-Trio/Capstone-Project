/** Nhãn của route hiện có; không đưa UUID vào breadcrumb. */
export function breadcrumbLabel(path: string, hash = ''): string {
  if (hash === '#catalogue') return 'Danh mục nghề';
  if (hash === '#review-queue') return 'Hàng duyệt';
  if (hash === '#authored') return 'Scenario tôi viết';
  if (path.includes('/catalogue/imports/')) return 'Chi tiết nhập dữ liệu';
  const labels: Record<string, string> = {
    assets: 'Thư viện asset',
    catalogue: 'Danh mục nghề',
    imports: 'Nhập dữ liệu',
    publish: 'Xuất bản scenario',
    monitor: 'Theo dõi nghề',
    prompts: 'Prompt hệ thống',
    settings: 'Cài đặt trò chơi',
    scenarios: 'Ô scenario',
    'review-criteria': 'Tiêu chí duyệt',
    gamify: 'Thiết kế trình bày',
    author: 'Soạn scenario',
    review: 'Duyệt scenario',
  };
  return (
    labels[path.split('/').filter(Boolean).slice(-1)[0] ?? ''] ??
    (path.startsWith('/de') ? 'Việc của tôi' : 'Tổng quan')
  );
}
