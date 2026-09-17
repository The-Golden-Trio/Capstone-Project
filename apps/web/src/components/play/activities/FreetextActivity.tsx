import { useEffect, useRef, useState } from 'react';
import { Button } from '../../ui/Button';

interface FreetextActivityProps {
  placeholder: string;
  /** Câu đào sâu không có gợi ý. */
  isFollowup: boolean;
  hintAvailable: boolean;
  hintUsed: boolean;
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
        placeholder={isFollowup ? 'Trả lời…' : placeholder}
        aria-label={isFollowup ? 'Câu trả lời đào sâu' : placeholder}
        className="min-h-[94px] w-full resize-y rounded-[9px] border-[1.5px] border-line bg-inset px-3.5 py-3 text-[14px] leading-relaxed text-ink focus:border-gold focus:outline-none"
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
            Đã xem gợi ý — câu này tối đa mức trung bình
          </span>
        )}
        <span className="flex-1" />
        <Button variant="primary" onClick={submit} disabled={text.trim().length < 2}>
          Gửi
        </Button>
      </div>

      {canHint && (
        <p className="mt-2.5 text-[11.5px] leading-snug text-gold">
          Xem gợi ý thì câu này chỉ đạt được mức trung bình, dù bạn trả lời hay
          tới đâu.
        </p>
      )}
    </>
  );
}
