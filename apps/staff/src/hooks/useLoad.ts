/** Tải dữ liệu một lần theo khoá, kèm trạng thái và hàm tải lại. */
import { useCallback, useEffect, useState } from 'react';

export interface Loaded<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  reload: () => Promise<void>;
  setData: (value: T) => void;
}

export function useLoad<T>(
  load: () => Promise<T>,
  deps: readonly unknown[],
): Loaded<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setData(await run());
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}
