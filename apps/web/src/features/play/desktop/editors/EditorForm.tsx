import {
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import type { shift } from '@datn/game-core';

export type ArtefactEditorProps = {
  form: shift.ArtefactForm;
  busy: boolean;
  submitLabel: string;
  onSubmit: (fields: Record<string, string>, ticks: string[]) => void;
  onCancel?: () => void;
  onDraftChange?: (draft: ArtefactDraft) => void;
};

export type ArtefactDraft = NonNullable<shift.ArtefactForm['prefill']>;

export type EditorView<Type extends shift.ArtefactView['type']> = Extract<
  shift.ArtefactView,
  { type: Type }
>;

type Draft = {
  fields: Record<string, string>;
  ticks: string[];
  setField: (id: string, value: string) => void;
  setTick: (id: string, checked: boolean) => void;
  setSelection: (id: string, value: string) => void;
  errorId?: string;
};

export type EditorLayoutProps<View> = {
  form: shift.ArtefactForm;
  view: View;
  busy: boolean;
  draft: Draft;
  actions: ReactNode;
};

export const controlClass =
  'w-full min-w-0 rounded-md border border-slate-400/60 bg-transparent px-3 py-2 text-sm placeholder:text-current/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';

const optionTick = (selectId: string, optionId: string) =>
  `${selectId}=${optionId}`;

export const reasonFieldId = (selectId: string) => `${selectId}__why`;

export function selectedOption(select: shift.ArtefactSelect, ticks: string[]) {
  return (
    select.options.find(({ id }) => ticks.includes(optionTick(select.id, id)))
      ?.id ?? ''
  );
}

export function EditorForm<View>({
  form,
  view,
  busy,
  submitLabel,
  onSubmit,
  onCancel,
  onDraftChange,
  Layout,
}: ArtefactEditorProps & {
  view: View;
  Layout: (props: EditorLayoutProps<View>) => ReactNode;
}) {
  const [{ fields, ticks }, setDraft] = useState<ArtefactDraft>(
    () => form.prefill ?? { fields: {}, ticks: [] },
  );
  const updateDraft = (next: ArtefactDraft) => {
    setDraft(next);
    onDraftChange?.(next);
  };
  const [showError, setShowError] = useState(false);
  const errorId = useId();
  const selects = form.selects ?? [];
  const fieldIds = [
    ...form.fields.map(({ id }) => id),
    ...selects
      .filter(({ reason }) => reason)
      .map(({ id }) => reasonFieldId(id)),
  ];
  const validTicks = form.ticks
    .map(({ id }) => id)
    .filter((id) => ticks.includes(id));
  for (const select of selects) {
    const option = selectedOption(select, ticks);
    if (option) validTicks.push(optionTick(select.id, option));
  }
  const empty =
    fieldIds.length > 0 &&
    validTicks.length === 0 &&
    fieldIds.every((id) => !fields[id]?.trim());
  const invalid = showError && empty;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (empty) {
      setShowError(true);
      event.currentTarget
        .querySelector<HTMLElement>('textarea, input[type="text"]')
        ?.focus();
      return;
    }

    setShowError(false);
    onSubmit(
      Object.fromEntries(fieldIds.map((id) => [id, (fields[id] ?? '').trim()])),
      validTicks,
    );
  }

  const draft: Draft = {
    fields,
    ticks,
    setField: (id, value) =>
      updateDraft({ fields: { ...fields, [id]: value }, ticks }),
    setTick: (id, checked) => {
      const otherTicks = ticks.filter((tick) => tick !== id);
      updateDraft({
        fields,
        ticks: checked ? [...otherTicks, id] : otherTicks,
      });
    },
    setSelection: (id, value) => {
      const otherTicks = ticks.filter((tick) => !tick.startsWith(`${id}=`));
      updateDraft({
        fields,
        ticks: value ? [...otherTicks, optionTick(id, value)] : otherTicks,
      });
    },
    errorId: invalid ? errorId : undefined,
  };

  return (
    <form
      className="desktop-editor-form @container"
      onSubmit={submit}
      aria-label={form.title}
      aria-busy={busy || undefined}
    >
      <Layout
        form={form}
        view={view}
        busy={busy}
        draft={draft}
        actions={
          <div className="space-y-4">
            {selects.length > 0 && (
              <EditorSelects selects={selects} draft={draft} busy={busy} />
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {invalid && (
                <p
                  id={errorId}
                  role="alert"
                  className="mr-auto text-sm text-current"
                >
                  Viết ít nhất một phần rồi gửi nhé.
                </p>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-400/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-60"
                >
                  Để sau
                </button>
              )}
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-60"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        }
      />
    </form>
  );
}

export function EditorField({
  field,
  draft,
  busy,
  rows = 3,
  hideLabel = false,
}: {
  field: shift.ArtefactField;
  draft: Draft;
  busy: boolean;
  rows?: number;
  hideLabel?: boolean;
}) {
  const props = {
    name: field.id,
    value: draft.fields[field.id] ?? '',
    readOnly: busy,
    placeholder: field.placeholder,
    maxLength: 4000,
    'aria-invalid': draft.errorId ? true : undefined,
    'aria-describedby': draft.errorId,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      draft.setField(field.id, event.target.value),
  };

  return (
    <label className="block min-w-0">
      <span
        className={hideLabel ? 'sr-only' : 'mb-1.5 block text-sm font-semibold'}
      >
        {field.label}
      </span>
      {field.multiline === false ? (
        <input type="text" className={controlClass} {...props} />
      ) : (
        <textarea
          rows={rows}
          className={`${controlClass} resize-y`}
          {...props}
        />
      )}
    </label>
  );
}

export function EditorTicks({
  ticks,
  draft,
  busy,
  legend = 'Đánh dấu',
}: {
  ticks: shift.ArtefactForm['ticks'];
  draft: Draft;
  busy: boolean;
  legend?: string;
}) {
  if (ticks.length === 0) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      {ticks.map(({ id, label }) => (
        <label key={id} className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            data-tick-id={id}
            className="mt-0.5 size-4 shrink-0 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            checked={draft.ticks.includes(id)}
            disabled={busy}
            onChange={(event) => draft.setTick(id, event.target.checked)}
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

function EditorSelects({
  selects,
  draft,
  busy,
}: {
  selects: shift.ArtefactSelect[];
  draft: Draft;
  busy: boolean;
}) {
  const hasReason = selects.some(({ reason }) => reason);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm max-sm:block">
        <caption className="sr-only">Bảng giả thuyết</caption>
        <thead className="bg-slate-500/10 max-sm:sr-only">
          <tr>
            <th scope="col" className="px-3 py-2">
              Giả thuyết
            </th>
            <th scope="col" className="px-3 py-2">
              Đánh giá
            </th>
            {hasReason && (
              <th scope="col" className="px-3 py-2">
                Vì sao
              </th>
            )}
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {selects.map((select) => (
            <tr
              key={select.id}
              className="border-b border-slate-200 align-top max-sm:block max-sm:space-y-2 max-sm:py-3"
            >
              <th
                scope="row"
                className="min-w-32 px-3 py-3 font-medium max-sm:block max-sm:min-w-0 max-sm:py-0"
              >
                {select.label}
              </th>
              <td className="min-w-32 px-3 py-2 max-sm:block max-sm:min-w-0 max-sm:py-0">
                <select
                  aria-label={`Đánh giá: ${select.label}`}
                  data-select-id={select.id}
                  className={controlClass}
                  disabled={busy}
                  value={selectedOption(select, draft.ticks)}
                  onChange={(event) =>
                    draft.setSelection(select.id, event.target.value)
                  }
                >
                  <option value="">Chọn…</option>
                  {select.options.map(({ id, label }) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              {hasReason && (
                <td className="min-w-40 px-3 py-2 max-sm:block max-sm:min-w-0 max-sm:py-0">
                  {select.reason && (
                    <EditorField
                      field={{
                        id: reasonFieldId(select.id),
                        label: `Vì sao: ${select.label}`,
                        multiline: true,
                      }}
                      draft={draft}
                      busy={busy}
                      rows={2}
                      hideLabel
                    />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
