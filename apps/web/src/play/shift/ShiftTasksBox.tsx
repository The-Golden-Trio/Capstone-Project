/** Các ca làm của một cấp, đặt trong panel cấp của bản đồ nghề. */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SectionLabel, SourceNote } from '../../components/ui/Note';
import { getShiftApi, type ShiftTask } from './shiftApi';

export function ShiftTasksBox({
  roleCode,
  band,
}: {
  roleCode: string;
  band: string;
}) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ShiftTask[]>([]);

  useEffect(() => {
    let alive = true;
    getShiftApi()
      .tasks(roleCode, band)
      .then((list) => alive && setTasks(list))
      .catch(() => alive && setTasks([]));
    return () => {
      alive = false;
    };
  }, [roleCode, band]);

  if (tasks.length === 0) return null;
  return (
    <div className="mt-4 border-t border-line-2 pt-3">
      <SectionLabel>Ca làm</SectionLabel>
      {tasks.map((t) => (
        <div key={t.taskId} className="mt-2">
          <p className="m-0 mb-1 text-[13px] text-ink-2">{t.situation}</p>
          <Button
            variant="highlight"
            className="w-full"
            onClick={() => navigate(`/shift/${t.taskId}`)}
          >
            Thử ca: {t.title}
          </Button>
        </div>
      ))}
      <SourceNote className="mt-2 text-center">
        Bản thử theo Game Design mới, chưa chấm điểm.
      </SourceNote>
    </div>
  );
}
