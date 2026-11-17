import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  HeartHandshake,
  Lightbulb,
  Telescope,
  WandSparkles,
  Wrench,
} from 'lucide-react';
import {
  NightCard,
  NightSky,
  Logo,
  ToonButton,
  ToonField,
  ToonTextarea,
  ToonLikeScale,
  InkStar,
} from '@datn/ui';
import { QuizChip, QuizMessage, QuizNotice, QuizStars } from './QuizDecor';
import { errorText, useMe, useQuizForm, useSubmitQuiz } from '../../api/hooks';
import type { LikeLevel, QuizForm } from '../../api/types';
import {
  DISTRESS_MESSAGE,
  emptyDraft,
  hasDistressSignal,
  parseDraft,
  toggleChoice,
  type QuizDraft,
} from './quizDraft';

export default function QuizPage() {
  const form = useQuizForm();
  const me = useMe();
  return (
    <div className="theme-toon-night relative isolate min-h-dvh px-4 py-6 pb-16">
      <NightSky seed="get-to-know-me" scene="plain" />
      <main className="relative mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between gap-3">
          <Logo size="sm" />
          <Link
            to="/galaxy"
            className="rounded text-sm font-bold text-toon-star-soft underline underline-offset-4 focus-visible:shadow-toon-focus"
          >
            Để sau, vào bản đồ
          </Link>
        </header>
        {form.isError || me.isError ? (
          <QuizNotice
            title="Chưa mở được bộ thẻ"
            retry={() => {
              void form.refetch();
              void me.refetch();
            }}
          >
            {errorText(form.error ?? me.error)}
          </QuizNotice>
        ) : !form.data || !me.data ? (
          <QuizNotice title="Đang chuẩn bị bộ thẻ…" loading />
        ) : form.data.cards.length === 0 ? (
          <QuizNotice title="Bộ thẻ đang được chuẩn bị">
            Bạn vẫn có thể khám phá bản đồ nghề ngay bây giờ.
          </QuizNotice>
        ) : (
          <QuizFlow
            key={me.data.id}
            form={form.data}
            storageKey={`jobquest:quiz:v1:${me.data.id}`}
          />
        )}
      </main>
    </div>
  );
}

function QuizFlow({
  form,
  storageKey,
}: {
  form: QuizForm;
  storageKey: string;
}) {
  const [draft, setDraft] = useState<QuizDraft>(() => {
    try {
      return parseDraft(sessionStorage.getItem(storageKey), form);
    } catch {
      return emptyDraft();
    }
  });
  const [advancing, setAdvancing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const submit = useSubmitQuiz();
  const navigate = useNavigate();
  const { phase, index, answers } = draft;
  const card = form.cards[index];

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      /* Trình duyệt có thể tắt lưu trữ; vẫn tiếp tục làm được. */
    }
  }, [draft, storageKey]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    heading.current?.focus();
  }, [phase, index]);

  const answer = (value: LikeLevel) => {
    if (locked.current || phase !== 'cards' || !card) return;
    locked.current = true;
    setAdvancing(true);
    setDraft((d) => ({
      ...d,
      answers: {
        ...d.answers,
        cards: { ...d.answers.cards, [card.id]: value },
      },
    }));
    timer.current = setTimeout(() => {
      locked.current = false;
      setAdvancing(false);
      setDraft((d) => {
        // Hết lượt thẻ mà còn thẻ chưa trả lời (vd. bản nháp cũ) thì quay về thẻ đó.
        const missing = form.cards.findIndex(
          (c) => d.answers.cards[c.id] === undefined,
        );
        if (d.index + 1 >= form.cards.length)
          return missing === -1
            ? { ...d, phase: 'about' }
            : { ...d, index: missing, phase: 'cards' };
        return { ...d, index: d.index + 1, phase: 'cards' };
      });
    }, 250);
  };

  const finish = (skipAbout: boolean) => {
    const payload = skipAbout
      ? { ...answers, interests: [], goals: {} }
      : answers;
    submit.mutate(payload, {
      onSuccess: () => {
        try {
          sessionStorage.removeItem(storageKey);
        } catch {
          /* Không ảnh hưởng kết quả đã lưu. */
        }
        navigate('/quiz/result', { replace: true });
      },
    });
  };

  const Illustration = [
    Telescope,
    HeartHandshake,
    Wrench,
    WandSparkles,
    Lightbulb,
    Compass,
  ][index % 6];
  return (
    <div
      onKeyDown={(event) => {
        if (
          phase !== 'cards' ||
          event.repeat ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          !['1', '2', '3'].includes(event.key)
        )
          return;
        event.preventDefault();
        answer(Number(event.key) as LikeLevel);
      }}
    >
      {phase === 'intro' && (
        <NightCard>
          <InkStar size={32} className="mb-6 text-toon-star" />
          <p className="text-xs font-bold uppercase tracking-widest text-toon-ink-soft">
            Get to know me
          </p>
          <h1
            ref={heading}
            tabIndex={-1}
            className="mt-3 font-toon text-4xl font-extrabold focus:outline-none"
          >
            Bắt đầu từ những việc bạn thích
          </h1>
          <p className="mt-4 text-toon-ink-soft">
            18 thẻ, khoảng 1–2 phút, không có đáp án đúng sai; cuối bài có phần
            kể về bạn, không bắt buộc.
          </p>
          <details className="mt-6 rounded-xl border-2 border-toon-ink bg-toon-cream p-3 text-sm">
            <summary className="cursor-pointer font-bold">
              Get to know me không gọi AI.
            </summary>
            <p className="mt-3">
              Chữ trong ô “Kể thêm” có thể được AI đọc và gửi tới nhà cung cấp
              model khi chơi để nhận xét, động viên bạn.
            </p>
            <p className="mt-3">
              Phần kể về bạn không chấm điểm và không dùng để gợi ý nghề.
            </p>
          </details>
          <ToonButton
            className="mt-7"
            block
            size="lg"
            onClick={() => setDraft((d) => ({ ...d, phase: 'cards' }))}
          >
            {Object.keys(answers.cards).length
              ? 'Tiếp tục bộ thẻ đang làm'
              : 'Bắt đầu 18 thẻ'}
          </ToonButton>
        </NightCard>
      )}
      {phase === 'cards' && card && (
        <>
          <h1 className="font-toon text-2xl font-extrabold">
            Bạn thích làm những việc gì?
          </h1>
          <QuizStars cards={form.cards} answers={answers.cards} />
          <NightCard key={card.id} className="animate-toon-slide text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-toon-ink-soft">
              Thẻ {index + 1} / {form.cards.length}
            </p>
            <div
              aria-hidden
              className="relative mx-auto my-7 grid size-28 place-items-center rounded-2xl border-[3px] border-toon-ink bg-toon-sky shadow-toon -rotate-6"
            >
              <Illustration
                size={48}
                strokeWidth={2.3}
                className="text-toon-ink-soft"
              />
              <InkStar
                className="absolute right-0 top-0 text-toon-star"
                size={20}
              />
            </div>
            <h2
              ref={heading}
              tabIndex={-1}
              className="min-h-24 font-toon text-3xl font-extrabold leading-snug focus:outline-none"
              aria-live="polite"
            >
              {card.text}
            </h2>
            <p className="mb-4 mt-6 text-sm text-toon-ink-soft">
              Bạn thích làm việc này tới đâu?
            </p>
            <ToonLikeScale
              value={answers.cards[card.id] ?? null}
              label="Bạn thích làm việc này tới đâu?"
              onChange={answer}
            />
            <p className="mt-4 text-xs text-toon-ink-faint">
              Không có đáp án đúng sai · Phím 1 / 2 / 3 để chọn
            </p>
          </NightCard>
          <ToonButton
            className="mt-4"
            variant="secondary"
            disabled={advancing}
            onClick={() =>
              setDraft((d) => ({
                ...d,
                phase: index === 0 ? 'intro' : 'cards',
                index: Math.max(0, index - 1),
              }))
            }
          >
            ← {index === 0 ? 'Về giới thiệu' : 'Thẻ trước'}
          </ToonButton>
        </>
      )}
      {phase === 'about' && (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-toon-star-soft">
            Phần 2 · Không bắt buộc
          </p>
          <h1
            ref={heading}
            tabIndex={-1}
            className="mt-3 font-toon text-3xl font-extrabold focus:outline-none sm:text-4xl"
          >
            Kể một chút về bạn
          </h1>
          <p className="mt-3 text-toon-paper">
            Chạm những điều bạn muốn giữ lại. Không cần trả lời hết.
          </p>
          <ToonButton
            className="my-5"
            block
            variant="secondary"
            disabled={submit.isPending}
            onClick={() => finish(true)}
          >
            Bỏ qua, xem kết quả luôn
          </ToonButton>
          <fieldset disabled={submit.isPending} className="space-y-5">
            <NightCard>
              <h2 className="font-toon text-xl font-bold">
                Ngoài giờ học và làm, bạn thích gì?
              </h2>
              <p className="mt-2 text-sm text-toon-ink-faint">
                Chọn tối đa 5 · {answers.interests.length}/5
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {form.interests.map((interest) => (
                  <QuizChip
                    key={interest}
                    selected={answers.interests.includes(interest)}
                    disabled={
                      answers.interests.length >= 5 &&
                      !answers.interests.includes(interest)
                    }
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        answers: {
                          ...d.answers,
                          interests: toggleChoice(
                            d.answers.interests,
                            interest,
                            5,
                          ),
                        },
                      }))
                    }
                  >
                    {interest}
                  </QuizChip>
                ))}
              </div>
            </NightCard>
            {form.goals.map((goal, i) => {
              const value = answers.goals[goal.id] ?? { picked: [], note: '' };
              return (
                <NightCard key={goal.id}>
                  <h2 className="font-toon text-xl font-bold">
                    {i + 1}. {goal.question}
                  </h2>
                  <div
                    role="group"
                    aria-label={goal.question}
                    className="my-4 flex flex-wrap gap-2"
                  >
                    {goal.options.map((option) => (
                      <QuizChip
                        key={option}
                        selected={value.picked.includes(option)}
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            answers: {
                              ...d.answers,
                              goals: {
                                ...d.answers.goals,
                                [goal.id]: {
                                  ...value,
                                  picked: toggleChoice(value.picked, option),
                                },
                              },
                            },
                          }))
                        }
                      >
                        {option}
                      </QuizChip>
                    ))}
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer py-2 text-sm font-bold">
                      Kể thêm (không bắt buộc)
                    </summary>
                    <ToonField
                      label="Kể thêm (không bắt buộc)"
                      hint={`${value.note.length}/500 ký tự`}
                    >
                      <ToonTextarea
                        maxLength={500}
                        rows={3}
                        value={value.note}
                        onChange={(event) => {
                          const note = event.target.value;
                          setDraft((d) => ({
                            ...d,
                            answers: {
                              ...d.answers,
                              goals: {
                                ...d.answers.goals,
                                [goal.id]: { ...value, note },
                              },
                            },
                          }));
                        }}
                      />
                    </ToonField>
                  </details>
                  {hasDistressSignal(value.note) && (
                    <div role="status" className="mt-4">
                      <QuizMessage>{DISTRESS_MESSAGE}</QuizMessage>
                    </div>
                  )}
                </NightCard>
              );
            })}
          </fieldset>
          {submit.isError && (
            <div role="alert" className="mt-5">
              <QuizMessage tone="danger">
                {errorText(submit.error)} Câu trả lời vẫn được giữ để bạn thử
                lại.
              </QuizMessage>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <ToonButton
              loading={submit.isPending}
              loadingText="Đang lưu…"
              onClick={() => finish(false)}
            >
              Xem bản nháp về bạn
            </ToonButton>
            <ToonButton
              variant="secondary"
              disabled={submit.isPending}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  phase: 'cards',
                  index: form.cards.length - 1,
                }))
              }
            >
              ← Xem lại thẻ
            </ToonButton>
          </div>
        </>
      )}
    </div>
  );
}
