import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { AchievementSeal, PlayerSeal, SkillRadar } from './ProfileArt';
afterEach(cleanup);
it('huy hiệu có nhãn, trạng thái chưa mở có dấu hỏi và radar xử lý giá trị không hữu hạn', () => {
  const { container } = render(
    <>
      <PlayerSeal seed="sao-mai" />
      <AchievementSeal kind="kham_pha" locked label="Chuyến đi đầu" />
      <SkillRadar
        axes={[
          { key: 'a', label: 'Giao tiếp' },
          { key: 'b', label: 'Tư duy' },
          { key: 'c', label: 'Cảm xúc' },
        ]}
        values={{ a: Infinity, b: -1, c: 3 }}
      />
    </>,
  );
  expect(screen.getByRole('img', { name: 'Huy hiệu người chơi' })).toBeTruthy();
  expect(
    screen.getByRole('img', { name: 'Chuyến đi đầu' }).textContent,
  ).toContain('?');
  expect(screen.getByRole('img', { name: /Nhóm kỹ năng mềm/ })).toBeTruthy();
  expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
});
