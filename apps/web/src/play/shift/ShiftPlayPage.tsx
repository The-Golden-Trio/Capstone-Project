/**
 * Màn chơi ca làm (Game Design W45): đồng hồ điểm thời gian, danh sách việc,
 * hội thoại theo nhịp, nút canon, sổ tay. Mọi luật chạy ở máy chủ; màn hình
 * gửi thao tác và hiện lại cảnh máy chủ trả.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Note } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import {
  ActionsPanel,
  ArtefactFormView,
  ClockBar,
  DocumentView,
  NotebookPanel,
  TranscriptView,
  TurnPanel,
} from './ShiftParts';
import type { ShiftScene, TurnBody } from './shiftApi';
import { useShiftSession } from './shiftSession';

type ActionView = ShiftScene['actions'][number];

export function ShiftPlayPage() {
  const { runId = '' } = useParams();
  const navigate = useNavigate();
  const s = useShiftSession();
  const [doc, setDoc] = useState<string | null>(null);
  const [writing, setWriting] = useState<ActionView | null>(null);

  useEffect(() => {
    void useShiftSession.getState().open(runId);
    return () => useShiftSession.getState().close();
  }, [runId]);

  const send = useCallback(
    (body: TurnBody) => useShiftSession.getState().send(body),
    [],
  );

  if (!s.scene || !s.run)
    return (
      <div className="mx-auto max-w-[720px]">
        {s.error ? (
          <Note tone="warn">{s.error}</Note>
        ) : (
          <p className="font-label text-[11px] uppercase tracking-[0.16em] text-muted">
            Đang mở ca làm…
          </p>
        )}
      </div>
    );

  const scene = s.scene;
  const waiting = s.waitingTurn !== null;
  const canAct =
    (scene.mode === 'phase' || scene.mode === 'conversation') &&
    !waiting &&
    !s.busy &&
    !scene.paused;

  const onAction = (action: ActionView) => {
    if (action.form) setWriting(action);
    else void send({ kind: 'action', key: action.key });
  };

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <ClockBar scene={scene} />
      <p className="m-0 mb-3 text-[13px] text-ink-2">
        <Pill tone="gold" className="mr-2">
          Vai của bạn
        </Pill>
        {s.run.playerRole}
      </p>
      {s.error && (
        <Note tone="warn" className="mb-3">
          {s.error}
        </Note>
      )}
      {scene.suspended && (
        <Note tone="info" className="mb-3">
          Đang làm dở “{scene.suspended.label}”, còn {scene.suspended.remaining}{' '}
          điểm. Xong việc chen ngang thì làm tiếp.
        </Note>
      )}

      <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)_280px]">
        <aside className="order-2 lg:order-1">
          <ActionsPanel
            scene={scene}
            locked={!canAct}
            onAction={onAction}
            onOpenDocument={setDoc}
          />
        </aside>

        <main className="order-1 min-w-0 lg:order-2">
          {doc && (
            <DocumentView scene={scene} id={doc} onClose={() => setDoc(null)} />
          )}
          {writing?.form && (
            <div className="mb-3">
              <ArtefactFormView
                key={writing.key}
                form={writing.form}
                submitLabel={`${writing.label} (${writing.points} điểm)`}
                disabled={!canAct}
                onCancel={() => setWriting(null)}
                onSubmit={(fields, ticks) => {
                  void send({
                    kind: 'action',
                    key: writing.key,
                    fields,
                    ticks,
                  }).then((ok) => ok && setWriting(null));
                }}
              />
            </div>
          )}
          <TranscriptView lines={s.lines} scene={scene} />
          <TurnPanel
            scene={scene}
            waiting={waiting}
            delayed={s.delayed}
            busy={s.busy}
            invalid={s.invalid}
            onSend={send}
            onResume={() => void s.resume()}
            onSummary={() => navigate(`/shift-run/${runId}/summary`)}
          />
          <div className="mt-2 text-right">
            <Button
              size="sm"
              onClick={() => {
                const reason = window.prompt(
                  'Nội dung nào sai hoặc không hợp lý?',
                );
                if (reason?.trim())
                  void s.flag(scene.node?.id ?? 'pha', reason.trim());
              }}
            >
              Báo nội dung sai
            </Button>
          </div>
        </main>

        <aside className="order-3">
          <NotebookPanel
            scene={scene}
            busy={!canAct}
            onNote={(text) => void s.addNote(text)}
            onHint={() => void send({ kind: 'hint' })}
          />
        </aside>
      </div>
    </div>
  );
}
