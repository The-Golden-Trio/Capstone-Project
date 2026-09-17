import { Link, useNavigate } from 'react-router-dom';
import { GAME, findRole, hasFit, rankRoles, roleHasAnyScenario } from '@datn/game-core';
import { StarMap } from '../components/game/StarMap';
import { PageHeader } from '../components/layout/PageHeader';
import { SourceNote } from '../components/ui/Note';
import { useJourneyStore } from '../store/journeyStore';
import { useProfileStore } from '../store/profileStore';

export function JobsMapPage() {
  const navigate = useNavigate();
  const fit = useProfileStore((s) => s.fit);
  const activeRoleCode = useJourneyStore((s) => s.roleCode);

  const ranked = rankRoles(fit);
  const explored = ranked.filter((x) => roleHasAnyScenario(x.role)).length;
  const known = hasFit(fit);

  const goToRole = (code: string) => {
    const role = findRole(code);
    if (role) navigate(`/jobs/${code}/${role.band_start}`);
  };

  return (
    <>
      <PageHeader title="Bản đồ nghề">
        {GAME.roles.length} hành tinh trong vùng <b>{GAME._meta.group}</b>. Hành
        tinh sáng là nơi đã có nhiệm vụ chuyên sâu — {explored}/
        {GAME.roles.length} nơi.{' '}
        {known ? (
          'Xếp theo mức hợp với bạn.'
        ) : (
          <>
            Chưa rõ bạn hợp đâu —{' '}
            <Link to="/quiz" className="text-gold-2 hover:underline">
              trả lời 6 câu
            </Link>{' '}
            để bản đồ xếp lại theo bạn.
          </>
        )}
      </PageHeader>

      <StarMap
        roles={ranked}
        activeRoleCode={activeRoleCode}
        withLinks
        onSelect={goToRole}
      />

      <SourceNote className="mt-2 text-center">
        <span className="text-gold-2">──</span> đi lên thành &nbsp;
        <span className="text-blue">╌╌</span> nghề tương tự
      </SourceNote>
    </>
  );
}
