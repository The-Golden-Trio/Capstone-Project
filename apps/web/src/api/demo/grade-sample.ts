import { runPathLabel } from './data';
import { profile, shift } from '@datn/game-core';
import type { OccupationProfile, RunSummary } from '../types';
import { completed, stateOf } from './rules';
import { context } from './data';
import { now, save, type Player, type SavedRun } from './store';
/**
 * SAMPLE — chỉ xem trước UI DEMO. Đây là heuristic minh bạch, KHÔNG phải
 * AI-5 và tuyệt đối không nhập vào live mode. D-92 cấm đường chấm không AI.
 * score = 50% dữ kiện tìm thấy + 30% nút đã xong + 20% lời hứa giữ được.
 * Không có lời hứa thì phần đó bằng 0, không tự coi là giữ lời.
 */
export function sampleGrade(
  p: Player,
  run: SavedRun,
  occupation: OccupationProfile,
  levelNo: number,
): RunSummary['grade'] {
  if (run.grade) return run.grade;
  const story = shift.shiftSummary(stateOf(run), context(run.taskId));
  const found = story.facts.found.length,
    missed = story.facts.requiredMissed;
  const done = story.nodes.filter((n) => n.status === 'done').length;
  const kept = story.promises.filter((p) => p.status === 'kept').length;
  const score = Math.round(
    (50 * found) / Math.max(1, found + missed) +
      (30 * done) / Math.max(1, story.nodes.length) +
      (20 * kept) / Math.max(1, story.promises.length),
  );
  const level = occupation.levels[levelNo - 1];
  const preview = run.enrolmentId === null;
  const groups = [
    ...new Set([
      ...level.focus,
      'giao_tiep_hop_tac' as const,
      'dao_duc_chuyen_nghiep' as const,
    ]),
  ].slice(0, 4);
  const softSkills = groups.map((id) => {
    // Ca xem thử (không gắn cấp) chỉ tính cho bản tổng kết, không cộng vào hồ sơ.
    const own = p.skills.find((s) => s.id === id)!;
    const skill = preview ? { ...own, history: [...own.history] } : own;
    const tierBefore = profile.keptTier(skill.points, skill.reachedTier);
    const buff = profile.withZodiacBuff(
      Math.round((score * 3) / 10) * 10,
      id,
      profile.zodiacOf(p.me.dateOfBirth),
    );
    const delta = Math.min(buff.total, profile.SOFT_SKILL_MAX - skill.points);
    skill.points += delta;
    skill.reachedTier = profile.keptTier(skill.points, skill.reachedTier);
    skill.scenarios++;
    const zodiacBonus = Math.min(buff.bonus, delta);
    skill.history.push({
      runId: run.id,
      title: story.title,
      path: runPathLabel(run.taskId),
      date: now(),
      delta,
      zodiacBonus,
      total: skill.points,
    });
    return {
      id,
      delta,
      zodiacBonus,
      pointsAfter: skill.points,
      tierBefore,
      tierAfter: skill.reachedTier,
    };
  });
  const keywordsGained =
    !preview && completed(p, occupation.code, level.band)
      ? level.outputKeywords
      : [];
  run.grade = {
    status: 'READY',
    score,
    ending: {
      type: score >= 75 ? 'GOOD' : score >= 40 ? 'PARTIAL' : 'BAD',
      title:
        score >= 75
          ? 'Đã có hướng xử lý'
          : score >= 40
            ? 'Còn việc cần làm rõ'
            : 'Khép ca với nhiều câu hỏi',
      text: `Bạn ghi nhận ${found} dữ kiện và hoàn thành ${done}/${story.nodes.length} nút tình huống. Kết cục mẫu để xem trước giao diện.`,
    },
    feedback: {
      result: missed
        ? `Ca kết thúc lúc ${story.endedAt}; còn ${missed} dữ kiện cần thiết bạn chưa tìm thấy.`
        : `Ca kết thúc lúc ${story.endedAt}; bạn đã tìm đủ các dữ kiện cần thiết.`,
      comment: `Bạn đã làm ${story.actions.length} hành động, giữ ${kept}/${story.promises.length} lời hứa và dùng ${story.hintsUsed} gợi ý.`,
      improve: missed
        ? `Lần tới hãy xem thêm tài liệu trước khi chốt nguyên nhân; còn ${missed} dữ kiện cần đối chiếu.`
        : kept < story.promises.length
          ? 'Ghi lại thời điểm cần báo lại và liên hệ đúng người trước khi kết thúc ca.'
          : `Đối chiếu lại các lựa chọn ở ${story.nodes.find((n) => n.status !== 'done')?.id ?? 'bản tổng kết'} và nêu bằng chứng khi giải thích hướng xử lý.`,
    },
    softSkills,
    keywordsGained,
  };
  save();
  return run.grade;
}
