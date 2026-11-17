import { cleanup, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CartoonMoon,
  CartoonPlanet,
  Cloud,
  Comet,
  Constellation,
  Orbit,
} from './Celestial';
import { regionColor } from '../../tokens';

afterEach(cleanup);
describe('Thiên thể cartoon', () => {
  it.each([CartoonMoon, CartoonPlanet, Cloud, Comet, Constellation, Orbit])(
    '%s mặc định ẩn trợ năng và nhận size/class',
    (Motif) => {
      const { container } = render(<Motif size={72} className="test-motif" />);
      expect(screen.queryByRole('img')).toBeNull();
      expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
        'true',
      );
      expect(container.firstElementChild?.getAttribute('width')).toBe('72');
      expect(
        container.firstElementChild?.classList.contains('test-motif'),
      ).toBe(true);
    },
  );
  it('hành tinh tất định theo seed, khác seed đổi chi tiết và region chọn màu token', () => {
    const first = renderToStaticMarkup(<CartoonPlanet seed="backend" />);
    expect(renderToStaticMarkup(<CartoonPlanet seed="backend" />)).toBe(first);
    expect(renderToStaticMarkup(<CartoonPlanet seed="nurse" />)).not.toBe(
      first,
    );
    expect(
      renderToStaticMarkup(<CartoonPlanet seed="backend" region="suc_khoe" />),
    ).toContain(regionColor('suc_khoe'));
  });
  it('tắt vành đai và chọn biểu cảm trăng độc lập', () => {
    const { container, rerender } = render(<CartoonPlanet ring={false} />);
    expect(container.querySelector('ellipse')).toBeNull();
    rerender(<CartoonPlanet ring />);
    expect(container.querySelector('ellipse')).not.toBeNull();
    expect(renderToStaticMarkup(<CartoonMoon face="sleep" />)).not.toBe(
      renderToStaticMarkup(<CartoonMoon face="smile" />),
    );
  });
  it('quỹ đạo có thể đứng yên và luôn tôn trọng reduced motion', () => {
    const { container, rerender } = render(<Orbit />);
    expect(
      container.querySelector('[data-celestial-motion="orbit"]'),
    ).not.toBeNull();
    expect(container.querySelector('style')?.textContent).toContain(
      'prefers-reduced-motion: reduce',
    );
    rerender(<Orbit animated={false} />);
    expect(
      container.querySelector('[data-celestial-motion="orbit"]'),
    ).toBeNull();
  });
});
