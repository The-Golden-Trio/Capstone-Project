import { describe, expect, it } from 'vitest';
import { botArt, sceneBackdrop } from './presentation';
import { TOON_BACKDROPS } from './toon';

const seedId = 'SWE_BACKEND.L3.m2';
const acted = [{ context: 'action:open_wiki', text: 'Bạn mở Wiki.' }];
const noon = {
  context: 'timeline',
  text: 'Đồng hồ góc màn hình nhảy sang 11:30, nhóm chat bắt đầu réo ai đặt cơm.',
};
const call = (slot: string) => ({ channel: 'call' as const, slots: [slot] });

describe('sceneBackdrop', () => {
  it('seed không có trong bảng giữ bối cảnh theo kênh như cũ', () => {
    const base = { seedId: 'OTHER.L1.m1', lines: [] };
    expect(sceneBackdrop({ ...base, channel: null })).toBe(
      TOON_BACKDROPS.office,
    );
    expect(
      sceneBackdrop({
        ...base,
        channel: 'meet',
        talking: { channel: 'meet', slots: ['support'] },
        lines: [noon],
      }),
    ).toBe(TOON_BACKDROPS.meeting);
  });

  it('cảnh mở đầu dùng bàn có cảnh báo tới khi người chơi làm việc đầu tiên', () => {
    const opening = sceneBackdrop({ seedId, channel: null, lines: [] });
    expect(opening).toContain('bg-desk-alert');
    expect(
      sceneBackdrop({
        seedId,
        channel: 'chat',
        talking: { channel: 'chat', slots: ['mentor'] },
        lines: [{ context: 'node:n0', text: 'Lan ơi' }],
      }),
    ).toBe(opening);
    expect(sceneBackdrop({ seedId, channel: null, lines: acted })).toBe(
      TOON_BACKDROPS.office,
    );
  });

  it('chị Linh gọi (cuộc trò chuyện hay nút tình huống) thì dùng bàn chăm sóc khách hàng', () => {
    expect(
      sceneBackdrop({
        seedId,
        channel: null,
        talking: call('support'),
        lines: acted,
      }),
    ).toContain('bg-cs-desk');
    expect(
      sceneBackdrop({
        seedId,
        channel: null,
        talking: { channel: 'chat', slots: ['support'] },
        lines: acted,
      }),
    ).toBe(TOON_BACKDROPS.office);
    expect(
      sceneBackdrop({
        seedId,
        channel: null,
        talking: call('mentor'),
        lines: acted,
      }),
    ).toBe(TOON_BACKDROPS.office);
  });

  it('từ dòng cảnh 11:30 tới hết ca dùng bàn buổi trưa, kể cả khi đang gọi', () => {
    const lines = [...acted, noon];
    expect(sceneBackdrop({ seedId, channel: null, lines })).toContain(
      'bg-desk-noon',
    );
    expect(
      sceneBackdrop({ seedId, channel: null, talking: call('support'), lines }),
    ).toContain('bg-desk-noon');
  });
});

describe('botArt', () => {
  it('chỉ bot deploy và bot giám sát có ảnh riêng', () => {
    expect(botArt('bot_deploy')).toContain('bot-deploy');
    expect(botArt('bot_giam_sat')).toContain('bot-giam-sat');
    expect(botArt('bot_khac')).toBeUndefined();
  });
});
