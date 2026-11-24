import { createRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../components/Field';
import {
  ToonBadge,
  ToonButton,
  ToonCheckbox,
  ToonField,
  ToonIconButton,
  ToonInput,
  ToonProgress,
  ToonTabPanel,
  ToonTabs,
  ToonTextarea,
  toonButtonClasses,
  type ToonButtonVariant,
  type ToonTone,
} from './ToonControls';

afterEach(cleanup);

describe('Nút cartoon', () => {
  it.each<ToonButtonVariant>([
    'primary',
    'secondary',
    'danger',
    'ghost',
    'mint',
  ])('hiện variant %s, giữ icon và mặc định không submit form', (variant) => {
    const onClick = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <ToonButton
          variant={variant}
          onClick={onClick}
          leftIcon={<span>Trái</span>}
          rightIcon={<span>Phải</span>}
        >
          Nhận ca
        </ToonButton>
      </form>,
    );
    const button = screen.getByRole('button', { name: 'Nhận ca' });
    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(button.className).toContain(
      variant === 'ghost' ? 'border-0' : 'border-[3px]',
    );
    expect(screen.getByText('Trái')).toBeTruthy();
    expect(screen.getByText('Phải')).toBeTruthy();
  });

  it('nút disabled và loading không gửi thêm, loading có nhãn và ẩn icon', () => {
    const click = vi.fn();
    const { rerender } = render(
      <ToonButton disabled onClick={click}>
        Gửi
      </ToonButton>,
    );
    screen.getByRole('button').click();
    expect(click).not.toHaveBeenCalled();
    rerender(
      <ToonButton
        loading
        loadingText="Đang gửi…"
        onClick={click}
        leftIcon={<span>Trái</span>}
        rightIcon={<span>Phải</span>}
      >
        Gửi
      </ToonButton>,
    );
    const button = screen.getByRole('button', { name: 'Đang gửi…' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(screen.queryByText('Trái')).toBeNull();
    expect(screen.queryByText('Phải')).toBeNull();
    button.click();
    expect(click).not.toHaveBeenCalled();
  });

  it('truyền ref, size và class cho button và Link', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ToonButton ref={ref} block size="lg">
        Vào ca
      </ToonButton>,
    );
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(ref.current?.className).toContain('min-h-13');
    expect(ref.current?.className).toContain('w-full');
    render(
      <a
        href="#ca"
        className={toonButtonClasses({ size: 'sm', className: 'mt-2' })}
      >
        Mở ca
      </a>,
    );
    const link = screen.getByRole('link');
    expect(link.className).toContain('min-h-9');
    expect(link.className).toContain('mt-2');
    expect(link.className).toContain('hover:-translate-y-px');
  });

  it('icon button có tên truy cập, cỡ 44px và cỡ nhỏ 36px', () => {
    const { rerender } = render(
      <ToonIconButton label="Mở sổ tay" icon={<svg />} />,
    );
    expect(
      screen.getByRole('button', { name: 'Mở sổ tay' }).className,
    ).toContain('size-11');
    rerender(
      <ToonIconButton label="Mở sổ tay" icon={<svg />} size="sm" disabled />,
    );
    const button = screen.getByRole('button', { name: 'Mở sổ tay' });
    expect(button.className).toContain('size-9');
    expect(button.hasAttribute('disabled')).toBe(true);
  });
});

describe('Ô nhập và nhãn cartoon', () => {
  it('tương thích Field hiện hành, kể cả input có icon', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Field label="Tên" hint="Tên hiển thị">
        <ToonInput leftIcon={<svg />} ref={ref} />
      </Field>,
    );
    const input = screen.getByLabelText('Tên');
    expect(ref.current).toBe(input);
    const hint = input.getAttribute('aria-describedby');
    expect(hint).toBeTruthy();
    expect(document.getElementById(hint ?? '')?.textContent).toBe(
      'Tên hiển thị',
    );
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('giữ id và mô tả ngoài, đổi hint sang lỗi mà không để aria trỏ tới phần tử mất', () => {
    const { rerender } = render(
      <>
        <p id="external">Mô tả ngoài</p>
        <ToonField label="Ghi chú" hint="Ghi lại dữ kiện" counter="0/500">
          <ToonTextarea id="note" aria-describedby="external" />
        </ToonField>
      </>,
    );
    let input = screen.getByLabelText('Ghi chú');
    expect(input.id).toBe('note');
    expect(input.getAttribute('aria-describedby')).toBe('external note-hint');
    expect(screen.getByText('0/500')).toBeTruthy();
    rerender(
      <>
        <p id="external">Mô tả ngoài</p>
        <ToonField
          label="Ghi chú"
          hint="Ghi lại dữ kiện"
          error="Chưa có nội dung"
        >
          <ToonTextarea id="note" aria-describedby="external" />
        </ToonField>
      </>,
    );
    input = screen.getByLabelText('Ghi chú');
    expect(input.getAttribute('aria-describedby')).toBe('external note-error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.className).toContain('border-toon-coral');
    expect(screen.getByRole('alert').textContent).toBe('Chưa có nội dung');
    expect(document.getElementById('note-hint')).toBeNull();
  });

  it('nối nhãn tự sinh với input native và giữ invalid được caller chỉ định', () => {
    render(
      <>
        <ToonField label="Email">
          <input aria-invalid />
        </ToonField>
        <ToonInput aria-label="Tìm" invalid />
        <ToonTextarea aria-label="Nháp" invalid />
      </>,
    );
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(
      screen.getByRole('textbox', { name: 'Tìm' }).getAttribute('aria-invalid'),
    ).toBe('true');
    expect(
      screen
        .getByRole('textbox', { name: 'Nháp' })
        .getAttribute('aria-invalid'),
    ).toBe('true');
  });

  it('ô nhập 16px dưới sm để iOS không phóng to trang khi focus, kể cả compact', () => {
    render(
      <>
        <ToonInput aria-label="Thường" />
        <ToonInput aria-label="Gọn" compact />
        <ToonTextarea aria-label="Dài" />
      </>,
    );
    for (const name of ['Thường', 'Gọn', 'Dài']) {
      const classes = screen.getByRole('textbox', { name }).className.split(' ');
      expect(classes).toContain('text-base');
      expect(classes.some((c) => /^text-(sm|\[1[0-5]px\])$/.test(c))).toBe(
        false,
      );
    }
    expect(screen.getByRole('textbox', { name: 'Gọn' }).className).toContain(
      'sm:text-sm',
    );
    expect(screen.getByRole('textbox', { name: 'Dài' }).className).toContain(
      'sm:text-[15px]',
    );
  });

  it('checkbox controlled đổi trạng thái, có mô tả và tôn trọng disabled', () => {
    const changed = vi.fn();
    function Example({ disabled = false }: { disabled?: boolean }) {
      const [checked, setChecked] = useState(false);
      return (
        <ToonCheckbox
          label="Đã đọc"
          description="Quy định nơi làm"
          checked={checked}
          disabled={disabled}
          onChange={(e) => {
            setChecked(e.target.checked);
            changed(e.target.checked);
          }}
        />
      );
    }
    const { rerender } = render(<Example />);
    const checkbox = screen.getByRole('checkbox', {
      name: 'Đã đọc',
    }) as HTMLInputElement;
    const description = checkbox.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(description)?.textContent).toBe(
      'Quy định nơi làm',
    );
    fireEvent.click(screen.getByText('Đã đọc'));
    expect(checkbox.checked).toBe(true);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(changed.mock.calls.map(([value]) => value)).toEqual([true, false]);
    rerender(<Example disabled />);
    checkbox.click();
    expect(changed).toHaveBeenCalledTimes(2);
  });
});

describe('Tab hồ sơ giấy', () => {
  function Example() {
    const [value, setValue] = useState('facts');
    return (
      <>
        <ToonTabs
          idBase="notebook"
          label="Sổ tay"
          items={[
            { key: 'facts', label: 'Dữ kiện', count: 0 },
            { key: 'notes', label: 'Ghi chú', icon: <svg /> },
            { key: 'people', label: 'Đồng nghiệp' },
          ]}
          value={value}
          onChange={setValue}
        />
        {['facts', 'notes', 'people'].map((key) => (
          <ToonTabPanel
            key={key}
            idBase="notebook"
            tabKey={key}
            active={value === key}
          >
            Nội dung {key}
          </ToonTabPanel>
        ))}
      </>
    );
  }

  it('click chọn đúng panel, ARIA nối hai chiều, tablist được xuống dòng', () => {
    render(<Example />);
    expect(screen.getByRole('tablist', { name: 'Sổ tay' }).className).toContain(
      'flex-wrap',
    );
    expect(screen.getByText('0')).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Ghi chú' }));
    const panel = screen.getByRole('tabpanel', { name: 'Ghi chú' });
    const tab = screen.getByRole('tab', { name: 'Ghi chú' });
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    expect(screen.queryByText('Nội dung facts')).toBeNull();
    expect(panel.className).toContain('focus-visible:shadow-toon-focus');
  });

  it('mũi tên, Home/End đổi chọn và focus, chỉ tab đang chọn có tabindex 0', () => {
    render(<Example />);
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    for (const [key, index] of [
      ['ArrowLeft', 2],
      ['ArrowRight', 0],
      ['ArrowRight', 1],
      ['End', 2],
      ['Home', 0],
    ] as const) {
      fireEvent.keyDown(document.activeElement as Element, { key });
      expect(document.activeElement).toBe(tabs[index]);
      expect(tabs[index].getAttribute('aria-selected')).toBe('true');
      expect(tabs.filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
    }
  });
});

describe('Nhãn và tiến độ cartoon', () => {
  it.each<ToonTone>([
    'paper',
    'mustard',
    'mint',
    'coral',
    'sky',
    'maroon',
    'olive',
  ])('hiện nhãn tone %s', (tone) => {
    render(
      <ToonBadge tone={tone} icon={<svg />}>
        Đang làm
      </ToonBadge>,
    );
    expect(screen.getByText('Đang làm').className).toContain(`bg-toon-${tone}`);
  });

  it.each([
    { value: 25, max: 50, expected: '25', width: '50%' },
    { value: 75, max: 50, expected: '50', width: '100%' },
    { value: -2, max: 50, expected: '0', width: '0%' },
    { value: NaN, max: 50, expected: '0', width: '0%' },
    { value: 25, max: 0, expected: '25', width: '25%' },
    { value: 25, max: Infinity, expected: '25', width: '25%' },
  ])(
    'giữ tiến độ hợp lệ với value=$value, max=$max',
    ({ value, max, expected, width }) => {
      render(
        <ToonProgress
          value={value}
          max={max}
          label="Ca hoàn thành"
          showValue
          tone="mint"
        />,
      );
      const progress = screen.getByRole('progressbar', {
        name: 'Ca hoàn thành',
      });
      expect(progress.getAttribute('aria-valuenow')).toBe(expected);
      expect((progress.firstElementChild as HTMLElement).style.width).toBe(
        width,
      );
      expect(progress.getAttribute('aria-valuemax')).toBe(
        max > 0 && Number.isFinite(max) ? String(max) : '100',
      );
    },
  );
});
