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
  Button,
  Callout,
  Chip,
  EmptyState,
  Field,
  LikeScale,
  LoadingBlock,
  Logo,
  Mountains,
  Panel,
  SegmentedProgress,
  Sparkle,
  StarField,
  Textarea,
} from '@datn/ui';
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
    <div className="relative isolate min-h-dvh overflow-hidden px-4 py-6 pb-36">
      <StarField fixed seed="get-to-know-me" />
      <Mountains className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-36" />
      <main className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between gap-3">
          <Logo size="sm" />
          <Link
            to="/galaxy"
            className="rounded text-sm text-ink-muted hover:text-ink focus-visible:shadow-focus"
          >
            Để sau, vào bản đồ
          </Link>
        </header>
        {form.isError || me.isError ? (
          <EmptyState
            title="Chưa mở được bộ thẻ"
            description={errorText(form.error ?? me.error)}
            action={
              <Button
                onClick={() => {
                  void form.refetch();
                  void me.refetch();
                }}
              >
                Thử lại
              </Button>
            }
          />
        ) : !form.data || !me.data ? (
          <LoadingBlock text="Đang chuẩn bị bộ thẻ…" />
        ) : form.data.cards.length === 0 ? (
          <EmptyState
            title="Bộ thẻ đang được chuẩn bị"
            description="Bạn vẫn có thể khám phá bản đồ nghề ngay bây giờ."
          />
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
        <Panel frame padding="lg">
          <Sparkle size={32} className="mb-6 text-gold-300" />
          <p className="eyebrow">Get to know me</p>
          <h1
            ref={heading}
            tabIndex={-1}
            className="mt-3 text-4xl focus:outline-none"
          >
            Bắt đầu từ những việc bạn thích
          </h1>
          <p className="mt-4 text-ink-muted">
            18 thẻ, khoảng 1–2 phút, không có đáp án đúng sai; cuối bài có phần
            kể về bạn, không bắt buộc.
          </p>
          <Callout className="mt-6" title="Get to know me không gọi AI.">
            Chữ bạn gõ trong các ô “Kể thêm” có thể được AI đọc và gửi tới nhà
            cung cấp model khi chơi để nhận xét, động viên bạn. Phần kể về bạn
            không chấm điểm và không dùng để gợi ý nghề.
          </Callout>
          <Button
            className="mt-7"
            block
            size="lg"
            onClick={() => setDraft((d) => ({ ...d, phase: 'cards' }))}
          >
            {Object.keys(answers.cards).length
              ? 'Tiếp tục bộ thẻ đang làm'
              : 'Bắt đầu 18 thẻ'}
          </Button>
        </Panel>
      )}
      {phase === 'cards' && card && (
        <>
          <h1 className="text-2xl">Bạn thích làm những việc gì?</h1>
          <div className="my-5 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((cluster) => (
              <div key={cluster}>
                <p className="mb-2 text-xs text-ink-faint">Cụm {cluster}</p>
                <SegmentedProgress
                  total={form.cards.filter((c) => c.cluster === cluster).length}
                  done={
                    form.cards.filter(
                      (c) =>
                        c.cluster === cluster &&
                        answers.cards[c.id] !== undefined,
                    ).length
                  }
                  label={`Cụm ${cluster}`}
                />
              </div>
            ))}
          </div>
          <Panel frame padding="lg" className="text-center">
            <p className="eyebrow">
              Thẻ {index + 1} / {form.cards.length}
            </p>
            <div
              aria-hidden
              className="relative mx-auto my-7 grid size-28 place-items-center rounded-full border border-line bg-night-800 shadow-panel"
            >
              <Illustration
                size={48}
                strokeWidth={1.2}
                className="text-ink-muted"
              />
              <Sparkle
                className="absolute right-0 top-0 text-gold-300"
                size={20}
              />
            </div>
            <h2
              ref={heading}
              tabIndex={-1}
              className="min-h-24 text-2xl leading-snug focus:outline-none"
              aria-live="polite"
            >
              {card.text}
            </h2>
            <p className="mb-4 mt-6 text-sm text-ink-muted">
              Bạn thích làm việc này tới đâu?
            </p>
            <LikeScale
              size="lg"
              value={answers.cards[card.id] ?? null}
              label="Bạn thích làm việc này tới đâu?"
              onChange={answer}
            />
            <p className="mt-4 text-xs text-ink-faint">
              Không có đáp án đúng sai · Phím 1 / 2 / 3 để chọn
            </p>
          </Panel>
          <Button
            className="mt-4"
            variant="ghost"
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
          </Button>
        </>
      )}
      {phase === 'about' && (
        <>
          <p className="eyebrow">Phần 2 · Không bắt buộc</p>
          <h1
            ref={heading}
            tabIndex={-1}
            className="mt-3 text-3xl focus:outline-none sm:text-4xl"
          >
            Kể một chút về bạn
          </h1>
          <p className="mt-3 text-ink-muted">
            Chạm những điều bạn muốn giữ lại. Không cần trả lời hết.
          </p>
          <Button
            className="my-5 h-auto min-h-12 w-full whitespace-normal py-3"
            variant="secondary"
            disabled={submit.isPending}
            onClick={() => finish(true)}
          >
            Bỏ qua, xem kết quả luôn
          </Button>
          <fieldset disabled={submit.isPending} className="space-y-5">
            <Panel>
              <h2 className="text-xl">Ngoài giờ học và làm, bạn thích gì?</h2>
              <p className="mt-2 text-sm text-ink-faint">
                Chọn tối đa 5 · {answers.interests.length}/5
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {form.interests.map((interest) => (
                  <Chip
                    key={interest}
                    className="h-auto min-h-8 max-w-full whitespace-normal py-2 text-left"
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
                  </Chip>
                ))}
              </div>
            </Panel>
            {form.goals.map((goal, i) => {
              const value = answers.goals[goal.id] ?? { picked: [], note: '' };
              return (
                <Panel key={goal.id}>
                  <h2 className="text-xl">
                    {i + 1}. {goal.question}
                  </h2>
                  <div
                    role="group"
                    aria-label={goal.question}
                    className="my-4 flex flex-wrap gap-2"
                  >
                    {goal.options.map((option) => (
                      <Chip
                        key={option}
                        className="h-auto min-h-8 max-w-full whitespace-normal py-2 text-left"
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
                      </Chip>
                    ))}
                  </div>
                  <Field
                    label="Kể thêm (không bắt buộc)"
                    hint={`${value.note.length}/500 ký tự`}
                  >
                    <Textarea
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
                  </Field>
                  {hasDistressSignal(value.note) && (
                    <div role="status" className="mt-4">
                      <Callout>{DISTRESS_MESSAGE}</Callout>
                    </div>
                  )}
                </Panel>
              );
            })}
          </fieldset>
          {submit.isError && (
            <div role="alert" className="mt-5">
              <Callout tone="danger">
                {errorText(submit.error)} Câu trả lời vẫn được giữ để bạn thử
                lại.
              </Callout>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              loading={submit.isPending}
              loadingText="Đang lưu…"
              onClick={() => finish(false)}
            >
              Xem bản nháp về bạn
            </Button>
            <Button
              variant="ghost"
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
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
