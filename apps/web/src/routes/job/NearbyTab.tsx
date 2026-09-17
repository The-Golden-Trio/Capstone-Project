import { useNavigate } from 'react-router-dom';
import { findRole, roleName } from '../../data/indexes';
import type { Role } from '../../data/schema';
import { adjacentRoles } from '../../domain/fit';
import { shortName } from '../../domain/format';
import { Planet } from '../../components/game/Planet';
import { Button } from '../../components/ui/Button';
import { Note, SourceNote } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import { useProfileStore } from '../../store/profileStore';

/** "Hành tinh lân cận": nghề gần nhất trong đồ thị, xếp lại theo hồ sơ người chơi. */
export function NearbyTab({ role }: { role: Role }) {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const nearby = adjacentRoles(role.role_code, profile.fit);
  const enoughEvents = profile.eventsPlayed >= 5;

  const travelTo = (code: string) => {
    const target = findRole(code);
    if (target) navigate(`/jobs/${code}/${target.band_start}`);
  };

  return (
    <>
      {!enoughEvents && (
        <Note className="mb-4">
          Xếp hạng sẽ chính xác hơn sau khi bạn chơi ít nhất <b>5</b> sự kiện.
          Đang có <b>{profile.eventsPlayed}</b> — hiện đang xếp theo độ gần trong
          đồ thị nghề.
        </Note>
      )}

      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
        {nearby.map((item) => (
          <div
            key={item.role_code}
            className="flex items-start gap-[15px] rounded-[10px] border border-line bg-surf px-4 py-3.5"
          >
            <Planet roleCode={item.role_code} size={56} />
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 text-[14.5px] font-semibold">
                {shortName(roleName(item.role_code))}
              </div>
              <div className="mb-1.5 font-mono text-[10px] text-gold-2">
                độ gần {item.weight}
                {item.fit != null && ` · hợp ${Math.round(item.fit * 100)}%`}
              </div>
              <p className="m-0 text-[12.5px] leading-relaxed text-muted">
                {item.why ?? ''}
              </p>
              <div className="mt-2.5">
                {item.playable ? (
                  <Button size="sm" onClick={() => travelTo(item.role_code)}>
                    Du hành tới đây
                  </Button>
                ) : (
                  <Pill tone="locked">ngoài vùng bản đồ</Pill>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SourceNote className="mt-3.5">
        Xếp hạng = độ gần trong đồ thị nghề × độ khớp hồ sơ tính cách của bạn.
        Nguồn đồ thị:{' '}
        <code className="font-mono">graph_edges.similar_ranked</code>.
      </SourceNote>
    </>
  );
}
