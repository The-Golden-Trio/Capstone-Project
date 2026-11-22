import { renderWithProviders } from '../../test/renderWithProviders';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { assert, expect, it, vi } from 'vitest';
import { ArtefactForm } from './ArtefactForm';
import { Composer } from './Composer';
import { Notebook } from './Notebook';
import { Hud } from './Hud';
import { api } from '../../api';
import { signInDemo } from '../../test/renderWithProviders';
import type { SceneView } from '../../api/types';

const form = {
  id: 'patch',
  title: 'Bản vá',
  fields: [
    { id: 'why', label: 'Nguyên nhân', multiline: true },
    { id: 'how', label: 'Hướng xử lý', multiline: true },
  ],
  ticks: [],
  selects: [],
};

it('biểu mẫu trống báo một lỗi, focus đúng ô và vẫn cho gửi khi có một phần', () => {
  const onSubmit = vi.fn();
  renderWithProviders(
    <ArtefactForm
      form={form}
      submitLabel="Gửi bản vá"
      busy={false}
      onSubmit={onSubmit}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /^Gửi bản vá$/ }));
  const input = screen.getByRole('textbox', { name: /^Nguyên nhân$/ });
  expect(screen.getAllByRole('alert')).toHaveLength(1);
  expect(document.activeElement).toBe(input);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(onSubmit).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: '  Truy vấn N+1  ' } });
  fireEvent.click(screen.getByRole('button', { name: /^Gửi bản vá$/ }));
  expect(onSubmit).toHaveBeenCalledWith({ why: 'Truy vấn N+1', how: '' }, []);
  expect(screen.queryByRole('alert')).toBeNull();
});

it('không gửi lặp hoặc sửa bản nháp lúc biểu mẫu đang gửi', () => {
  const send = vi.fn();
  const { container } = renderWithProviders(
    <ArtefactForm form={form} submitLabel="Gửi" busy onSubmit={send} />,
  );
  expect(
    screen
      .getByRole('textbox', { name: /^Nguyên nhân$/ })
      .hasAttribute('readonly'),
  ).toBe(true);
  const element = container.querySelector('form');
  assert(element);
  fireEvent.submit(element);
  expect(send).not.toHaveBeenCalled();
});

it('sổ tay báo không tìm thấy, tìm không dấu được và trả focus khi đóng tìm kiếm', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const scene = await api.play.scene(run.runId);
  const lines = [
    {
      seq: 1,
      kind: 'npc' as const,
      speaker: run.cast[0].slot,
      text: 'Cần kiểm tra nguyên nhân API chậm.',
      at: 0,
      context: 'node:test',
    },
  ];
  renderWithProviders(
    <Notebook run={run} scene={scene} lines={lines} onOpenDocument={vi.fn()} />,
  );
  fireEvent.click(screen.getByRole('button', { name: /^Tìm lời thoại$/ }));
  const search = screen.getByRole('textbox', { name: /Tìm trong lời thoại/ });
  fireEvent.change(search, { target: { value: 'z' } });
  expect(screen.getByText(/Nhập ít nhất 2 ký tự/).textContent).toContain(
    'ít nhất 2',
  );
  fireEvent.change(search, { target: { value: 'khong-co' } });
  expect(screen.getByText(/Không tìm thấy lời thoại/).textContent).toContain(
    'Không tìm thấy',
  );
  expect(screen.queryByRole('tablist')).toBeNull();
  fireEvent.change(search, { target: { value: 'nguyen nhan' } });
  expect(screen.getByText(/1 lời thoại khớp/).textContent).toContain(
    '1 lời thoại',
  );
  expect(screen.getByText(lines[0].text)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /^Đóng tìm kiếm$/ }));
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /^Tìm lời thoại$/ }),
    ),
  );
  expect(screen.getByRole('tablist', { name: /Sổ tay/ })).toBeTruthy();
});

it('mục tiêu mobile mở được nguyên văn và nhãn AI vẫn hiện', () => {
  const goal = 'Tìm ra vì sao API chậm và báo anh An hướng xử lý trước 12:00.';
  renderWithProviders(
    <Hud
      title="Ca mẫu"
      goal={goal}
      scene={null}
      backTo="/galaxy"
      onNotebook={vi.fn()}
      notebookCount={0}
      onHint={vi.fn()}
      hintDisabled={false}
      aiLabel="AI giả (bản xem thử)"
    />,
  );
  const summary = screen.getByLabelText('Mục tiêu ca làm');
  expect(summary.closest('details')?.open).toBe(false);
  fireEvent.click(summary);
  // jsdom does not implement native details toggling, but the full text is present inside the expandable region.
  expect(summary.closest('details')?.querySelector('p')?.textContent).toBe(
    goal,
  );
  expect(screen.getAllByText(/AI giả/).length).toBeGreaterThan(0);
});

it('hết giờ gửi lỗi không tự spam và có thể gửi lại lượt timeout', async () => {
  vi.useFakeTimers();
  const send = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
  const scene = {
    mode: 'node',
    await: { kind: 'node_choice' },
    node: {
      id: 'timer',
      prompt: 'Chọn cách trả lời',
      timeLimitSeconds: 1,
      options: [{ key: 'a', text: 'Phương án A' }],
    },
  } as SceneView;
  renderWithProviders(
    <Composer
      scene={scene}
      busy={false}
      locked={false}
      onSend={send}
      onPickAction={vi.fn()}
      onOpenNode={vi.fn()}
    />,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith({ kind: 'timeout' });
  expect(screen.getByRole('alert').textContent).toContain('Chưa ghi nhận');
  expect(
    screen
      .getByRole('button', { name: /Phương án A/ })
      .hasAttribute('disabled'),
  ).toBe(true);
  await act(async () =>
    fireEvent.click(
      screen.getByRole('button', { name: /Gửi lại lượt hết giờ/ }),
    ),
  );
  expect(send).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('alert')).toBeNull();
});

it('xác nhận gửi báo kết ca và cho huỷ để làm tiếp', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const original = await api.play.scene(run.runId);
  const send = vi.fn().mockResolvedValue(true);
  renderWithProviders(
    <Composer
      scene={{
        ...original,
        mode: 'confirm_end',
      }}
      busy={false}
      locked={false}
      onSend={send}
      onPickAction={vi.fn()}
      onOpenNode={vi.fn()}
    />,
  );
  expect(screen.getByText(/Gửi xong thì ca này kết thúc/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /^Làm thêm$/ }));
  expect(send).toHaveBeenCalledWith({ kind: 'cancel_end' });
  fireEvent.click(screen.getByRole('button', { name: /^Gửi$/ }));
  expect(send).toHaveBeenCalledWith({ kind: 'confirm_end' });
});

it('cho gửi lời nhắn cuối ca hoặc bỏ qua từ khung trả lời', async () => {
  const send = vi.fn().mockResolvedValue(true);
  const prompt = 'Nhắn chị Linh trước khi kết ca?';
  const scene = {
    mode: 'node',
    await: { kind: 'last_word', to: 'support', prompt },
    node: null,
  } as SceneView;
  renderWithProviders(
    <Composer
      scene={scene}
      busy={false}
      locked={false}
      onSend={send}
      onPickAction={vi.fn()}
      onOpenNode={vi.fn()}
    />,
  );
  const text = 'Chị ơi, anh An duyệt rồi ạ.';
  fireEvent.change(screen.getByRole('textbox', { name: prompt }), {
    target: { value: text },
  });
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' })),
  );
  expect(send).toHaveBeenNthCalledWith(1, { kind: 'say', text });
  fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }));
  expect(send).toHaveBeenNthCalledWith(2, { kind: 'end_conversation' });
});

it('không hủy xác nhận kết ca bằng Escape hoặc nút đóng khi đang gửi', () => {
  const send = vi.fn().mockResolvedValue(true);
  renderWithProviders(
    <Composer
      scene={
        {
          mode: 'confirm_end',
          await: { kind: 'confirm_end', node: 'n3' },
          node: null,
        } as SceneView
      }
      busy
      locked={false}
      onSend={send}
      onPickAction={vi.fn()}
      onOpenNode={vi.fn()}
    />,
  );
  fireEvent(
    screen.getByRole('dialog'),
    new Event('cancel', { cancelable: true }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
  expect(send).not.toHaveBeenCalled();
});
