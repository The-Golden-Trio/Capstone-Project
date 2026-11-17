import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Planet } from './Planet';
import { Portrait } from './Portrait';
import { EXPRESSIONS, EXPRESSION_LABELS } from '../tokens';
describe('Tranh có seed', () => {
  it('Planet sinh cùng markup với cùng seed, khác hình khi đổi seed', () => {
    const draw = (seed: string) =>
      renderToStaticMarkup(
        <Planet seed={seed} color="#72c5f2" label="Back-end" />,
      );
    expect(draw('SWE_BACKEND')).toBe(draw('SWE_BACKEND'));
    expect(draw('SWE_BACKEND')).not.toBe(draw('SWE_FRONTEND'));
  });
  it('bỏ chi tiết nhỏ ở 14px và có trạng thái khoá đọc được', () => {
    const tiny = renderToStaticMarkup(
      <Planet
        seed="SWE_BACKEND"
        color="#72c5f2"
        size={14}
        status="locked"
        label="Back-end"
      />,
    );
    expect(tiny).toContain('Chưa mở khoá');
    expect(tiny).not.toContain('clip-path=');
  });
  it('NPC có đúng tám biểu cảm khác nhau với nhãn tiếng Việt', () => {
    const markup = EXPRESSIONS.map((expression) =>
      renderToStaticMarkup(
        <Portrait seed="Minh" name="Minh" expression={expression} />,
      ),
    );
    expect(new Set(markup).size).toBe(8);
    EXPRESSIONS.forEach((expression, i) =>
      expect(markup[i]).toContain(EXPRESSION_LABELS[expression]),
    );
  });
});
