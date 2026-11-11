/**
 * Hỏi vặn: câu của AI-4 khi có, câu chuyên gia soạn sẵn khi AI-4 không cho được
 * câu qua luật (SD-01), không hỏi khi không có cả hai. Không bao giờ bịa câu.
 */
import { fixtureData } from '@datn/game-core/testing';
import type { ContentService } from '../content/content.service';
import type { NarratorService } from '../ai/narrator/narrator.service';
import { FollowUpService } from './follow-up.service';

const scenario = fixtureData().scenarios['SWE_BACKEND_L1_S_EXEC'];

const input = {
  scenario,
  scenarioKey: 'SWE_BACKEND_L1_S_EXEC',
  contentVersion: 1,
  activityKey: 'a4',
  transcript: [],
  answer: 'Em sửa xong rồi anh xem giúp em.',
  identity: {},
};

const record = (outcome: 'accepted' | 'rejected' | 'error') => ({
  attempt: 1,
  modelKey: 'qwen3.8-flash@ap-southeast-1',
  provider: 'qwen',
  family: 'qwen',
  promptVersion: 'narrator-v2',
  profileVersion: 'p',
  contentVersion: 1,
  temperature: 0.7,
  startedAt: 0,
  latencyMs: 1200,
  outcome,
  violations: [],
  error: null,
  finishReason: 'stop',
  usage: {
    input: 2000,
    cachedInput: 0,
    cacheWrite: 0,
    output: 40,
    reasoning: 0,
  },
  cost: { usd: 0.0003, basis: 'list' as const },
  requestId: null,
  output: null,
});

function setup(result: unknown, expertLine?: { who: string; text: string }) {
  const narrator = {
    narrate: jest.fn().mockResolvedValue(result),
  } as unknown as NarratorService;
  const content = {
    followupLookup: jest.fn().mockResolvedValue(() => expertLine),
  } as unknown as ContentService;
  return new FollowUpService(narrator, content);
}

describe('FollowUpService', () => {
  it('AI-4 cho câu qua luật: dùng câu đó, kèm nguồn gốc và chi phí', async () => {
    const service = setup({
      status: 'ok',
      line: { speaker: 'an', follow_up: 'Em đã chạy lại test chưa?' },
      records: [record('accepted')],
      redactions: {},
      cost: { usd: 0.0003, basis: 'list' },
    });
    const d = await service.decide(input);
    expect(d.asked).toMatchObject({
      type: 'FOLLOWUP_ASKED',
      npcKey: 'an',
      name: 'An',
      question: 'Em đã chạy lại test chưa?',
      source: 'ai',
      provenance: { modelKey: 'qwen3.8-flash@ap-southeast-1', costUsd: 0.0003 },
    });
    expect(d.aiOutcome).toBeNull();
    expect(d.usage).toEqual([
      expect.objectContaining({
        role: 'narrator',
        tokensIn: 2000,
        succeeded: true,
      }),
    ]);
  });

  it('AI-4 hết model: dùng câu chuyên gia soạn sẵn, vẫn ghi chi phí các lượt đã gọi', async () => {
    const service = setup(
      {
        status: 'unavailable',
        reason: 'exhausted',
        records: [record('rejected')],
        redactions: {},
        cost: { usd: 0.0003, basis: 'list' },
      },
      { who: 'an', text: 'Ok. Thế em sửa bằng cách nào?' },
    );
    const d = await service.decide(input);
    expect(d.asked).toMatchObject({
      source: 'expert_default',
      question: 'Ok. Thế em sửa bằng cách nào?',
      provenance: null,
    });
    expect(d.aiOutcome).toBe('unavailable:exhausted');
    expect(d.usage[0]).toMatchObject({ succeeded: false });
  });

  it('bị bộ lọc chặn và không có câu soạn sẵn: không hỏi', async () => {
    const service = setup({
      status: 'blocked',
      records: [],
      redactions: {},
      cost: { usd: 0, basis: 'list' },
    });
    const d = await service.decide(input);
    expect(d.asked).toBeNull();
    expect(d.aiOutcome).toBe('blocked');
  });
});
