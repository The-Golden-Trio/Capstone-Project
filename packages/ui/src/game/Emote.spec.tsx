import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EXPRESSIONS, EXPRESSION_LABELS } from '../tokens';
import { Emote, EXPRESSION_MOTION } from './Emote';

afterEach(cleanup);

describe('Emote', () => {
  it.each(EXPRESSIONS)(
    'biểu cảm %s có nhãn đúng hoặc không chiếm chỗ khi bình thường',
    (expression) => {
      const { container } = render(<Emote expression={expression} />);
      if (expression === 'binh_thuong') {
        expect(container.childElementCount).toBe(0);
        expect(screen.queryByRole('img')).toBeNull();
        return;
      }
      const svg = screen.getByRole('img', {
        name: EXPRESSION_LABELS[expression],
      });
      expect(svg.getAttribute('width')).toBe('56');
      expect(svg.getAttribute('height')).toBe('56');
      expect(svg.getAttribute('focusable')).toBe('false');
    },
  );

  it('đổi từ bình thường sang biểu cảm, nhận kích thước và class đặt cạnh nhân vật', () => {
    const { rerender, container } = render(<Emote expression="binh_thuong" />);
    rerender(
      <Emote
        expression="lo_lang"
        size={40}
        className="absolute right-0 top-0"
      />,
    );
    const svg = screen.getByRole('img', { name: 'Lo lắng' });
    expect(svg.getAttribute('width')).toBe('40');
    expect(svg.getAttribute('height')).toBe('40');
    expect(svg.classList.contains('absolute')).toBe(true);
    expect(svg.classList.contains('animate-toon-pop')).toBe(true);
    rerender(<Emote expression="binh_thuong" />);
    expect(container.childElementCount).toBe(0);
  });

  it('cô lập keyframe giữa các instance và tắt cả pop lẫn cử động SVG khi giảm chuyển động', () => {
    render(
      <>
        <Emote expression="vui" />
        <Emote expression="vui" />
      </>,
    );
    const [first, second] = screen.getAllByRole('img', { name: 'Vui' });
    const firstId = first.getAttribute('data-emote');
    const secondId = second.getAttribute('data-emote');
    expect(firstId).not.toBe(secondId);
    for (const svg of [first, second]) {
      const id = svg.getAttribute('data-emote');
      const css = svg.querySelector('style')?.textContent ?? '';
      expect(css).toContain(`@keyframes ${id}-gesture`);
      expect(css).toContain(`[data-emote="${id}"]`);
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
      expect(css).toContain('animation: none !important');
    }
    expect(first.querySelector('style')?.textContent).not.toContain(
      `${secondId}-gesture`,
    );
  });

  it('ba chấm suy nghĩ có độ trễ lần lượt để không nhấp nháy đồng thời', () => {
    const { container } = render(<Emote expression="suy_nghi" />);
    const dots = Array.from(
      container.querySelectorAll<SVGCircleElement>('.emote-dot'),
    );
    expect(dots.map((dot) => dot.style.animationDelay)).toEqual([
      '0s',
      '0.18s',
      '0.36s',
    ]);
  });

  it('ánh xạ chuyển động thân cho đủ tám biểu cảm, giữ yên khi lo lắng hoặc buồn', () => {
    expect(EXPRESSION_MOTION).toEqual({
      binh_thuong: 'none',
      vui: 'hop',
      cuoi_lon: 'hop',
      ngac_nhien: 'hop',
      suy_nghi: 'bob',
      lo_lang: 'none',
      kho_chiu: 'shake',
      buon: 'none',
    });
  });
});
