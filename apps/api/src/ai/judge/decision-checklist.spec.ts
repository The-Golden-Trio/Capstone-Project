import { shift } from '@datn/game-core';
import {
  DecisionsGateway,
  type DecisionsRequest,
} from '../gateway/decisions-gateway';
import { gradeDecisionChecklist } from './decision-checklist';
import { CallBudget } from './call-budget';
import {
  DEFAULT_DECISION_PANEL,
  decisionSelection,
  gradeDecisionPanel,
} from './decision-panel';

const model = 'typesafe/jev-1.14';
const observes = [{ sub: '7.1', from: ['n2'] }];
const segment: shift.EvidenceSegment = {
  id: 'n2',
  label: 'Nút giữa',
  kind: 'node',
  subs: ['7.1'],
  outcome: 'answered',
  entries: [
    {
      role: 'player',
      turn: {
        code: 't1',
        kind: 'say',
        at: 2,
        time: '10:10',
        text: 'Em xin phép kiểm lại thông tin trước khi báo cáo.',
      },
    },
  ],
  facts: [],
  rulesHeard: [],
  promises: [],
  brief: 'Xử lý một yêu cầu từ đồng nghiệp.',
};
const input = { observes, segments: [segment] };
const options = { threshold: 0.5, budgetUsd: 0.25 };

function harness(
  override: Record<string, unknown> = {},
  byModel: Record<string, Record<string, unknown>> = {},
) {
  const requests: DecisionsRequest[] = [];
  const gateway = new DecisionsGateway('fake', async (url, init) => {
    expect(url).toBe('https://openrouter.ai/api/alpha/decisions');
    const request = JSON.parse(init.body) as DecisionsRequest;
    requests.push(request);
    const overrides = { ...override, ...byModel[request.model] };
    const answers = Object.fromEntries(
      Object.entries(request.questions).map(([id, question]) => [
        id,
        Object.hasOwn(overrides, id + '_' + question.type)
          ? overrides[id + '_' + question.type]
          : question.type === 'choice'
            ? { type: 'choice', choice: 'c0' }
            : { type: 'noul', noul: /_(applies|A)$/.test(id) ? 0.8 : 0.1 },
      ]),
    );
    return {
      status: 200,
      text: async () =>
        JSON.stringify({
          id: 'fake',
          model: request.model,
          provider: 'fake',
          answers,
          usage: { input_tokens: 100, output_tokens: 0, cost: 0.0001 },
        }),
    };
  });
  return { requests, gateway };
}

describe('AI-5 decision checklist', () => {
  it('ánh xạ ID bằng chứng để chấm mức theo game-core, cộng chi phí cả hai lượt', async () => {
    const { requests, gateway } = harness();
    const result = await gradeDecisionChecklist(input, model, gateway, options);
    expect(requests).toHaveLength(2);
    expect(requests[0].questions.p0_A.type).toBe('noul');
    expect(requests[1].questions.p0_A).toMatchObject({
      type: 'choice',
      criteria: { c0: 'Lượt t1 trong transcript.' },
    });
    expect(result).toMatchObject({
      status: 'graded',
      costUsd: 0.0002,
      items: [{ sub: '7.1', segment: 'n2', level: 1 }],
      checked: {
        items: [
          {
            A: {
              valid: true,
              turn: 't1',
              quote: 'Em xin phép kiểm lại thông tin trước khi báo cáo.',
            },
          },
        ],
      },
    });
  });

  it('giữ refusal và câu trả lời sai kiểu như ca chưa chấm', async () => {
    const { requests, gateway } = harness({
      p0_A_noul: { type: 'refusal' },
      p0_B_noul: { type: 'noul', noul: 4 },
    });
    const result = await gradeDecisionChecklist(input, model, gateway, options);
    expect(requests).toHaveLength(1);
    expect(result).toMatchObject({
      status: 'incomplete',
      reason: 'labels',
      items: [],
      receipts: [{ issues: { p0_A: 'refusal', p0_B: 'invalid' } }],
    });
  });

  it('không ghi điểm âm thầm khi choice trả ID lạ hoặc không có bằng chứng', async () => {
    const invalid = harness({
      p0_A_choice: { type: 'choice', choice: 'invented' },
    });
    await expect(
      gradeDecisionChecklist(input, model, invalid.gateway, options),
    ).resolves.toMatchObject({
      status: 'incomplete',
      reason: 'evidence',
      items: [],
    });
    const abstain = harness({
      p0_A_choice: { type: 'choice', choice: 'no_evidence' },
    });
    await expect(
      gradeDecisionChecklist(input, model, abstain.gateway, options),
    ).resolves.toMatchObject({
      status: 'graded',
      items: [{ level: 0 }],
      checked: { items: [{ A: { yes: true, valid: false, quote: '' } }] },
    });
  });

  it('giữ điểm hết giờ của engine và từ chối lượt gọi vượt ngân sách', async () => {
    const { requests, gateway } = harness();
    await expect(
      gradeDecisionChecklist(
        {
          observes,
          segments: [{ ...segment, outcome: 'timed_out', entries: [] }],
        },
        model,
        gateway,
        options,
      ),
    ).resolves.toMatchObject({
      status: 'graded',
      items: [{ level: 0, fixed: 'timed_out' }],
    });
    await expect(
      gradeDecisionChecklist(input, model, gateway, {
        ...options,
        budgetUsd: 0,
      }),
    ).resolves.toMatchObject({
      status: 'unavailable',
      reason: 'budget',
      costUsd: 0,
    });
    expect(requests).toHaveLength(0);
  });
});

describe('AI-5 decision panel', () => {
  it('gộp ba ghế bằng trung vị và bật bất đồng lệch hai mức', async () => {
    const { requests, gateway } = harness(
      {},
      {
        'typesafe/jev-1.14': { p0_B_noul: { type: 'noul', noul: 0.9 } },
        'liquid/d1-ultra': { p0_A_noul: { type: 'noul', noul: 0.1 } },
      },
    );
    const { panel } = await gradeDecisionPanel(
      input,
      DEFAULT_DECISION_PANEL,
      gateway,
      {
        threshold: 0.5,
        budget: new CallBudget(0.25),
      },
    );
    expect(requests.slice(0, 3).map(({ model }) => model)).toEqual(
      DEFAULT_DECISION_PANEL,
    );
    expect(panel).toMatchObject({
      status: 'graded',
      method: 'median_of_3',
      panelSize: 3,
      items: [{ level: 1, judgeLevels: [2, 0, 1], highDisagreement: true }],
    });
  });

  it('giữ pending và giữ phán đoán từng ghế khi một ghế từ chối', async () => {
    const { gateway } = harness(
      {},
      {
        'liquid/d1-ultra': { p0_A_noul: { type: 'refusal' } },
      },
    );
    const { slots, panel } = await gradeDecisionPanel(
      input,
      DEFAULT_DECISION_PANEL,
      gateway,
      {
        threshold: 0.5,
        budget: new CallBudget(0.25),
      },
    );
    expect(slots.map(({ status }) => status)).toEqual([
      'graded',
      'incomplete',
      'graded',
    ]);
    expect(panel).toMatchObject({
      status: 'pending',
      reason: 'one_judge_down',
      panelSize: 2,
    });
  });

  it('chạy all với panel cố định và giữ Decider làm phép thử riêng', () => {
    expect(decisionSelection('all')).toEqual({
      panel: DEFAULT_DECISION_PANEL,
      probes: ['perplexity/pplx-decider-v1.2'],
    });
    expect(() =>
      decisionSelection(
        'typesafe/jev-1.14,nace-ai/drex-max,perplexity/pplx-decider-v1.2',
      ),
    ).toThrow('Qwen');
  });
});
