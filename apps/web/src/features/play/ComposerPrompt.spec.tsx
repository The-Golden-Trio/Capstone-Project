import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { SceneView } from '../../api/types';
import { Composer } from './Composer';

afterEach(cleanup);

const QUESTION = 'Em nói chị nghe, trưa xong được hông em?';

const scene = (format: string, awaiting = 'node_reply') =>
  ({
    mode: 'node',
    await: { kind: awaiting },
    node: { id: 'call', format, prompt: QUESTION, options: [] },
  }) as unknown as SceneView;

const renderComposer = (view: SceneView, spoken: string | null) =>
  render(
    <Composer
      scene={view}
      busy={false}
      locked={false}
      onSend={vi.fn()}
      onOpenNode={vi.fn()}
      spoken={spoken}
    />,
  );

it('lượt nói thêm sau nút chọn không nhắc lại câu hỏi của nút đó', () => {
  renderComposer(scene('timed_choice'), 'Thôi chị nói khách là bên kỹ thuật.');
  expect(screen.queryByText(QUESTION)).toBeNull();
  expect(screen.getByPlaceholderText('Bạn trả lời thế nào?')).toBeTruthy();
});

it('nút trả lời tự do hiện câu hỏi, trừ khi hộp thoại vừa nói đúng câu đó', () => {
  const view = scene('free_reply');
  renderComposer(view, 'Một câu khác.');
  expect(screen.getAllByText(QUESTION).some((el) => el.tagName === 'P')).toBe(
    true,
  );
  cleanup();
  renderComposer(view, ` ${QUESTION.toUpperCase()} `);
  expect(screen.queryByText(QUESTION)).toBeNull();
});
