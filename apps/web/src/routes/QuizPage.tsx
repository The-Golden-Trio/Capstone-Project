import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Note } from '../components/ui/Note';
import { ProgressDots } from '../components/ui/Progress';
import { useGameIndex } from '../store/contentStore';
import { useProfileStore } from '../store/profileStore';

/**
 * "Get to Know Me" — sáu câu tự vấn.
 *
 * Câu trả lời gom lại rồi gửi một lần khi xong: máy chủ tra tín hiệu của từng
 * lựa chọn từ bộ câu hỏi và tự cộng, nên chân dung là suy ra được chứ không
 * phải con số máy khách gửi lên.
 *
 * Người mới đăng nhập lần đầu được dẫn thẳng vào đây (xem `RequireAuth`), còn
 * sau đó thì vào lại lúc nào cũng được từ thanh bên — tính cách người ta có
 * đổi, và làm lại thì thay hẳn phần đóng góp của bài này.
 */
export function QuizPage() {
  const navigate = useNavigate();
  const content = useGameIndex();
  const submitQuiz = useProfileStore((s) => s.submitQuiz);
  const quizDone = useProfileStore((s) => s.quizDone);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; optionId: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const questions = content.data.quiz.questions;
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
      <PageHeader title="Get to Know Me">
        Sáu câu, không có đáp án đúng. Kết quả dùng để chỉ hướng trên bản đồ,
        không phải để chấm bạn.
      </PageHeader>

      {/* Lần đầu thì chào một câu; lần sau thì không cần nhắc lại. */}
      {!quizDone && (
        <Note className="mb-4 max-w-[640px]">
          Trước khi lên đường, kể cho chúng tôi nghe một chút về bạn.
        </Note>
      )}

      {error && (
        <Note tone="warn" className="mb-4 max-w-[640px]">
          {error}
        </Note>
      )}

      <Card className="mx-auto max-w-[640px]">
        <CardBody>
          <ProgressDots total={questions.length} current={index} />

          <p className="m-0 mb-2.5 text-[10px] tracking-[0.11em] text-gold">
            {`CÂU ${index + 1}/${questions.length}`}
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
                className="action-card w-full rounded-xl border border-blue/40 bg-line/30 px-4 py-3.5 text-left text-[14px] leading-normal text-ink disabled:opacity-50"
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
