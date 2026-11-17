import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Logo, LogoMark } from './Logo';

afterEach(cleanup);

describe('huy hiệu JobQuest', () => {
  it('đọc title khi dùng độc lập và cô lập nhãn giữa nhiều logo', () => {
    render(
      <>
        <LogoMark title="La bàn JobQuest" size={184} />
        <LogoMark title="La bàn nhóm" />
      </>,
    );
    const first = screen.getByRole('img', { name: 'La bàn JobQuest' });
    const second = screen.getByRole('img', { name: 'La bàn nhóm' });
    expect(first.getAttribute('viewBox')).toBe('0 0 200 200');
    expect(first.getAttribute('width')).toBe('184');
    expect(first.getAttribute('height')).toBe('184');
    expect(first.getAttribute('aria-labelledby')).not.toBe(
      second.getAttribute('aria-labelledby'),
    );
    expect(first.getAttribute('focusable')).toBe('false');
  });

  it('ẩn dấu trang trí khỏi trình đọc màn hình, giữ kích thước và class truyền vào', () => {
    const { container } = render(<LogoMark size={16} className="mx-auto" />);
    expect(screen.queryByRole('img')).toBeNull();
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('width')).toBe('16');
    expect(svg?.classList.contains('mx-auto')).toBe(true);
  });

  it.each(['sm', 'md', 'lg'] as const)(
    'giữ API size %s, wordmark và tagline; đổi màu khi đặt trên giấy',
    (size) => {
      const { rerender, container } = render(<Logo size={size} tagline />);
      expect(
        screen.getByText('JOBQUEST').classList.contains('text-toon-star'),
      ).toBe(true);
      expect(
        screen.getByText('TRY THE JOB BEFORE YOU PICK THE CAREER'),
      ).toBeTruthy();
      expect(container.querySelector('svg')?.getAttribute('width')).toBe(
        String({ sm: 24, md: 30, lg: 44 }[size]),
      );
      rerender(<Logo size={size} tone="paper" />);
      expect(
        screen.getByText('JOBQUEST').classList.contains('text-toon-night'),
      ).toBe(true);
      expect(
        screen.queryByText('TRY THE JOB BEFORE YOU PICK THE CAREER'),
      ).toBeNull();
    },
  );
});
