import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { api } from '../../api';
import type { SceneView } from '../../api/types';
import PlayPage from './PlayPage';

const state = vi.hoisted(() => ({
  scene: null as SceneView | null,
  send: vi.fn(async () => false),
}));
vi.mock('./usePlaySession', async () => {
  const { useState } = await import('react');
  return {
    usePlaySession: () => {
      const [error, setError] = useState<string | null>(null);
      const [sending, setSending] = useState(false);
      return {
        scene: state.scene,
        ready: true,
        fresh: false,
        queued: 0,
        shown: [],
        current: null,
        error,
        sending,
        waiting: false,
        paused: null,
        send: async () => {
          setSending(true);
          await state.send();
          setSending(false);
          setError('Kết nối bị gián đoạn');
          return false;
        },
      };
    },
  };
});
it('keeps an action draft and shows its send error inside the open dialog', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const scene = await api.play.scene(run.runId);
  state.scene = {
    ...scene,
    mode: 'phase',
    await: { kind: 'phase' },
    node: null,
    actions: [
      {
        key: 'patch',
        label: 'Viết bản vá',
        kind: 'write',
        points: 1,
        enabled: true,
        form: {
          id: 'patch',
          title: 'Bản vá',
          fields: [{ id: 'why', label: 'Nguyên nhân' }],
          ticks: [],
        },
      },
    ],
  };
  state.send.mockClear();
  renderWithProviders(
    <Routes>
      <Route path="/play/:runId" element={<PlayPage />} />
    </Routes>,
    `/play/${run.runId}`,
  );
  fireEvent.click(await screen.findByRole('button', { name: /Viết bản vá/ }));
  const dialog = within(screen.getByRole('dialog', { name: 'Viết bản vá' }));
  fireEvent.change(dialog.getByRole('textbox', { name: 'Nguyên nhân' }), {
    target: { value: 'Truy vấn N+1' },
  });
  fireEvent.click(dialog.getByRole('button', { name: 'Xong' }));
  await waitFor(() =>
    expect(dialog.getByRole('alert').textContent).toContain('Bản nháp vẫn còn'),
  );
  expect(
    dialog.getByRole<HTMLTextAreaElement>('textbox', { name: 'Nguyên nhân' })
      .value,
  ).toBe('Truy vấn N+1');
  fireEvent.click(dialog.getByRole('button', { name: 'Xong' }));
  await waitFor(() => expect(state.send).toHaveBeenCalledTimes(2));
});
