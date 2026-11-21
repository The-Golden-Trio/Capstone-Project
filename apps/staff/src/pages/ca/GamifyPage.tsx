import {
  EmptyState,
  Button,
  LoadingBlock as Loading,
  PageHeader,
} from '@datn/ui';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isProblem } from '../../api/client';
import { staffApi } from '../../api/endpoints';
import type {
  Build,
  Presentation,
  ScenarioContent,
  TaskType,
} from '../../api/types';
import {
  Card,
  LinkButton,
  Notice,
  ProblemAlert,
  SelectField,
} from '../../components/ui';
import type { Hint } from '../../features/authoring/lint';
import { AssetPicker } from '../../features/gamify/AssetPicker';
import { ContentReadOnly } from '../../features/shared/ContentReadOnly';
import { HintList } from '../../features/shared/Guidance';
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
  return <GamifyScenario key={scenarioId} scenarioId={scenarioId} />;
}

function GamifyScenario({ scenarioId }: { scenarioId: string }) {
  const detail = useLoad(() => staffApi.getScenario(scenarioId), [scenarioId]);
  const saved = useLoad(
    () => staffApi.getPresentation(scenarioId),
    [scenarioId],
  );
  const assets = useLoad(() => staffApi.listAssets(), []);
  const [p, setP] = useState<Presentation | null>(null);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
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
    setNotice('');
    setError(undefined);
    try {
      await staffApi.savePresentation(scenarioId, {
        ...p,
        npcs: p.npcs.filter((n) => n.avatarAssetId),
      });
      setDirty(false);
      setNotice('Đã lưu trình bày.');
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
  const formatHints = content && p ? presentationHints(content, p) : [];

  return (
    <>
      <PageHeader
        title={`Trình bày: ${d.taskTitle}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={d.status} /> L{d.levelNo} · tác giả{' '}
            {d.authorName ?? '—'}
          </span>
        }
        actions={
          <LinkButton
            to={`/ca/occupations/${d.occupationId}/scenarios`}
            variant="subtle"
            size="sm"
          >
            ← Ô scenario
          </LinkButton>
        }
      />
      {!editable && (
        <Notice>
          {d.status === 'IN_PLAYTEST'
            ? 'Đã dựng bản nháp; tác giả đang chơi thử. Trình bày chỉ sửa lại được nếu tác giả báo lỗi trình bày.'
            : 'Chỉ thiết kế trình bày khi scenario đã được duyệt.'}
        </Notice>
      )}
      <ProblemAlert
        error={error ?? detail.error ?? assets.error ?? saved.error}
      />
      {notice && <Notice tone="success">{notice}</Notice>}
      {build && (
        <Notice tone="success">
          Đã dựng bản nháp lúc {formatDateTime(build.builtAt)} · hash{' '}
          <code className="font-mono">{build.contentHash.slice(0, 12)}</code>.
          Tác giả đã được báo để chơi thử.
        </Notice>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
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
                  <div className="mt-3 grid gap-3 rounded-xl border border-line-strong bg-surface p-4 md:grid-cols-2">
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
          ) : !content ? (
            <EmptyState title="Scenario chưa có nội dung để trình bày." />
          ) : saved.error ? null : (
            <Loading />
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:self-start lg:overflow-y-auto">
          {editable && (
            <Card title="Lưu và dựng bản nháp">
              <div className="flex flex-col gap-2">
                <Button
                  variant="subtle"
                  loading={busy === 'save'}
                  disabled={!dirty}
                  onClick={save}
                >
                  Lưu trình bày
                </Button>
                <Button
                  variant="primary"
                  loading={busy === 'build'}
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
                  <p className="text-[12px] text-warning">
                    Mỗi NPC cần một avatar.
                  </p>
                )}
                {dirty && (
                  <p className="text-[12px] text-ink-faint">
                    Lưu trình bày trước khi dựng.
                  </p>
                )}
              </div>
            </Card>
          )}
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
                    label={`Avatar: ${npcLabel(content?.cast, n.npcKey)}`}
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
          {p && (
            <Card title="Dạng trình bày">
              <p className="mb-2 text-[12px] text-ink-faint">
                Kiểm theo luật định dạng của seed; không chặn lưu hay dựng.
              </p>
              <HintList
                hints={formatHints}
                empty="Dạng đã chọn khớp luật định dạng."
              />
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

function npcLabel(cast: ScenarioContent['cast'], npcKey: string): string {
  const m = cast?.find((x) => x.npcKey === npcKey);
  if (!m) return npcKey;
  return m.name ? `${m.roleInScene} · ${m.name}` : m.roleInScene;
}

/**
 * Gợi ý theo dạng CA chọn (Seed §D3): nút kết luôn là dạng viết, mỗi màn có
 * ít nhất một nút dạng đóng.
 */
function presentationHints(content: ScenarioContent, p: Presentation): Hint[] {
  const out: Hint[] = [];
  const typeOf = (key: string) =>
    p.activities.find((a) => a.activityKey === key)?.taskType;
  for (const a of content.activities)
    if (!a.forwardTo && typeOf(a.key) && typeOf(a.key) !== 'FREE_TEXT')
      out.push({
        id: 'END_WRITTEN',
        path: `activities.${a.key}`,
        message: `Activity kết ${a.key} đang trình bày dạng ${TASK_TYPE_LABEL[typeOf(a.key) as TaskType]}; nút kết luôn là dạng viết.`,
        source: 'Seed §D3',
        severity: 'warn',
      });
  if (!p.activities.some((a) => a.taskType !== 'FREE_TEXT'))
    out.push({
      id: 'NO_CLOSED_FORMAT',
      path: 'activities',
      message:
        'Mọi activity đều trình bày tự luận; mỗi màn nên có ít nhất một dạng đóng nếu DE cho phép.',
      source: 'Seed §D3',
      severity: 'info',
    });
  return out;
}
