import { bandLabel, findScenario, formatVnd, initials, type Role } from '@datn/game-core';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import { Stat } from '../../components/ui/Stat';

interface ContextTabProps {
  role: Role;
  band: string;
  onGoToTasks: () => void;
}

/** "Nơi này": cấp bậc, lương, và những ai bạn sẽ làm việc cùng. */
export function ContextTab({ role, band, onGoToTasks }: ContextTabProps) {
  const entry = findScenario(role.role_code, band);
  const salary = role.salary_by_band.find((b) => b.band === band);

  return (
    <>
      <div className="mb-4 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
        <Stat
          label="Cấp bậc hiện tại"
          value={band}
          hint={bandLabel(band)}
          gold
        />
        <Stat
          label="Lương trung bình"
          value={formatVnd(salary?.salary_avg)}
          hint={`mỗi tháng · ${salary?.evidence_level ?? '—'}`}
        />
      </div>

      {entry ? (
        <Card className="mb-4">
          <CardHeader title="Bạn sẽ làm việc với">
            <Pill>{entry.scenario.cast.length} người</Pill>
          </CardHeader>
          <CardBody>
            {entry.scenario.cast.map((member) => (
              <div key={member.npc_id} className="mb-3 flex gap-[11px]">
                <span className="flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full bg-chip text-[12px] font-semibold text-gold-2">
                  {initials(member.role_in_scene)}
                </span>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold">
                    {member.role_in_scene}
                  </div>
                  <div className="text-[12.5px] leading-normal text-muted">
                    {member.pressure}
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : (
        <Note tone="warn" className="mb-4">
          Hành tinh này <b>chưa có nhiệm vụ chính</b> nên chưa có ai ở đây. Nhiệm
          vụ phụ vẫn làm được và vẫn vẽ nên chân dung của bạn.
        </Note>
      )}

      <Button variant="primary" onClick={onGoToTasks}>
        Nhận nhiệm vụ
      </Button>
    </>
  );
}
