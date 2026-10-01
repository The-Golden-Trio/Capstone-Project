import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizQuestion } from '@datn/game-core';
import type { QuizSubmission } from '../api/endpoints';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Note } from '../components/ui/Note';
import { ProgressDots } from '../components/ui/Progress';
import { useGameText, useT } from '../i18n/useT';
import { cx } from '../lib/cx';
import { useGameIndex } from '../store/contentStore';
import { useProfileStore } from '../store/profileStore';

type Choice = { optionId: string; strength?: 1 | 0.5 };

/**
 * "Get to Know Me": câu giai đoạn, các câu hai vế, và ba câu kể ngắn.
 *
 * Câu trả lời gom lại rồi gửi một lần khi xong: máy chủ tra tín hiệu của từng
 * lựa chọn từ bộ câu hỏi và cho AI đọc câu kể, nên chân dung là suy ra được
 * chứ không phải con số máy khách gửi lên.
 *
 * Cả bài bỏ qua được (D-29), nhưng đã làm thì câu kể là bắt buộc: đó là phần
 * AI đọc để viết đoạn mô tả. Người mới đăng nhập lần đầu được dẫn thẳng vào
 * đây (xem `RequireAuth`), sau đó vào lại lúc nào cũng được từ thanh bên —
 * làm lại thì thay hẳn phần đóng góp của lần trước.
 */
export function QuizPage() {
  const navigate = useNavigate();
  const t = useT();
  const content = useGameIndex();
  const submitQuiz = useProfileStore((s) => s.submitQuiz);
  const quizDone = useProfileStore((s) => s.quizDone);

  const questions = content.data.quiz.questions;
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const question = questions[index];
  const isLast = index + 1 >= questions.length;

  /** Chỉ gửi câu kể đã đủ dài — bỏ ngang giữa chừng thì câu dở bị bỏ. */
  const submission = (all: Record<string, Choice>): QuizSubmission => ({
    answers: Object.entries(all).map(([questionId, choice]) => ({
      questionId,
      ...choice,
    })),
    texts: questions
      .filter((q) => q.kind === 'text')
      .map((q) => ({ questionId: q.question_id, text: (texts[q.question_id] ?? '').trim() }))
      .filter((a) => {
        const q = questions.find((x) => x.question_id === a.questionId);
        return a.text.length >= (q?.min_length ?? 1);
      }),
  });

  const send = async (all: Record<string, Choice>, next: string) => {
    setBusy(true);
    setError(null);
    try {
      await submitQuiz(submission(all));
      navigate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('quiz.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  const advance = (all: Record<string, Choice>) => {
    if (isLast) void send(all, '/quiz/result');
    else setIndex(index + 1);
  };

  const choose = (choice: Choice) => {
    const all = { ...choices, [question.question_id]: choice };
    setChoices(all);
    advance(all);
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
            {question.kind === 'stage'
              ? t('quiz.stageTag')
              : question.kind === 'text'
                ? t('quiz.storyTag')
                : t('quiz.question', { current: index + 1, total: questions.length })}
          </p>

          <QuestionBody
            key={question.question_id}
            question={question}
            choice={choices[question.question_id]}
            text={texts[question.question_id] ?? ''}
            busy={busy}
            isLast={isLast}
            onChoose={choose}
            onText={(value) =>
              setTexts((prev) => ({ ...prev, [question.question_id]: value }))
            }
            onNext={() => advance(choices)}
          />

          <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
            {index > 0 && (
              <Button onClick={() => setIndex(index - 1)} disabled={busy}>
                {t('quiz.back')}
              </Button>
            )}
            <Button onClick={() => void send(choices, '/jobs')} disabled={busy}>
              {t('quiz.skip')}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

interface QuestionBodyProps {
  question: QuizQuestion;
  choice: Choice | undefined;
  text: string;
  busy: boolean;
  isLast: boolean;
  onChoose: (choice: Choice) => void;
  onText: (value: string) => void;
  onNext: () => void;
}

function QuestionBody({
  question,
  choice,
  text,
  busy,
  isLast,
  onChoose,
  onText,
  onNext,
}: QuestionBodyProps) {
  const t = useT();
  const game = useGameText();
  const prompt = (
    <p className="m-0 mb-[18px] font-display text-[21px] font-semibold leading-snug">
      {game.quizPrompt(question.question_id, question.prompt)}
    </p>
  );

  if (question.kind === 'stage') {
    return (
      <>
        {prompt}
        <div className="flex flex-col gap-2.5">
          {question.options.map((option) => (
            <button
              key={option.option_id}
              type="button"
              disabled={busy}
              onClick={() => onChoose({ optionId: option.option_id })}
              className={cx(
                'action-card w-full rounded-[10px] border bg-surf px-4 py-3.5 text-left text-[14px] leading-normal text-ink disabled:opacity-50',
                choice?.optionId === option.option_id ? 'border-gold' : 'border-line',
              )}
            >
              {game.quizOption(option.option_id, option.text)}
            </button>
          ))}
        </div>
      </>
    );
  }

  if (question.kind === 'text') {
    const min = question.min_length ?? 0;
    const max = question.max_length ?? 400;
    const missing = Math.max(0, min - text.trim().length);
    return (
      <>
        {prompt}
        {question.hint && (
          <p className="m-0 mb-3 text-[13px] text-muted">
            {game.quizHint(question.question_id, question.hint)}
          </p>
        )}
        <textarea
          value={text}
          maxLength={max}
          rows={5}
          disabled={busy}
          onChange={(e) => onText(e.target.value)}
          aria-label={game.quizPrompt(question.question_id, question.prompt)}
          className="w-full resize-y rounded-[10px] border border-line bg-surf px-4 py-3 text-[14px] leading-normal text-ink focus:border-gold focus:outline-none"
        />
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[10.5px] text-muted">
          <span>{missing > 0 ? t('quiz.minChars', { count: missing }) : ''}</span>
          <span>{t('quiz.chars', { count: text.length, max })}</span>
        </div>
        <p className="m-0 mt-3 text-[12px] text-muted">{t('quiz.aiReads')}</p>
        <div className="mt-3">
          <Button variant="primary" disabled={busy || missing > 0} onClick={onNext}>
            {isLast ? t('quiz.finish') : t('quiz.next')}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {prompt}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {question.options.map((option) => {
          const picked = choice?.optionId === option.option_id;
          return (
            <div
              key={option.option_id}
              className={cx(
                'flex flex-col justify-between gap-3 rounded-[10px] border bg-surf px-4 py-3.5',
                picked ? 'border-gold' : 'border-line',
              )}
            >
              <p className="m-0 text-[14px] leading-normal text-ink">
                {game.quizOption(option.option_id, option.text)}
              </p>
              <div className="flex flex-wrap gap-2">
                {([1, 0.5] as const).map((strength) => (
                  <Button
                    key={strength}
                    size="sm"
                    variant={
                      picked && choice?.strength === strength ? 'highlight' : 'default'
                    }
                    disabled={busy}
                    onClick={() => onChoose({ optionId: option.option_id, strength })}
                  >
                    {strength === 1 ? t('quiz.strong') : t('quiz.lean')}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
