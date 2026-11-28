import { join } from 'node:path';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { FakeClock, fakeTransport } from '../../ai/testing/fake-model';
import { PLAY_POLICIES, loadCohort } from './persona-cohort';
import { livePersona, limitGateway, personaModel } from './persona-model';
import {
  observe,
  personaMessages,
  runPersona,
  scriptedPersona,
} from './persona';
import { loadPlaythrough } from './playthrough';
import { createPorts, fakeRuntime, liveRuntime } from './ports';
import { LabSession } from './runner';

const ctx = fixtureShiftContext('SWE_BACKEND.L3.m2');
const settings = { allowUnconfirmedProviders: false };
const policy = PLAY_POLICIES['dieu-tra-ky'];

const options = () => ({
  ctx,
  ports: createPorts(fakeRuntime(settings), undefined),
  budgetUsd: 0.25,
});

const limits = { turns: 50, timeoutMs: 60_000, hints: policy.hints };

describe('persona trong ai-lab', () => {
  it('chạy trọn ca và giữ lại các thao tác đã áp dụng', async () => {
    const fixture = loadPlaythrough(
      join(__dirname, 'playthroughs', 'lam-tot.json'),
    );
    const trial = await runPersona(
      options(),
      scriptedPersona(fixture.steps),
      limits,
    );
    expect(trial.status).toBe('ended');
    expect(trial.result.steps[0].step.do).toBe('start');
    expect(trial.coverage.rejected).toBe(0);
    expect(trial.coverage.documents.length).toBeGreaterThan(0);
  });

  it('chỉ cấp một cơ hội sửa thao tác và giữ nguyên trạng thái khi bị từ chối', async () => {
    const agent = jest
      .fn()
      .mockResolvedValue({ value: { do: 'action', key: 'hidden' } });
    const trial = await runPersona(options(), agent, limits);
    expect(trial.status).toBe('invalid_action');
    expect(trial.result.steps).toHaveLength(1);
    expect(trial.coverage.rejected).toBe(2);
    expect(agent).toHaveBeenCalledTimes(2);
    expect(agent.mock.calls[1][0].retry).toBeDefined();
  });

  it('gửi quan sát thay vì seed, UUID nguồn hoặc mục chấm', async () => {
    const session = new LabSession(options());
    await session.apply({ do: 'start' });
    const observation = observe(session, 0);
    const [profile] = loadCohort(
      join(__dirname, 'personas', 'nemotron-vietnam.json'),
    ).profiles;
    const user = personaMessages(profile, policy, observation)[1].parts[0].text;
    expect(user).toContain(profile.occupation);
    expect(user).not.toContain(profile.sourceUuid);
    expect(user).not.toMatch(
      /"observes"|"knownFacts"|"flags"|"beliefs"|"requestId"/,
    );
    expect(observation.allowed).not.toContain('hint');
    const control = personaMessages(undefined, policy, observation)[1].parts[0]
      .text;
    expect(control).not.toContain(profile.occupation);
  });

  it('đọc quyết định qua adapter thật và chặn trước khi gửi nếu hết ngân sách', async () => {
    const transportCalls = jest.fn();
    const env = liveRuntime(
      {
        ...settings,
        qwen: {
          apiKey: 'test',
          region: 'ap-southeast-1',
          cacheMode: 'implicit',
        },
      },
      fakeTransport(() => {
        transportCalls();
        return {
          content: '{"do":"say","text":"Em sẽ xem log."}',
          completionTokens: 12,
        };
      }, new FakeClock()),
    );
    const gateway = env.gateway!;
    const model = personaModel(env);
    const budget = limitGateway(gateway, 0.01);
    const session = new LabSession(options());
    await session.apply({ do: 'start' });
    const view = observe(session, 0);
    const trial = livePersona(gateway, model, budget, policy, undefined);
    await expect(
      trial.decide({ view, timeoutMs: 5_000 }),
    ).resolves.toMatchObject({
      value: { do: 'say', text: 'Em sẽ xem log.' },
    });
    expect(budget.spent).toBeGreaterThan(0);
    const depleted = livePersona(
      gateway,
      model,
      limitGateway(gateway, 0),
      policy,
      undefined,
    );
    await expect(
      depleted.decide({ view, timeoutMs: 5_000 }),
    ).resolves.toMatchObject({ stop: 'budget' });
    expect(transportCalls).toHaveBeenCalledTimes(1);
  });
});
