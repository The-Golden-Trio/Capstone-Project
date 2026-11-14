import { useEffect, useRef, useState } from 'react';
import { Button } from '../../ui/Button';

interface FreetextActivityProps {
  placeholder: string;
  /** Câu đào sâu không có gợi ý. */
  isFollowup: boolean;
  hintAvailable: boolean;
  hintUsed: boolean;
  /** Xem gợi ý không hạ điểm (Q5, FR-13 mới). Màn chơi cũ để `false`. */
  hintFree?: boolean;
  /** Đang gửi hoặc đang chờ chấm: khoá ô nhập. */
  busy?: boolean;
  onHint: () => void;
  onSubmit: (text: string) => void;
  /** Khoá reset ô nhập khi sang câu khác. */
  resetKey: string;
}

export function FreetextActivity({
  placeholder,
  isFollowup,
  hintAvailable,
  hintUsed,
  hintFree = false,
  busy = false,
  onHint,
  onSubmit,
  resetKey,
}: FreetextActivityProps) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  // Sang câu mới thì dọn ô nhập, không để câu cũ dính lại.
  useEffect(() => setText(''), [resetKey]);

  const submit = () => {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      ref.current?.focus();
      return;
    }
    onSubmit(trimmed);
  };

  const canHint = hintAvailable && !hintUsed && !isFollowup;

  return (
    <>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        readOnly={busy}
        placeholder={isFollowup ? 'Trả lời…' : placeholder}
        aria-label={isFollowup ? 'Câu trả lời đào sâu' : placeholder}
        className="min-h-[94px] w-full resize-y rounded-xl border border-blue/45 bg-inset/85 px-3.5 py-3 text-[14px] leading-relaxed text-ink transition-colors focus:border-[var(--accent)] focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        {isFollowup && (
          <span className="text-[12px] text-muted">
            Không có gợi ý ở câu đào sâu
          </span>
        )}
        {canHint && (
          <Button variant="highlight" onClick={onHint}>
            Xem gợi ý
          </Button>
        )}
        {hintUsed && !isFollowup && (
          <span className="text-[11.5px] leading-snug text-gold">
            {hintFree
              ? 'Đã xem gợi ý'
              : 'Đã xem gợi ý — câu này tối đa mức trung bình'}
          </span>
        )}
        <span className="flex-1" />
        <Button
          variant="primary"
          onClick={submit}
          disabled={busy || text.trim().length < 2}
        >
          Gửi
        </Button>
      </div>

      {canHint && (
        <p className="mt-2.5 text-[11.5px] leading-snug text-gold">
          {hintFree
            ? 'Xem gợi ý không trừ điểm.'
            : 'Xem gợi ý thì câu này chỉ đạt được mức trung bình, dù bạn trả lời hay tới đâu.'}
        </p>
      )}
    </>
  );
}
