import { useMatches, type Params } from 'react-router-dom';

export interface Crumb {
  label: string;
  /** Không có `to` nghĩa là chặng cuối, không bấm được. */
  to?: string;
}

/** Route khai báo mẩu bánh mì của chính nó qua `handle.crumbs`. */
export interface CrumbHandle {
  crumbs: (params: Params<string>) => Crumb[];
}

const hasCrumbs = (handle: unknown): handle is CrumbHandle =>
  typeof handle === 'object' &&
  handle !== null &&
  typeof (handle as CrumbHandle).crumbs === 'function';

/**
 * Gom mẩu bánh mì từ mọi route đang khớp.
 *
 * Bản prototype giữ một bảng `CRUMBS` tra theo tên màn hình; ở đây mỗi route
 * tự khai, nên thêm màn mới không phải nhớ sửa hai chỗ.
 */
export function useBreadcrumbs(): Crumb[] {
  const matches = useMatches();
  return matches.flatMap((match) =>
    hasCrumbs(match.handle) ? match.handle.crumbs(match.params) : [],
  );
}
