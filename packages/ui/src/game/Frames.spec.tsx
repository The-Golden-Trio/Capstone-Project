import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import {
  BottomNav,
  EmptyHint,
  NightCard,
  PillTabs,
  StatTile,
  TopNav,
  type CartoonNavItem,
  type CartoonRenderLink,
} from './Frames';
import { ToonButton, ToonTabPanel } from './ToonControls';

afterEach(cleanup);

const items: CartoonNavItem[] = [
  {
    key: 'galaxy',
    label: 'Bản đồ',
    href: '/galaxy',
    icon: <svg aria-label="Sao" />,
    active: true,
  },
  { key: 'bag', label: 'Hành trang', href: '/bag' },
  { key: 'profile', label: 'Chân dung', href: '/profile' },
  { key: 'settings', label: 'Tài khoản', href: '/settings' },
];

describe('Khung Celestial cartoon', () => {
  it('giữ nội dung, thuộc tính và hai tone; trang trí không có tên truy cập', () => {
    const { rerender } = render(
      <NightCard
        tape
        stars
        ribbon={<h2>Chuyến đi của bạn</h2>}
        aria-labelledby="card-title"
        data-testid="card"
      >
        <p id="card-title">Nhận nghề mới</p>
      </NightCard>,
    );
    expect(
      screen.getByRole('heading', { name: 'Chuyến đi của bạn' }),
    ).toBeTruthy();
    expect(screen.getByText('Nhận nghề mới')).toBeTruthy();
    const card = screen.getByTestId('card');
    expect(card.getAttribute('aria-labelledby')).toBe('card-title');
    expect(card.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(card.className).toContain('bg-toon-paper');
    rerender(
      <NightCard tone="night" data-testid="card">
        Bầu trời
      </NightCard>,
    );
    expect(screen.getByTestId('card').className).toContain(
      'bg-toon-night-soft',
    );
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it.each([TopNav, BottomNav])(
    'nav có nhãn, link thật, duy nhất một aria-current',
    (Nav) => {
      render(
        <Nav
          logo={<span>JobQuest</span>}
          items={items}
          label="Điều hướng thử"
        />,
      );
      const nav = screen.getByRole('navigation', { name: 'Điều hướng thử' });
      const links = within(nav).getAllByRole('link');
      expect(links).toHaveLength(4);
      expect(links[0].getAttribute('href')).toBe('/galaxy');
      expect(
        links.filter((link) => link.getAttribute('aria-current') === 'page'),
      ).toHaveLength(1);
      expect(links[0].getAttribute('aria-current')).toBe('page');
      expect(within(nav).getByRole('link', { name: 'Bản đồ' })).toBeTruthy();
      expect(within(nav).queryByRole('img', { name: 'Sao' })).toBeNull();
    },
  );

  it('renderLink nhận href, class, aria-current và children, không tạo link lồng', () => {
    const click = vi.fn();
    const renderLink: CartoonRenderLink = (props, item) => (
      <a
        {...props}
        data-key={item.key}
        onClick={(event) => {
          event.preventDefault();
          click(item.key);
        }}
      />
    );
    const { rerender } = render(
      <TopNav
        logo="JobQuest"
        right={<span>Dữ liệu mẫu</span>}
        items={items}
        renderLink={renderLink}
      />,
    );
    const link = screen.getByRole('link', { name: 'Bản đồ' });
    fireEvent.click(link);
    expect(click).toHaveBeenCalledWith('galaxy');
    expect(link.getAttribute('data-key')).toBe('galaxy');
    expect(link.className).toContain('bg-toon-star');
    expect(link.querySelector('a,button')).toBeNull();
    expect(screen.getByText('Dữ liệu mẫu')).toBeTruthy();
    rerender(
      <BottomNav
        items={items.map((item) => ({
          ...item,
          active: item.key === 'profile',
        }))}
        renderLink={renderLink}
      />,
    );
    expect(
      screen
        .getByRole('link', { name: 'Chân dung' })
        .getAttribute('aria-current'),
    ).toBe('page');
    expect(
      screen.getByRole('link', { name: 'Bản đồ' }).hasAttribute('aria-current'),
    ).toBe(false);
  });

  it('tab đổi lựa chọn/focus bằng mũi tên, Home/End và nối panel đúng id', () => {
    const tabs = [
      { key: 'one', label: 'Tổng quan' },
      { key: 'two', label: 'Kỹ năng', count: 0 },
      { key: 'three', label: 'Lộ trình' },
    ];
    function Demo() {
      const [value, setValue] = useState('one');
      return (
        <>
          <PillTabs
            items={tabs}
            value={value}
            onChange={setValue}
            label="Hồ sơ nghề"
            idBase="job"
          />
          {tabs.map((tab) => (
            <ToonTabPanel
              key={tab.key}
              idBase="job"
              tabKey={tab.key}
              active={value === tab.key}
            >
              {tab.label}
            </ToonTabPanel>
          ))}
        </>
      );
    }
    render(<Demo />);
    const list = screen.getByRole('tablist', { name: 'Hồ sơ nghề' });
    const [one, two, three] = within(list).getAllByRole('tab');
    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(three);
    fireEvent.keyDown(three, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(one);
    fireEvent.keyDown(one, { key: 'End' });
    expect(document.activeElement).toBe(three);
    fireEvent.keyDown(three, { key: 'Home' });
    expect(document.activeElement).toBe(one);
    fireEvent.keyDown(one, { key: 'ArrowRight', ctrlKey: true });
    expect(document.activeElement).toBe(one);
    fireEvent.click(two);
    expect(two.getAttribute('aria-selected')).toBe('true');
    expect(two.tabIndex).toBe(0);
    expect(one.tabIndex).toBe(-1);
    expect(two.getAttribute('aria-controls')).toBe(
      screen.getByRole('tabpanel').id,
    );
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(
      two.id,
    );
    expect(within(two).getByText('0')).toBeTruthy();
  });

  it('không mắc kẹt bàn phím khi giá trị chưa có; danh sách rỗng vẫn render', () => {
    const change = vi.fn();
    const { rerender } = render(
      <PillTabs
        items={[{ key: 'a', label: 'Một' }]}
        value="missing"
        onChange={change}
        label="Bộ lọc"
      />,
    );
    const tab = screen.getByRole('tab');
    expect(tab.tabIndex).toBe(0);
    fireEvent.keyDown(tab, { key: 'ArrowRight' });
    expect(change).toHaveBeenCalledWith('a');
    expect(document.activeElement).toBe(tab);
    rerender(<PillTabs items={[]} value="" onChange={change} label="Bộ lọc" />);
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('số liệu gắn nhãn và giữ số 0, empty hint có một action hoạt động', () => {
    const action = vi.fn();
    render(
      <>
        <StatTile value={0} label="Ca hoàn thành" icon={<svg />} />
        <EmptyHint
          illustration={<svg />}
          message="Chọn một nghề để bắt đầu."
          action={<ToonButton onClick={action}>Khám phá</ToonButton>}
        />
      </>,
    );
    expect(screen.getByText('Ca hoàn thành').tagName).toBe('DT');
    expect(screen.getByText('0').tagName).toBe('DD');
    expect(screen.getByText('Chọn một nghề để bắt đầu.')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Khám phá' }));
    expect(action).toHaveBeenCalledTimes(1);
  });
});
