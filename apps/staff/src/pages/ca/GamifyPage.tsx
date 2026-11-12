import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isProblem } from '../../api/client';
import { staffApi } from '../../api/endpoints';
import type { Build, Presentation, TaskType } from '../../api/types';
import {
  Button,
  Card,
  Loading,
  Notice,
  PageHeader,
  ProblemAlert,
  SelectField,
} from '../../components/ui';
import { AssetPicker } from '../../features/gamify/AssetPicker';
import { ContentReadOnly } from '../../features/shared/ContentReadOnly';
import { HistoryTimeline } from '../../features/shared/HistoryTimeline';
import { StatusBadge } from '../../features/shared/StatusBadge';
import { useLoad } from '../../hooks/useLoad';
import { formatDateTime, TASK_TYPE_LABEL } from '../../lib/labels';

/**
 * C06 Gamify workspace (UC-C07, SD-07, FR-35): nội dung chỉ đọc; mỗi activity
 * chọn một dạng task trong tập DE cho phép, cảnh, nền, avatar NPC; rồi dựng
 * bản game nháp (Approved → In playtest). Gợi ý trình bày bằng AI hoãn (D-104).
 */
export function GamifyPage() {
  const { scenarioId = '' } = useParams();
  const detail = useLoad(() => staffApi.getScenario(scenarioId), [scenarioId]);
  const saved = useLoad(
    () => staffApi.getPresentation(scenarioId),
    [scenarioId],
  );
  const assets = useLoad(() => staffApi.listAssets(), []);
  const [p, setP] = useState<Presentation | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<unknown>();
  const [build, setBuild] = useState<Build | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const d = detail.data;
  const content = d?.content;
  const editable = d?.status === 'APPROVED';

  // Ghép bản đã lưu với nội dung: activity / NPC chưa có lựa chọn thì để trống.
  useEffect(() => {
    if (!content || !saved.data || p) return;
    setP({
      backgroundAssetId: saved.data.backgroundAssetId,
      activities: content.activities.map((a) => {
        const s = saved.data?.activities.find((x) => x.activityKey === a.key);
        return {
          activityKey: a.key,
          taskType: (s?.taskType ?? a.allowedTypes[0]) as TaskType,
          sceneAssetId: s?.sceneAssetId ?? null,
        };
      }),
      npcs: (content.cast ?? []).map((m) => ({
        npcKey: m.npcKey,
        avatarAssetId:
          saved.data?.npcs.find((x) => x.npcKey === m.npcKey)?.avatarAssetId ??
          '',
      })),
    });
  }, [content, saved.data, p]);

  const update = (next: Presentation) => {
    setP(next);
    setDirty(true);
  };

  const save = async () => {
    if (!p) return;
    setBusy('save');
    setError(undefined);
    try {
      await staffApi.savePresentation(scenarioId, {
        ...p,
        npcs: p.npcs.filter((n) => n.avatarAssetId),
      });
      setDirty(false);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(null);
    }
  };

  const buildDraft = async () => {
    setBusy('build');
    setError(undefined);
    try {
      setBuild(await staffApi.buildDraftGame(scenarioId));
      await detail.reload();
      setHistoryKey((k) => k + 1);
    } catch (e) {
      setError(
        isProblem(e, 'TASK_TYPE_NOT_ALLOWED')
          ? new Error('Có activity chọn dạng task ngoài tập DE cho phép.')
          : e,
      );
    } finally {
      setBusy(null);
    }
  };

  if (detail.loading && !d) return <Loading />;
  if (!d) return <ProblemAlert error={detail.error} />;
  const pool = assets.data ?? [];
  const missingNpc = p?.npcs.some((n) => !n.avatarAssetId);

  return (
    <>
      <PageHeader
        title={`Trình bày: ${d.taskTitle}`}
        subtitle={
          <span className="flex items-center gap-2">
            <StatusBadge status={d.status} /> L{d.levelNo} · tác giả{' '}
            {d.authorName ?? '—'}
          </span>
        }
        actions={
          <Link
            to={`/ca/occupations/${d.occupationId}/scenarios`}
            className="rounded-md border border-line px-3 py-1.5 hover:bg-inset"
          >
            ← Ô scenario
          </Link>
        }
      />
      {!editable && (
        <Notice>
          {d.status === 'IN_PLAYTEST'
            ? 'Đã dựng bản nháp; tác giả đang chơi thử. Trình bày chỉ sửa lại được nếu tác giả báo lỗi trình bày.'
            : 'Chỉ thiết kế trình bày khi scenario đã được duyệt.'}
        </Notice>
      )}
      <ProblemAlert error={error ?? assets.error ?? saved.error} />
      {build && (
        <Notice tone="good">
          Đã dựng bản nháp lúc {formatDateTime(build.builtAt)} · hash{' '}
          <code className="font-mono">{build.contentHash.slice(0, 12)}</code>.
          Tác giả đã được báo để chơi thử.
        </Notice>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div>
          {content && p ? (
            <ContentReadOnly
              content={content}
              skillName={() => 'Năng lực'}
              renderActivityExtra={(key) => {
                const i = p.activities.findIndex((a) => a.activityKey === key);
                const a = content.activities.find((x) => x.key === key);
                if (i < 0 || !a) return null;
                const chosen = p.activities[i];
                return (
                  <div className="mt-3 grid gap-3 rounded-md bg-brand-soft p-3 md:grid-cols-2">
                    <SelectField
                      label="Dạng task (trong tập DE cho phép)"
                      value={chosen.taskType}
                      disabled={!editable}
                      options={a.allowedTypes.map((t) => ({
                        value: t,
                        label: TASK_TYPE_LABEL[t],
                      }))}
                      onChange={(e) =>
                        update({
                          ...p,
                          activities: p.activities.map((x, j) =>
                            j === i
                              ? { ...x, taskType: e.target.value as TaskType }
                              : x,
                          ),
                        })
                      }
                    />
                    <AssetPicker
                      kind="SCENE"
                      label="Cảnh"
                      assets={pool}
                      value={chosen.sceneAssetId}
                      disabled={!editable}
                      onChange={(id) =>
                        update({
                          ...p,
                          activities: p.activities.map((x, j) =>
                            j === i ? { ...x, sceneAssetId: id } : x,
                          ),
                        })
                      }
                    />
                  </div>
                );
              }}
            />
          ) : (
            <Loading />
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:self-start lg:overflow-y-auto">
          {p && (
            <Card title="Nền và nhân vật">
              <div className="space-y-3">
                <AssetPicker
                  kind="BACKGROUND"
                  label="Nền"
                  assets={pool}
                  value={p.backgroundAssetId}
                  disabled={!editable}
                  onChange={(id) => update({ ...p, backgroundAssetId: id })}
                />
                {p.npcs.map((n, i) => (
                  <AssetPicker
                    key={n.npcKey}
                    kind="NPC"
                    allowNone={false}
                    label={`Avatar: ${content?.cast?.find((m) => m.npcKey === n.npcKey)?.name ?? n.npcKey}`}
                    assets={pool}
                    value={n.avatarAssetId || null}
                    disabled={!editable}
                    onChange={(id) =>
                      update({
                        ...p,
                        npcs: p.npcs.map((x, j) =>
                          j === i ? { ...x, avatarAssetId: id ?? '' } : x,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </Card>
          )}
          {editable && (
            <Card title="Lưu và dựng bản nháp">
              <div className="flex flex-col gap-2">
                <Button busy={busy === 'save'} disabled={!dirty} onClick={save}>
                  Lưu trình bày
                </Button>
                <Button
                  variant="primary"
                  busy={busy === 'build'}
                  disabled={
                    dirty ||
                    missingNpc ||
                    !d.allowedActions.includes('BUILD_DRAFT')
                  }
                  onClick={buildDraft}
                >
                  Dựng bản game nháp
                </Button>
                {missingNpc && (
                  <p className="text-[12px] text-warn">
                    Mỗi NPC cần một avatar.
                  </p>
                )}
                {dirty && (
                  <p className="text-[12px] text-muted">
                    Lưu trình bày trước khi dựng.
                  </p>
                )}
              </div>
            </Card>
          )}
          <Card title="Lịch sử">
            <HistoryTimeline scenarioId={scenarioId} refreshKey={historyKey} />
          </Card>
        </aside>
      </div>
    </>
  );
}
