/**
 * Diễn biến người chơi đã thấy, dựng lại từ sổ sự kiện — đầu vào của AI-4.
 *
 * Chỉ gồm nội dung kịch bản đã hiện (canon), lời người chơi và câu hỏi vặn đã
 * qua kiểm. Không có rubric, khoá chấm, gợi ý chưa xem hay hoạt động tương lai
 * (AI-4 không được thấy, thiết kế AI-4 phần 5).
 */
import { findActivity, type PlayEvent, type Scenario } from '@datn/game-core';
import type { TranscriptLine } from '../ai/narrator/narrator.prompt';

export interface AnswerText {
  id: string;
  activityKey: string;
  followupNo: number;
  text: string | null;
}

export function transcriptBefore(
  scenario: Scenario,
  events: readonly PlayEvent[],
  answers: readonly AnswerText[],
  current: { activityKey: string; answerId: string },
): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  const seen = new Set<string>();

  const enter = (key: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    const activity = findActivity(scenario, key);
    lines.push({ kind: 'canon', text: activity.setup });
    if (activity.npc_line)
      lines.push({ kind: 'canon', text: activity.npc_line });
  };

  for (const event of events) {
    switch (event.type) {
      case 'RUN_STARTED':
        break;
      case 'CLOSED_ANSWERED':
        enter(event.activityKey);
        lines.push({ kind: 'player', text: event.quote });
        break;
      case 'TEXT_SUBMITTED': {
        enter(event.activityKey);
        if (event.answerId === current.answerId) return lines;
        const text = answers.find((a) => a.id === event.answerId)?.text;
        if (text) lines.push({ kind: 'player', text });
        break;
      }
      case 'FOLLOWUP_ASKED':
        lines.push({
          kind: 'npc',
          speaker: event.npcKey,
          text: event.question,
        });
        break;
      case 'ACTIVITY_CLOSED':
        lines.push({
          kind: 'canon',
          text: findActivity(scenario, event.activityKey).closing_prompt,
        });
        break;
      default:
        break;
    }
  }
  enter(current.activityKey);
  return lines;
}
