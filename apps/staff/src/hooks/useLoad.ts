/** Load by key without letting an older request replace the current screen. */
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const run = useCallback(load, deps);
  const [snapshot, setSnapshot] = useState<{
    loader: typeof run;
    data?: T;
    error?: unknown;
    loading: boolean;
  }>({ loader: run, loading: true });
  const mounted = useRef(false);
  const request = useRef(0);
  const reload = useCallback(async () => {
    const id = ++request.current;
    setSnapshot((previous) => ({
      loader: run,
      data: previous.loader === run ? previous.data : undefined,
      loading: true,
    }));
    try {
      const value = await run();
      if (mounted.current && id === request.current)
        setSnapshot({ loader: run, data: value, loading: false });
    } catch (error) {
      if (mounted.current && id === request.current)
        setSnapshot((previous) => ({ ...previous, error, loading: false }));
    }
  }, [run]);
  useEffect(() => {
    mounted.current = true;
    void reload();
    return () => {
      mounted.current = false;
      request.current++;
    };
  }, [reload]);
  const setData = useCallback(
    (value: T) => {
      // A completed mutation supersedes any earlier refresh still in flight.
      request.current++;
      if (mounted.current)
        setSnapshot({ loader: run, data: value, loading: false });
    },
    [run],
  );
  // Do not expose the previous route's data during the render before effects run.
  const current = snapshot.loader === run ? snapshot : { loading: true };
  return {
    data: 'data' in current ? current.data : undefined,
    error: 'error' in current ? current.error : undefined,
    loading: current.loading,
    reload,
    setData,
  };
}
