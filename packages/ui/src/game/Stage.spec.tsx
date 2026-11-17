import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Emote } from './Emote';
import { EXPRESSION_LABELS } from '../tokens';
import {
  CaptionStrip,
  Character,
  DialogueBox,
  NameTag,
  SceneBackdrop,
  SpeechBubble,
  ToonPanel,
} from './Stage';

afterEach(cleanup);

describe('Bối cảnh và nhân vật trên sân khấu', () => {
  it('giữ ảnh, vị trí và nội dung; ảnh có thể là trang trí khi alt rỗng', () => {
    const { container, rerender } = render(
      <SceneBackdrop
        src="/office.png"
        alt="Văn phòng nhóm Back-end"
        focus="25% center"
        dim={0.4}
      >
        <h1>Ca làm buổi sáng</h1>
      </SceneBackdrop>,
    );
    const image = screen.getByRole('img', {
      name: 'Văn phòng nhóm Back-end',
    }) as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('/office.png');
    expect(image.draggable).toBe(false);
    expect(image.style.objectPosition).toBe('25% center');
    expect(
      screen.getByRole('heading', { name: 'Ca làm buổi sáng' }),
    ).toBeTruthy();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    rerender(
      <SceneBackdrop src="/meeting.png" overlay>
        Đang họp nhóm
      </SceneBackdrop>,
    );
    expect(container.firstElementChild?.className).toContain(
      'absolute inset-0',
    );
    expect(container.firstElementChild?.className).not.toContain('relative');
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByText('Đang họp nhóm')).toBeTruthy();
  });

  it('đọc tên qua figure, giữ ảnh trang trí và emote có tên riêng khi dimmed', () => {
    const { rerender } = render(
      <Character
        src="/linh.png"
        name="Linh"
        height="45vh"
        flip
        motion="hop"
        beat={1}
        emote={<Emote expression="vui" />}
      />,
    );
    let character = screen.getByRole('figure', { name: 'Linh' });
    expect(character.style.height).toBe('45vh');
    const image = character.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/linh.png');
    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.style.transform).toBe('scaleX(-1)');
    expect(character.firstElementChild?.className).toContain(
      'animate-toon-hop',
    );
    expect(
      within(character).getByRole('img', { name: EXPRESSION_LABELS.vui }),
    ).toBeTruthy();
    rerender(
      <Character
        src="/linh.png"
        name="Linh"
        dimmed
        motion="hop"
        beat={2}
        emote={<Emote expression="lo_lang" />}
      />,
    );
    character = screen.getByRole('figure', { name: 'Linh' });
    expect(character.className).toContain('brightness-[0.8]');
    expect(character.firstElementChild?.className).not.toContain(
      'animate-toon-hop',
    );
    expect(
      within(character).getByRole('img', { name: EXPRESSION_LABELS.lo_lang }),
    ).toBeTruthy();
    expect(
      within(character).queryByRole('img', { name: EXPRESSION_LABELS.vui }),
    ).toBeNull();
  });

  it('chạy lại chuyển động một lần khi beat đổi, không bắt buộc có emote', () => {
    const { rerender } = render(
      <Character src="/ha.png" name="Hà" motion="shake" beat="one" />,
    );
    const firstBeat = screen.getByRole('figure').firstElementChild;
    rerender(<Character src="/ha.png" name="Hà" motion="shake" beat="two" />);
    expect(screen.getByRole('figure').firstElementChild).not.toBe(firstBeat);
    expect(screen.queryByRole('img')).toBeNull();
    rerender(<Character src="/ha.png" name="Hà" motion="none" />);
    expect(screen.getByRole('figure').firstElementChild?.className).not.toMatch(
      /animate-toon-/,
    );
  });
});

describe('Các khung thoại cartoon', () => {
  it('bảng tên giữ vai và màu người nói, có thể bỏ vai', () => {
    const { rerender } = render(
      <NameTag name="Hà" role="Người hướng dẫn" color="#a8dbb9" />,
    );
    expect(screen.getByText('Hà').parentElement?.style.backgroundColor).toBe(
      'rgb(168, 219, 185)',
    );
    expect(screen.getByText('Người hướng dẫn')).toBeTruthy();
    rerender(<NameTag name="Linh" />);
    expect(screen.getByText('Linh')).toBeTruthy();
    expect(screen.queryByText('Người hướng dẫn')).toBeNull();
  });

  it('hộp thoại giữ bảng tên/kênh và chỉ hiện mũi tên trang trí khi còn nhịp', () => {
    const { container, rerender } = render(
      <DialogueBox
        tag={<NameTag name="Linh" />}
        meta={<span>Cuộc gọi</span>}
        more
      >
        Em kiểm tra log trước nhé.
      </DialogueBox>,
    );
    expect(screen.getByText('Linh')).toBeTruthy();
    expect(screen.getByText('Cuộc gọi')).toBeTruthy();
    expect(screen.getByText('Em kiểm tra log trước nhé.')).toBeTruthy();
    const arrow = container.querySelector('svg');
    expect(arrow).not.toBeNull();
    expect(arrow?.closest('[aria-hidden="true"]')).not.toBeNull();
    // Component chỉ trình bày; thao tác qua nhịp thuộc màn chơi.
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<DialogueBox narration>Đồng hồ vừa chỉ gần trưa.</DialogueBox>);
    expect(screen.getByText('Đồng hồ vừa chỉ gần trưa.').className).toContain(
      'italic',
    );
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryByText('Linh')).toBeNull();
    expect(screen.queryByText('Cuộc gọi')).toBeNull();
  });

  it.each(['left', 'right'] as const)(
    'bong bóng phía %s giữ lời thoại, đuôi không thêm nội dung đọc',
    (side) => {
      const { container } = render(
        <SpeechBubble side={side} tone="sky">
          Em sẽ báo lại lúc 11:30.
        </SpeechBubble>,
      );
      expect(screen.getByText('Em sẽ báo lại lúc 11:30.')).toBeTruthy();
      expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
        'true',
      );
      expect(screen.queryByRole('img')).toBeNull();
      expect(container.firstElementChild?.className).toContain(
        side === 'left' ? 'rounded-bl-md' : 'rounded-br-md',
      );
    },
  );

  it('lời dẫn là đoạn văn, không tạo thêm heading hay nút', () => {
    render(<CaptionStrip>Nhóm chat bắt đầu hỏi ai đặt cơm.</CaptionStrip>);
    expect(screen.getByText('Nhóm chat bắt đầu hỏi ai đặt cơm.').tagName).toBe(
      'P',
    );
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('ToonPanel giữ landmark, tiêu đề, nội dung và thao tác ở header', () => {
    const action = vi.fn();
    render(
      <ToonPanel
        as="aside"
        id="notebook"
        aria-label="Sổ tay ca làm"
        title="Dữ kiện"
        icon={<span aria-hidden>✎</span>}
        action={<button onClick={action}>Ghi thêm</button>}
        bodyClassName="overflow-y-auto"
      >
        API chậm sau bản cập nhật.
      </ToonPanel>,
    );
    const panel = screen.getByRole('complementary', { name: 'Sổ tay ca làm' });
    expect(panel.id).toBe('notebook');
    expect(
      within(panel).getByRole('heading', { name: 'Dữ kiện', level: 2 }),
    ).toBeTruthy();
    expect(within(panel).getByText('API chậm sau bản cập nhật.')).toBeTruthy();
    fireEvent.click(within(panel).getByRole('button', { name: 'Ghi thêm' }));
    expect(action).toHaveBeenCalledTimes(1);
  });
});
