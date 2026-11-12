import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isProblem } from '../../api/client';
import { staffApi } from '../../api/endpoints';
import {
  Button,
  Card,
  Loading,
  Notice,
  PageHeader,
  ProblemAlert,
} from '../../components/ui';
import { useLoad } from '../../hooks/useLoad';

/**
 * C04 Review criteria (UC-C02, FR-32): CA soạn bộ tiêu chí duyệt của nghề.
 * Mỗi lần lưu là một version mới; lượt duyệt dùng version mới nhất.
 */
export function ReviewCriteriaPage() {
  const { occupationId = '' } = useParams();
  const current = useLoad(
    () =>
      staffApi.getReviewCriteria(occupationId).catch((e) => {
        if (isProblem(e, 'NOT_FOUND')) return null;
        throw e;
      }),
    [occupationId],
  );
  const [texts, setTexts] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (current.data !== undefined)
      setTexts(current.data?.criteria.map((c) => c.text) ?? ['']);
  }, [current.data]);

  const save = async () => {
    setBusy(true);
    setError(undefined);
    setSaved(false);
    try {
      current.setData(
        await staffApi.createReviewCriteriaVersion(
          occupationId,
          texts.map((t) => t.trim()).filter(Boolean),
        ),
      );
      setSaved(true);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Tiêu chí duyệt"
        subtitle={
          current.data
            ? `Đang dùng phiên bản ${current.data.versionNo}. Lưu sẽ tạo phiên bản mới.`
            : 'Nghề chưa có tiêu chí — chưa duyệt được scenario nào (FR-32).'
        }
      />
      <ProblemAlert error={current.error ?? error} />
      {saved && <Notice tone="good">Đã lưu phiên bản mới.</Notice>}
      {current.loading && current.data === undefined ? (
        <Loading />
      ) : (
        <Card>
          <ol className="space-y-2">
            {texts.map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-5 text-muted">{i + 1}.</span>
                <textarea
                  aria-label={`Tiêu chí ${i + 1}`}
                  rows={2}
                  className="flex-1 rounded-md border border-line px-2.5 py-1.5"
                  value={t}
                  onChange={(e) =>
                    setTexts(
                      texts.map((x, j) => (j === i ? e.target.value : x)),
                    )
                  }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Xoá tiêu chí ${i + 1}`}
                  onClick={() => setTexts(texts.filter((_, j) => j !== i))}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => setTexts([...texts, ''])}>
              + Thêm tiêu chí
            </Button>
            <Button
              variant="primary"
              busy={busy}
              disabled={!texts.some((t) => t.trim())}
              onClick={save}
            >
              Lưu phiên bản mới
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
