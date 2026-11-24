import { useState } from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { shift } from '@datn/game-core';
import type { SceneView } from '../../../api/types';
import { AUTOPLAY_SCRIPTS } from '../../../api/demo/playthroughs';
import { describeStep, planOf, useAutoplay } from './useAutoplay';

afterEach(cleanup);

const script = (steps: shift.Playthrough['steps']): shift.Playthrough => ({
  name: 'thu',
  seed: 'SWE_BACKEND.L3.m2',
  title: 'Thử',
  intent: 'Thử điều khiển',
  steps: [{ do: 'start' }, ...steps],
});

const scene = (awaiting: string, extra: Partial<SceneView> = {}) =>
  ({
    mode: 'conversation',
    await: { kind: awaiting },
    clock: { time: '10:50' },
    actions: [],
    node: null,
    ...extra,
  }) as unknown as SceneView;

function Harness({
  playthrough,
  awaiting = 'conversation',
  fresh = true,
}: {
  playthrough: shift.Playthrough;
  awaiting?: string;
  fresh?: boolean;
}) {
  const [sent, setSent] = useState<string[]>([]);
  const [text, setText] = useState('');
  const autoplay = useAutoplay({
    script: playthrough,
    snapshot: {
      scene: scene(awaiting),
      settled: true,
      queued: 0,
      spoken: null,
      intro: false,
      fresh,
    },
    timeScale: 1000,
  });
  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSent((list) => [...list, text]);
          setText('');
        }}
      >
        <textarea
          id="composer"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit">Gửi</button>
      </form>
      <button onClick={autoplay.next}>Tiếp</button>
      <button onClick={autoplay.togglePlaying}>Tự chạy</button>
      <button onClick={autoplay.toggleSpeed}>Tốc độ</button>
      <output aria-label="Đã gửi">{sent.join('|')}</output>
      <output aria-label="Trạng thái">
        {autoplay.status}:{autoplay.index}/{autoplay.total}:{autoplay.speed}
      </output>
      <output aria-label="Nhãn">{autoplay.label}</output>
      <output aria-label="Giữ đồng hồ">{String(autoplay.holdsClock)}</output>
    </div>
  );
}

const sent = () => screen.getByLabelText('Đã gửi').textContent;
const status = () => screen.getByLabelText('Trạng thái').textContent;

describe('kế hoạch lượt chơi mẫu', () => {
  it('thêm bước giới thiệu ở đầu và bỏ bước start vì ca đã mở sẵn', () => {
    const plan = planOf(AUTOPLAY_SCRIPTS.lan);
    expect(plan[0]).toEqual({ do: 'intro' });
    expect(plan.some((step) => step.do === ('start' as string))).toBe(false);
    expect(plan).toHaveLength(AUTOPLAY_SCRIPTS.lan.steps.length);
  });

  it('mô tả việc sắp làm kèm giờ trong truyện', () => {
    expect(describeStep({ do: 'intro' }, scene('phase'))).toBe(
      '10:50 Giới thiệu ca',
    );
    expect(
      describeStep(
        { do: 'action', key: 'open_log' },
        scene('phase', {
          actions: [{ key: 'open_log', label: 'Mở log API' }] as never,
        }),
      ),
    ).toBe('10:50 Mở log API');
    expect(describeStep({ do: 'choose', option: 'c' }, null)).toBe(
      'Chọn phương án C',
    );
  });
});

describe('useAutoplay', () => {
  it('chế độ từng bước: mỗi lần Tiếp làm một việc, bỏ bước ifAwait không đúng chỗ', async () => {
    render(
      <Harness
        playthrough={script([
          { do: 'say', text: 'một' },
          { do: 'say', text: 'bị bỏ qua', ifAwait: 'probe_answer' },
          { do: 'say', text: 'hai' },
        ])}
      />,
    );
    expect(status()).toBe('idle:0/4:1');

    fireEvent.click(screen.getByText('Tiếp'));
    await waitFor(() => expect(sent()).toBe('một'));
    await waitFor(() => expect(status()).toBe('idle:2/4:1'));

    fireEvent.click(screen.getByText('Tiếp'));
    await waitFor(() => expect(sent()).toBe('một|hai'));
    await waitFor(() => expect(status()).toBe('done:4/4:1'));
  });

  it('chỉ chạy bước ifAwait khi cảnh đang chờ đúng loại đó', async () => {
    render(
      <Harness
        awaiting="probe_answer"
        playthrough={script([
          { do: 'say', text: 'trả lời', ifAwait: 'probe_answer' },
        ])}
      />,
    );
    fireEvent.click(screen.getByText('Tiếp'));
    await waitFor(() => expect(sent()).toBe('trả lời'));
  });

  it('gõ dần vào ô nhập rồi mới bấm gửi, không đặt nguyên câu một lần', async () => {
    render(
      <Harness playthrough={script([{ do: 'say', text: 'a'.repeat(120) }])} />,
    );
    const box = document.getElementById('composer') as HTMLTextAreaElement;
    const seen = new Set<number>();
    box.addEventListener('input', () => seen.add(box.value.length));
    fireEvent.click(screen.getByText('Tiếp'));
    await waitFor(() => expect(sent()).toBe('a'.repeat(120)), {
      timeout: 5000,
    });
    expect([...seen].some((n) => n > 0 && n < 120)).toBe(true);
  });

  it('tự chạy đi hết kịch bản, tạm dừng thì không làm thêm việc nào', async () => {
    render(
      <Harness
        playthrough={script(
          Array.from({ length: 12 }, (_, i) => ({
            do: 'say' as const,
            text: `câu ${i}`,
          })),
        )}
      />,
    );
    fireEvent.click(screen.getByText('Tự chạy'));
    await waitFor(() => expect(sent()).not.toBe(''));
    fireEvent.click(screen.getByText('Tự chạy'));
    await waitFor(() => expect(status()).toMatch(/^idle:/));
    const stopped = sent();
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(sent()).toBe(stopped);
    expect((stopped ?? '').split('|').length).toBeLessThan(12);

    fireEvent.click(screen.getByText('Tự chạy'));
    await waitFor(() => expect(status()).toMatch(/^done:/), { timeout: 8000 });
    expect((sent() ?? '').split('|')).toHaveLength(12);
  }, 15000);

  it('giữ đồng hồ chọn phương án khi chờ người trình bày, thả khi đang tự chạy', async () => {
    const held = () => screen.getByLabelText('Giữ đồng hồ').textContent;
    render(
      <Harness
        playthrough={script(
          Array.from({ length: 12 }, (_, i) => ({
            do: 'say' as const,
            text: `câu ${i}`,
          })),
        )}
      />,
    );
    expect(held()).toBe('true');
    fireEvent.click(screen.getByText('Tự chạy'));
    expect(held()).toBe('false');
    fireEvent.click(screen.getByText('Tự chạy'));
    await waitFor(() => expect(status()).toMatch(/^idle:/));
    expect(held()).toBe('true');
  });

  it('không giữ đồng hồ khi ca đã chơi dở nên lượt mẫu bị chặn', async () => {
    render(
      <Harness fresh={false} playthrough={script([{ do: 'say', text: 'x' }])} />,
    );
    await waitFor(() => expect(status()).toBe('blocked:0/2:1'));
    expect(screen.getByLabelText('Giữ đồng hồ').textContent).toBe('false');
  });

  it('đổi tốc độ giữa 1x và 2x', () => {
    render(<Harness playthrough={script([{ do: 'say', text: 'x' }])} />);
    fireEvent.click(screen.getByText('Tốc độ'));
    expect(status()).toBe('idle:0/2:2');
    fireEvent.click(screen.getByText('Tốc độ'));
    expect(status()).toBe('idle:0/2:1');
  });

  it('ca đã chơi dở thì chặn, không làm việc nào', async () => {
    render(
      <Harness
        fresh={false}
        playthrough={script([{ do: 'say', text: 'không được gửi' }])}
      />,
    );
    await waitFor(() => expect(status()).toBe('blocked:0/2:1'));
    fireEvent.click(screen.getByText('Tiếp'));
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(sent()).toBe('');
  });

  it('phím mũi tên phải chạy một việc ở chế độ từng bước', async () => {
    render(
      <Harness playthrough={script([{ do: 'say', text: 'bằng phím' }])} />,
    );
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => expect(sent()).toBe('bằng phím'));
  });
});
