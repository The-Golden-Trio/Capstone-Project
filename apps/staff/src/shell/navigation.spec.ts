import { describe, expect, it } from 'vitest';
import { breadcrumbLabel } from './navigation';

describe('breadcrumbLabel', () => {
  it('dùng nhãn màn hình thay cho UUID', () => {
    expect(breadcrumbLabel('/ca/occupations/abc-123/review-criteria')).toBe(
      'Tiêu chí duyệt',
    );
    expect(breadcrumbLabel('/de/scenarios/abc-123/author')).toBe(
      'Soạn scenario',
    );
    expect(breadcrumbLabel('/ca/scenarios/abc-123/gamify')).toBe(
      'Thiết kế trình bày',
    );
  });
  it('phân biệt các vùng trong dashboard và route portal', () => {
    expect(breadcrumbLabel('/de', '#review-queue')).toBe('Hàng duyệt');
    expect(breadcrumbLabel('/ca', '#catalogue')).toBe('Danh mục nghề');
    expect(breadcrumbLabel('/ca/catalogue')).toBe('Danh mục nghề');
    expect(breadcrumbLabel('/ca/catalogue/imports/import-123')).toBe(
      'Chi tiết nhập dữ liệu',
    );
    expect(breadcrumbLabel('/de')).toBe('Việc của tôi');
    expect(breadcrumbLabel('/ca')).toBe('Tổng quan');
  });
});
