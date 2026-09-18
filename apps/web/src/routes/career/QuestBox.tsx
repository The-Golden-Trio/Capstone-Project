import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MIN_ANSWER_LENGTH,
  questKind,
  type GameEvent,
  type QuestKind,
} from '@datn/game-core';
import { Button } from '../../components/ui/Button';
import { Note, SectionLabel, SourceNote } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import { useGameIndex } from '../../store/contentStore';
import { useProfileStore } from '../../store/profileStore';
import type { EventAnswerResult } from '../../api/schemas';
import type { Anchor } from './mapGeometry';

/** Khoảng hở giữa ký hiệu và hộp, và lề tối thiểu với mép màn hình. */
const GAP = 16;
const EDGE = 12;

/**
 * Đặt hộp ngay bên phải ký hiệu, ngang tầm mắt với nó.
 *
 * Phải đo hộp sau khi dựng mới biết nó cao bao nhiêu, nên lần vẽ đầu hộp còn
 * ẩn: thà chớp một nhịp còn hơn để người chơi thấy nó nhảy từ góc màn hình
 * về đúng chỗ. Nếu bên phải không đủ chỗ thì lật sang trái — vẫn cạnh ký
 * hiệu, chỉ đổi phía.
 */
function useAnchored(anchor: Anchor) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const place = () => {
      const { width, height } = el.getBoundingClientRect();

      let left = anchor.right + GAP;
      if (left + width > window.innerWidth - EDGE) {
        left = anchor.left - GAP - width;
      }
      left = clamp(left, EDGE, window.innerWidth - width - EDGE);

      const top = clamp(
        anchor.y - height / 2,
        EDGE,
        window.innerHeight - height - EDGE,
      );

      setStyle({ left, top });
    };

    place();

    // Hộp cao lên khi trả lời xong và hiện diễn biến; không đo lại thì nó
    // tràn xuống dưới mép màn hình.
    const observer = new ResizeObserver(place);
    observer.observe(el);
    window.addEventListener('resize', place);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [anchor.left, anchor.right, anchor.y]);

  return { ref, style };
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(value, Math.max(low, high)));
}

interface QuestBoxProps {
  roleCode: string;
  band: string;
  /** "scenario:<key>" hoặc "event:<id>". */
  markId: string;
  /** Chỗ đứng của ký hiệu vừa bấm, tính bằng pixel màn hình. */
  anchor: Anchor;
  /** Vừa được cộng điểm kỹ năng — bản đồ phải tải lại tiến trình. */
  onAwarded: () => void;
  onClose: () => void;
}

/**
 * Hộp câu hỏi, hiện ngay cạnh ký hiệu vừa bấm trên bản đồ giấy.
 *
 * Nhiệm vụ phụ vốn chỉ là một tình huống ngắn và ba lựa chọn, nên chơi luôn
 * tại chỗ: không cần rời bản đồ, trả lời xong thấy ngay diễn biến. Nhiệm vụ
 * chính thì dài hơn nhiều — nhiều cảnh, có đếm giờ, có hỏi vặn — nên ở đây
 * chỉ tóm tắt rồi mở sang màn chơi đầy đủ.
 */
export function QuestBox({
  roleCode,
  band,
  markId,
  anchor,
  onAwarded,
  onClose,
}: QuestBoxProps) {
  const navigate = useNavigate();
  const anchored = useAnchored(anchor);
  const answerEvent = useProfileStore((s) => s.answerEvent);

  const [result, setResult] = useState<EventAnswerResult | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = useGameIndex();

  const [kind, value] = markId.split(/:(.+)/);
  const role = content.findRole(roleCode);

  /* ── Nhiệm vụ chính: tóm tắt rồi mở màn chơi ── */
  if (kind === 'scenario') {
    const entry = content.findScenarioByKey(value);
    if (!entry) return null;
    const { scenario } = entry;

    return (
      <Shell title={scenario.scenario_title} onClose={onClose} {...anchored}>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Pill tone="gold">Nhiệm vụ chính</Pill>
          <Pill>≈ {scenario.context.estimated_minutes} phút</Pill>
          <Pill>{scenario.activities.length} cảnh</Pill>
        </div>

        <p className="m-0 mb-3 text-[13px] leading-relaxed text-ink-2">
          {scenario.context.situation}
        </p>

        {scenario.context.stakes && (
          <Note tone="warn" className="mb-3">
            {scenario.context.stakes}
          </Note>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={() => navigate(`/play/${value}`)}
        >
          Bắt đầu nhiệm vụ
        </Button>
      </Shell>
    );
  }

  /* ── Nhiệm vụ phụ: hỏi và đáp ngay tại chỗ ── */
  if (!role) return null;
  const event = content.findEvent(role, value);
  if (!event) return null;

  // `kind` ở trên đã là loại ký hiệu (chính/phụ); đây là kiểu hỏi.
  const askKind = questKind(role, band, event.event_id, content);

  const send = async (reply: { answer?: string; choiceIndex?: number }) => {
    setBusy(true);
    setError(null);
    try {
      const next = await answerEvent(event.event_id, roleCode, band, reply);
      setResult(next);
      if (next.pointsAwarded > 0) onAwarded();
    } catch (err) {
      // Máy chủ từ chối khi đọc không ra ý định; giữ nguyên câu đã viết để
      // người chơi sửa tiếp chứ không bắt gõ lại từ đầu.
      setError(err instanceof Error ? err.message : 'Không ghi nhận được');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title={event.title} onClose={onClose} {...anchored}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {event.measures.map((m) => (
          <Pill key={m}>{m}</Pill>
        ))}
      </div>

      <p className="m-0 mb-3.5 text-[13px] leading-relaxed text-ink-2">
        {event.setup}
      </p>

      {error && (
        <Note tone="warn" className="mb-3">
          {error}
        </Note>
      )}

      {result ? (
        <>
          {/* Chỉ câu tự luận mới cần nói lại: hai kiểu kia người chơi đã tự
              chọn nên họ biết rồi. */}
          {askKind === 'WRITE' && (
            <>
              <SectionLabel>Mình đọc câu của bạn là</SectionLabel>
              <p className="m-0 mb-3.5 text-[13px] leading-relaxed text-ink">
                {result.readAs}
              </p>
            </>
          )}

          <SectionLabel>Chuyện gì xảy ra</SectionLabel>
          <div className="mb-3.5 rounded-r-[9px] border-l-[3px] border-l-[var(--accent)] bg-panel px-3.5 py-3 text-[13px] leading-relaxed text-ink-2">
            {result.outcome}
          </div>

          {/* Nhiệm vụ phụ giờ có cộng điểm, nên phải nói ra — nếu không người
              chơi lại tưởng nó chẳng để làm gì. */}
          {result.pointsAwarded > 0 ? (
            <Note tone="ok" className="mb-3.5">
              <b>+{result.pointsAwarded} điểm kỹ năng</b> ở {band}. Đang có{' '}
              <b>{result.bandPoints}</b> điểm tại đảo này.
              {result.unlockedBand && (
                <>
                  {' '}
                  Vừa mở <b>{result.unlockedBand}</b>.
                </>
              )}
            </Note>
          ) : (
            <Note className="mb-3.5">
              Nhiệm vụ này đã tính điểm ở {band} rồi, nên lần này chỉ đổi câu
              trả lời chứ không cộng thêm.
            </Note>
          )}

          <Button variant="primary" className="w-full" onClick={onClose}>
            Về bản đồ
          </Button>
        </>
      ) : (
        <QuestPrompt
          event={event}
          kind={askKind}
          busy={busy}
          draft={draft}
          onDraft={setDraft}
          onSend={(reply) => void send(reply)}
        />
      )}
    </Shell>
  );
}

const KEYCAPS = 'ABCDE';

/**
 * Phần hỏi của một nhiệm vụ phụ.
 *
 * Kiểu hỏi do `questKind` quyết định và máy chủ cũng tra đúng hàm ấy, nên
 * không thể gửi số thứ tự phương án cho một câu lẽ ra phải tự viết.
 */
function QuestPrompt({
  event,
  kind,
  busy,
  draft,
  onDraft,
  onSend,
}: {
  event: GameEvent;
  kind: QuestKind;
  busy: boolean;
  draft: string;
  onDraft: (text: string) => void;
  onSend: (reply: { answer?: string; choiceIndex?: number }) => void;
}) {
  const [order, setOrder] = useState(() => event.choices.map((_, i) => i));

  /* ── Tự viết, máy chủ đọc ── */
  if (kind === 'WRITE') {
    return (
      <>
        <SectionLabel>Bạn sẽ làm gì? Viết bằng lời của bạn</SectionLabel>
        <textarea
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          rows={5}
          placeholder="Bạn sẽ làm gì trước, và vì sao?"
          className="mb-2 w-full resize-y rounded-[9px] border border-line bg-inset px-3 py-2.5 text-[12.5px] leading-relaxed text-ink outline-none focus:border-[var(--accent)]"
        />
        <Button
          variant="primary"
          className="w-full"
          disabled={busy || draft.trim().length < MIN_ANSWER_LENGTH}
          onClick={() => onSend({ answer: draft })}
        >
          {busy ? 'Đang chấm…' : 'Gửi câu trả lời'}
        </Button>
        <SourceNote className="mt-2 text-center">
          Không có đáp án đúng. Cách bạn xử lý nói lên bạn hợp với việc gì.
        </SourceNote>
      </>
    );
  }

  /* ── Xếp thứ tự, cái trên cùng là câu trả lời ── */
  if (kind === 'ORDER') {
    const move = (at: number, by: number) => {
      const to = at + by;
      if (to < 0 || to >= order.length) return;
      const next = [...order];
      [next[at], next[to]] = [next[to], next[at]];
      setOrder(next);
    };

    return (
      <>
        <SectionLabel>Xếp theo thứ tự bạn sẽ làm</SectionLabel>
        <div className="mb-3 flex flex-col gap-2">
          {order.map((choiceIndex, position) => (
            <div
              key={event.choices[choiceIndex].text}
              className="flex items-start gap-2 rounded-[9px] border border-line bg-surf px-3 py-2.5 text-[12.5px] leading-normal text-ink"
            >
              <span className="keycap mt-px font-mono text-[10px] text-muted">
                {position + 1}
              </span>
              <span className="min-w-0 flex-1">
                {event.choices[choiceIndex].text}
              </span>
              <span className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label="Lên trên"
                  disabled={position === 0}
                  onClick={() => move(position, -1)}
                  className="rounded-[5px] border border-line-2 px-1.5 font-mono text-[10px] text-muted disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  aria-label="Xuống dưới"
                  disabled={position === order.length - 1}
                  onClick={() => move(position, 1)}
                  className="rounded-[5px] border border-line-2 px-1.5 font-mono text-[10px] text-muted disabled:opacity-30"
                >
                  ▼
                </button>
              </span>
            </div>
          ))}
        </div>
        <Button
          variant="primary"
          className="w-full"
          disabled={busy}
          onClick={() => onSend({ choiceIndex: order[0] })}
        >
          Chốt thứ tự này
        </Button>
        <SourceNote className="mt-2 text-center">
          Việc bạn xếp lên đầu là việc bạn thật sự chọn.
        </SourceNote>
      </>
    );
  }

  /* ── Chọn thẳng một hướng ── */
  return (
    <>
      <SectionLabel>Bạn sẽ làm gì</SectionLabel>
      <div className="flex flex-col gap-2">
        {event.choices.map((choice, index) => (
          <button
            key={choice.text}
            type="button"
            disabled={busy}
            onClick={() => onSend({ choiceIndex: index })}
            className="action-card flex w-full items-start gap-2.5 rounded-[9px] border border-line bg-surf px-3 py-2.5 text-left text-[12.5px] leading-normal text-ink disabled:opacity-50"
          >
            <span className="keycap mt-px font-mono text-[10px] text-muted">
              {KEYCAPS[index]}
            </span>
            <span>{choice.text}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/** Khung chung: tiêu đề, nút đóng, thân cuộn được. */
function Shell({
  title,
  onClose,
  children,
  ref,
  style,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  ref: React.Ref<HTMLDivElement>;
  style: CSSProperties;
}) {
  return (
    <div className="quest-box" ref={ref} style={style}>
      <div className="mb-3 flex items-start gap-2.5">
        <h2 className="min-w-0 flex-1 font-display text-[15.5px] font-semibold leading-snug">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="shrink-0 rounded-[6px] border border-line-2 bg-inset px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:border-line hover:text-ink-2"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  );
}
