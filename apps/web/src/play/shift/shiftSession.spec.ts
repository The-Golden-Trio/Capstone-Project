import { afterEach, describe, expect, it } from 'vitest';
import { PlayApiError } from '../api/contract';
import {
  setShiftApi,
  type Line,
  type ShiftApi,
  type ShiftScene,
  type ShiftStreamEvent,
} from './shiftApi';
import { mergeLines, useShiftSession } from './shiftSession';

const line = (seq: number, text = `l${seq}`): Line => ({
  seq,
  at: 0,
  kind: 'npc',
  speaker: 'mentor',
  text,
  context: 'x',
});

const scene = (over: Partial<ShiftScene> = {}): ShiftScene =>
  ({
    seedId: 'S.L1.m1',
    title: 'Ca thử',
    goal: 'Làm xong',
    clock: {
      time: '9:40',
      start: '9:40',
      deadline: '12:00',
      pointsUsed: 0,
      budget: 28,
      remaining: 28,
      minutesPerPoint: 5,
    },
    mode: 'phase',
    await: { kind: 'phase' },
    conversation: null,
    node: null,
    actions: [],
    documents: [],
    notebook: { facts: [], promises: [] },
    cast: [{ slot: 'mentor', name: 'anh An', relation: 'mentor' }],
    glossary: [],
    suspended: null,
    hintsUsed: 0,
    ended: false,
    paused: false,
    pendingTurnId: null,
    notes: [],
    ...over,
  }) as ShiftScene;

function fakeApi(over: Partial<ShiftApi> = {}) {
  let listener: ((e: ShiftStreamEvent) => void) | null = null;
  const api: ShiftApi = {
    tasks: async () => [],
    start: async () => ({}) as never,
    get: async (id) => ({ id, playerRole: 'Bạn trực sự cố' }) as never,
    scene: async () => scene(),
    transcript: async () => [line(0)],
    turn: async (_r, _b, turnId = 't1') => ({
      status: 202,
      turnId,
      jobId: turnId,
      lines: [line(1, 'Bạn nói')],
    }),
    resume: async () => undefined,
    note: async () => undefined,
    flag: async () => undefined,
    summary: async () => ({}) as never,
    openStream: (onEvent) => {
      listener = onEvent;
      return () => (listener = null);
    },
    ...over,
  };
  setShiftApi(api);
  return { emit: (e: ShiftStreamEvent) => listener?.(e) };
}

afterEach(() => {
  useShiftSession.getState().close();
  setShiftApi(null);
});

describe('mergeLines', () => {
  it('gộp theo seq, không trùng, đúng thứ tự', () => {
    expect(
      mergeLines([line(0), line(2)], [line(1), line(2, 'mới')]).map((l) => [
        l.seq,
        l.text,
      ]),
    ).toEqual([
      [0, 'l0'],
      [1, 'l1'],
      [2, 'mới'],
    ]);
  });
});

describe('phiên ca làm', () => {
  it('lượt 202 chờ tin trên luồng; turn.lines thêm dòng, turn.done cập nhật cảnh và hết chờ', async () => {
    const { emit } = fakeApi();
    const s = useShiftSession.getState();
    await s.open('r1');
    expect(useShiftSession.getState().lines).toHaveLength(1);

    await useShiftSession.getState().send({ kind: 'say', text: 'Dạ' });
    expect(useShiftSession.getState().waitingTurn).not.toBeNull();
    const turnId = useShiftSession.getState().waitingTurn ?? '';

    // Tin của lượt khác bị bỏ qua.
    emit({
      type: 'turn.lines',
      runId: 'khac',
      payload: { turnId, lines: [line(9)] },
    });
    emit({
      type: 'turn.lines',
      runId: 'r1',
      payload: { turnId, lines: [line(2, 'Ừ.')] },
    });
    expect(useShiftSession.getState().lines.map((l) => l.seq)).toEqual([
      0, 1, 2,
    ]);

    emit({
      type: 'provider.delay',
      runId: 'r1',
      payload: { turnId, waitingFor: 'narration' },
    });
    expect(useShiftSession.getState().delayed).toBe(true);

    emit({
      type: 'turn.done',
      runId: 'r1',
      payload: { turnId, scene: scene({ mode: 'conversation' }), ended: false },
    });
    const after = useShiftSession.getState();
    expect(after.waitingTurn).toBeNull();
    expect(after.delayed).toBe(false);
    expect(after.scene?.mode).toBe('conversation');
  });

  it('đang chờ thì không gửi lượt mới; tạm dừng thì hết chờ, tiếp tục thì chờ lại', async () => {
    const { emit } = fakeApi();
    await useShiftSession.getState().open('r1');
    await useShiftSession.getState().send({ kind: 'say', text: 'Một' });
    expect(
      await useShiftSession.getState().send({ kind: 'say', text: 'Hai' }),
    ).toBe(false);

    const turnId = useShiftSession.getState().waitingTurn ?? '';
    emit({
      type: 'run.paused',
      runId: 'r1',
      payload: { turnId, reason: 'no_model' },
    });
    expect(useShiftSession.getState().scene?.paused).toBe(true);
    expect(useShiftSession.getState().waitingTurn).toBeNull();
  });

  it('thao tác sai luật hiện lý do của máy chủ', async () => {
    fakeApi({
      turn: async () => {
        throw new PlayApiError({
          type: 'about:blank',
          title: 'Thao tác không hợp luật lúc này',
          status: 422,
          code: 'TURN_INVALID',
          errors: [{ reason: 'Chưa tới lúc' }],
        });
      },
    });
    await useShiftSession.getState().open('r1');
    expect(
      await useShiftSession.getState().send({ kind: 'action', key: 'chot' }),
    ).toBe(false);
    expect(useShiftSession.getState().invalid).toBe('Chưa tới lúc');
  });

  it('lượt 200 cập nhật cảnh ngay', async () => {
    fakeApi({
      turn: async (_r, _b, turnId = 't') => ({
        status: 200,
        turnId,
        lines: [line(1)],
        scene: scene({ mode: 'node' }),
      }),
    });
    await useShiftSession.getState().open('r1');
    await useShiftSession.getState().send({ kind: 'action', key: 'open_log' });
    expect(useShiftSession.getState().scene?.mode).toBe('node');
    expect(useShiftSession.getState().waitingTurn).toBeNull();
  });
});
