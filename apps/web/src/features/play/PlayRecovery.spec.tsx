import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { Link, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { api } from '../../api';
import { player } from '../../api/demo/store';
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
          const accepted = await state.send();
          setSending(false);
          setError(accepted ? null : 'Kết nối bị gián đoạn');
          return accepted;
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
          view: { type: 'patch', path: 'src/orders.js', base: [] },
          fields: [{ id: 'why', label: 'Nguyên nhân', multiline: true }],
          ticks: [],
          selects: [],
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
  fireEvent.click(dialog.getByRole('button', { name: 'Lưu bản vá' }));
  await waitFor(() =>
    expect(dialog.getByRole('alert').textContent).toContain('Bản nháp vẫn còn'),
  );
  expect(
    dialog.getByRole<HTMLTextAreaElement>('textbox', { name: 'Nguyên nhân' })
      .value,
  ).toBe('Truy vấn N+1');
  fireEvent.click(dialog.getByRole('button', { name: 'Lưu bản vá' }));
  await waitFor(() => expect(state.send).toHaveBeenCalledTimes(2));
});

it('giữ nháp khi Esc, Để sau và tải lại, cách ly theo ca và xóa khi gửi thành công', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const saved = player().runs.find(({ id }) => id === run.runId);
  if (!saved) throw new Error('Thiếu ca demo');
  player().runs.push({ ...saved, id: 'ca-khac' });
  const scene = await api.play.scene(run.runId);
  state.scene = {
    ...scene,
    mode: 'phase',
    await: { kind: 'phase' },
    node: null,
    actions: [
      {
        key: 'write_patch',
        label: 'Viết bản vá',
        kind: 'write',
        points: 1,
        enabled: true,
        form: {
          id: 'patch',
          title: 'Bản vá',
          view: { type: 'patch', path: 'orders.js', base: [] },
          fields: [{ id: 'why', label: 'Nguyên nhân', multiline: true }],
          ticks: [{ id: 'v1', label: 'Gom truy vấn' }],
          selects: [],
        },
      },
    ],
  };
  const renderRun = () =>
    renderWithProviders(
      <>
        <Link to="/play/ca-khac">Chuyển ca</Link>
        <Link to={`/play/${run.runId}`}>Về ca cũ</Link>
        <Routes>
          <Route path="/play/:runId" element={<PlayPage />} />
        </Routes>
      </>,
      `/play/${run.runId}`,
    );
  const open = async () => {
    fireEvent.click(await screen.findByRole('button', { name: /Viết bản vá/ }));
    return await screen.findByRole('dialog', { name: 'Viết bản vá' });
  };
  const valueIn = (dialog: HTMLElement) =>
    within(dialog).getByRole<HTMLTextAreaElement>('textbox', {
      name: 'Nguyên nhân',
    }).value;
  const first = renderRun();
  const dialog = await open();
  fireEvent.change(within(dialog).getByRole('textbox'), {
    target: { value: '  N+1  ' },
  });
  fireEvent.click(
    within(dialog).getByRole('checkbox', { name: 'Gom truy vấn' }),
  );
  fireEvent.keyDown(dialog, { key: 'Escape' });
  const reopened = await open();
  expect(valueIn(reopened)).toBe('  N+1  ');
  fireEvent.click(within(reopened).getByRole('button', { name: 'Để sau' }));
  first.unmount();

  renderRun();
  const afterReload = await open();
  expect(valueIn(afterReload)).toBe('  N+1  ');
  expect(
    within(afterReload).getByRole<HTMLInputElement>('checkbox', {
      name: 'Gom truy vấn',
    }).checked,
  ).toBe(true);
  fireEvent.click(screen.getByRole('link', { name: 'Chuyển ca' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(valueIn(await open())).toBe('');

  fireEvent.click(screen.getByRole('link', { name: 'Về ca cũ' }));
  const original = await open();
  expect(valueIn(original)).toBe('  N+1  ');
  state.send.mockResolvedValueOnce(true);
  fireEvent.click(within(original).getByRole('button', { name: 'Lưu bản vá' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(valueIn(await open())).toBe('');
});
