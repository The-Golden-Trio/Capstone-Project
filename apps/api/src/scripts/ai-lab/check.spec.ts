/**
 * `--mode=check` cho ghế judge: lượt bộ phán (D-129) và lượt checklist của
 * AI-5 (`judge-v2`). Model giả ở tầng Transport nên adapter dựng body thật;
 * không gọi model thật.
 */
import { shift } from '@datn/game-core';
import { ModelGateway } from '../../ai/gateway/model-gateway';
import { judgePanel, type JudgeSlot } from '../../ai/gateway/models';
import {
  FakeClock,
  fakeTransport,
  type FakeTurn,
} from '../../ai/testing/fake-model';
import { checkChecklist, checkJudge, checklistSample } from './check';

const SLOTS: JudgeSlot[] = judgePanel({
  openrouter: { apiKey: 'or' },
  allowUnconfirmedProviders: false,
}).slots;

const { segments } = checklistSample();
const PAIRS = shift.expectedPairs(segments);

const answer = (yes: boolean, turn = 't2', quote?: string) => ({
  quote: quote ?? (yes ? 'Chị ơi em tìm ra lỗi rồi, đang sửa.' : ''),
  turn: yes ? turn : '',
  yes,
});

const output = (over: { quote?: string; drop?: boolean } = {}) =>
  JSON.stringify({
    items: PAIRS.slice(0, over.drop ? 0 : PAIRS.length).map((p) => ({
      sub: p.sub,
      segment: p.segment,
      applicable: true,
      A: answer(true, 't2', over.quote),
      B: answer(false),
      C: answer(false),
    })),
    flags: [],
  });

function setup(turn: FakeTurn) {
  const transport = fakeTransport([turn], new FakeClock());
  return {
    transport,
    gateway: new ModelGateway({ openrouter: 'or' }, transport),
  };
}

describe('checklistSample', () => {
  it('một mục con, một đoạn, hai lượt nói của người chơi', () => {
    const sample = checklistSample();
    expect(sample.observes).toHaveLength(1);
    expect(sample.segments).toHaveLength(1);
    expect(shift.allTurns(sample.segments).map((t) => t.code)).toEqual([
      't1',
      't2',
    ]);
    expect(PAIRS).toEqual([
      { sub: sample.observes[0].sub, segment: sample.segments[0].id },
    ]);
  });
});

describe('checkChecklist (ghế judge, prompt judge-v2)', () => {
  it.each(SLOTS.map((s) => [s.slot, s.family] as const))(
    'đúng khuôn → sẵn sàng, bỏ 0 câu trích (ghế %i, %s)',
    async (slot) => {
      const { transport, gateway } = setup({ content: output() });
      const row = await checkChecklist(gateway, slot, SLOTS[slot - 1].chain[0]);
      expect(row.service).toBe(`ghế judge ${slot} (AI-5 checklist)`);
      expect(row.verdict).toBe('sẵn sàng');
      expect(row.note).toContain('bỏ 0 câu trích');

      const body = transport.calls[0].body as {
        max_tokens: number;
        response_format: { json_schema: { name: string } };
        messages: Array<{ content: string }>;
      };
      expect(body.response_format.json_schema.name).toBe('checklist');
      expect(body.max_tokens).toBeLessThanOrEqual(1_000);
      expect(body.messages[1].content).toContain('Chị ơi em tìm ra lỗi rồi');
    },
  );

  it('câu trích không khớp lượt nói → vẫn sẵn sàng, ghi số câu bị bỏ', async () => {
    const { gateway } = setup({
      content: output({ quote: 'một câu người chơi chưa hề nói ra' }),
    });
    const row = await checkChecklist(gateway, 1, SLOTS[0].chain[0]);
    expect(row.verdict).toBe('sẵn sàng');
    expect(row.note).toContain('bỏ 1 câu trích');
  });

  it('sai khuôn (thiếu cặp) → có cảnh báo, nêu luật J2', async () => {
    const { gateway } = setup({ content: output({ drop: true }) });
    const row = await checkChecklist(gateway, 1, SLOTS[0].chain[0]);
    expect(row.verdict).toBe('có cảnh báo');
    expect(row.note).toContain('J2');
  });

  it('không phải json → có cảnh báo, nêu luật J3', async () => {
    const { gateway } = setup({ content: 'xin chào' });
    const row = await checkChecklist(gateway, 1, SLOTS[0].chain[0]);
    expect(row.verdict).toBe('có cảnh báo');
    expect(row.note).toContain('J3');
  });

  it('bị cắt vì chạm trần token → có cảnh báo', async () => {
    const { gateway } = setup({ content: output(), finishReason: 'length' });
    const row = await checkChecklist(gateway, 1, SLOTS[0].chain[0]);
    expect(row.verdict).toBe('có cảnh báo');
  });

  it('hãng trả 400 → không sẵn sàng, kèm cách xử lý', async () => {
    const { gateway } = setup({
      status: 400,
      errorMessage: 'Provider returned error',
    });
    const row = await checkChecklist(gateway, 1, SLOTS[0].chain[0]);
    expect(row.verdict).toBe('không sẵn sàng');
    expect(row.note).toContain('bad_request');
  });
});

describe('checkJudge (ghế judge, bộ phán)', () => {
  it('Claude: body gửi đi không còn type dạng mảng', async () => {
    const { transport, gateway } = setup({
      content: JSON.stringify({ answers: [] }),
    });
    const row = await checkJudge(gateway, 1, SLOTS[0].chain[0]);
    expect(row.verdict).toBe('sẵn sàng');
    const sent = JSON.stringify(transport.calls[0].body);
    expect(sent).not.toMatch(/"type":\[/);
    expect(sent).toContain('anyOf');
  });

  it.each([1, 2])(
    'GPT và Gemini (ghế %i): body vẫn dùng type dạng mảng như cũ',
    async (index) => {
      const { transport, gateway } = setup({
        content: JSON.stringify({ answers: [] }),
      });
      await checkJudge(gateway, index + 1, SLOTS[index].chain[0]);
      const sent = JSON.stringify(transport.calls[0].body);
      expect(sent).toMatch(/"type":\["string","null"\]/);
      expect(sent).not.toContain('anyOf');
    },
  );
});
