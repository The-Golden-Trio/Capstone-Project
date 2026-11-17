import { cleanup, render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { NightSky } from './NightSky';

afterEach(cleanup);
describe('NightSky', () => {
  it('cùng seed giữ nguyên bố cục khi render lại; khác seed đổi bố cục', () => {
    const first = renderToStaticMarkup(
      <NightSky seed="golden-trio" scene="map" />,
    );
    expect(
      renderToStaticMarkup(<NightSky seed="golden-trio" scene="map" />),
    ).toBe(first);
    expect(
      renderToStaticMarkup(<NightSky seed="other" scene="map" />),
    ).not.toBe(first);
  });
  it.each(['home', 'map', 'profile', 'plain'] as const)(
    'scene %s nhẹ và không chiếm tương tác',
    (scene) => {
      const { container } = render(
        <NightSky scene={scene} horizon className="sky" />,
      );
      const root = container.firstElementChild;
      expect(root?.getAttribute('aria-hidden')).toBe('true');
      expect(root?.classList.contains('absolute')).toBe(true);
      expect(root?.classList.contains('sky')).toBe(true);
      expect(container.querySelectorAll('[data-sky-star]').length).toBe(22);
      expect(container.querySelectorAll('*').length).toBeLessThan(180);
      expect(container.querySelector('filter')).toBeNull();
      expect(container.querySelector('linearGradient')).toBeNull();
    },
  );
  it('đường chân trời là tùy chọn, đồi và thành phố có hình khác nhau', () => {
    const { container, rerender } = render(<NightSky />);
    expect(container.querySelector('svg.absolute')).toBeNull();
    rerender(<NightSky horizon="hills" />);
    const hills = container.querySelector('svg.absolute')?.innerHTML;
    rerender(<NightSky horizon="city" />);
    expect(container.querySelector('svg.absolute')?.innerHTML).not.toBe(hills);
  });
});
