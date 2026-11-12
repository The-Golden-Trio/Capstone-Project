import { useCallback } from 'react';
import { staffApi } from '../../api/endpoints';
import { useLoad } from '../../hooks/useLoad';

/**
 * Tên năng lực theo id. Lấy từ hồ sơ nghề không có tên, nên dùng
 * `getSituationOptions` khi được phép; không được thì hiện mã.
 */
export function useSkillNames(scenarioId: string, enabled: boolean) {
  const options = useLoad(
    () =>
      enabled
        ? staffApi.getSituationOptions(scenarioId)
        : Promise.resolve(null),
    [scenarioId, enabled],
  );
  return useCallback(
    (id: string) =>
      options.data?.skills.find((s) => s.competencyId === id)?.name ??
      'Năng lực',
    [options.data],
  );
}
