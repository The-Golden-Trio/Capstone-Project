import { useState } from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LikeValue } from '../components/LikeScale';
import { ToonLikeScale } from './ToonLikeScale';

afterEach(cleanup);

function Example() {
  const [value, setValue] = useState<LikeValue | null>(null);
  return (
    <ToonLikeScale
      label="Bạn thích kiểm tra log tới đâu?"
      value={value}
      onChange={setValue}
    />
  );
}

describe('Thang cảm nhận cartoon', () => {
  it('có tên nhóm và ba mức rõ nghĩa, chưa chọn thì chỉ mức giữa nhận Tab', () => {
    render(<Example />);
    const group = screen.getByRole('radiogroup', {
      name: 'Bạn thích kiểm tra log tới đâu?',
    });
    const radios = within(group).getAllByRole('radio');
    expect(radios.map((r) => r.textContent)).toEqual([
      'Không thích',
      'Bình thường',
      'Thích',
    ]);
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual([
      'false',
      'false',
      'false',
    ]);
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, 0, -1]);
    expect(within(group).queryByRole('img')).toBeNull();
  });

  it('click thay câu trả lời có chọn và không submit form cha', () => {
    const submit = vi.fn();
    render(
      <form onSubmit={submit}>
        <Example />
      </form>,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Thích' }));
    expect(
      screen.getByRole('radio', { name: 'Thích' }).getAttribute('aria-checked'),
    ).toBe('true');
    fireEvent.click(screen.getByRole('radio', { name: 'Không thích' }));
    expect(
      screen
        .getByRole('radio', { name: 'Không thích' })
        .getAttribute('aria-checked'),
    ).toBe('true');
    expect(
      screen.getByRole('radio', { name: 'Thích' }).getAttribute('aria-checked'),
    ).toBe('false');
    expect(submit).not.toHaveBeenCalled();
  });

  it('mũi tên quay vòng, Home/End đổi chọn và focus; phím khác không thay đổi', () => {
    render(<Example />);
    const radios = screen.getAllByRole('radio');
    radios[1].focus();
    for (const [key, index] of [
      ['ArrowRight', 2],
      ['ArrowDown', 0],
      ['ArrowLeft', 2],
      ['ArrowUp', 1],
      ['Home', 0],
      ['End', 2],
    ] as const) {
      fireEvent.keyDown(document.activeElement as Element, { key });
      expect(document.activeElement).toBe(radios[index]);
      expect(radios[index].getAttribute('aria-checked')).toBe('true');
      expect(radios.filter((r) => r.tabIndex === 0)).toEqual([radios[index]]);
      expect(
        radios.filter((r) => r.getAttribute('aria-checked') === 'true'),
      ).toEqual([radios[index]]);
    }
    fireEvent.keyDown(radios[2], { key: 'Escape' });
    expect(radios[2].getAttribute('aria-checked')).toBe('true');
  });

  it('giá trị do caller quản lý và callback nhận đúng mức 1–3', () => {
    const change = vi.fn();
    const { rerender } = render(
      <ToonLikeScale label="Cảm nhận" value={1} onChange={change} />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Thích' }));
    expect(change).toHaveBeenCalledWith(3);
    expect(
      screen
        .getByRole('radio', { name: 'Không thích' })
        .getAttribute('aria-checked'),
    ).toBe('true');
    rerender(<ToonLikeScale label="Cảm nhận" value={3} onChange={change} />);
    expect(
      screen.getByRole('radio', { name: 'Thích' }).getAttribute('aria-checked'),
    ).toBe('true');
  });
});
