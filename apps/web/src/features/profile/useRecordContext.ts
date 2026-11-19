import { useQueries } from '@tanstack/react-query';
import { api } from '../../api';
import { keys, useCatalogue } from '../../api/hooks';
import type { PlayerRecord } from '../../api/types';

/** Resolve only recorded context; unmatched tasks retain an explicit unknown label. */
export function useRecordContext(record: PlayerRecord) {
  const catalogue = useCatalogue();
  const summaries = useQueries({
    queries: record.journal.map((entry) => ({
      queryKey: keys.summary(entry.runId),
      queryFn: () => api.play.summary(entry.runId),
      staleTime: 30_000,
      retry: false,
    })),
  });
  const contexts = record.journal.map((entry, index) => {
    const summary = summaries[index]?.data;
    const occupation = catalogue.data?.occupations.find((item) =>
      summary
        ? item.code === summary.occupationCode
        : entry.path.split(/ › | · /).includes(item.name),
    );
    return { entry, summary, occupation };
  });
  return {
    journal: (runId: string) =>
      contexts.find(({ entry }) => entry.runId === runId)?.occupation,
    taskGroup: (text: string) => {
      const groups = new Set(
        contexts
          .filter(({ summary }) =>
            summary?.reflection.prompts.some((prompt) => prompt.recap === text),
          )
          .flatMap(({ occupation }) => (occupation ? [occupation.group] : [])),
      );
      return groups.size
        ? [...groups].join(' · ')
        : 'Nhóm ngành chưa được ghi lại';
    },
  };
}
