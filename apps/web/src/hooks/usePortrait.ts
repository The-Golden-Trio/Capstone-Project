import { useEffect, useState } from 'react';
import { profileApi } from '../api/endpoints';
import type { PortraitView } from '../api/schemas';
import { useLanguage } from '../i18n/useT';

/**
 * Chân dung từ máy chủ, tải lại khi đổi ngôn ngữ — đoạn mô tả được viết bằng
 * đúng ngôn ngữ đang chọn. `key` đổi thì cũng tải lại (ví dụ sau một lượt
 * chơi làm chỉ số dịch chuyển).
 */
export function usePortrait(key: unknown = null) {
  const language = useLanguage();
  const [portrait, setPortrait] = useState<PortraitView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    profileApi
      .portrait(language)
      .then((view) => alive && setPortrait(view))
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      alive = false;
    };
  }, [language, key]);

  return { portrait, error, loading: !portrait && !error };
}
