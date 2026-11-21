/**
 * Bộ chấm checklist giả cho `AI_MODE=fake` (chỉ dev) và cho ai-lab.
 *
 * Dùng một transport giả trả lời "có" cho câu A của mọi cặp mục con–đoạn,
 * trích câu đầu tiên của người chơi trong đoạn. Mục đích chỉ là cho thấy đường
 * chạy (dựng đoạn, khử định danh, kiểm câu trích, gộp panel); mức ra KHÔNG
 * phản ánh chất lượng câu trả lời. Không phải đường chấm thay thế (D-92).
 */
import { shift, type KnownIdentity } from '@datn/game-core';
import { ModelGateway } from '../gateway/model-gateway';
import { judgePanel } from '../gateway/models';
import { FakeClock, fakeTransport } from '../testing/fake-model';
import { deidentifySegments } from './checklist.segments';
import type {
  ChecklistGradeInput,
  ChecklistPanelResult,
} from './checklist.types';
import { JudgePanelService } from './judge-panel.service';

/** Cổng chấm theo checklist: `JudgePanelService` khi live, `FakeChecklistJudge` khi fake. */
export interface ShiftJudge {
  gradeChecklist(input: ChecklistGradeInput): Promise<ChecklistPanelResult>;
}
export const SHIFT_JUDGE = Symbol('SHIFT_JUDGE');

export function fakeChecklistService(
  segments: readonly shift.EvidenceSegment[],
  identity: KnownIdentity | undefined,
): JudgePanelService {
  const sent = deidentifySegments(segments, identity).segments;
  const firstTurn = new Map(
    sent.map((s) => [s.id, shift.turnsOf(s)[0]] as const),
  );
  const reply = JSON.stringify({
    items: shift.expectedPairs(sent).map(({ sub, segment }) => {
      const turn = firstTurn.get(segment);
      const quote =
        !turn || turn.kind === 'action'
          ? (turn?.code ?? '')
          : turn.text.split(/\s+/).slice(0, 8).join(' ');
      const no = { yes: false, quote: '', turn: '' };
      return {
        sub,
        segment,
        applicable: true,
        A: { yes: true, quote, turn: turn?.code ?? '' },
        B: no,
        C: no,
      };
    }),
    flags: [],
  });
  const clock = new FakeClock();
  const slots = judgePanel({
    openrouter: { apiKey: 'fake' },
    allowUnconfirmedProviders: false,
  }).slots;
  return new JudgePanelService(
    new ModelGateway(
      { openrouter: 'fake' },
      fakeTransport(() => ({ content: reply, latencyMs: 2_000 }), clock),
      clock,
    ),
    slots,
    clock,
  );
}

export class FakeChecklistJudge implements ShiftJudge {
  gradeChecklist(input: ChecklistGradeInput): Promise<ChecklistPanelResult> {
    return fakeChecklistService(input.segments, input.identity).gradeChecklist(
      input,
    );
  }
}
