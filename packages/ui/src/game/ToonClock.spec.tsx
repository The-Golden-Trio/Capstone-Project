import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ToonClock, type ToonClockProps } from './ToonClock';

afterEach(cleanup);
const props: ToonClockProps = {
  time: '9:40',
  deadline: '12:00',
  remaining: 7,
  budget: 10,
  minutesPerPoint: 5,
};

describe('ToonClock', () => {
  it('đọc được giờ, hạn và điểm còn lại qua tên nhóm và pin', () => {
    render(<ToonClock {...props} />);
    expect(
      screen.getByRole('group', {
        name: 'Bây giờ 9:40, hạn 12:00, còn 7 điểm thời gian',
      }),
    ).toBeTruthy();
    const battery = screen.getByRole('progressbar', {
      name: 'Điểm thời gian còn lại',
    });
    expect(battery.getAttribute('aria-valuenow')).toBe('7');
    expect(battery.getAttribute('aria-valuemax')).toBe('10');
    expect(screen.getByText('còn 7/10 điểm · 1 điểm = 5 phút')).toBeTruthy();
  });

  it('vẽ đúng budget ô và phân biệt điểm đã dùng với điểm còn lại', () => {
    const { container } = render(<ToonClock {...props} />);
    expect(container.querySelectorAll('[data-clock-cell]')).toHaveLength(10);
    expect(container.querySelectorAll('[data-clock-cell="used"]')).toHaveLength(
      3,
    );
    expect(
      container.querySelectorAll('[data-clock-cell="remaining"]'),
    ).toHaveLength(7);
    expect(
      container
        .querySelector('[data-clock-cell="remaining"]')
        ?.classList.contains('bg-toon-mustard'),
    ).toBe(true);
  });

  it('đổi coral đúng ngưỡng 20%, rung một lần và không rung lại mỗi điểm thấp', () => {
    const { container, rerender } = render(
      <ToonClock {...props} remaining={3} />,
    );
    expect(screen.getByRole('group').getAttribute('data-state')).toBe('normal');
    rerender(<ToonClock {...props} remaining={2} />);
    expect(screen.getByRole('group').getAttribute('data-state')).toBe('late');
    const battery = screen.getByRole('progressbar');
    expect(battery.classList.contains('animate-toon-wiggle')).toBe(true);
    expect(battery.style.animationIterationCount).toBe('1');
    expect(battery.classList.contains('motion-reduce:animate-none')).toBe(true);
    expect(
      container
        .querySelector('[data-clock-cell="remaining"]')
        ?.classList.contains('bg-toon-coral'),
    ).toBe(true);
    expect(
      container.querySelector('svg')?.classList.contains('text-toon-coral'),
    ).toBe(true);
    rerender(<ToonClock {...props} remaining={1} />);
    expect(screen.getByRole('progressbar')).toBe(battery);
  });

  it('compact chỉ giữ mặt đồng hồ 40px và tên truy cập', () => {
    const { container } = render(<ToonClock {...props} compact />);
    expect(screen.getByRole('group').textContent).toBe('');
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('40');
    expect(screen.getByRole('group').getAttribute('aria-label')).toContain(
      'còn 7 điểm thời gian',
    );
  });

  it('đặt kim đúng 3:00 và cập nhật vị trí kim khi giờ đổi', () => {
    const { container, rerender } = render(
      <ToonClock {...props} time="3:00" />,
    );
    const hour = container.querySelector<SVGElement>(
      '[data-clock-hand="hour"]',
    );
    const minute = container.querySelector<SVGElement>(
      '[data-clock-hand="minute"]',
    );
    expect(hour?.style.transform).toBe('rotate(90deg)');
    expect(minute?.style.transform).toBe('rotate(0deg)');
    expect(container.querySelectorAll('[data-clock-tick]')).toHaveLength(12);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('56');
    rerender(<ToonClock {...props} time="3:30" />);
    expect(hour?.style.transform).toBe('rotate(105deg)');
    expect(minute?.style.transform).toBe('rotate(180deg)');
    expect(hour?.classList.contains('motion-reduce:transition-none')).toBe(
      true,
    );
  });

  it('budget lớn dùng thanh có vạch chia và không sinh hàng trăm ô', () => {
    const { container } = render(
      <ToonClock {...props} budget={100} remaining={40} />,
    );
    expect(container.querySelectorAll('[data-clock-cell]')).toHaveLength(0);
    expect(
      container.querySelector('[data-clock-battery="continuous"]'),
    ).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuemax')).toBe(
      '100',
    );
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '40',
    );
  });

  it('qua nửa đêm vẫn có cung hạn, budget rỗng không tạo giá trị NaN', () => {
    const { container, rerender } = render(
      <ToonClock {...props} time="23:40" deadline="0:20" />,
    );
    expect(container.querySelector('svg path')).toBeTruthy();
    rerender(<ToonClock {...props} budget={0} remaining={0} />);
    expect(container.querySelectorAll('[data-clock-cell]')).toHaveLength(0);
    expect(container.innerHTML).not.toContain('NaN');
    expect(screen.getByText('còn 0/0 điểm · 1 điểm = 5 phút')).toBeTruthy();
  });
});
