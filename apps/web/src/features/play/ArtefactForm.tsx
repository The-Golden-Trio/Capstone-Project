import { useId, useRef, useState, type FormEvent } from 'react';
import { FileText, Send } from 'lucide-react';
import { ToonButton, ToonCheckbox, ToonField, ToonTextarea } from '@datn/ui';
import type { SceneView } from '../../api/types';

type Form = NonNullable<SceneView['node']>['form'] & object;

/**
 * Soạn một tài liệu thật (email, báo cáo, bản vá): các ô theo
 * `deliverable_parts` của seed, người chơi thấy ngay đủ phần cần viết
 * (seed D4: follow-up không lộ đáp án, nên phần cần có phải hiện rõ).
 */
export function ArtefactForm({
  form,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: {
  form: Form;
  submitLabel: string;
  busy: boolean;
  onSubmit: (fields: Record<string, string>, ticks: string[]) => void;
  onCancel?: () => void;
}) {
  const [fields, setFields] = useState<Record<string, string>>(() => ({
    ...(form.prefill?.fields ?? {}),
  }));
  const [ticks, setTicks] = useState<string[]>(() => [
    ...(form.prefill?.ticks ?? []),
  ]);
  const [touched, setTouched] = useState(false);
  const firstField = useRef<HTMLTextAreaElement>(null);
  const errorId = useId();
  const empty = form.fields.filter((f) => !(fields[f.id] ?? '').trim());
  const missing =
    touched && form.fields.length > 0 && empty.length === form.fields.length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setTouched(true);
    if (empty.length === form.fields.length && form.fields.length > 0) {
      firstField.current?.focus();
      return;
    }
    onSubmit(
      Object.fromEntries(
        form.fields.map((f) => [f.id, (fields[f.id] ?? '').trim()]),
      ),
      ticks,
    );
  };

  return (
    <form
      onSubmit={submit}
      className="toon-card relative mt-3 bg-toon-paper p-4 pt-6 sm:p-6 sm:pt-7"
      noValidate
      aria-busy={busy || undefined}
    >
      {/* Kẹp giấy: tài liệu đang soạn trên bàn làm việc. */}
      <span
        aria-hidden
        className="absolute -top-4 left-6 h-8 w-14 -rotate-3 rounded-md border-[3px] border-toon-ink bg-toon-sky shadow-toon-sm"
      />
      <p className="flex items-center gap-2 font-toon text-xl font-extrabold text-toon-ink">
        <FileText size={20} strokeWidth={2.6} aria-hidden />
        <span className="inline-block first-letter:uppercase">
          {form.title}
        </span>
      </p>
      {missing && (
        <p
          id={errorId}
          role="alert"
          className="mt-3 text-sm font-bold text-toon-maroon"
        >
          Viết ít nhất một phần rồi gửi nhé.
        </p>
      )}
      <div className="mt-4 flex flex-col gap-4">
        {form.fields.map((f, index) => (
          <ToonField
            key={f.id}
            label={f.label}
            counter={`${(fields[f.id] ?? '').length}/4000`}
          >
            <ToonTextarea
              ref={index === 0 ? firstField : undefined}
              readOnly={busy}
              aria-invalid={missing || undefined}
              aria-describedby={missing ? errorId : undefined}
              value={fields[f.id] ?? ''}
              maxLength={4000}
              onChange={(e) =>
                setFields((v) => ({ ...v, [f.id]: e.target.value }))
              }
              className="min-h-24"
            />
          </ToonField>
        ))}
        {form.ticks.length > 0 && (
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2 font-toon text-base font-extrabold text-toon-ink">
              Đánh dấu
            </legend>
            {form.ticks.map((t) => (
              <ToonCheckbox
                disabled={busy}
                key={t.id}
                label={t.label}
                checked={ticks.includes(t.id)}
                onChange={(e) =>
                  setTicks((v) =>
                    e.target.checked
                      ? [...v, t.id]
                      : v.filter((x) => x !== t.id),
                  )
                }
              />
            ))}
          </fieldset>
        )}
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        {onCancel && (
          <ToonButton variant="ghost" onClick={onCancel} disabled={busy}>
            Để sau
          </ToonButton>
        )}
        <ToonButton
          type="submit"
          loading={busy}
          leftIcon={<Send size={16} strokeWidth={2.6} />}
        >
          {submitLabel}
        </ToonButton>
      </div>
    </form>
  );
}
