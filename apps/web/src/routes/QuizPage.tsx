import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME } from '@datn/game-core';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Note } from '../components/ui/Note';
import { ProgressDots } from '../components/ui/Progress';
import { useGameText, useT } from '../i18n/useT';
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
  const t = useT();
  const game = useGameText();
  const submitQuiz = useProfileStore((s) => s.submitQuiz);
  const quizDone = useProfileStore((s) => s.quizDone);

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
      setError(err instanceof Error ? err.message : t('quiz.saveFailed'));
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
      <PageHeader title={t('quiz.title')}>{t('quiz.lead')}</PageHeader>

      {/* Lần đầu thì chào một câu; lần sau thì không cần nhắc lại. */}
      {!quizDone && (
        <Note className="mb-4 max-w-[640px]">{t('quiz.welcome')}</Note>
      )}

      {error && (
        <Note tone="warn" className="mb-4 max-w-[640px]">
          {error}
        </Note>
      )}

      <Card className="mx-auto max-w-[640px]">
        <CardBody>
          <ProgressDots total={questions.length} current={index} />

          <p className="m-0 mb-2.5 font-mono text-[10px] tracking-[0.11em] text-gold">
            {t('quiz.question', { current: index + 1, total: questions.length })}
          </p>
          <p className="m-0 mb-[18px] font-display text-[21px] font-semibold leading-snug">
            {game.quizPrompt(question.question_id, question.prompt)}
          </p>

          <div className="flex flex-col gap-2.5">
            {question.options.map((option) => (
              <button
                key={option.option_id}
                type="button"
                disabled={busy}
                onClick={() => answer(option.option_id)}
                className="action-card w-full rounded-[10px] border border-line bg-surf px-4 py-3.5 text-left text-[14px] leading-normal text-ink disabled:opacity-50"
              >
                {game.quizOption(option.option_id, option.text)}
              </button>
            ))}
          </div>

          <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
            <Button onClick={() => void send(answers, '/jobs')} disabled={busy}>
              {t('quiz.skip')}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
