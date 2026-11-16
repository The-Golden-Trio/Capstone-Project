import { fireEvent, render } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import catalogue from '../../api/demo/fixtures/catalogue.json';
import type { Catalogue } from '../../api/types';
import { GalaxyMap, pickLabels } from './GalaxyMap';
import { layoutGalaxy } from './layout';

const layout = layoutGalaxy(catalogue as unknown as Catalogue);

beforeAll(() => {
  // jsdom chưa có pointer capture; trình duyệt thật đổi target của pointerup về svg.
  Object.assign(SVGElement.prototype, {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
  });
  globalThis.ResizeObserver ??= class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

describe('bản đồ ngân hà', () => {
  it('chạm một hành tinh rồi nhả trên svg (pointer capture) vẫn chọn đúng nghề', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <GalaxyMap
        layout={layout}
        selected={null}
        onSelect={onSelect}
        highlight={null}
        suggested={new Set()}
      />,
    );
    const svg = container.querySelector('svg')!;
    const planet = container.querySelector('[data-code="SWE_BACKEND"] circle')!;
    fireEvent.pointerDown(planet, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(svg, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(onSelect).toHaveBeenLastCalledWith('SWE_BACKEND');

    fireEvent.pointerDown(svg, { pointerId: 2, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(svg, { pointerId: 2, clientX: 10, clientY: 10 });
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it('nhãn không chồng nhau và không nằm đè lên hành tinh khác', () => {
    const shown = pickLabels(
      layout.occupations,
      'near',
      'SWE_BACKEND',
      null,
      new Set(),
    );
    expect(shown.has('SWE_BACKEND')).toBe(true);
    expect(shown.size).toBeGreaterThan(20);
    expect(shown.size).toBeLessThan(layout.occupations.length);
  });
});
