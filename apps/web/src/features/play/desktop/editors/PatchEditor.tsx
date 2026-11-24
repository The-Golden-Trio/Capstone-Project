import { CodeEditor } from '../CodeEditor';
import {
  EditorField,
  EditorTicks,
  type EditorLayoutProps,
  type EditorView,
} from './EditorForm';

function languageOf(path: string) {
  if (/\.sql$/i.test(path)) return 'sql';
  if (/\.[cm]?tsx?$/i.test(path)) return 'ts';
  if (/\.[cm]?jsx?$/i.test(path)) return 'js';
  return 'text';
}

export function PatchEditor({
  form,
  view,
  busy,
  draft,
  selects,
}: EditorLayoutProps<EditorView<'patch'>>) {
  return (
    <div className="grid min-w-0 gap-px bg-[#454545] text-[#e5e5e5] @3xl:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
      <div className="flex min-w-0 bg-[#1e1e1e]">
        <CodeEditor
          path={view.path}
          language={languageOf(view.path)}
          code={view.base}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4 bg-[#252526] p-4">
        <EditorTicks
          ticks={form.ticks}
          draft={draft}
          busy={busy}
          legend="Thay đổi"
        />
        {form.fields.map((field) => (
          <EditorField key={field.id} field={field} draft={draft} busy={busy} />
        ))}
        {selects}
      </div>
    </div>
  );
}
