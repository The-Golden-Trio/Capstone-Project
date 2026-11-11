import { useEffect } from 'react';
import { getPlayApi } from '../api/playApi';
import { usePlaySession, useReleaseStore } from '../store/playSession';

/**
 * Mở lượt chơi cho một màn (E10/E11): nạp trạng thái từ máy chủ, tải bản
 * phát hành của kịch bản, và — nếu màn cần chờ kết quả — nghe `/stream` trong
 * lúc màn còn mở (đóng khi rời màn, như hợp đồng dặn).
 */
export function useRunScreen(runId: string, options: { listen: boolean }) {
  const open = usePlaySession((s) => s.open);
  const run = usePlaySession((s) => (s.runId === runId ? s.run : null));
  const loadRelease = useReleaseStore((s) => s.load);
  const scenario = useReleaseStore((s) =>
    s.runId === runId ? s.scenario : null,
  );

  useEffect(() => {
    void open(runId);
  }, [runId, open]);

  useEffect(() => {
    if (run) void loadRelease(run);
  }, [run, loadRelease]);

  useEffect(() => {
    if (!options.listen) return;
    return getPlayApi().openEventStream((event) =>
      usePlaySession.getState().handleEvent(event),
    );
  }, [options.listen]);

  return { run, scenario };
}

/**
 * Khoá kịch bản theo quy ước `<role>_<band>_<archetype>` của bộ dữ liệu, để tra
 * sân khấu văn phòng (`office/stage.ts`).
 */
export const scenarioKeyOf = (scenario: {
  job: { role_code: string; band: string };
  context: { scenario_archetype: string };
}): string =>
  `${scenario.job.role_code}_${scenario.job.band}_${scenario.context.scenario_archetype}`;
