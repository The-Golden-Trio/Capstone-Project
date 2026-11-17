import { expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import LandingPage from './LandingPage';

it('giữ CTA đăng ký, bốn bước và thông tin bắt buộc, không gợi ý mức hợp nghề', () => {
  const { container } = renderWithProviders(<LandingPage />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
    'Thử làm một nghề trước khi chọn nghề',
  );
  expect(
    screen
      .getByRole('link', { name: 'Bắt đầu hành trình' })
      .getAttribute('href'),
  ).toBe('/register');
  expect(
    screen.getByRole('link', { name: 'Đăng nhập' }).getAttribute('href'),
  ).toBe('/sign-in');
  const steps = container.querySelectorAll('#cach-choi li');
  expect(steps).toHaveLength(4);
  steps.forEach((step) =>
    expect(step.textContent?.trim().split(/\s+/).length).toBeLessThanOrEqual(
      12,
    ),
  );
  expect(screen.getByText('Có cả mặt khó của nghề')).toBeTruthy();
  expect(container.textContent).toContain('Màn chơi do AI dẫn dắt và chấm');
  expect(container.textContent).toContain(
    'không gửi cho trường hay nhà tuyển dụng',
  );
  expect(container.textContent).not.toMatch(
    /phù hợp|hợp nhất|hợp với bạn|bạn nên|\d+\s*%/i,
  );
});
