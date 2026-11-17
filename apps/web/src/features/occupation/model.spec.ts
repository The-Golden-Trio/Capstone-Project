import { describe, expect, it } from 'vitest';
import type { LevelSummary, SoftSkillState } from '../../api/types';
import {
  firstDestination,
  formatPay,
  formatYears,
  islandState,
  skillTiers,
} from './model';

const level = (levelNo: number, access: LevelSummary['access']) =>
  ({ levelNo, access }) as LevelSummary;

describe('hiển thị hồ sơ nghề', () => {
  it('đổi VND sang triệu/tháng với dấu phẩy và giữ số 0 khác dữ liệu thiếu', () => {
    expect(formatPay(37_800_000)).toBe('37,8 triệu/tháng');
    expect(formatPay(20_000_000)).toBe('20 triệu/tháng');
    expect(formatPay(0)).toBe('0 triệu/tháng');
    expect(formatPay(null)).toBe('Chưa có số liệu');
  });
  it('đổi số năm kinh nghiệm thô thành câu đọc được', () => {
    expect(formatYears('0')).toBe('Chưa cần kinh nghiệm');
    expect(formatYears('0-1')).toBe('0–1 năm kinh nghiệm');
    expect(formatYears('4–7')).toBe('4–7 năm kinh nghiệm');
    expect(formatYears('1-2 năm')).toBe('1–2 năm kinh nghiệm');
    expect(formatYears('15+')).toBe('Từ 15 năm kinh nghiệm');
    expect(formatYears('<1 năm')).toBe('Dưới 1 năm kinh nghiệm');
    expect(formatYears('>8 năm')).toBe('Trên 8 năm kinh nghiệm');
    expect(formatYears('0–0,5')).toBe('0–0,5 năm kinh nghiệm');
    expect(formatYears('12-15+')).toBe('12–15+ năm kinh nghiệm');
    expect(formatYears('1-2 (kèm nền lập trình)')).toBe(
      '1–2 năm kinh nghiệm (kèm nền lập trình)',
    );
    expect(formatYears('1-2 (kèm nền lập trình)', { short: true })).toBe(
      '1–2 năm kinh nghiệm',
    );
  });
  it('ưu tiên cấp đang chơi, rồi cấp mở; không tự mở cấp bị khoá', () => {
    const levels = [level(1, 'OPEN'), level(2, 'ENROLLED'), level(3, 'LOCKED')];
    expect(firstDestination(levels)?.levelNo).toBe(2);
    expect(firstDestination([levels[0], levels[2]])?.levelNo).toBe(1);
    expect(
      firstDestination([level(1, 'COMPLETED'), levels[2]]),
    ).toBeUndefined();
    expect(firstDestination([])).toBeUndefined();
  });
  it('giữ bậc đã đạt khi mất điểm và lấp bậc 0 cho nhóm chưa chơi', () => {
    const skills = [
      { id: 'giao_tiep_hop_tac', points: 400, reachedTier: 2 },
    ] as SoftSkillState[];
    const tiers = skillTiers(skills);
    expect(tiers.giao_tiep_hop_tac).toBe(2);
    expect(tiers.thich_ung_hoc_hoi).toBe(0);
    expect(Object.keys(tiers)).toHaveLength(7);
    expect(
      skillTiers([{ ...skills[0], points: 6000, reachedTier: 2 }])
        .giao_tiep_hop_tac,
    ).toBe(4);
  });
  it('chuyển đủ bốn trạng thái truy cập sang trạng thái đảo', () => {
    expect(islandState).toEqual({
      OPEN: 'open',
      ENROLLED: 'current',
      COMPLETED: 'completed',
      LOCKED: 'locked',
    });
  });
});
