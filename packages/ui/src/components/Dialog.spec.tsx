import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Dialog, Sheet } from './Dialog';

beforeAll(() => {
  // jsdom không hiện thực top layer của native dialog.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
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
