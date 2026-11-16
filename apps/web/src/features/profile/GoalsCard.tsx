import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Callout,
  Checkbox,
  EmptyState,
  Field,
  LoadingBlock,
  Panel,
  PanelHeader,
  Textarea,
  useToast,
} from '@datn/ui';
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
  const [editing, setEditing] = useState(
    !record.goals || Object.keys(record.goals).length === 0,
  );
  const [draft, setDraft] = useState<QuizAnswers['goals']>(record.goals ?? {});
  const save = useMutation({
    mutationFn: () => api.progress.updateGoals(draft),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.record });
      void qc.invalidateQueries({ queryKey: keys.quizResult });
      setEditing(false);
      toast({ tone: 'success', title: 'Đã lưu mục tiêu' });
    },
  });
  return (
    <Panel padding="lg">
      <PanelHeader
        title="Mục tiêu của bạn"
        description="Điều bạn muốn thử có thể thay đổi theo từng chặng."
        action={
          !editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(record.goals ?? {});
                setEditing(true);
              }}
            >
              Sửa
            </Button>
          )
        }
      />
      {form.isError ? (
        <EmptyState
          title="Chưa tải được câu hỏi"
          description={errorText(form.error)}
          action={
            <Button variant="secondary" onClick={() => void form.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : !form.data ? (
        <LoadingBlock />
      ) : editing ? (
        <form
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
                    <Checkbox
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
                <Field
                  label={`Kể thêm · ${question.label}`}
                  optional
                  counter={`${answer.note.length}/500`}
                >
                  <Textarea
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
                </Field>
                {hasDistressSignal(answer.note) && (
                  <p
                    role="status"
                    className="mt-2 rounded-md border border-info/40 bg-info-deep/40 p-3 text-sm text-ink"
                  >
                    {DISTRESS_MESSAGE}
                  </p>
                )}
              </fieldset>
            );
          })}
          <Callout tone="ai">
            Mục tiêu và phần kể thêm có thể được gửi tới nhà cung cấp model khi
            AI nhận xét ca làm. Chỉ chia sẻ điều bạn muốn.
          </Callout>
          {save.isError && (
            <Callout tone="danger">{errorText(save.error)}</Callout>
          )}
          <div className="flex gap-3">
            <Button type="submit" variant="secondary" loading={save.isPending}>
              Lưu mục tiêu
            </Button>
            {record.goals && (
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Huỷ
              </Button>
            )}
          </div>
        </form>
      ) : (
        <dl className="space-y-4">
          {form.data.goals.map((question) => (
            <div key={question.id}>
              <dt className="eyebrow">{question.label}</dt>
              <dd className="mt-1 break-words text-sm text-ink-muted">
                {[
                  ...(record.goals?.[question.id]?.picked ?? []),
                  record.goals?.[question.id]?.note,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Chưa kể'}
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
          Hoặc làm Get to know me để được gợi ý nghề nên thử
        </Link>
      )}
    </Panel>
  );
}
