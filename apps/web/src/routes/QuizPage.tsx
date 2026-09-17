import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME } from '../data/gameData';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { ProgressDots } from '../components/ui/Progress';
import { useProfileStore } from '../store/profileStore';

export function QuizPage() {
  const navigate = useNavigate();
  const applyFit = useProfileStore((s) => s.applyFit);
  const setQuizDone = useProfileStore((s) => s.setQuizDone);
  const [index, setIndex] = useState(0);

  const questions = GAME.quiz.questions;
  const question = questions[index];

  const answer = (optionId: string) => {
    const option = question.options.find((o) => o.option_id === optionId);
    if (option) applyFit(option.signal);

    if (index + 1 >= questions.length) {
      setQuizDone();
      navigate('/quiz/result');
    } else {
      setIndex(index + 1);
    }
  };

  const skip = () => {
    setQuizDone();
    navigate('/jobs');
  };

  return (
    <>
      <PageHeader title="Tự vấn">
        Sáu câu, không có đáp án đúng. Kết quả dùng để chỉ hướng trên bản đồ,
        không phải để chấm bạn.
      </PageHeader>

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
                onClick={() => answer(option.option_id)}
                className="w-full rounded-[10px] border border-line bg-surf px-[17px] py-[15px] text-left text-[14px] leading-normal text-ink transition-colors hover:border-gold hover:bg-gold-soft"
              >
                {option.text}
              </button>
            ))}
          </div>

          <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
            <Button onClick={skip}>Bỏ qua phần này</Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
