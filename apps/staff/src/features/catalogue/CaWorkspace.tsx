import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Badge, Button, Callout, LoadingBlock } from '@datn/ui';
import { Link } from 'react-router-dom';
import { messageOf } from '../../api/client';
import type { Sourced } from '../../api/ca-extra';

export function CaWorkspace({
  code,
  title,
  description,
  demo,
  children,
  action,
}: {
  code: string;
  title: string;
  description: string;
  demo?: boolean;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            className="text-sm text-ink-muted hover:text-ink"
            to="/ca/catalogue"
          >
            Quản trị nội dung / {code}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl">{title}</h1>
            {demo && <Badge tone="info">Dữ liệu mẫu</Badge>}
          </div>
          <p className="max-w-3xl text-sm text-ink-muted">{description}</p>
        </div>
        {action}
      </header>
      {demo && (
        <Callout>
          Dữ liệu mô phỏng trong bộ nhớ của trình duyệt. Thao tác mẫu không ghi
          vào hệ thống và mất khi tải lại trang.
        </Callout>
      )}
      {children}
    </div>
  );
}

export function useCaResource<T>(loader: () => Promise<Sourced<T>>) {
  const [result, setResult] = useState<Sourced<T>>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setResult(undefined);
    setError('');
    loader()
      .then((value) => {
        if (active) setResult(value);
      })
      .catch((e) => {
        if (active) setError(messageOf(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loader, revision]);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  return { result, error, loading, reload };
}
export function ResourceState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  if (loading) return <LoadingBlock text="Đang tải nội dung…" />;
  if (error)
    return (
      <div role="alert" className="space-y-3">
        <Callout tone="danger">{error}</Callout>
        <Button variant="subtle" onClick={retry}>
          Thử lại
        </Button>
      </div>
    );
  return null;
}
export function useCaMutation() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, run };
}
