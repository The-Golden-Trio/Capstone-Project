import {
  EditorField,
  EditorTicks,
  type EditorLayoutProps,
  type EditorView,
} from './EditorForm';

export function ChannelComposer({
  form,
  view,
  busy,
  draft,
  selects,
}: EditorLayoutProps<EditorView<'channel'>>) {
  const channel = view.channel.startsWith('#')
    ? view.channel
    : `#${view.channel}`;

  return (
    <div className="bg-white text-slate-900">
      <h2 className="bg-[#4a154b] px-5 py-3 text-sm font-semibold text-white">
        {channel}
      </h2>
      <div className="p-4">
        <div className="space-y-3 rounded-lg border border-slate-300 p-3">
          {form.fields.map((field) => (
            <EditorField
              key={field.id}
              field={{
                ...field,
                placeholder: field.placeholder ?? `Nhắn vào ${channel}`,
              }}
              draft={draft}
              busy={busy}
              rows={4}
            />
          ))}
          <EditorTicks ticks={form.ticks} draft={draft} busy={busy} />
          {selects}
        </div>
      </div>
    </div>
  );
}
