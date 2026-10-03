import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Note } from '../../components/ui/Note';
import { cx } from '../../lib/cx';
import { colorOf, groupOf, shortPlanetName, type GalaxyNode } from '../galaxy';
import type { SkillCheck } from '../unlock';

interface EntryTestProps {
  node: GalaxyNode;
  missing: SkillCheck[];
  /** Người chơi đã trả lời hết — cấp visa cho đúng các kỹ năng còn thiếu. */
  onPass: (skills: string[]) => void;
  onClose: () => void;
}

type Step = 'intro' | 'quiz' | 'result';

/**
 * "Kiểm tra nhập cảnh" — cửa vào một hành tinh khi còn thiếu kỹ năng.
 *
 * BẢN MẪU: câu hỏi lấy từ sự kiện tình huống thật của nghề (dataset), nhưng
 * chưa có đáp án đúng/sai để chấm — trả lời xong là được cấp visa. Bài thật
 * sẽ chấm theo rubric anchor +2/0/−1 của kịch bản (KHỐI B); điểm nối là
 * `onPass`, chỗ này chỉ cần đổi điều kiện gọi nó.
 */
export function EntryTest({ node, missing, onPass, onClose }: EntryTestProps) {
  const [step, setStep] = useState<Step>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const color = colorOf(node);
  const questions = node.events;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const answer = (choice: number) => {
    const next = [...answers, choice];
    setAnswers(next);
    if (index + 1 < questions.length) setIndex(index + 1);
    else setStep('result');
  };

  const skills = missing.map((s) => s.name);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-40 grid place-items-center bg-black/55 p-4 backdrop-blur-[3px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-test-title"
        onClick={(e) => e.stopPropagation()}
        className="galaxy-glass galaxy-rise flex max-h-full w-[520px] max-w-full flex-col overflow-hidden rounded-[13px]"
        style={{ borderTop: `3px solid ${color}` }}
      >
        <div className="flex items-start gap-3 border-b border-line-2 px-5 pb-3.5 pt-4">
          <div className="min-w-0 flex-1">
            <p className="m-0 mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color }}>
              Kiểm tra nhập cảnh · Hệ {groupOf(node).label}
            </p>
            <h2 id="entry-test-title" className="m-0 font-display text-[20px] font-semibold leading-tight">
              {shortPlanetName(node)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="h-[30px] w-[30px] shrink-0 rounded-[7px] border border-line bg-inset text-[14px] text-muted hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === 'intro' && (
            <>
              <p className="m-0 text-[13.5px] leading-relaxed text-ink-2">
                Trạm kiểm soát ghi nhận bạn còn thiếu <b className="text-ink">{skills.length}</b> kỹ năng
                nghề này yêu cầu. Trả lời {questions.length} tình huống thật của nghề để được cấp visa.
              </p>
              <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0">
                {missing.map((s) => (
                  <li
                    key={s.name}
                    className={cx(
                      'rounded-full border px-2 py-[3px] text-[11.5px]',
                      s.type === 'hard'
                        ? 'border-skill-hard/40 bg-skill-hard-soft text-skill-hard'
                        : 'border-skill-soft/40 bg-skill-soft-soft text-skill-soft',
                    )}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
              <Note tone="warn" className="mt-4">
                Bản mẫu: bài này chưa chấm điểm — trả lời xong là được cấp visa. Bản thật sẽ chấm theo
                rubric của kịch bản và chỉ cấp visa khi đạt.
              </Note>
            </>
          )}

          {step === 'quiz' && questions[index] && (
            <div key={questions[index].id} className="galaxy-rise">
              <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Tình huống {index + 1}/{questions.length}
              </p>
              <h3 className="m-0 font-display text-[17px] font-semibold leading-snug">
                {questions[index].title}
              </h3>
              <p className="m-0 mt-2 text-[13.5px] leading-relaxed text-ink-2">{questions[index].setup}</p>
              <div className="mt-4 grid gap-2">
                {questions[index].choices.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => answer(i)}
                    className="action-card flex items-start gap-3 rounded-[9px] border border-line bg-inset px-3.5 py-3 text-left text-[13px] leading-relaxed text-ink"
                  >
                    <span className="keycap shrink-0 font-mono text-[10.5px] text-muted">{i + 1}</span>
                    <span>{c.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="galaxy-rise">
              <p className="m-0 text-[13.5px] leading-relaxed text-ink-2">
                Trạm kiểm soát đã xem cách bạn xử lý {questions.length} tình huống:
              </p>
              <ol className="m-0 mt-3 grid list-none gap-2 p-0">
                {questions.map((q, i) => (
                  <li key={q.id} className="rounded-lg border border-line-2 bg-inset px-3 py-2.5">
                    <p className="m-0 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{q.title}</p>
                    <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-ink">
                      {q.choices[answers[i] ?? 0]?.outcome}
                    </p>
                  </li>
                ))}
              </ol>
              <Note tone="ok" className="mt-4">
                Visa cấp cho: {skills.join(', ')}.
              </Note>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line-2 px-5 py-3.5">
          {step === 'intro' && (
            <>
              <Button onClick={onClose}>Để sau</Button>
              <Button variant="primary" onClick={() => setStep(questions.length ? 'quiz' : 'result')}>
                Bắt đầu
              </Button>
            </>
          )}
          {step === 'quiz' && <Button onClick={onClose}>Bỏ dở</Button>}
          {step === 'result' && (
            <Button variant="primary" onClick={() => onPass(skills)}>
              Nhận visa <span role="img" aria-label="dấu visa">🛂</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
