import type { PlayEvent } from '@datn/game-core';
import { fixtureData } from '@datn/game-core/testing';
import { transcriptBefore } from './transcript';

const scenario = fixtureData().scenarios['SWE_BACKEND_L3_S_INCIDENT'];
const a = (id: string) =>
  scenario.activities.find((x) => x.activity_id === id)!;

describe('transcriptBefore', () => {
  const events: PlayEvent[] = [
    {
      type: 'RUN_STARTED',
      scenarioKey: 'SWE_BACKEND_L3_S_INCIDENT',
      contentVersion: 1,
      band: 'L3',
    },
    {
      type: 'CLOSED_ANSWERED',
      activityKey: 'a1',
      answerId: 'c1',
      score: 2,
      why: 'w',
      quote: 'Xem query plan',
    },
    { type: 'ACTIVITY_CLOSED', activityKey: 'a1', nextActivityKey: 'a2' },
    {
      type: 'TEXT_SUBMITTED',
      activityKey: 'a2',
      answerId: 't1',
      followupNo: 0,
      followUpAllowed: true,
    },
  ];
  const answers = [
    { id: 't1', activityKey: 'a2', followupNo: 0, text: 'N+1, gộp bằng join' },
  ];

  it('gồm nội dung đã hiện và lời người chơi trước câu đang xét, không gồm chính câu đó', () => {
    const lines = transcriptBefore(scenario, events, answers, {
      activityKey: 'a2',
      answerId: 't1',
    });
    expect(lines).toEqual([
      { kind: 'canon', text: a('a1').setup },
      ...(a('a1').npc_line ? [{ kind: 'canon', text: a('a1').npc_line }] : []),
      { kind: 'player', text: 'Xem query plan' },
      { kind: 'canon', text: a('a1').closing_prompt },
      { kind: 'canon', text: a('a2').setup },
      ...(a('a2').npc_line ? [{ kind: 'canon', text: a('a2').npc_line }] : []),
    ]);
  });

  it('không lộ rubric hay hoạt động tương lai', () => {
    const text = JSON.stringify(
      transcriptBefore(scenario, events, answers, {
        activityKey: 'a2',
        answerId: 't1',
      }),
    );
    for (const anchor of Object.values(a('a2').observes[0].anchors))
      expect(text).not.toContain(anchor);
    expect(text).not.toContain(a('a3').setup);
  });
});
