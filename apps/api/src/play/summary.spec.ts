import {
  activityResults,
  foldPlay,
  pickPlayEnding,
  type PlayEvent,
} from '@datn/game-core';
import { fixtureData } from '@datn/game-core/testing';
import { toProblem, Problem } from '../core/problem';
import { compareIds } from '../core/stream.service';
import { parseReleaseVersion } from './run.service';
import { summaryOf } from './summary.service';

const scenario = fixtureData().scenarios['SWE_BACKEND_L1_S_EXEC'];

describe('summaryOf', () => {
  const events: PlayEvent[] = [
    {
      type: 'RUN_STARTED',
      scenarioKey: 'SWE_BACKEND_L1_S_EXEC',
      contentVersion: 1,
      band: 'L1',
    },
    {
      type: 'CLOSED_ANSWERED',
      activityKey: 'a1',
      answerId: 'c1',
      score: 2,
      why: 'Chọn đúng',
      quote: 'bug 500',
    },
    { type: 'ACTIVITY_CLOSED', activityKey: 'a1', nextActivityKey: 'a2' },
    { type: 'HINT_VIEWED', activityKey: 'a2' },
    {
      type: 'CLOSED_ANSWERED',
      activityKey: 'a2',
      answerId: 'c2',
      score: 0,
      why: 'Sai cách sửa',
      quote: 'xoá ảnh',
    },
    { type: 'ACTIVITY_CLOSED', activityKey: 'a2', nextActivityKey: null },
  ];
  const state = foldPlay(events, scenario);
  const results = activityResults(state, scenario);
  const summary = summaryOf(
    { id: 'r1', completedAt: new Date('2026-11-11T10:00:00Z') },
    scenario,
    state,
    results,
    pickPlayEnding(scenario, results),
    { failed: 1, levelUnlocked: true },
  );

  it('ba phần tách riêng (FR-14), đếm đúng mức, nói rõ câu chưa chấm được', () => {
    expect(summary.result).toContain(
      '1 làm tốt (mức 2), 0 đạt (mức 1), 1 chưa đạt (mức 0)',
    );
    expect(summary.result).toContain('1 câu tự viết chưa chấm được');
    expect(summary.feedback).toContain('Sai cách sửa — “xoá ảnh”');
    expect(summary.guidance).toContain(
      scenario.activities[1].observes[0].anchors['+2'],
    );
    expect(summary).toMatchObject({
      hintsUsed: 1,
      levelUnlocked: true,
      finishedAt: '2026-11-11T10:00:00.000Z',
    });
  });
});

describe('phụ trợ', () => {
  it('Problem theo RFC 9457 có code ổn định', () => {
    expect(
      toProblem(new Problem(409, 'INVALID_TRANSITION', 'Not now')),
    ).toEqual({
      type: 'about:blank',
      title: 'Not now',
      status: 409,
      code: 'INVALID_TRANSITION',
    });
  });

  it('so id của Redis Stream theo thời gian rồi theo số thứ tự', () => {
    expect(compareIds('1700-2', '1700-10')).toBeLessThan(0);
    expect(compareIds('1701-0', '1700-99')).toBeGreaterThan(0);
  });

  it('releaseVersion = <khoá kịch bản>@<phiên bản nội dung>', () => {
    expect(parseReleaseVersion('SWE_BACKEND_L1_S_EXEC@3')).toEqual({
      scenarioKey: 'SWE_BACKEND_L1_S_EXEC',
      contentVersion: 3,
    });
    expect(parseReleaseVersion('../etc')).toBeNull();
  });
});
