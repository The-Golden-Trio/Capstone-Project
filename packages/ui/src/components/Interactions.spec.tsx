import { useState } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs } from './Tabs';
import { LikeScale, type LikeValue } from './LikeScale';
import { Field, Input } from './Field';
import { Menu } from './Menu';
import { Tooltip } from './Tooltip';
import { ToastProvider, useToast } from './Toast';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe('Tabs', () => {
  it('chọn, di chuyển focus và quay vòng bằng mũi tên, Home, End', () => {
    function Example() {
      const [value, setValue] = useState('map');
      return (
        <Tabs
          idBase="explore"
          label="Khám phá"
          items={[
            { key: 'map', label: 'Bản đồ' },
            { key: 'list', label: 'Danh sách' },
            { key: 'saved', label: 'Đã lưu' },
          ]}
          value={value}
          onChange={setValue}
        />
      );
    }
    render(<Example />);
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    for (const [key, index] of [
      ['ArrowRight', 1],
      ['End', 2],
      ['ArrowRight', 0],
      ['ArrowLeft', 2],
      ['Home', 0],
    ] as const) {
      fireEvent.keyDown(document.activeElement as Element, { key });
      expect(document.activeElement).toBe(tabs[index]);
      expect(tabs[index].getAttribute('aria-selected')).toBe('true');
      expect(tabs[index].tabIndex).toBe(0);
      expect(tabs.filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
    }
    expect(tabs[0].getAttribute('aria-controls')).toBe('explore-panel-map');
  });
});
describe('LikeScale', () => {
  it('chọn bằng click, phím mũi tên và giữ focus trên mức được chọn', () => {
    function Example() {
      const [value, setValue] = useState<LikeValue | null>(null);
      return (
        <LikeScale
          label="Bạn thích công việc này tới đâu?"
          value={value}
          onChange={setValue}
        />
      );
    }
    render(<Example />);
    const radios = screen.getAllByRole('radio');
    expect(radios[1].tabIndex).toBe(0);
    fireEvent.click(radios[2]);
    expect(radios[2].getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(radios[2], { key: 'ArrowRight' });
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(radios[0]);
    fireEvent.keyDown(radios[0], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(radios[2]);
    expect(radios.filter((radio) => radio.tabIndex === 0)).toHaveLength(1);
  });
});
describe('Field', () => {
  it('giữ id và mô tả có sẵn, không trỏ tới hint bị ẩn khi có lỗi', () => {
    const { rerender } = render(
      <>
        <p id="external">Thông tin bổ sung</p>
        <Field label="Tên" hint="Tên hiển thị">
          <Input id="name" aria-describedby="external" />
        </Field>
      </>,
    );
    let input = screen.getByLabelText('Tên');
    expect(input.id).toBe('name');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(
      input
        .getAttribute('aria-describedby')
        ?.split(' ')
        .map((id) => document.getElementById(id)?.textContent),
    ).toEqual(['Thông tin bổ sung', 'Tên hiển thị']);
    rerender(
      <>
        <p id="external">Thông tin bổ sung</p>
        <Field label="Tên" hint="Tên hiển thị" error="Vui lòng nhập tên">
          <Input id="name" aria-describedby="external" />
        </Field>
      </>,
    );
    input = screen.getByLabelText('Tên');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(
      input
        .getAttribute('aria-describedby')
        ?.split(' ')
        .map((id) => document.getElementById(id)?.textContent),
    ).toEqual(['Thông tin bổ sung', 'Vui lòng nhập tên']);
  });
});
describe('Menu và Tooltip', () => {
  it('mở ở cuối, điều hướng, chọn mục và trả focus về nút mở', () => {
    const select = vi.fn();
    render(
      <Menu
        trigger={(props) => <button {...props}>Tuỳ chọn</button>}
        items={[
          { key: 'a', label: 'Lưu', onSelect: select },
          { key: 'b', label: 'Bỏ', onSelect: select },
        ]}
      />,
    );
    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    const items = screen.getAllByRole('menuitem');
    expect(document.activeElement).toBe(items[1]);
    fireEvent.keyDown(items[1], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[0]);
    fireEvent.click(items[0]);
    expect(select).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });
  it('liên kết tooltip khi focus và đóng bằng Escape', () => {
    render(
      <Tooltip content="Xem hồ sơ">
        <button>Hồ sơ</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.focus(trigger);
    expect(trigger.getAttribute('aria-describedby')).toBe(
      screen.getByRole('tooltip').id,
    );
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
it('Toast thông báo và tự đóng sau 5 giây', () => {
  vi.useFakeTimers();
  function Example() {
    const { toast } = useToast();
    return (
      <button onClick={() => toast({ title: 'Đã lưu', tone: 'success' })}>
        Lưu
      </button>
    );
  }
  render(
    <ToastProvider>
      <Example />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
  expect(screen.getByText('Đã lưu')).toBeTruthy();
  act(() => vi.advanceTimersByTime(4999));
  expect(screen.getByText('Đã lưu')).toBeTruthy();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByText('Đã lưu')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Đóng thông báo' }));
  expect(screen.queryByText('Đã lưu')).toBeNull();
});
