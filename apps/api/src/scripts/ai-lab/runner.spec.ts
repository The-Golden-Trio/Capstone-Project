import { join } from 'node:path';
import { shift } from '@datn/game-core';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { FakeShiftChecker, FakeShiftNarrator } from '../../ai/shift/fake';
import type {
  AiCallOptions,
  AiOutcome,
  ShiftChecker,
  ShiftNarrator,
} from '../../ai/shift/types';
import {
  parsePlaythrough,
  selectPlaythroughs,
  type Playthrough,
} from './playthrough';
import {
  emptyDetail,
  runPlaythrough,
  type LabObserver,
  type LabPorts,
} from './runner';

const SEED = 'SWE_BACKEND.L3.m2';
const ctx = fixtureShiftContext(SEED);
const DIR = join(__dirname, 'playthroughs');

const fakePorts = (over: Partial<LabPorts> = {}): LabPorts => ({
  narrator: new FakeShiftNarrator(),
  checker: new FakeShiftChecker(),
  narratorMode: 'fake',
  checkerMode: 'fake',
  drain: emptyDetail,
  ...over,
});

const run = (p: Playthrough, ports = fakePorts(), budgetUsd = 0.25) =>
  runPlaythrough(p, { ctx, ports, budgetUsd });

const shipped = (name: string) => selectPlaythroughs(DIR, name)[0];

const script = (steps: unknown[]) =>
  parsePlaythrough(
    {
      name: 'thu',
      seed: SEED,
      title: 'Thử',
      intent: 'Thử',
      steps,
    },
    'thu.json',
  );

describe('runPlaythrough với bản giả', () => {
  it('lam-tot: chạy trọn ca, mọi yêu cầu AI đều được giải, anh An duyệt', async () => {
    const result = await run(shipped('lam-tot'));
    expect(result.outcome).toBe('ended');
    expect(result.state.ended).toBe(true);
    expect(result.state.pending).toBeNull();
    expect(shift.pendingRequest(result.state, ctx)).toBeNull();
    expect(result.state.flags).toEqual(
      expect.arrayContaining([
        'nguyen_nhan_da_noi_voi_mentor',
        'da_loai_db_bang_chung',
        'hua_bao_lai',
        'bv.v1',
        'bv.v2',
        'bv.v3',
        'n3.co_cach_kiem',
        'email.co_rollback',
      ]),
    );
    expect(result.state.flags).not.toContain('tre_hen');
    expect(result.state.points).toBe(26);
    expect(result.summary.promises.map((p) => p.status)).toEqual([
      'kept',
      'kept',
      'kept',
    ]);
    expect(result.summary.nodes.find((n) => n.id === 'n3')?.approved).toBe(
      true,
    );
    expect(result.summary.graded).toBe(false);
  });

  it('lam-nhanh-quen-hen: trễ hẹn bật tre_hen, anh An hoãn duyệt', async () => {
    const result = await run(shipped('lam-nhanh-quen-hen'));
    expect(result.outcome).toBe('ended');
    expect(result.state.flags).toContain('tre_hen');
    expect(result.state.flags).toContain('hua_chac_trua');
    expect(result.state.flags).not.toContain('email.co_rollback');
    expect(result.summary.nodes.find((n) => n.id === 'n3')?.approved).toBe(
      false,
    );
    expect(result.summary.promises.map((p) => p.status)).toContain('late');
  });

  it('lac-de-tan-cong: lời chèn lệnh không bật cờ nào của anh An hay bản vá', async () => {
    const result = await run(shipped('lac-de-tan-cong'));
    expect(result.outcome).toBe('ended');
    expect(result.state.flags).not.toContain('nguyen_nhan_da_noi_voi_mentor');
    expect(result.state.flags).not.toContain('bv.v1');
    expect(result.state.flags).not.toContain('email.co_rollback');
  });

  it('ghi từng lượt gọi: dịch vụ, yêu cầu của engine, cờ vừa bật', async () => {
    const result = await run(shipped('lam-tot'));
    const services = new Set(result.calls.map((c) => c.service));
    expect(services).toEqual(new Set(['narrator', 'checker']));
    expect(result.calls.map((c) => c.index)).toEqual(
      result.calls.map((_, i) => i + 1),
    );
    const checkCall = result.calls.find(
      (c) => c.service === 'checker' && c.flagsAdded.length > 0,
    );
    expect(checkCall?.answers?.length).toBeGreaterThan(0);
    expect(checkCall?.adapter).toBe('fake');
    // Mỗi yêu cầu chỉ một lần: id không trùng.
    const ids = result.calls.map((c) => c.request.requestId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('runPlaythrough: vòng giải yêu cầu AI', () => {
  it('đưa cho cổng ngân sách còn lại, ngữ cảnh seed và tên nhân vật', async () => {
    const seen: AiCallOptions[] = [];
    const narrator: ShiftNarrator = {
      async narrate(req, opts) {
        seen.push(opts ?? {});
        return {
          status: 'ok',
          value: shift.fakeNarration(req, shift.FAKE_SCRIPTS[SEED]),
          provenance: { adapter: 'test', costUsd: 0.1 },
        };
      },
    };
    await run(
      script([
        { do: 'start' },
        { do: 'say', text: 'Dạ em coi log anh nha.' },
        { do: 'action', key: 'talk_mentor' },
        { do: 'say', text: 'Anh ơi em đang coi.' },
      ]),
      fakePorts({ narrator }),
      0.25,
    );
    expect(seen).toHaveLength(2);
    expect(seen[0].budgetUsd).toBeCloseTo(0.25);
    expect(seen[1].budgetUsd).toBeCloseTo(0.15);
    expect(seen[0].ctx).toBe(ctx);
    expect(seen[0].castNames).toEqual(['anh An', 'chị Linh']);
  });

  it('trừ cả các lượt đã gọi trong cùng một bước, không chỉ các bước trước', async () => {
    const COST = 0.01;
    const BUDGET = 1;
    const seen: number[] = [];
    const inner = fakePorts();
    const paid = {
      narrator: {
        async narrate(req, opts) {
          seen.push(opts?.budgetUsd ?? NaN);
          const out = await inner.narrator.narrate(req, opts);
          return out.status === 'ok'
            ? { ...out, provenance: { ...out.provenance, costUsd: COST } }
            : out;
        },
      } satisfies ShiftNarrator,
      checker: {
        async check(req, opts) {
          seen.push(opts?.budgetUsd ?? NaN);
          const out = await inner.checker.check(req, opts);
          return out.status === 'ok'
            ? { ...out, provenance: { ...out.provenance, costUsd: COST } }
            : out;
        },
      } satisfies ShiftChecker,
    };
    const result = await run(shipped('lam-tot'), fakePorts(paid), BUDGET);

    // Có bước gọi AI nhiều lần liền, nếu không thì test này không chứng minh gì.
    expect(result.steps.some((s) => s.calls.length > 1)).toBe(true);
    expect(seen).toHaveLength(result.calls.length);
    seen.forEach((budget, i) => expect(budget).toBeCloseTo(BUDGET - COST * i));
    expect(result.costUsd).toBeCloseTo(COST * result.calls.length);
  });

  it('hết model dùng được thì dừng ở đó như RUN_PAUSED, giữ tiến độ', async () => {
    const narrator: ShiftNarrator = {
      narrate: async (): Promise<AiOutcome<shift.Beat[]>> => ({
        status: 'unavailable',
        reason: 'no_model',
      }),
    };
    const result = await run(
      script([
        { do: 'start' },
        { do: 'say', text: 'Dạ em coi log anh nha.' },
        { do: 'action', key: 'open_log' },
      ]),
      fakePorts({ narrator }),
    );
    expect(result.outcome).toBe('paused');
    expect(result.message).toMatch(/no_model/);
    expect(result.steps).toHaveLength(2);
    expect(result.state.pending).not.toBeNull();
    expect(result.calls[0].status).toBe('unavailable');
  });

  it('bộ phán hết model cũng dừng, và không ghi cờ nào', async () => {
    const checker: ShiftChecker = {
      check: async (): Promise<AiOutcome<shift.CheckAnswer[]>> => ({
        status: 'unavailable',
        reason: 'exhausted',
      }),
    };
    const result = await run(
      script([
        { do: 'start' },
        { do: 'say', text: 'Dạ em coi log anh nha.' },
        { do: 'action', key: 'talk_mentor' },
        { do: 'say', text: 'Anh duyệt giúp em đưa bản sửa lên nhé.' },
      ]),
      fakePorts({ checker }),
    );
    expect(result.outcome).toBe('paused');
    expect(result.state.flags).not.toContain('xin_duyet');
  });

  it('báo hiệu từng bước, dòng hiện ra và lượt gọi cho người quan sát', async () => {
    const events: string[] = [];
    const observer: LabObserver = {
      stepStart: (i) => events.push(`bước ${i}`),
      stepSkipped: (i) => events.push(`bỏ ${i}`),
      lines: (lines) => events.push(`${lines.length} dòng`),
      call: (c) => events.push(`gọi ${c.service}`),
    };
    await runPlaythrough(
      script([
        { do: 'start' },
        { do: 'say', text: 'Dạ em coi log anh nha.' },
        { do: 'say', text: 'Không ai hỏi.', ifAwait: 'probe_answer' },
      ]),
      { ctx, ports: fakePorts(), budgetUsd: 1, observer },
    );
    expect(events).toEqual([
      'bước 1',
      '4 dòng',
      'bước 2',
      'gọi narrator',
      '2 dòng',
      'bỏ 3',
    ]);
  });
});

describe('runPlaythrough: lỗi kịch bản', () => {
  it('việc engine từ chối thì dừng và chỉ ra việc dùng được lúc đó', async () => {
    const result = await run(
      script([{ do: 'start' }, { do: 'action', key: 'chot_nguyen_nhan' }]),
    );
    expect(result.outcome).toBe('script_error');
    expect(result.message).toMatch(/Bước 2/);
    expect(result.message).toMatch(/Hành động dùng được/);
  });

  it('nói khi chưa bắt đầu ca', async () => {
    const result = await run(script([{ do: 'say', text: 'xin chào' }]));
    expect(result.outcome).toBe('script_error');
    expect(result.message).toMatch(/chưa bắt đầu/);
  });

  it('bước ifAwait không khớp thì bỏ qua, không phải lỗi', async () => {
    const result = await run(
      script([
        { do: 'start' },
        { do: 'say', text: 'Chào anh', ifAwait: 'probe_answer' },
        { do: 'say', text: 'Dạ em coi log.' },
      ]),
    );
    expect(result.steps[1].skipped).toBe(true);
    expect(result.steps[2].skipped).toBeUndefined();
    // Kịch bản hết mà ca chưa xong: không phải lỗi, nhưng không phải "ended".
    expect(result.outcome).toBe('incomplete');
    expect(result.message).toMatch(/chưa xong/);
  });

  it('ca hết sớm mà còn bước bắt buộc thì là lỗi kịch bản', async () => {
    const full = shipped('lam-tot');
    const result = await run({
      ...full,
      steps: [...full.steps, { do: 'say', text: 'Dạ còn nữa ạ.' }],
    });
    expect(result.outcome).toBe('script_error');
    expect(result.message).toMatch(/bước bắt buộc/);
  });
});
