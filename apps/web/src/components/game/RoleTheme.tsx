import type { CSSProperties, ReactNode } from 'react';
import { DEFAULT_THEME, roleTheme, themeVars } from '../../domain/roleTheme';

/**
 * Nhuộm một nhánh giao diện theo màu của nghề.
 *
 * Gắn màu bằng biến CSS chứ không truyền prop xuống từng thành phần: mọi thứ
 * bên trong chỉ cần viết `text-[var(--accent)]` là xong, không thành phần nào
 * phải biết mình đang ở nghề nào.
 */
export function RoleTheme({
  roleCode,
  children,
  className,
}: {
  /** Không có nghề nào thì giữ màu vàng mặc định của app. */
  roleCode?: string | null;
  children: ReactNode;
  className?: string;
}) {
  const theme = roleCode ? roleTheme(roleCode) : DEFAULT_THEME;
  return (
    <div
      className={className ?? 'contents'}
      style={themeVars(theme) as CSSProperties}
      data-role-theme={theme.name}
    >
      {children}
    </div>
  );
}
