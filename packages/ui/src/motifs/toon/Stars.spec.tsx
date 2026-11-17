import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { InkStar, Twinkle } from './Stars';

afterEach(cleanup);
describe('Sao mực', () => {
  it('mặc định là trang trí, nhận kích thước/class và cho phép nhãn có nghĩa', () => {
    const { container, rerender } = render(
      <InkStar size={48} className="test-star" />,
    );
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(container.firstElementChild?.getAttribute('width')).toBe('48');
    expect(container.firstElementChild?.classList.contains('test-star')).toBe(
      true,
    );
    rerender(<InkStar label="Ngôi sao mới" />);
    expect(
      screen
        .getByRole('img', { name: 'Ngôi sao mới' })
        .getAttribute('focusable'),
    ).toBe('false');
  });
  it('hai biến thể có đường nét khác nhau', () => {
    const { container, rerender } = render(<InkStar />);
    const sparkle = container.querySelector('path')?.getAttribute('d');
    rerender(<InkStar variant="round5" />);
    expect(container.querySelector('path')?.getAttribute('d')).not.toBe(
      sparkle,
    );
  });
  it('nhấp nháy có media query tắt chuyển động, không cần theme cha', () => {
    const { container } = render(<Twinkle delay={1.2} />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(container.querySelector('style')?.textContent).toContain(
      'prefers-reduced-motion: reduce',
    );
    expect(container.querySelector('style')?.textContent).toContain(
      'animation: none !important',
    );
    expect(
      container.querySelector('[data-celestial-motion="twinkle"]'),
    ).not.toBeNull();
  });
});
