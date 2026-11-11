import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { getPlayApi, isPlayApiError, PLAY_HOME } from '../api/playApi';

/**
 * "Bắt đầu nhiệm vụ" trên Island Map (E08) dẫn tới đây: mở lượt chơi hoặc
 * lấy lại lượt đang dở (`POST /runs`, NFR-03), rồi sang phần giới thiệu.
 */
export function QuestLauncher() {
  const { scenarioKey = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    getPlayApi()
      .startRun({
        // Bản demo không có ghi danh; máy chủ thật nhận id ghi danh từ E08.
        enrolmentId: params.get('enrolment') ?? 'demo',
        taskId: scenarioKey,
      })
      .then((run) => navigate(`/run/${run.id}`, { replace: true }))
      .catch((err: unknown) =>
        setError(
          isPlayApiError(err) && err.code === 'SCENARIO_UNAVAILABLE'
            ? 'Nhiệm vụ này đang tạm đóng. Quay lại bản đồ để chọn nhiệm vụ khác.'
            : 'Không mở được nhiệm vụ. Thử lại sau nhé.',
        ),
      );
  }, [scenarioKey, params, navigate]);

  return (
    <Card className="mx-auto max-w-[720px]">
      <CardBody>
        {error ? (
          <>
            <Note tone="warn" className="mb-4">
              {error}
            </Note>
            <Button variant="primary" onClick={() => navigate(PLAY_HOME)}>
              Về bản đồ
            </Button>
          </>
        ) : (
          <p className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Đang mở nhiệm vụ…
          </p>
        )}
      </CardBody>
    </Card>
  );
}
