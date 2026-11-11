/**
 * "Thử ca làm" trên bản đồ nghề dẫn tới đây: mở lượt ca làm, hoặc lấy lại
 * lượt đang dở của cùng nhiệm vụ (NFR-03), rồi vào màn chơi.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { isPlayApiError } from '../api/contract';
import { getShiftApi } from './shiftApi';

export function ShiftLauncher() {
  const { seedId = '' } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    getShiftApi()
      .start(seedId)
      .then((run) => navigate(`/shift-run/${run.id}`, { replace: true }))
      .catch((err: unknown) =>
        setError(
          isPlayApiError(err) && err.code === 'SCENARIO_UNAVAILABLE'
            ? 'Ca làm này đang tạm đóng. Quay lại bản đồ để chọn việc khác.'
            : 'Không mở được ca làm. Thử lại sau nhé.',
        ),
      );
  }, [seedId, navigate]);

  return (
    <Card className="mx-auto max-w-[720px]">
      <CardBody>
        {error ? (
          <>
            <Note tone="warn" className="mb-4">
              {error}
            </Note>
            <Button variant="primary" onClick={() => navigate('/jobs')}>
              Về bản đồ
            </Button>
          </>
        ) : (
          <p className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Đang mở ca làm…
          </p>
        )}
      </CardBody>
    </Card>
  );
}
