import { join } from 'node:path';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { FakeShiftChecker, FakeShiftNarrator } from '../../../ai/shift/fake';
import { selectPlaythroughs } from '../playthrough';
import { emptyDetail, runPlaythrough } from '../runner';
import { judgeStage } from './judge';

const SEED = 'SWE_BACKEND.L3.m2';
const ctx = fixtureShiftContext(SEED);
const IDENTITY = { names: ['Nam'], usernames: ['nam'] };

async function endedRun(name: string) {
  const [playthrough] = selectPlaythroughs(
    join(
      __dirname,
      '../../../../../../packages/game-core/src/shift/playthroughs',
    ),
    name,
  );
  const result = await runPlaythrough(playthrough, {
    ctx,
    ports: {
      narrator: new FakeShiftNarrator(),
      checker: new FakeShiftChecker(),
      narratorMode: 'fake',
      checkerMode: 'fake',
      drain: emptyDetail,
    },
    identity: IDENTITY,
    budgetUsd: 0.25,
  });
  expect(result.outcome).toBe('ended');
  return result;
}

describe('judgeStage (bước AI-5 của ai-lab)', () => {
  it('chế độ fake: dựng đoạn bằng chứng từ ca vừa chơi và chấm qua đủ ba ghế', async () => {
    const result = await endedRun('lam-tot');
    const out = await judgeStage.run({
      playthrough: 'lam-tot',
      ctx,
      state: result.state,
      summary: result.summary,
      identity: IDENTITY,
      budgetUsd: 0.25,
      runtime: {
        mode: 'fake',
        settings: { allowUnconfirmedProviders: false },
        gateway: null,
        judgeSlots: [],
      },
      only: undefined,
    });

    const data = out.data as {
      result: {
        status: string;
        slots: Array<{ status: string }>;
        records: Array<{ quotesRejected: number }>;
      };
    };
    expect(data.result.status).toBe('graded');
    expect(data.result.slots.map((s) => s.status)).toEqual(['ok', 'ok', 'ok']);
    // Câu trích của judge giả lấy từ chính đoạn đã khử định danh, nên không câu nào bị bỏ.
    expect(data.result.records.every((r) => r.quotesRejected === 0)).toBe(true);
    expect(out.lines.some((l) => l.includes('judge giả'))).toBe(true);
  });

  it('chế độ live mà không có ghế judge: báo thiếu, không gọi gì', async () => {
    const result = await endedRun('lam-tot');
    const out = await judgeStage.run({
      playthrough: 'lam-tot',
      ctx,
      state: result.state,
      summary: result.summary,
      identity: IDENTITY,
      budgetUsd: 0.25,
      runtime: {
        mode: 'live',
        settings: { allowUnconfirmedProviders: false },
        gateway: {} as never,
        judgeSlots: [],
      },
      only: 'judge',
    });
    expect(out.data).toBeUndefined();
    expect(out.lines.at(-1)).toContain('Không có ghế judge');
  });
});
