import { useCallback, useEffect, useRef, useState } from 'react';
import type { SceneView, TurnInput } from '../../api/types';
import type { DesktopEntry } from './desktop/Desktop';
import type { ArtefactDraft } from './desktop/editors/EditorForm';
import type { PlaySession } from './usePlaySession';

type Action = SceneView['actions'][number];
type Node = NonNullable<SceneView['node']>;
type Form = NonNullable<Node['form']>;

interface DocumentWindow extends DesktopEntry {
  kind: 'document';
}

interface EditorWindow extends DesktopEntry {
  kind: 'editor';
  form: Form;
  submitLabel: string;
  target:
    | Pick<Extract<TurnInput, { kind: 'action' }>, 'kind' | 'key'>
    | Pick<Extract<TurnInput, { kind: 'save_artefact' }>, 'kind' | 'artefact'>;
}

type Window = DocumentWindow | EditorWindow;

interface PendingDocument {
  target: string;
  actionKey: string;
  before: SceneView;
}

function documentEntry(doc: SceneView['documents'][number]): DocumentWindow {
  return {
    id: doc.id,
    title: doc.title,
    type: doc.view?.type,
    kind: 'document',
  };
}

function submitLabel(form: Form, node?: Node) {
  switch (form.view?.type) {
    case 'patch':
      return 'Lưu bản vá';
    case 'note':
      return node ? `Gửi ${node.speaker.name}` : 'Gửi';
    case 'mail':
    case 'channel':
      return 'Gửi';
    default:
      return node
        ? node.kind === 'end'
          ? 'Gửi và kết thúc ca'
          : 'Gửi'
        : 'Xong';
  }
}

export function usePlayDesktop(
  session: PlaySession,
  intro: boolean,
  runId: string,
) {
  const [windows, setWindows] = useState<Window[]>([]);
  const [pending, setPending] = useState<PendingDocument[]>([]);
  const { scene, paused, sending, waiting, queued, send } = session;
  const draftKey = `jobquest:play-drafts:${runId}`;
  const [initialDrafts] = useState<Record<string, ArtefactDraft>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(draftKey) ?? '{}') ?? {};
    } catch {
      return {};
    }
  });
  const drafts = useRef(initialDrafts);
  const openedNodes = useRef(new Set<string>());
  const updateDraft = (id: string, draft?: ArtefactDraft) => {
    if (draft) drafts.current[id] = draft;
    else delete drafts.current[id];
    try {
      if (Object.keys(drafts.current).length)
        sessionStorage.setItem(draftKey, JSON.stringify(drafts.current));
      else sessionStorage.removeItem(draftKey);
    } catch {
      // The in-memory draft survives when browser storage is unavailable.
    }
  };

  const show = useCallback((entry: Window) => {
    setWindows((current) => {
      if (current[current.length - 1]?.id === entry.id) return current;
      return [...current.filter((item) => item.id !== entry.id), entry];
    });
  }, []);

  const close = (id: string) =>
    setWindows((current) => current.filter((entry) => entry.id !== id));

  const openDocument = (id: string) => {
    const doc = scene?.documents.find((item) => item.id === id);
    if (doc) show(documentEntry(doc));
  };

  const openNode = useCallback(
    (node: Node) => {
      const { form } = node;
      if (
        !form ||
        scene?.await.kind !== 'node_artefact' ||
        scene.await.node !== node.id
      )
        return;
      show({
        id: `node:${node.id}`,
        kind: 'editor',
        title: form.title,
        type: form.view?.type,
        form,
        target: { kind: 'save_artefact', artefact: form.id },
        submitLabel: submitLabel(form, node),
      });
    },
    [scene, show],
  );

  useEffect(() => {
    if (!scene || sending || waiting || paused || !pending.length) return;
    const completed = pending.filter(
      (request) =>
        scene !== request.before && scene.suspended?.key !== request.actionKey,
    );
    if (!completed.length) return;
    setPending((current) =>
      current.filter((request) => !completed.includes(request)),
    );
    for (const request of completed) {
      const doc = scene.documents.find((item) => item.id === request.target);
      if (doc) show(documentEntry(doc));
    }
  }, [scene, sending, waiting, paused, pending, show]);

  const node =
    !intro &&
    !waiting &&
    !queued &&
    !paused &&
    scene?.await.kind === 'node_artefact'
      ? scene.node
      : null;
  useEffect(() => {
    if (node?.form && !openedNodes.current.has(node.id)) {
      openedNodes.current.add(node.id);
      openNode(node);
    }
  }, [node, openNode]);

  const activeNodeId =
    scene?.await.kind === 'node_artefact' ? `node:${scene.await.node}` : null;
  useEffect(() => {
    setWindows((current) => {
      const active = current.filter(
        ({ id }) => !id.startsWith('node:') || id === activeNodeId,
      );
      return active.length === current.length ? current : active;
    });
  }, [activeNodeId]);

  const pick = async (action: Action) => {
    if (action.form) {
      show({
        id: `action:${action.key}`,
        kind: 'editor',
        title: action.label,
        type: action.form.view?.type,
        form: action.form,
        target: { kind: 'action', key: action.key },
        submitLabel: submitLabel(action.form),
      });
      return;
    }

    const accepted = await send({ kind: 'action', key: action.key });
    if (
      accepted &&
      scene &&
      action.target &&
      ['open', 'run'].includes(action.kind)
    ) {
      const request = {
        target: action.target,
        actionKey: action.key,
        before: scene,
      };
      setPending((current) => [...current, request]);
    }
  };

  const submit = async (
    editor: EditorWindow,
    fields: Record<string, string>,
    ticks: string[],
  ) => {
    if (await send({ ...editor.target, fields, ticks })) {
      updateDraft(editor.form.id);
      close(editor.id);
      return true;
    }
    return false;
  };

  return {
    windows,
    draftFor: (form: Form): Form => ({
      ...form,
      prefill: Object.prototype.hasOwnProperty.call(drafts.current, form.id)
        ? drafts.current[form.id]
        : form.prefill,
    }),
    updateDraft,
    openDocument,
    openNode,
    pick,
    close: (id: string) => {
      if (
        !sending ||
        windows.find((entry) => entry.id === id)?.kind === 'document'
      )
        close(id);
    },
    submit,
  };
}
