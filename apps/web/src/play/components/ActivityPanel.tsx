import { useState } from 'react';
import {
  stripNpcPrefix,
  type ActivityType,
  type Scenario,
} from '@datn/game-core';
import { ChatLog, NpcBubble } from '../../components/play/ChatLog';
import { ObjectiveStrip } from '../../components/play/ObjectiveStrip';
import { ChoiceActivity } from '../../components/play/activities/ChoiceActivity';
import { FreetextActivity } from '../../components/play/activities/FreetextActivity';
import { OrderingActivity } from '../../components/play/activities/OrderingActivity';
import { PrioritizingActivity } from '../../components/play/activities/PrioritizingActivity';
import { Button } from '../../components/ui/Button';
import { Note } from '../../components/ui/Note';
import { PLAY_API_MODE } from '../api/playApi';
import type { ActivityView, TaskType } from '../api/types';
import { usePlaySession } from '../store/playSession';

const ACTIVITY_TYPE: Record<TaskType, ActivityType> = {
  CHOICE: 'CHOICE',
  ORDERING: 'ORDERING',
  PRIORITIZING: 'PRIORITIZING',
  FREE_TEXT: 'FREETEXT',
};

/** `ActivityView` của hợp đồng → hình dạng mà các thẻ hoạt động cũ đọc. */
const asItems = (view: ActivityView) =>
  (view.items ?? []).map((i) => ({
    item_id: i.key ?? '',
    text: i.text ?? '',
    note: i.note ?? null,
  }));

/** NFR-07: nói rõ ai chấm câu tự luận, ngay chỗ người chơi viết. */
const AI_DISCLOSURE =
  PLAY_API_MODE === 'mock'
    ? 'Bản demo: câu tự luận được chấm giả lập bằng từ khoá, chưa qua hội đồng AI.'
    : 'Câu tự luận do AI chấm theo tiêu chí chuyên gia soạn; kết quả kèm nhận xét ở cuối màn.';

/**
 * Thân một hoạt động (E11): việc cần làm, lời trao đổi, rồi thẻ trả lời hoặc
 * trạng thái chờ chấm. Dùng chung cho khung chat và cho lớp phủ văn phòng.
 */
export function ActivityPanel({
  scenario,
  playerSeed,
  showOpening,
  showClosing,
}: {
  scenario: Scenario;
  playerSeed: string;
  /** Khung chat tự in lời dẫn và câu NPC; văn phòng đã nói trong hội thoại. */
  showOpening: boolean;
  /** Văn phòng đọc lời kết thành hội thoại, khung chat in ngay ở đây. */
  showClosing: boolean;
}) {
  const s = usePlaySession();
  const view = s.activity;
  if (!view?.taskType) return null;

  const type = ACTIVITY_TYPE[view.taskType];
  const index = scenario.activities.findIndex(
    (a) => a.activity_id === view.activityKey,
  );
  const limit = scenario.activities[index]?.limitFollowup ?? 0;
  const busy = s.stage === 'submitting' || s.stage === 'grading';
  const answering = s.stage === 'answering' || s.stage === 'submitting';
  const freeText =
    s.followup !== null ||
    (view.taskType === 'FREE_TEXT' && s.stage !== 'closing');

  return (
    <>
      <ObjectiveStrip
        type={type}
        total={scenario.activities.length}
        current={Math.max(0, index)}
        followup={s.followup ? { used: s.followup.no, limit } : null}
      />

      {showOpening && (
        <>
          <p className="m-0 mb-4 text-[14px] leading-relaxed text-ink-2">
            {view.setup}
          </p>
          {view.npc?.line && (
            <NpcBubble
              seed={view.npc.npcKey}
              name={view.npc.name ?? '?'}
              text={view.npc.line}
            />
          )}
        </>
      )}

      {s.hint && (
        <NpcBubble
          seed={s.hint.npcKey}
          name={nameOf(s.npcNames, s.hint.npcKey)}
          text={s.hint.text}
        />
      )}

      <ChatLog lines={s.log} playerSeed={playerSeed} />

      {answering && view.inputPrompt && view.taskType !== 'FREE_TEXT' && (
        <p className="m-0 mb-4 text-[14px] font-medium leading-relaxed text-ink">
          {view.inputPrompt}
        </p>
      )}

      {s.invalid.length > 0 && (
        <Note tone="warn" className="mb-3">
          {s.invalid.join(' ')}
        </Note>
      )}
      {s.error && (
        <Note tone="warn" className="mb-3">
          {s.error}
        </Note>
      )}

      {/* ── Thân ── */}
      {s.stage === 'closing' ? (
        showClosing && (
          <>
            <p className="reveal m-0 mb-4 text-[14px] leading-relaxed text-muted">
              {stripNpcPrefix(s.closing?.line ?? '')}
            </p>
            <Button variant="primary" onClick={() => void s.next()}>
              {s.closing?.next ? 'Tiếp tục' : 'Xem kết quả'}
            </Button>
          </>
        )
      ) : s.stage === 'finishing' ? (
        <WaitingNote delayed={s.delayed}>
          Đang soạn nhận xét cho màn này…
        </WaitingNote>
      ) : s.stage === 'grading' ? (
        <WaitingNote delayed={s.delayed}>
          {nameOf(s.npcNames, view.npc?.npcKey ?? '')} đang đọc câu trả lời của
          bạn…
        </WaitingNote>
      ) : freeText ? (
        <>
          <FreetextActivity
            resetKey={`${view.activityKey}:${s.followup?.no ?? 0}`}
            placeholder={view.inputPrompt ?? ''}
            isFollowup={s.followup !== null}
            hintAvailable={Boolean(view.hintAvailable)}
            hintUsed={s.hint !== null}
            hintFree
            busy={busy}
            onHint={() => void s.viewHint()}
            onSubmit={(text) => void s.submitText(text)}
          />
          <p className="mt-2 font-mono text-[10px] leading-snug text-muted">
            {AI_DISCLOSURE}
          </p>
        </>
      ) : (
        <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0">
          {view.taskType === 'CHOICE' ? (
            <ChoiceActivity
              activity={{
                options: (view.items ?? []).map((i) => i.text ?? ''),
              }}
              onPick={(i) =>
                void s.submitChoice(view.items?.[i]?.key ?? String(i))
              }
            />
          ) : view.taskType === 'ORDERING' ? (
            <OrderingActivity
              activity={{ items: asItems(view) }}
              order={s.order}
              onMove={s.move}
              onSubmit={() => void s.submitOrdering()}
            />
          ) : (
            <PrioritizingActivity
              activity={{
                items: asItems(view),
                pick_count: view.pickCount ?? 0,
              }}
              picked={s.picked}
              hintUsed={s.hint !== null}
              hintAvailable={Boolean(view.hintAvailable)}
              hintFree
              onToggle={s.toggle}
              onHint={() => void s.viewHint()}
              onSubmit={() => void s.submitPrioritizing()}
            />
          )}
          {/* Hoạt động đóng chưa có nút gợi ý riêng thì cho một nút chung. */}
          {view.hintAvailable &&
            !s.hint &&
            (view.taskType === 'CHOICE' || view.taskType === 'ORDERING') && (
              <div className="mt-3 flex items-center gap-2.5">
                <Button
                  variant="highlight"
                  size="sm"
                  onClick={() => void s.viewHint()}
                >
                  Xem gợi ý
                </Button>
                <span className="text-[11.5px] text-gold">
                  Xem gợi ý không trừ điểm.
                </span>
              </div>
            )}
        </fieldset>
      )}

      <FlagContent key={view.activityKey} />
    </>
  );
}

/** Tên NPC: tên đã gặp trong lượt chơi, không thì viết hoa khoá ("an" → "An"). */
function nameOf(names: Record<string, string>, npcKey: string): string {
  if (!npcKey) return 'Đồng nghiệp';
  return names[npcKey] ?? npcKey.charAt(0).toUpperCase() + npcKey.slice(1);
}

function WaitingNote({
  delayed,
  children,
}: {
  delayed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite">
      <p className="m-0 mb-3 flex items-center gap-2 text-[13.5px] text-ink-2">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
        {children}
      </p>
      {delayed && (
        <Note tone="warn">
          Hệ thống chấm đang chậm hơn thường lệ. Câu trả lời đã được lưu; bạn có
          thể chờ thêm hoặc quay lại sau, tiến độ vẫn còn nguyên.
        </Note>
      )}
    </div>
  );
}

/** FR-14: người chơi báo một hoạt động có nội dung sai. */
function FlagContent() {
  const flag = usePlaySession((s) => s.flag);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState<'idle' | 'sending' | 'done' | 'error'>(
    'idle',
  );

  if (sent === 'done')
    return (
      <p className="mt-5 text-[11.5px] text-muted">
        Đã gửi báo cáo. Chuyên gia của nghề sẽ xem lại hoạt động này.
      </p>
    );

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 text-[11.5px] text-muted underline decoration-dotted underline-offset-2 hover:text-ink-2"
      >
        Báo nội dung sai
      </button>
    );

  const send = async () => {
    setSent('sending');
    try {
      await flag(reason.trim());
      setSent('done');
    } catch {
      setSent('error');
    }
  };

  return (
    <div className="mt-5 rounded-[10px] border border-line bg-inset p-3">
      <label
        className="mb-2 block text-[12px] text-ink-2"
        htmlFor="flag-reason"
      >
        Hoạt động này sai ở đâu?
      </label>
      <textarea
        id="flag-reason"
        value={reason}
        maxLength={1000}
        onChange={(e) => setReason(e.target.value)}
        className="min-h-[64px] w-full resize-y rounded-[8px] border border-line bg-bg px-3 py-2 text-[13px] text-ink focus:border-[var(--accent)] focus:outline-none"
      />
      {sent === 'error' && (
        <p className="m-0 mt-2 text-[11.5px] text-signal">
          Chưa gửi được, thử lại nhé.
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={() => setOpen(false)}>
          Huỷ
        </Button>
        <Button
          size="sm"
          variant="primary"
          disabled={reason.trim().length < 3 || sent === 'sending'}
          onClick={() => void send()}
        >
          Gửi báo cáo
        </Button>
      </div>
    </div>
  );
}
