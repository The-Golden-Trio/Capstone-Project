import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { api } from '../../api';
import { Stage } from './Stage';
import { usePlaySession } from './usePlaySession';

it('Space qua nhịp, nhưng Space trong ô nhập không làm mất lượt đang đọc', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const advance = vi.fn();
  renderWithProviders(
    <>
      <Stage
        run={run}
        lines={[]}
        current={{
          seq: 1,
          kind: 'scene',
          speaker: '',
          text: 'Nhịp đang đọc',
          at: 0,
          context: 'node:n0',
        }}
        queued={2}
        waitingLabel={null}
        onAdvance={advance}
        onRevealAll={vi.fn()}
      />
      <input aria-label="Câu đang soạn" />
    </>,
  );
  fireEvent.keyDown(document.body, { key: ' ' });
  expect(advance).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(screen.getByLabelText('Câu đang soạn'), { key: ' ' });
  expect(advance).toHaveBeenCalledTimes(1);
});

// Hồi quy lỗi tự lộ hết nhịp: mã app được agent khác sửa trong lúc viết test.
it('ca mới giữ các nhịp sau trong hàng đợi cho tới khi người chơi nhấn Space', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  await waitFor(async () =>
    expect((await api.play.scene(run.runId)).mode).not.toBe('waiting'),
  );
  const transcript = await api.play.transcript(run.runId);
  const beats = transcript.filter(
    (line) => line.kind === 'npc' || line.kind === 'scene',
  );
  expect(beats.length).toBeGreaterThan(1);
  const { result } = renderHook(() => usePlaySession(run.runId));
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(
    result.current.shown.filter(
      (line) => line.kind === 'npc' || line.kind === 'scene',
    ),
  ).toHaveLength(1);
  expect(result.current.queued).toBeGreaterThan(0);
});
