import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import {
  act,
  fireEvent,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { api } from '../../api';
import type { PlayEvent } from '../../api/port';
import { createTurnId } from '../../api/port';
import type { SceneView, TranscriptLine, TurnResult } from '../../api/types';
import { player, save } from '../../api/demo/store';
import { Route, Routes } from 'react-router-dom';
import PlayPage from './PlayPage';
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

it('đọc lời đáp cuối, từng tin bot và lời kết theo thứ tự', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const original = await api.play.scene(run.runId);
  const line = (
    seq: number,
    kind: TranscriptLine['kind'],
    speaker: string,
    context: string,
  ): TranscriptLine => ({
    seq,
    kind,
    speaker,
    context,
    at: 26,
    text: `Nhịp ${seq}`,
  });
  const finalLines = [
    line(1, 'player', 'player', 'last_word'),
    line(2, 'npc', 'support', 'last_word'),
    line(3, 'system', 'bot_deploy', 'epilogue'),
    line(4, 'system', 'bot_giam_sat', 'epilogue'),
    line(5, 'npc', 'support', 'epilogue'),
    line(6, 'system', 'system', 'end'),
  ];
  vi.spyOn(api.play, 'scene').mockResolvedValue({
    ...original,
    mode: 'node',
    await: { kind: 'last_word', to: 'support', prompt: 'Nhắn chị Linh?' },
  });
  vi.spyOn(api.play, 'transcript').mockResolvedValue([]);
  vi.spyOn(api.play, 'turn').mockImplementation(
    async (_id, _input, turnId) => ({
      turnId: turnId ?? 'turn',
      lines: finalLines,
      scene: {
        ...original,
        mode: 'ended',
        await: { kind: 'ended' },
        ended: true,
      },
      pending: false,
    }),
  );
  const { result } = renderHook(() => usePlaySession(run.runId));
  await waitFor(() => expect(result.current.ready).toBe(true));
  await act(async () => {
    await result.current.send({ kind: 'say', text: 'Chị ơi, đã duyệt.' });
  });
  for (const seq of [2, 3, 4, 5]) {
    expect(result.current.current?.seq).toBe(seq);
    act(() => result.current.advance());
  }
  expect(result.current.queued).toBe(0);
});

it('chặn gửi đồng thời và dùng lại mã cùng thời gian chọn khi gửi lại sau lỗi mạng', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const turn = vi.spyOn(api.play, 'turn');
  let rejectTurn!: (error: Error) => void;
  turn.mockImplementationOnce(
    () =>
      new Promise<TurnResult>((_resolve, reject) => {
        rejectTurn = reject;
      }),
  );
  const { result } = renderHook(() => usePlaySession(run.runId));
  await waitFor(() => expect(result.current.ready).toBe(true));
  await act(async () => {
    const sent = result.current.send({
      kind: 'choose',
      option: 'a',
      elapsedMs: 500,
    });
    expect(await result.current.send({ kind: 'cancel_end' })).toBe(false);
    rejectTurn(new Error('Mất phản hồi'));
    expect(await sent).toBe(false);
  });
  expect(turn).toHaveBeenCalledTimes(1);
  turn.mockImplementationOnce(async (_id, _input, turnId) => ({
    turnId: turnId ?? 'turn',
    lines: [],
    scene: null,
    pending: false,
  }));
  await act(async () => {
    expect(
      await result.current.send({
        kind: 'choose',
        option: 'a',
        elapsedMs: 1000,
      }),
    ).toBe(true);
  });
  expect(turn.mock.calls[1]).toEqual(turn.mock.calls[0]);
});

it('bỏ snapshot poll cũ khi SSE đã đưa ca sang nút khác', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const base = await api.play.scene(run.runId);
  const old: SceneView = {
    ...base,
    mode: 'node',
    await: { kind: 'node_artefact', node: 'n2', artefact: 'ghi_chu_su_co' },
  };
  const next: SceneView = { ...base, mode: 'phase', await: { kind: 'phase' } };
  let resolvePoll!: (scene: SceneView) => void;
  const scene = vi
    .spyOn(api.play, 'scene')
    .mockResolvedValueOnce({ ...base, mode: 'waiting', pendingTurnId: 'turn' })
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePoll = resolve;
        }),
    );
  vi.spyOn(api.play, 'transcript').mockResolvedValue([]);
  let emit!: (event: PlayEvent) => void;
  vi.spyOn(api.play, 'subscribe').mockImplementation((_id, listener) => {
    emit = listener;
    return () => undefined;
  });
  vi.useFakeTimers();
  const { result } = renderHook(() => usePlaySession(run.runId));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  expect(result.current.waiting).toBe(true);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(8000);
  });
  expect(scene).toHaveBeenCalledTimes(2);
  act(() => emit({ type: 'done', turnId: 'turn', scene: next, ended: false }));
  await act(async () => {
    resolvePoll(old);
  });
  expect(result.current.scene?.await.kind).toBe('phase');
});

it('mở lại ca demo đã tạm dừng và cho tiếp tục job còn dang dở', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const saved = player().runs.find(({ id }) => id === run.runId);
  if (!saved) throw new Error('Thiếu ca demo');
  saved.events.push({ type: 'SAY', text: 'Dạ em coi liền.' });
  saved.paused = true;
  save();
  expect(await api.play.scene(run.runId)).toMatchObject({
    mode: 'waiting',
    paused: true,
    pendingTurnId: saved.turnId,
  });

  renderWithProviders(
    <Routes>
      <Route path="/play/:runId" element={<PlayPage />} />
    </Routes>,
    `/play/${run.runId}`,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Thử tiếp tục' }));
  await waitFor(async () =>
    expect(await api.play.scene(run.runId)).toMatchObject({
      mode: 'phase',
      paused: false,
    }),
  );
  expect(screen.queryByRole('button', { name: 'Thử tiếp tục' })).toBeNull();
});

it('phát lại kết quả demo khi nhận cùng turnId mà không ghi lượt mới', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const id = createTurnId();
  const input = { kind: 'say', text: 'Dạ em coi liền.' } as const;
  expect((await api.play.turn(run.runId, input, id)).turnId).toBe(id);
  await waitFor(async () =>
    expect((await api.play.scene(run.runId)).mode).toBe('phase'),
  );
  const retry = await api.play.turn(run.runId, input, id);
  expect(retry).toMatchObject({ turnId: id, pending: false });
  expect(retry.lines.filter(({ kind }) => kind === 'player')).toHaveLength(1);
  expect(
    (await api.play.transcript(run.runId)).filter(
      ({ kind }) => kind === 'player',
    ),
  ).toHaveLength(1);
});
