import { describe, expect, it } from 'vitest';
import {
  getSettingsVersions,
  saveSettingsVersion,
  validateSettings,
} from './gameSettings';
import { hasFamilyConflict } from './PromptVersions';

describe('cấu hình đề xuất', () => {
  it('bản chụp ban đầu hợp lệ và không bịa trần chi phí chưa chốt', () => {
    const current = getSettingsVersions()[0];
    expect(validateSettings(current.values)).toEqual({});
    expect(current.values.costCap).toBe('');
  });
  it('chặn ngưỡng bậc không tăng, tỉ lệ ngoài khoảng và số lượt không nguyên', () => {
    const values = {
      ...getSettingsVersions()[0].values,
      tiers: '0,500,400,3000,6000,10000',
      entry: '101',
      followups: '2,2,3,3,3,4,4.5',
    };
    expect(Object.keys(validateSettings(values))).toEqual(
      expect.arrayContaining(['tiers', 'entry', 'followups']),
    );
  });
  it('chặn giá trị rỗng giữa danh sách hoặc số lượng sai', () => {
    const values = { ...getSettingsVersions()[0].values, penalty: '0.25,,0.5' };
    expect(validateSettings(values).penalty).toBeTruthy();
  });
  it('lưu phiên bản mới và bảo toàn bản trước, chống ghi từ phiên bản cũ', () => {
    const before = getSettingsVersions()[0];
    const next = saveSettingsVersion(
      { ...before.values, zodiac: '13' },
      'Giá trị để thử trong demo',
      before.version,
    );
    expect(next.version).toBe(before.version + 1);
    expect(getSettingsVersions()[1]).toEqual(before);
    next.values.zodiac = '99';
    expect(getSettingsVersions()[0].values.zodiac).toBe('13');
    expect(() =>
      saveSettingsVersion(before.values, 'Cũ', before.version),
    ).toThrow('Đã có phiên bản mới');
  });
  it('nhận ra họ model trùng dù cách viết khác nhau', () => {
    expect(hasFamilyConflict(' Qwen ', ['qwen', 'DeepSeek'])).toBe(true);
    expect(hasFamilyConflict('Qwen', ['OpenAI', 'DeepSeek'])).toBe(false);
    expect(hasFamilyConflict(null, [])).toBe(false);
  });
});
