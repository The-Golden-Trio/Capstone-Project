import {
  EditorField,
  EditorTicks,
  type EditorLayoutProps,
  type EditorView,
} from './EditorForm';

export function IncidentNote({
  form,
  busy,
  draft,
  actions,
}: EditorLayoutProps<EditorView<'note'>>) {
  return (
    <div className="bg-slate-100 px-3 py-4 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold">{form.title}</h2>
        {form.fields.map((field) => (
          <EditorField key={field.id} field={field} draft={draft} busy={busy} />
        ))}
        <EditorTicks ticks={form.ticks} draft={draft} busy={busy} />
        {actions}
      </div>
    </div>
  );
}
