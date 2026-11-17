import { ToonButton, Skeleton } from '@datn/ui';

import { errorText, useCatalogue, useRunSummary } from '../../api/hooks';

/** Một số nguồn demo trả URL thay vì đường nghề; tra ngữ cảnh ca qua hook chung. */
export function RunPath({ runId, path }: { runId: string; path: string }) {
  if (!path.startsWith('/')) return <span>{path}</span>;
  return <ResolvedRunPath runId={runId} />;
}

function ResolvedRunPath({ runId }: { runId: string }) {
  const summary = useRunSummary(runId);
  const catalogue = useCatalogue();

  if (summary.isError || catalogue.isError) {
    return (
      <span className="text-toon-ink-soft">
        Chưa tải được đường nghề · {errorText(summary.error ?? catalogue.error)}{' '}
        <ToonButton
          variant="ghost"
          size="sm"
          onClick={() => {
            void summary.refetch();
            void catalogue.refetch();
          }}
        >
          Thử lại
        </ToonButton>
      </span>
    );
  }
  if (!summary.data || !catalogue.data)
    return <Skeleton className="inline-block h-3 w-40 align-middle" />;

  const occupation = catalogue.data.occupations.find(
    (item) => item.code === summary.data.occupationCode,
  );
  return (
    <span>
      {occupation?.group ?? 'Ca trải nghiệm'} ›{' '}
      {summary.data.occupationName ??
        occupation?.name ??
        'Nghề chưa được ghi lại'}{' '}
      ›{' '}
      {summary.data.levelNo === null
        ? 'Chưa ghi cấp'
        : `Cấp ${summary.data.levelNo}`}
    </span>
  );
}
