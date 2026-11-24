import { cleanup, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type { ShiftRun, TranscriptLine } from '../../../api/types';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { Stage } from '../Stage';
import { stageForm, threadLines } from './form';

const line = (
  seq: number,
  kind: TranscriptLine['kind'],
  speaker: string,
  extra: Partial<TranscriptLine> = {},
): TranscriptLine => ({
  seq,
  kind,
  speaker,
  text: `Nhịp ${seq}`,
  at: 0,
  context: 'conv:c1',
  ...extra,
});

const bots = new Set(['bot_deploy']);

it('chọn hình thức sân khấu theo kênh của nhịp', () => {
  expect(stageForm(line(1, 'npc', 'a', { channel: 'chat' }))).toBe('thread');
  expect(stageForm(line(1, 'npc', 'a', { channel: 'group' }))).toBe('thread');
  expect(stageForm(line(1, 'npc', 'a', { channel: 'call' }))).toBe('call');
  expect(stageForm(line(1, 'npc', 'a', { channel: 'meet' }))).toBe('scene');
  expect(stageForm(line(1, 'scene', '', { channel: 'chat' }))).toBe('scene');
  expect(stageForm(null)).toBe('scene');
});

it('khung tin nhắn gồm lời hai bên và tin bot, dừng ở lời dẫn cảnh', () => {
  const shown = [
    line(1, 'npc', 'a', { channel: 'chat' }),
    line(2, 'scene', ''),
    line(3, 'npc', 'a', { channel: 'chat' }),
    line(4, 'player', 'player', { channel: 'chat' }),
    line(5, 'system', 'bot_deploy'),
    line(6, 'system', 'system'),
    line(7, 'npc', 'a', { channel: 'chat' }),
  ];
  const seqs = (lines: TranscriptLine[]) => lines.map((l) => l.seq);
  expect(seqs(threadLines(shown, bots, null))).toEqual([3, 4, 5, 7]);
  expect(seqs(threadLines(shown, bots, shown[4]))).toEqual([3, 4, 7]);
});

it('hai cuộc chat liền nhau với người khác nhau không gộp một khung', () => {
  const shown = [
    line(1, 'npc', 'an', { channel: 'chat', context: 'conv:c1' }),
    line(2, 'player', 'player', { channel: 'chat', context: 'conv:c1' }),
    line(3, 'npc', 'an', { channel: 'chat', context: 'node:review' }),
    line(4, 'npc', 'linh', { channel: 'chat', context: 'conv:c2' }),
    line(5, 'player', 'player', { channel: 'chat', context: 'conv:c2' }),
    line(6, 'system', 'bot_deploy', { context: 'conv:c2' }),
    line(7, 'npc', 'linh', { channel: 'chat', context: 'conv:c2' }),
  ];
  const seqs = (lines: TranscriptLine[]) => lines.map((l) => l.seq);
  expect(seqs(threadLines(shown, bots, null))).toEqual([4, 5, 6, 7]);
  expect(seqs(threadLines(shown.slice(0, 3), bots, null))).toEqual([3]);
  expect(seqs(threadLines(shown.slice(0, 2), bots, null))).toEqual([1, 2]);
});

it('nhóm chat giữ đủ thành viên và lời người chơi', () => {
  const shown = [
    line(1, 'npc', 'an', { channel: 'group', context: 'conv:g1' }),
    line(2, 'npc', 'linh', { channel: 'group', context: 'conv:g1' }),
    line(3, 'player', 'player', { channel: 'group', context: 'conv:g1' }),
    line(4, 'npc', 'binh', { channel: 'group', context: 'conv:g1' }),
  ];
  expect(threadLines(shown, bots, null).map((l) => l.seq)).toEqual([
    1, 2, 3, 4,
  ]);
});

it('một nút trong kênh chat giữ lời dẫn, câu trả lời và phản ứng', () => {
  const shown = [
    line(1, 'npc', 'an', { channel: 'chat', context: 'conv:c1' }),
    line(2, 'npc', 'linh', { channel: 'chat', context: 'node:n1' }),
    line(3, 'player', 'player', { channel: 'chat', context: 'node:n1' }),
    line(4, 'npc', 'linh', { channel: 'chat', context: 'node:n1' }),
  ];
  expect(threadLines(shown, bots, null).map((l) => l.seq)).toEqual([2, 3, 4]);
});

const run: ShiftRun = {
  runId: 'run-1',
  taskId: 'SWE_BACKEND.L3.m2',
  title: 'Chín trăm đơn của Minh Phát',
  goal: '',
  role: '',
  scene: null,
  cast: [{ slot: 'support', name: 'chị Linh', relation: 'CS' }],
  glossary: [],
  paused: false,
  ended: false,
  occupationCode: null,
  levelNo: null,
  enrolmentId: null,
};

function renderStage(
  build: (slot: string) => Partial<React.ComponentProps<typeof Stage>>,
) {
  const slot = run.cast[0].slot;
  renderWithProviders(
    <Stage
      run={run}
      lines={[]}
      current={null}
      queued={0}
      waitingLabel={null}
      bots={[{ id: 'bot_deploy', name: 'Bot deploy' }]}
      onAdvance={vi.fn()}
      {...build(slot)}
    />,
  );
}

it('lời dẫn cảnh không có bảng tên "Cảnh"', () => {
  const scene = line(1, 'scene', '', { text: 'Bạn mở Bảng theo dõi CSDL.' });
  renderStage(() => ({ lines: [scene], current: scene }));
  expect(
    screen.getAllByText('Bạn mở Bảng theo dõi CSDL.').length,
  ).toBeGreaterThan(0);
  expect(screen.queryByText('Cảnh')).toBeNull();
});

it('chat hiện khung tin nhắn thay nhân vật đứng', () => {
  renderStage((slot) => {
    const chat = line(1, 'npc', slot, { channel: 'chat', text: 'Chào em.' });
    return { lines: [chat], current: chat };
  });
  expect(screen.getByRole('list', { name: 'Tin nhắn' })).toBeTruthy();
  expect(screen.getByLabelText('Nghe nhịp tiếp theo').id).toBe('stage-dialog');
});

it('cuộc gọi hiện màn gọi, và báo kết thúc khi hết người nói', () => {
  renderStage((slot) => {
    const call = line(1, 'npc', slot, { channel: 'call', text: 'Alo em.' });
    return {
      lines: [call],
      current: call,
      talking: { channel: 'call', slots: [slot] },
    };
  });
  expect(screen.getByText('Đang gọi')).toBeTruthy();
  expect(screen.getByLabelText('Nghe nhịp tiếp theo').id).toBe('stage-dialog');
});

it('cuộc gọi xong thì hiện trạng thái đã kết thúc', () => {
  renderStage((slot) => {
    const call = line(1, 'npc', slot, { channel: 'call', text: 'Alo em.' });
    return { lines: [call], current: call };
  });
  expect(screen.getByText('Cuộc gọi đã kết thúc')).toBeTruthy();
});

it('tin bot thành thẻ thông báo, hộp thoại giữ nhịp trò chuyện trước nó', () => {
  renderStage((slot) => {
    const npc = line(1, 'npc', slot, {
      channel: 'meet',
      text: 'Em xem giúp chị.',
    });
    const bot = line(2, 'system', 'bot_deploy', { text: 'Build #482 xong' });
    return { lines: [npc, bot], current: bot, queued: 1 };
  });
  const notice = screen.getByText('Build #482 xong').closest('[role="status"]');
  expect(notice?.textContent).toContain('Bot deploy');
  expect(screen.getByText('Em xem giúp chị.')).toBeTruthy();
});

it('nhân vật chỉ đứng trên sân khấu khi lời gần nhất là gặp trực tiếp', () => {
  const scene = line(3, 'scene', '', { text: 'Bạn nhắn anh An.' });
  const stand = (channel?: TranscriptLine['channel']) => {
    const npc = line(1, 'npc', 'support', { text: 'Chào em.', channel });
    renderStage(() => ({ lines: [npc, scene], current: scene }));
    const standing = screen.queryByRole('figure', { name: 'chị Linh' });
    cleanup();
    return !!standing;
  };
  expect(stand('meet')).toBe(true);
  expect(stand(undefined)).toBe(true);
  expect(stand('call')).toBe(false);
  expect(stand('chat')).toBe(false);
  expect(stand('group')).toBe(false);
});
