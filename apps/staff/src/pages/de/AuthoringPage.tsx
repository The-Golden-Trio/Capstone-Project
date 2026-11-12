import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isProblem } from '../../api/client';
import { staffApi } from '../../api/endpoints';
import type {
  CheckReport,
  GenerationInput,
  ScenarioContent,
  ScenarioDetail,
  StreamEvent,
} from '../../api/types';
import {
  Badge,
  Button,
  Card,
  Dialog,
  Loading,
  Notice,
  PageHeader,
  ProblemAlert,
  Tabs,
} from '../../components/ui';
import { ContextForm } from '../../features/authoring/ContextForm';
import { setAtPath } from '../../features/authoring/draft';
import { ReferenceAnswers } from '../../features/authoring/ReferenceAnswers';
import { RevisionDialog } from '../../features/authoring/RevisionDialog';
import { ScenarioEditor } from '../../features/authoring/ScenarioEditor';
import { HistoryTimeline } from '../../features/shared/HistoryTimeline';
import { StatusBadge } from '../../features/shared/StatusBadge';
import { useEventStream } from '../../hooks/useEventStream';
import { useLoad } from '../../hooks/useLoad';
import { formatDateTime } from '../../lib/labels';
import { useAuth } from '../../store/auth';

type Tab = 'context' | 'content' | 'references' | 'checks' | 'history';

/**
 * D03 Scenario authoring (UC-D01, AD-04, SD-05; FR-22, FR-23, FR-24). Tác giả
 * viết ngữ cảnh → AI sinh bản nháp (job ở worker, kết quả qua SSE) → sửa →
 * câu mẫu → kiểm tự động → nộp. Lưu có khoá lạc quan (`If-Match`, 412).
 */
export function AuthoringPage() {
  const { scenarioId = '' } = useParams();
  const me = useAuth((s) => s.me);
  const detail = useLoad(() => staffApi.getScenario(scenarioId), [scenarioId]);
  const options = useLoad(
    () => staffApi.getSituationOptions(scenarioId),
    [scenarioId],
  );
  const generations = useLoad(
    () => staffApi.listGenerations(scenarioId),
    [scenarioId],
  );

  const [draft, setDraft] = useState<ScenarioContent | null>(null);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<Tab | null>(null);
  const [pending, setPending] = useState<{
    kind: 'generate' | 'revise';
    jobId: string;
    label?: string;
  } | null>(null);
  const [revising, setRevising] = useState<{
    part: string;
    label: string;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState<string | null>(null);
  const [report, setReport] = useState<CheckReport | null>(null);
  const [conflict, setConflict] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  const d = detail.data;
  const content = draft ?? d?.content ?? null;
  const readOnly =
    !d || d.status !== 'DRAFT' || !me || d.assignment?.authorId !== me.id;
  const currentTab: Tab = tab ?? (content ? 'content' : 'context');

  const skills = useMemo(() => {
    const names = new Map(
      (options.data?.skills ?? []).map((s) => [s.competencyId, s.name]),
    );
    return (d?.skillIds ?? []).map((id) => ({
      competencyId: id,
      name: names.get(id) ?? id,
    }));
  }, [options.data, d?.skillIds]);

  const accept = (next: ScenarioDetail) => {
    detail.setData(next);
    setDraft(null);
    setDirty(false);
    setHistoryKey((k) => k + 1);
  };

  useEventStream(
    readOnly
      ? null
      : {
          types: ['generation.ready', 'revision.ready', 'review.outcome'],
          scenarioId,
        },
    (event: StreamEvent) => {
      if (event.type === 'review.outcome') {
        void detail.reload();
        setHistoryKey((k) => k + 1);
        return;
      }
      if (!pending || event.jobId !== pending.jobId) return;
      setPending(null);
      void generations.reload();
      const p = event.payload as {
        content?: ScenarioContent;
        part?: string;
        value?: unknown;
        error?: string;
        checkReport?: CheckReport;
      };
      if (p.error) {
        setError(
          new Error(
            'AI chưa trả được kết quả (model lỗi hoặc hết model dự phòng). Thử lại sau; bản đang soạn vẫn còn.',
          ),
        );
        return;
      }
      if (event.type === 'generation.ready' && p.content) {
        setDraft(p.content);
        setDirty(true);
        setTab('content');
        setReport(p.checkReport ?? null);
        setNotice(
          'AI đã sinh bản nháp. Đọc, sửa rồi bấm Lưu — chưa có gì được ghi.',
        );
      }
      if (event.type === 'revision.ready' && p.part && content) {
        setDraft(setAtPath(content, p.part, p.value));
        setDirty(true);
        setNotice(`AI đã sửa ${pending.label ?? p.part}. Xem lại rồi bấm Lưu.`);
      }
    },
  );

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError(undefined);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      if (isProblem(e, 'PRECONDITION_FAILED')) setConflict(true);
      else setError(e);
    } finally {
      setBusy(null);
    }
  };

  const generate = (input: GenerationInput) =>
    run('generate', async () => {
      const job = await staffApi.requestGeneration(scenarioId, input);
      setPending({ kind: 'generate', jobId: job.jobId });
      await detail.reload();
    });

  const save = () =>
    run('save', async () => {
      if (!d || !content) return;
      accept(
        await staffApi.saveScenarioContent(scenarioId, d.version, content),
      );
      setNotice('Đã lưu.');
    });

  const check = () =>
    run('check', async () => {
      setReport(await staffApi.runContentChecks(scenarioId));
      setTab('checks');
    });

  const submit = () =>
    run('submit', async () => {
      try {
        accept(await staffApi.submitScenario(scenarioId));
        setNotice('Đã nộp. Người duyệt đã được báo.');
      } catch (e) {
        if (isProblem(e, 'CHECKS_FAILED')) {
          setReport(await staffApi.runContentChecks(scenarioId));
          setTab('checks');
        }
        throw e;
      }
    });

  if (detail.loading && !d) return <Loading />;
  if (!d) return <ProblemAlert error={detail.error} />;

  return (
    <>
      <PageHeader
        title={d.taskTitle}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={d.status} />
            <span>L{d.levelNo}</span>
            <span>· phiên bản {d.version}</span>
            {d.reviewerName && <span>· người duyệt {d.reviewerName}</span>}
            {dirty && <Badge tone="warn">Chưa lưu</Badge>}
          </span>
        }
        actions={
          !readOnly && (
            <>
              <Button
                busy={busy === 'save'}
                disabled={!dirty || !content}
                variant="primary"
                onClick={save}
              >
                Lưu
              </Button>
              <Button
                busy={busy === 'check'}
                disabled={dirty || !d.content}
                onClick={check}
              >
                Kiểm tra
              </Button>
              <Button
                busy={busy === 'submit'}
                disabled={
                  dirty || !d.content || !d.allowedActions.includes('SUBMIT')
                }
                onClick={submit}
              >
                Nộp duyệt
              </Button>
            </>
          )
        }
      />
      {readOnly && (
        <Notice>
          {d.status === 'DRAFT'
            ? 'Bạn không phải tác giả của scenario này — chỉ xem.'
            : 'Scenario đã nộp hoặc đã qua duyệt, nội dung chỉ đọc.'}
        </Notice>
      )}
      {notice && <Notice tone="good">{notice}</Notice>}
      {pending && (
        <Notice>
          <span className="flex items-center gap-2">
            <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
            {pending.kind === 'generate'
              ? 'AI đang sinh bản nháp'
              : `AI đang sửa ${pending.label}`}
            … Có thể mất một phút; bạn vẫn xem trang được.
          </span>
        </Notice>
      )}
      <ProblemAlert error={error} />

      <Tabs
        label="Bước soạn"
        value={currentTab}
        onChange={setTab}
        tabs={[
          { id: 'context', label: 'Ngữ cảnh & sinh' },
          { id: 'content', label: 'Nội dung' },
          { id: 'references', label: 'Câu mẫu' },
          {
            id: 'checks',
            label: report
              ? `Kiểm tra ${report.passed ? '✓' : `(${report.failedRules.length})`}`
              : 'Kiểm tra',
          },
          { id: 'history', label: 'Lịch sử' },
        ]}
      />

      {currentTab === 'context' &&
        (options.data ? (
          <Card title="Ngữ cảnh và lựa chọn tình huống">
            {d.content && !readOnly && (
              <Notice tone="warn">
                Sinh lại sẽ thay toàn bộ bản đang soạn khi bạn lưu kết quả mới.
              </Notice>
            )}
            <ContextForm
              options={options.data}
              initial={{
                context: d.authorContext,
                archetype: d.archetype,
                companyType: d.companyType,
                competencyIds: d.skillIds,
              }}
              busy={busy === 'generate' || pending?.kind === 'generate'}
              disabled={readOnly}
              onGenerate={generate}
            />
          </Card>
        ) : (
          <ProblemAlert error={options.error} />
        ))}

      {currentTab === 'content' &&
        (content ? (
          <ScenarioEditor
            content={content}
            readOnly={readOnly}
            skills={skills}
            onChange={(next) => {
              setDraft(next);
              setDirty(true);
            }}
            onRevise={
              dirty ? undefined : (part, label) => setRevising({ part, label })
            }
          />
        ) : (
          <Notice>
            Chưa có nội dung. Viết ngữ cảnh ở bước đầu và để AI sinh bản nháp.
          </Notice>
        ))}

      {currentTab === 'references' && content && (
        <ReferenceAnswers
          scenarioId={scenarioId}
          content={content}
          skills={skills}
          readOnly={readOnly}
          dirty={dirty}
        />
      )}

      {currentTab === 'checks' && (
        <Card title="Kiểm tra tự động">
          {!report ? (
            <p className="text-muted">
              Bấm “Kiểm tra” để chạy luật trên bản đã lưu.
            </p>
          ) : report.passed ? (
            <Notice tone="good">Đạt mọi luật. Có thể nộp duyệt.</Notice>
          ) : (
            <ul className="space-y-1">
              {report.failedRules.map((f, i) => (
                <li
                  key={i}
                  className="rounded-md bg-bad-soft px-2 py-1 text-[13px] text-bad"
                >
                  <code className="font-mono text-[12px]">{f.rule}</code> ·{' '}
                  {f.path}: {f.message}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {currentTab === 'history' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Vòng đời">
            <HistoryTimeline scenarioId={scenarioId} refreshKey={historyKey} />
          </Card>
          <Card title="Các lần sinh bằng AI">
            <ul className="space-y-2">
              {(generations.data ?? []).map((g) => (
                <li key={g.id} className="text-[13px]">
                  <span className="font-medium">
                    {g.kind === 'GENERATE' ? 'Sinh' : 'Sửa'}
                  </span>{' '}
                  · {formatDateTime(g.createdAt)} · {g.model || '—'} · $
                  {g.costUsd.toFixed(4)}{' '}
                  {g.checkPassed === true && (
                    <Badge tone="good">qua kiểm</Badge>
                  )}
                  {g.checkPassed === false && (
                    <Badge tone="warn">chưa qua kiểm</Badge>
                  )}
                  {g.status === 'FAILED' && <Badge tone="bad">lỗi</Badge>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {revising && (
        <RevisionDialog
          label={revising.label}
          busy={busy === 'revise'}
          onClose={() => setRevising(null)}
          onSubmit={(request) =>
            run('revise', async () => {
              const job = await staffApi.requestRevision(
                scenarioId,
                revising.part,
                request,
              );
              setPending({
                kind: 'revise',
                jobId: job.jobId,
                label: revising.label,
              });
              setRevising(null);
            })
          }
        />
      )}

      <Dialog
        open={conflict}
        onClose={() => setConflict(false)}
        title="Scenario vừa được lưu ở nơi khác"
        footer={
          <>
            <Button onClick={() => setConflict(false)}>Ở lại sửa tiếp</Button>
            <Button
              variant="danger"
              onClick={async () => {
                setConflict(false);
                setDraft(null);
                setDirty(false);
                await detail.reload();
              }}
            >
              Tải bản mới (bỏ thay đổi của tôi)
            </Button>
          </>
        }
      >
        <p>
          Bản trên máy chủ mới hơn bản bạn đang sửa (412). Tải bản mới sẽ bỏ các
          thay đổi chưa lưu của bạn; ở lại thì bạn có thể chép phần cần giữ
          trước.
        </p>
      </Dialog>
    </>
  );
}
