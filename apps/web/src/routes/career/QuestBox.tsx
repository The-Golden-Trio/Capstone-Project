import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { findEvent, findRole, findScenarioByKey } from '@datn/game-core';
import { Button } from '../../components/ui/Button';
import { Note, SectionLabel } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import { useProfileStore } from '../../store/profileStore';
import type { Anchor } from './mapGeometry';

const KEYCAPS = 'ABCDE';

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
  onClose,
}: QuestBoxProps) {
  const navigate = useNavigate();
  const anchored = useAnchored(anchor);
  const answerEvent = useProfileStore((s) => s.answerEvent);

  const [outcome, setOutcome] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kind, value] = markId.split(/:(.+)/);
  const role = findRole(roleCode);

  /* ── Nhiệm vụ chính: tóm tắt rồi mở màn chơi ── */
  if (kind === 'scenario') {
    const entry = findScenarioByKey(value);
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
  const event = role ? findEvent(role, value) : undefined;
  if (!event) return null;

  const choose = async (index: number) => {
    setBusy(true);
    setError(null);
    try {
      setOutcome(await answerEvent(event.event_id, roleCode, band, index));
    } catch (err) {
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

      {outcome ? (
        <>
          <SectionLabel>Chuyện gì xảy ra</SectionLabel>
          <div className="mb-3.5 rounded-r-[9px] border-l-[3px] border-l-[var(--accent)] bg-panel px-3.5 py-3 text-[13px] leading-relaxed text-ink-2">
            {outcome}
          </div>
          <Button variant="primary" className="w-full" onClick={onClose}>
            Về bản đồ
          </Button>
        </>
      ) : (
        <>
          <SectionLabel>Bạn sẽ làm gì</SectionLabel>
          <div className="flex flex-col gap-2">
            {event.choices.map((choice, index) => (
              <button
                key={choice.text}
                type="button"
                disabled={busy}
                onClick={() => void choose(index)}
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
      )}
    </Shell>
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
