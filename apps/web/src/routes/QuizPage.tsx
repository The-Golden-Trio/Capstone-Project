import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME } from '@datn/game-core';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Note } from '../components/ui/Note';
import { ProgressDots } from '../components/ui/Progress';
import { useProfileStore } from '../store/profileStore';

/**
 * Sáu câu tự vấn.
 *
 * Câu trả lời gom lại rồi gửi một lần khi xong: máy chủ tra tín hiệu của từng
 * lựa chọn từ bộ câu hỏi và tự cộng, nên chân dung là suy ra được chứ không
 * phải con số máy khách gửi lên.
 */
export function QuizPage() {
  const navigate = useNavigate();
  const submitQuiz = useProfileStore((s) => s.submitQuiz);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; optionId: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const questions = GAME.quiz.questions;
  const question = questions[index];

  const send = async (
    all: Array<{ questionId: string; optionId: string }>,
    next: string,
  ) => {
    setBusy(true);
    setError(null);
    try {
      await submitQuiz(all);
      navigate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được kết quả');
    } finally {
      setBusy(false);
    }
  };

  const answer = (optionId: string) => {
    const all = [...answers, { questionId: question.question_id, optionId }];
    setAnswers(all);
    if (index + 1 >= questions.length) void send(all, '/quiz/result');
    else setIndex(index + 1);
  };

  return (
    <>
      <PageHeader title="Tự vấn">
        Sáu câu, không có đáp án đúng. Kết quả dùng để chỉ hướng trên bản đồ,
        không phải để chấm bạn.
      </PageHeader>

      {error && (
        <Note tone="warn" className="mb-4 max-w-[640px]">
          {error}
        </Note>
      )}

      <Card className="max-w-[640px]">
        <CardBody>
          <ProgressDots total={questions.length} current={index} />

          <p className="m-0 mb-2.5 font-mono text-[10px] tracking-[0.11em] text-gold">
            CÂU {index + 1}/{questions.length}
          </p>
          <p className="m-0 mb-[18px] font-display text-[21px] font-semibold leading-snug">
            {question.prompt}
          </p>

          <div className="flex flex-col gap-2.5">
            {question.options.map((option) => (
              <button
                key={option.option_id}
                type="button"
                disabled={busy}
                onClick={() => answer(option.option_id)}
                className="w-full rounded-[10px] border border-line bg-surf px-[17px] py-[15px] text-left text-[14px] leading-normal text-ink transition-colors hover:border-gold hover:bg-gold-soft disabled:opacity-50"
              >
                {option.text}
              </button>
            ))}
          </div>

          <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
            <Button onClick={() => void send(answers, '/jobs')} disabled={busy}>
              Bỏ qua phần này
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
