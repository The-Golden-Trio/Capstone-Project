import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ConfirmDialog, Dialog, Sheet } from './Dialog';

beforeAll(() => {
  // jsdom không hiện thực top layer của native dialog.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

describe('Dialog theme toon', () => {
  it('giữ tên và mô tả, nút đóng cartoon gọi onClose và khôi phục cuộn', () => {
    document.body.style.overflow = 'auto';
    const closed = vi.fn();
    function Example() {
      const [open, setOpen] = useState(true);
      return (
        <Dialog
          theme="toon"
          open={open}
          title="Sổ tay ca làm"
          description="Dữ kiện bạn đã tìm ra."
          onClose={() => {
            closed();
            setOpen(false);
          }}
        >
          Nội dung sổ tay
        </Dialog>
      );
    }
    render(<Example />);
    const dialog = screen.getByRole('dialog', { name: 'Sổ tay ca làm' });
    expect(dialog.className).toContain('theme-toon');
    expect(
      document.getElementById(dialog.getAttribute('aria-describedby') ?? '')
        ?.textContent,
    ).toBe('Dữ kiện bạn đã tìm ra.');
    expect(screen.getByText('Nội dung sổ tay')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
    const close = screen.getByRole('button', { name: 'Đóng' });
    expect(close.className).toContain('focus-visible:shadow-toon-focus');
    fireEvent.click(close);
    expect(closed).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('ConfirmDialog toon gọi đúng onConfirm và onClose, không gửi thao tác khi loading', () => {
    const confirm = vi.fn();
    const close = vi.fn();
    const props = {
      open: true,
      title: 'Nộp trước hạn?',
      theme: 'toon' as const,
      confirmLabel: 'Nộp luôn',
      cancelLabel: 'Làm thêm',
      onConfirm: confirm,
      onClose: close,
    };
    const { rerender } = render(
      <ConfirmDialog {...props} tone="danger">
        Các việc còn dở sẽ được giữ lại.
      </ConfirmDialog>,
    );
    expect(
      screen.getByRole('dialog', { name: 'Nộp trước hạn?' }).className,
    ).toContain('theme-toon');
    const submit = screen.getByRole('button', { name: 'Nộp luôn' });
    expect(submit.className).toContain('bg-toon-coral');
    fireEvent.click(submit);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Làm thêm' }));
    expect(close).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(1);
    rerender(<ConfirmDialog {...props} loading />);
    const loading = screen.getByRole('button', { name: 'Nộp luôn' });
    const cancel = screen.getByRole('button', { name: 'Làm thêm' });
    expect(loading.hasAttribute('disabled')).toBe(true);
    expect(loading.getAttribute('aria-busy')).toBe('true');
    expect(cancel.hasAttribute('disabled')).toBe(true);
    loading.click();
    cancel.click();
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
afterEach(cleanup);
describe('Dialog', () => {
  it('đồng bộ open, nhãn, nút đóng và khoá cuộn', () => {
    document.body.style.overflow = 'auto';
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Mở</button>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            title="Tiếp tục ca làm"
            description="Tiến độ sẽ được lưu."
          >
            Nội dung
          </Dialog>
        </>
      );
    }
    render(<Example />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByText('Mở'));
    const dialog = screen.getByRole('dialog', { name: 'Tiếp tục ca làm' });
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    expect(
      document.getElementById(dialog.getAttribute('aria-describedby') ?? '')
        ?.textContent,
    ).toBe('Tiến độ sẽ được lưu.');
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
  });
  it('đóng bằng cancel (Escape) và click ngoài vùng nội dung', () => {
    function Example() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button onClick={() => setOpen(true)}>Mở lại</button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Xác nhận" />
        </>
      );
    }
    render(<Example />);
    fireEvent(
      screen.getByRole('dialog'),
      new Event('cancel', { cancelable: true }),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByText('Mở lại'));
    fireEvent.click(screen.getByRole('dialog'), { clientX: -10, clientY: -10 });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('giữ khoá cuộn cho tới khi mọi modal đóng, dọn dẹp khi unmount', () => {
    document.body.style.overflow = 'scroll';
    const { rerender, unmount } = render(
      <>
        <Dialog open onClose={() => undefined} title="Một" />
        <Sheet open onClose={() => undefined} title="Hai" />
      </>,
    );
    rerender(
      <>
        <Dialog open={false} onClose={() => undefined} title="Một" />
        <Sheet open onClose={() => undefined} title="Hai" />
      </>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('scroll');
  });
});
