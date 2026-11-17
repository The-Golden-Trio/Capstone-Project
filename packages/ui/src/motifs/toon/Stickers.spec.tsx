import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CornerStars,
  Ribbon,
  StickerBadge,
  Tape,
  WavyDivider,
} from './Stickers';

afterEach(cleanup);
describe('Sticker cartoon', () => {
  it('huy hiệu và ribbon có chữ, mặc định ẩn trợ năng; label bật ngữ nghĩa', () => {
    const { container, rerender } = render(
      <StickerBadge size={112}>KHÁM PHÁ</StickerBadge>,
    );
    expect(container.querySelector('text')?.textContent).toBe('KHÁM PHÁ');
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(container.firstElementChild?.getAttribute('width')).toBe('112');
    rerender(
      <Ribbon label="Chặng mới" className="ribbon">
        Chặng mới
      </Ribbon>,
    );
    expect(
      screen
        .getByRole('img', { name: 'Chặng mới' })
        .classList.contains('ribbon'),
    ).toBe(true);
  });
  it.each([Tape, CornerStars, WavyDivider])(
    '%s nhận size và ẩn trợ năng',
    (Motif) => {
      const { container } = render(<Motif size={120} className="ornament" />);
      expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
        'true',
      );
      expect(container.firstElementChild?.getAttribute('width')).toBe('120');
      expect(container.firstElementChild?.classList.contains('ornament')).toBe(
        true,
      );
    },
  );
  it('băng keo đổi màu, cụm sao lật được sang góc trái', () => {
    const { container, rerender } = render(<Tape tone="blue" angle={12} />);
    expect(container.querySelector('path')?.getAttribute('fill')).toBe(
      'var(--color-toon-sky)',
    );
    expect(container.querySelector('g')?.getAttribute('transform')).toBe(
      'rotate(12 64 40)',
    );
    rerender(<CornerStars corner="left" />);
    expect(container.querySelector('g')?.getAttribute('transform')).toContain(
      'scale(-1 1)',
    );
  });
});
