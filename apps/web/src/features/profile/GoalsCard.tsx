import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ToonButton,
  ToonCheckbox,
  ToonField,
  LoadingBlock,
  ToonTextarea,
  useToast,
} from '@datn/ui';
import { Notice, ReadMore, EmptyMessage } from './ProfileKit';

import { api } from '../../api';
import { errorText, keys, useQuizForm } from '../../api/hooks';
import type { PlayerRecord, QuizAnswers } from '../../api/types';
import { DISTRESS_MESSAGE, hasDistressSignal } from '../quiz/quizDraft';
export function GoalsCard({
  record,
  quizDone,
}: {
  record: PlayerRecord;
  quizDone: boolean;
}) {
  const form = useQuizForm();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const editor = useRef<HTMLFormElement>(null);
  const wasEditing = useRef(false);
  useEffect(() => {
    if (editing)
      editor.current?.querySelector<HTMLElement>('input, textarea')?.focus();
    else if (wasEditing.current) editButton.current?.focus();
    wasEditing.current = editing;
  }, [editing, form.data]);
  const [draft, setDraft] = useState<QuizAnswers['goals']>(record.goals ?? {});
  const save = useMutation({
    mutationFn: () => api.progress.updateGoals(draft),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.record }),
        qc.invalidateQueries({ queryKey: keys.quizResult }),
      ]);
      setEditing(false);
      toast({ tone: 'success', title: 'Đã lưu mục tiêu' });
    },
  });
  return (
    // Nằm trong dòng gập "Mục tiêu của bạn": không bọc thêm thẻ, không lặp tiêu đề.
    <div>
      <header className="mb-4 flex items-start justify-between gap-3">
        <p className="max-w-xl text-sm text-toon-ink-soft">
          Điều bạn muốn thử có thể thay đổi theo từng chặng.
        </p>
        {!editing && (
          <ToonButton
            ref={editButton}
            variant="ghost"
            size="sm"
            onClick={() => {
              save.reset();
              setDraft(record.goals ?? {});
              setEditing(true);
            }}
          >
            Sửa
          </ToonButton>
        )}
      </header>
      {form.isError ? (
        <EmptyMessage
          title="Chưa tải được câu hỏi"
          description={errorText(form.error)}
          action={
            <ToonButton variant="secondary" onClick={() => void form.refetch()}>
              Thử lại
            </ToonButton>
          }
        />
      ) : !form.data ? (
        <LoadingBlock />
      ) : editing ? (
        <form
          ref={editor}
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          {form.data.goals.map((question) => {
            const answer = draft[question.id] ?? { picked: [], note: '' };
            return (
              <fieldset key={question.id} className="space-y-3">
                <legend className="mb-3 text-sm font-semibold">
                  {question.question}
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <ToonCheckbox
                      disabled={save.isPending}
                      key={option}
                      label={option}
                      checked={answer.picked.includes(option)}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          [question.id]: {
                            ...answer,
                            picked: event.target.checked
                              ? [...answer.picked, option]
                              : answer.picked.filter((item) => item !== option),
                          },
                        })
                      }
                    />
                  ))}
                </div>
                <ToonField
                  label={`Kể thêm · ${question.label}`}
                  optional
                  counter={`${answer.note.length}/500`}
                >
                  <ToonTextarea
                    maxLength={500}
                    disabled={save.isPending}
                    value={answer.note}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        [question.id]: { ...answer, note: event.target.value },
                      })
                    }
                  />
                </ToonField>
                {hasDistressSignal(answer.note) && (
                  <p
                    role="status"
                    className="mt-2 rounded-md border border-toon-ink bg-toon-sky p-3 text-sm text-toon-ink"
                  >
                    {DISTRESS_MESSAGE}
                  </p>
                )}
              </fieldset>
            );
          })}
          <Notice tone="ai">
            Mục tiêu và phần kể thêm có thể được gửi tới nhà cung cấp model khi
            AI nhận xét ca làm. Chỉ chia sẻ điều bạn muốn.
          </Notice>
          {save.isError && (
            <Notice tone="danger">{errorText(save.error)}</Notice>
          )}
          <div className="flex gap-3">
            <ToonButton
              type="submit"
              variant="secondary"
              loading={save.isPending}
            >
              Lưu mục tiêu
            </ToonButton>
            <ToonButton
              variant="ghost"
              disabled={save.isPending}
              onClick={() => setEditing(false)}
            >
              Huỷ
            </ToonButton>
          </div>
        </form>
      ) : (
        <dl aria-label="Mục tiêu đã kể" className="space-y-4">
          {form.data.goals.map((question) => (
            <div key={question.id}>
              <dt className="font-toon text-xs font-bold uppercase tracking-wider">
                {question.label}
              </dt>
              <dd className="mt-1 break-words text-sm text-toon-ink-soft">
                <ReadMore
                  text={
                    [
                      ...(record.goals?.[question.id]?.picked ?? []),
                      record.goals?.[question.id]?.note,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Chưa kể'
                  }
                />
              </dd>
            </div>
          ))}
        </dl>
      )}
      {!quizDone && (
        <Link
          to="/quiz"
          className="mt-5 block text-sm underline underline-offset-4"
        >
          Hoặc làm Get to know me để được gợi ý vài nghề có thể thử
        </Link>
      )}
    </div>
  );
}
