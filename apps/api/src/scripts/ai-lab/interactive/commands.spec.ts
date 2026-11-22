import { join } from 'node:path';
import { shift } from '@datn/game-core';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { FakeShiftChecker, FakeShiftNarrator } from '../../../ai/shift/fake';
import { parsePlaythrough, selectPlaythroughs } from '../playthrough';
import { emptyDetail, LabSession, type LabPorts } from '../runner';
import {
  isEngineCommand,
  parseCommand,
  planCommand,
  type Command,
  type EngineCommand,
} from './commands';
import {
  formatActions,
  formatCall,
  formatDebug,
  formatLine,
  formatOptions,
  formatPrompt,
  formatStatus,
  playName,
} from './format';

const SEED = 'SWE_BACKEND.L3.m2';
const ctx = fixtureShiftContext(SEED);

const ports = (): LabPorts => ({
  narrator: new FakeShiftNarrator(),
  checker: new FakeShiftChecker(),
  narratorMode: 'fake',
  checkerMode: 'fake',
  drain: emptyDetail,
});

/** Một ca thật chạy bản giả, dừng sau các bước cho trước. */
async function sessionAfter(...steps: Array<Record<string, unknown>>) {
  const session = new LabSession({ ctx, ports: ports(), budgetUsd: 1 });
  for (const step of steps) {
    const done = await session.apply(
      parsePlaythrough(
        { name: 'x', seed: SEED, title: 't', intent: 'i', steps: [step] },
        'x.json',
      ).steps[0],
    );
    if (done.status === 'rejected') throw new Error(done.message);
  }
  return session;
}

const view = (s: LabSession) => shift.sceneView(s.state, ctx);
const engine = (line: string): EngineCommand => {
  const c: Command = parseCommand(line);
  if (!isEngineCommand(c)) throw new Error(`không phải lệnh engine: ${c.kind}`);
  return c;
};

describe('parseCommand', () => {
  it('dòng chữ thường là lời nói, bỏ khoảng trắng hai đầu', () => {
    expect(parseCommand('  Dạ em coi liền anh  ')).toEqual({
      kind: 'say',
      text: 'Dạ em coi liền anh',
    });
  });

  it('dòng trống không làm gì', () => {
    expect(parseCommand('   ')).toEqual({ kind: 'empty' });
  });

  it.each([
    ['/lam open_log', { kind: 'lam', key: 'open_log' }],
    ['/LAM open_log   thừa', { kind: 'lam', key: 'open_log' }],
    ['/chon b', { kind: 'chon', option: 'b' }],
    ['/nop', { kind: 'nop' }],
    ['/ket', { kind: 'ket' }],
    ['/huy', { kind: 'huy' }],
    ['/xong', { kind: 'xong' }],
    ['/goiy', { kind: 'goiy' }],
    ['/lai', { kind: 'lai' }],
    ['/tt', { kind: 'tt' }],
    ['/giup', { kind: 'giup' }],
    ['/thoat', { kind: 'thoat' }],
  ])('%s', (line, expected) => {
    expect(parseCommand(line)).toEqual(expected);
  });

  it('/ghichu giữ nguyên cả câu', () => {
    expect(parseCommand('/ghichu rubric hỏi hai lần một ý')).toEqual({
      kind: 'ghichu',
      text: 'rubric hỏi hai lần một ý',
    });
  });

  it.each(['/lam', '/chon', '/ghichu'])(
    '%s thiếu đối số thì báo lỗi',
    (line) => {
      const c = parseCommand(line);
      expect(c.kind).toBe('error');
      expect((c as { message: string }).message).toContain(line);
    },
  );

  it('lệnh lạ chỉ sang /giup, không văng', () => {
    const c = parseCommand('/bay');
    expect(c).toMatchObject({ kind: 'error' });
    expect((c as { message: string }).message).toContain('/giup');
  });
});

describe('planCommand với ca thật', () => {
  it('đang chờ trả lời nút mở: lời nói ghi ifAwait để chạy lại không vỡ', async () => {
    const s = await sessionAfter({ do: 'start' });
    expect(s.state.await.kind).toBe('node_reply');
    expect(planCommand(engine('Dạ anh'), view(s), null)).toEqual({
      kind: 'step',
      step: { do: 'say', text: 'Dạ anh', ifAwait: 'node_reply' },
    });
  });

  it('hành động không form thành bước action; key không phân biệt hoa thường', async () => {
    const s = await sessionAfter({ do: 'start' }, { do: 'say', text: 'Dạ' });
    expect(s.state.await.kind).toBe('phase');
    expect(planCommand(engine('/lam OPEN_LOG'), view(s), null)).toEqual({
      kind: 'step',
      step: { do: 'action', key: 'open_log' },
    });
  });

  it('hành động có form hỏi từng ô, rồi dựng bước với chữ đã điền', async () => {
    const s = await sessionAfter({ do: 'start' }, { do: 'say', text: 'Dạ' });
    const plan = planCommand(engine('/lam message_su_co'), view(s), null);
    if (plan.kind !== 'form') throw new Error('phải là form');
    expect(plan.form.fields.map((f) => f.id)).toEqual(['noi_dung']);
    expect(plan.build({ noi_dung: 'chào' }, [])).toEqual({
      do: 'action',
      key: 'message_su_co',
      fields: { noi_dung: 'chào' },
    });
    expect(plan.build({ noi_dung: 'chào' }, ['h1'])).toMatchObject({
      ticks: ['h1'],
    });
  });

  it('hành động không có, hoặc chưa dùng được, báo lỗi chỉ đúng việc', async () => {
    const s = await sessionAfter({ do: 'start' }, { do: 'say', text: 'Dạ' });
    const unknown = planCommand(engine('/lam bay'), view(s), null);
    expect(unknown).toMatchObject({ kind: 'error' });
    expect((unknown as { message: string }).message).toContain('open_log');

    const blocked = view(s).actions.find((a) => !a.enabled);
    expect(blocked).toBeDefined();
    const plan = planCommand(engine(`/lam ${blocked?.key}`), view(s), null);
    expect(plan).toMatchObject({ kind: 'error' });
    expect((plan as { message: string }).message).toContain(
      blocked?.reason ?? '',
    );
  });

  it('lệnh sai chỗ báo lỗi dễ hiểu thay vì gửi engine', async () => {
    const s = await sessionAfter({ do: 'start' }, { do: 'say', text: 'Dạ' });
    for (const line of ['/chon a', '/nop', '/ket', '/huy', '/xong'])
      expect(planCommand(engine(line), view(s), null).kind).toBe('error');
    expect(planCommand(engine('/goiy'), view(s), null)).toEqual({
      kind: 'step',
      step: { do: 'hint' },
    });
  });
});

describe('planCommand: chọn phương án có đồng hồ', () => {
  const choice = (timeLimitSeconds?: number) =>
    ({
      await: { kind: 'node_choice', node: 'n1' },
      actions: [],
      node: {
        options: [
          { key: 'a', text: 'A' },
          { key: 'b', text: 'B' },
        ],
        timeLimitSeconds,
      },
    }) as unknown as shift.SceneView;

  it('trong giờ: ghi elapsedMs đã đo, làm tròn', () => {
    expect(planCommand(engine('/chon B'), choice(30), 4321.6)).toEqual({
      kind: 'step',
      step: { do: 'choose', option: 'b', elapsedMs: 4322 },
    });
  });

  it('chưa đo được thì không bịa elapsedMs', () => {
    expect(planCommand(engine('/chon a'), choice(30), null)).toEqual({
      kind: 'step',
      step: { do: 'choose', option: 'a' },
    });
  });

  it('quá giờ thì tính là hết giờ, không trả lời, và nói rõ', () => {
    const plan = planCommand(engine('/chon a'), choice(30), 31_000);
    expect(plan).toMatchObject({ kind: 'step', step: { do: 'timeout' } });
    expect((plan as { notice: string }).notice).toContain('hết giờ');
  });

  it('phương án không giới hạn giờ thì chờ bao lâu cũng được', () => {
    expect(planCommand(engine('/chon a'), choice(), 999_999)).toMatchObject({
      step: { do: 'choose' },
    });
  });

  it('phương án không có thì liệt kê phương án có', () => {
    const plan = planCommand(engine('/chon z'), choice(30), 1);
    expect(plan).toMatchObject({ kind: 'error' });
    expect((plan as { message: string }).message).toContain('a, b');
  });
});

describe('planCommand: nộp tài liệu và xác nhận kết ca', () => {
  const form = {
    id: 'email_an',
    title: 'Email',
    fields: [{ id: 'x', label: 'X' }],
    ticks: [],
  };

  it('/nop dựng bước save_artefact đúng tài liệu engine đang chờ', () => {
    const plan = planCommand(
      engine('/nop'),
      {
        await: { kind: 'node_artefact', node: 'n3', artefact: 'email_an' },
        actions: [],
        node: { form },
      } as unknown as shift.SceneView,
      null,
    );
    if (plan.kind !== 'form') throw new Error('phải là form');
    expect(plan.build({ x: 'nội dung' }, [])).toEqual({
      do: 'save_artefact',
      artefact: 'email_an',
      fields: { x: 'nội dung' },
    });
  });

  it('/ket và /huy chỉ dùng khi engine hỏi nộp sớm', () => {
    const confirm = {
      await: { kind: 'confirm_end', node: 'n3' },
      actions: [],
      node: null,
    } as unknown as shift.SceneView;
    expect(planCommand(engine('/ket'), confirm, null)).toEqual({
      kind: 'step',
      step: { do: 'confirm_end' },
    });
    expect(planCommand(engine('/huy'), confirm, null)).toEqual({
      kind: 'step',
      step: { do: 'cancel_end' },
    });
  });
});

describe('định dạng', () => {
  it('lời NPC có tên, vai, biểu cảm; {ten} được thay', () => {
    const line = formatLine(
      {
        seq: 0,
        at: 0,
        kind: 'npc',
        speaker: ctx.seed.cast[0].slot,
        text: 'Chào {ten}',
        expression: 'lo_lang',
        context: 'x',
      },
      ctx,
      'Nam',
    );
    expect(line).toBe(
      `  [${ctx.seed.cast[0].name} · ${ctx.seed.cast[0].relation} · lo_lang] Chào Nam`,
    );
  });

  it('dòng cảnh, hệ thống và người chơi khác nhau', () => {
    const base = { seq: 0, at: 0, speaker: 'canh', context: 'x' } as const;
    expect(formatLine({ ...base, kind: 'scene', text: 'a' }, ctx, 'Nam')).toBe(
      '  · a',
    );
    expect(formatLine({ ...base, kind: 'system', text: 'b' }, ctx, 'Nam')).toBe(
      '  » b',
    );
    expect(formatLine({ ...base, kind: 'player', text: 'c' }, ctx, 'Nam')).toBe(
      '  Bạn: c',
    );
  });

  it('dòng trạng thái có giờ, điểm đã dùng, còn lại và việc đang chờ', async () => {
    const s = await sessionAfter(
      { do: 'start' },
      { do: 'say', text: 'Dạ' },
      { do: 'action', key: 'open_log' },
    );
    const v = view(s);
    const status = formatStatus(v, ctx);
    expect(status).toContain(`[${v.clock.time}]`);
    expect(status).toContain(
      `đã dùng ${v.clock.pointsUsed}/${v.clock.budget} điểm thời gian, còn ${v.clock.remaining}`,
    );
    expect(status).toContain('bạn chọn việc làm tiếp');
    expect(v.clock.pointsUsed).toBeGreaterThan(0);
  });

  it('khối prompt ở pha tự do liệt kê hành động kèm key, nhãn, điểm', async () => {
    const s = await sessionAfter({ do: 'start' }, { do: 'say', text: 'Dạ' });
    const text = formatPrompt(view(s), ctx).join('\n');
    expect(text).toContain('/lam open_log —');
    expect(text).toContain('(1 điểm)');
    expect(text).toContain('/lam message_su_co');
    expect(text).toContain('có form');
    expect(text).toContain('Chưa dùng được:');
  });

  it('chờ chọn thì in phương án và đồng hồ; chờ trả lời thì nói ai hỏi', async () => {
    const asks = await sessionAfter({ do: 'start' });
    expect(formatStatus(view(asks), ctx)).toContain('đang chờ bạn trả lời');
    expect(formatOptions(view(asks))).toEqual([]);
    expect(formatActions(view(asks))).toEqual([]);

    const choosing = await sessionAfter(
      { do: 'start' },
      { do: 'say', text: 'Dạ' },
      { do: 'action', key: 'open_log' },
      { do: 'action', key: 'open_wiki' },
      { do: 'action', key: 'open_bang' },
      { do: 'action', key: 'open_dashboard' },
      { do: 'action', key: 'open_code' },
      { do: 'action', key: 'talk_support' },
      { do: 'end_conversation' },
      { do: 'action', key: 'write_patch', ticks: ['v1'] },
      { do: 'action', key: 'run_staging' },
      { do: 'action', key: 'wait' },
    );
    expect(choosing.state.await.kind).toBe('node_choice');
    const options = formatOptions(view(choosing)).join('\n');
    expect(options).toContain('a) ');
    expect(options).toContain('40 giây');
  });

  it('/tt in cờ, dữ kiện, lời hứa, khúc mắc, nút và yêu cầu AI đang chờ', async () => {
    const s = await sessionAfter({ do: 'start' }, { do: 'say', text: 'Dạ' });
    const text = formatDebug(s.state, ctx).join('\n');
    for (const part of [
      'Cờ đã bật',
      'Dữ kiện đã mở',
      'Lời hứa:',
      'Khúc mắc của NPC:',
      'Nút:',
      'n1 (mid)',
      'Yêu cầu AI đang chờ: không',
    ])
      expect(text).toContain(part);
  });

  it('một dòng cho mỗi lượt gọi AI, kèm cờ vừa bật', async () => {
    const s = await sessionAfter({ do: 'start' }, { do: 'say', text: 'Dạ' });
    const call = s.calls[0];
    expect(formatCall({ ...call, flagsAdded: ['a', 'b'] })).toContain(
      'cờ bật: a, b',
    );
    expect(formatCall(call)).toContain(`${call.service} `);
  });

  it('tên lượt chơi hợp lệ với tên kịch bản', () => {
    const name = playName(new Date(2026, 10, 19, 9, 5, 7));
    expect(name).toBe('choi-thu-20261119-090507');
    expect(() =>
      parsePlaythrough(
        {
          name,
          seed: SEED,
          title: 't',
          intent: 'i',
          steps: [{ do: 'start' }],
        },
        'x',
      ),
    ).not.toThrow();
  });
});

describe('--play nhận đường dẫn file', () => {
  it('đường dẫn .json được nạp như tên trong thư mục', () => {
    const dir = join(__dirname, '..', 'playthroughs');
    const byName = selectPlaythroughs(dir, 'lam-tot')[0];
    const byPath = selectPlaythroughs(dir, join(dir, 'lam-tot.json'))[0];
    expect(byPath).toEqual(byName);
  });

  it('tên sai vẫn liệt kê tên có và nhắc đường dẫn', () => {
    expect(() => selectPlaythroughs(__dirname, 'khong-co')).toThrow(
      /đường dẫn file/,
    );
  });
});
