import {
  EditorField,
  EditorTicks,
  type EditorLayoutProps,
  type EditorView,
} from './EditorForm';

export function MailComposer({
  form,
  view,
  busy,
  draft,
  actions,
}: EditorLayoutProps<EditorView<'mail'>>) {
  const subject = form.fields.find(({ id }) => id === view.subject_field);

  return (
    <div className="bg-white text-slate-900">
      <h2 className="bg-slate-100 px-5 py-3 text-sm font-semibold">
        {form.title}
      </h2>
      <div className="space-y-4 px-5 py-4">
        <dl className="flex items-center gap-3 border-b border-slate-200 pb-3 text-sm">
          <dt className="font-medium text-slate-600">Đến</dt>
          <dd className="rounded-full border border-slate-300 px-2.5 py-0.5">
            {view.to}
          </dd>
        </dl>
        {subject && (
          <EditorField
            field={{ ...subject, multiline: false }}
            draft={draft}
            busy={busy}
          />
        )}
        {form.fields
          .filter(({ id }) => id !== subject?.id)
          .map((field) => (
            <EditorField
              key={field.id}
              field={field}
              draft={draft}
              busy={busy}
            />
          ))}
        <EditorTicks ticks={form.ticks} draft={draft} busy={busy} />
        {actions}
      </div>
    </div>
  );
}
