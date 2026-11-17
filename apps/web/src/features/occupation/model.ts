import { profile } from '@datn/game-core';
import type {
  LevelAccess,
  LevelSummary,
  SoftSkillState,
} from '../../api/types';

export const islandState = {
  COMPLETED: 'completed',
  ENROLLED: 'current',
  OPEN: 'open',
  LOCKED: 'locked',
} as const satisfies Record<LevelAccess, string>;

export function formatPay(value: number | null): string {
  return value === null
    ? 'Chưa có số liệu'
    : `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value / 1_000_000)} triệu/tháng`;
}

/**
 * Số năm kinh nghiệm trong dữ liệu nghề viết nhiều kiểu ("0", "0-1",
 * "4–7", "15+", "<1 năm", "1-2 (kèm nền lập trình)"). Đổi về một câu đọc
 * được; `short` bỏ phần ghi chú trong ngoặc cho thẻ nhỏ.
 */
export function formatYears(raw: string, { short = false } = {}): string {
  const text = raw.trim();
  if (!text) return 'Chưa có số liệu kinh nghiệm';
  const paren = text.indexOf('(');
  const core = (paren >= 0 ? text.slice(0, paren) : text)
    .trim()
    .replace(/\s*năm$/u, '')
    .replace(/(\d)\s*-\s*(\d)/gu, '$1–$2');
  const note = paren >= 0 ? text.slice(paren).trim() : '';
  let phrase: string;
  if (/^0([.,]0)?$/u.test(core)) phrase = 'Chưa cần kinh nghiệm';
  else if (/^<\s*\d/u.test(core))
    phrase = `Dưới ${core.replace(/^<\s*/u, '')} năm kinh nghiệm`;
  else if (/^>\s*\d/u.test(core))
    phrase = `Trên ${core.replace(/^>\s*/u, '')} năm kinh nghiệm`;
  else if (/^\d+([.,]\d+)?\+$/u.test(core))
    phrase = `Từ ${core.slice(0, -1)} năm kinh nghiệm`;
  else if (/^[\d.,–+\s]+$/u.test(core)) phrase = `${core} năm kinh nghiệm`;
  else phrase = core;
  return short || !note ? phrase : `${phrase} ${note}`;
}

/** Dùng bậc đã giữ, kể cả khi điểm hiện tại giảm xuống dưới ngưỡng. */
export function skillTiers(skills: SoftSkillState[]): Record<string, number> {
  return Object.fromEntries(
    profile.SOFT_SKILL_GROUPS.map(({ id }) => {
      const skill = skills.find((s) => s.id === id);
      return [
        id,
        skill ? profile.keptTier(skill.points, skill.reachedTier) : 0,
      ];
    }),
  );
}

export function firstDestination(
  levels: LevelSummary[],
): LevelSummary | undefined {
  return (
    levels.find((l) => l.access === 'ENROLLED') ??
    levels.find((l) => l.access === 'OPEN')
  );
}
