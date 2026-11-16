import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button, Checkbox, Field, Textarea } from '@datn/ui';
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
  const empty = form.fields.filter((f) => !(fields[f.id] ?? '').trim());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (empty.length === form.fields.length && form.fields.length > 0) return;
    onSubmit(
      Object.fromEntries(
        form.fields.map((f) => [f.id, (fields[f.id] ?? '').trim()]),
      ),
      ticks,
    );
  };

  return (
    <form onSubmit={submit} className="paper rounded-lg p-4 sm:p-5" noValidate>
      <p className="font-display text-lg font-semibold text-paper-ink first-letter:uppercase">
        {form.title}
      </p>
      <div className="mt-3 flex flex-col gap-4 [&>div>label]:text-paper-ink/80 [&>div_span.tabular]:text-[#6b6450] [&>div_p]:text-[#6b6450]">
        {form.fields.map((f) => (
          <Field
            key={f.id}
            label={f.label}
            counter={`${(fields[f.id] ?? '').length}/4000`}
            error={
              touched && empty.length === form.fields.length
                ? 'Viết ít nhất một phần rồi gửi nhé.'
                : undefined
            }
          >
            <Textarea
              value={fields[f.id] ?? ''}
              maxLength={4000}
              onChange={(e) =>
                setFields((v) => ({ ...v, [f.id]: e.target.value }))
              }
              className="min-h-20 border-[#d8ccab] bg-white/70 text-paper-ink placeholder:text-[#8a7f63] focus:bg-white"
            />
          </Field>
        ))}
        {form.ticks.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[13px] font-semibold text-paper-ink/80">
              Đánh dấu
            </legend>
            {form.ticks.map((t) => (
              <div key={t.id} className="rounded-md bg-night-900/90 px-3 py-2">
                <Checkbox
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
              </div>
            ))}
          </fieldset>
        )}
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-paper-ink/70 hover:bg-black/5 hover:text-paper-ink"
          >
            Để sau
          </Button>
        )}
        <Button type="submit" loading={busy} leftIcon={<Send size={16} />}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
