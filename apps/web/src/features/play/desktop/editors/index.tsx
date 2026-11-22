import { ArtefactForm } from '../../ArtefactForm';
import { ChannelComposer } from './ChannelComposer';
import {
  EditorField,
  EditorForm,
  EditorTicks,
  type ArtefactEditorProps,
  type EditorLayoutProps,
} from './EditorForm';
import { IncidentNote } from './IncidentNote';
import { MailComposer } from './MailComposer';
import { PatchEditor } from './PatchEditor';

export function ArtefactEditor(props: ArtefactEditorProps) {
  const { form } = props;
  const view = form.view;

  switch (view?.type) {
    case 'patch':
      return (
        <EditorForm key={form.id} {...props} view={view} Layout={PatchEditor} />
      );
    case 'mail':
      return (
        <EditorForm
          key={form.id}
          {...props}
          view={view}
          Layout={MailComposer}
        />
      );
    case 'note':
      return (
        <EditorForm
          key={form.id}
          {...props}
          view={view}
          Layout={IncidentNote}
        />
      );
    case 'channel':
      return (
        <EditorForm
          key={form.id}
          {...props}
          view={view}
          Layout={ChannelComposer}
        />
      );
    default:
      if (form.selects?.length)
        return (
          <EditorForm
            key={form.id}
            {...props}
            view={view}
            Layout={GenericEditor}
          />
        );
      return <ArtefactForm key={form.id} {...props} />;
  }
}

function GenericEditor({
  form,
  draft,
  busy,
  actions,
}: EditorLayoutProps<unknown>) {
  return (
    <div className="space-y-4 bg-white p-4 text-slate-900">
      {form.fields.map((field) => (
        <EditorField key={field.id} field={field} draft={draft} busy={busy} />
      ))}
      <EditorTicks ticks={form.ticks} draft={draft} busy={busy} />
      {actions}
    </div>
  );
}
