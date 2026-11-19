import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough, Readable } from 'node:stream';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { FakeShiftChecker, FakeShiftNarrator } from '../../../ai/shift/fake';
import type { ShiftNarrator } from '../../../ai/shift/types';
import { loadPlaythrough, selectPlaythroughs, type Step } from '../playthrough';
import { createPorts, fakeRuntime } from '../ports';
import { emptyDetail, runPlaythrough, type LabPorts } from '../runner';
import { createLineReader, type LineReader } from './lineReader';
import { playInteractive, type PlayOptions } from './play';

const SEED = 'SWE_BACKEND.L3.m2';
const ctx = fixtureShiftContext(SEED);
const DIR = join(__dirname, '..', 'playthroughs');
const IDENTITY = {
  names: ['Nam'],
  usernames: ['nam'],
  emails: ['nam@example.com'],
};

let tmp: string;
beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), 'ai-lab-play-'));
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const fakePorts = (): LabPorts =>
  createPorts(fakeRuntime({ allowUnconfirmedProviders: false }), undefined);

/** Giá trị gõ cho từng ô của một form, theo thứ tự engine hỏi: ô chữ rồi ô tick. */
function formInput(
  artefactId: string,
  fields: Record<string, string> | undefined,
  ticks: string[] | undefined,
): string[] {
  const artefact = ctx.seed.artefacts.find((a) => a.id === artefactId);
  if (!artefact) throw new Error(`không có tài liệu ${artefactId}`);
  return [
    ...(artefact.fields ?? []).map((f) => fields?.[f.id] ?? ''),
    ...(artefact.ticks ?? []).map((t) => (ticks?.includes(t.id) ? 'c' : 'k')),
  ];
}

/** Đổi các bước đã áp dụng của một kịch bản thành những dòng tester sẽ gõ. */
function typedLines(steps: Step[]): string[] {
  const lines: string[] = [];
  for (const step of steps)
    switch (step.do) {
      case 'start':
        break; // chơi tay tự bắt đầu
      case 'say':
        lines.push(step.text);
        break;
      case 'action': {
        lines.push(`/lam ${step.key}`);
        const action = ctx.seed.actions.find((a) => a.key === step.key);
        if (step.fields && action?.target)
          lines.push(...formInput(action.target, step.fields, step.ticks));
        break;
      }
      case 'end_conversation':
        lines.push('/xong');
        break;
      case 'choose':
        lines.push(`/chon ${step.option}`);
        break;
      case 'save_artefact':
        lines.push(
          '/nop',
          ...formInput(step.artefact, step.fields, step.ticks),
        );
        break;
      case 'confirm_end':
        lines.push('/ket');
        break;
      default:
        throw new Error(`test chưa hỗ trợ ${step.do}`);
    }
  return lines;
}

/** Các bước của `lam-tot` mà engine thật sự nhận khi chạy bản giả (bỏ bước ifAwait bị bỏ qua). */
async function appliedSteps(name: string): Promise<Step[]> {
  const result = await runPlaythrough(selectPlaythroughs(DIR, name)[0], {
    ctx,
    ports: fakePorts(),
    budgetUsd: 1,
  });
  expect(result.outcome).toBe('ended');
  return result.steps.filter((s) => !s.skipped).map((s) => s.step);
}

function harness(lines: string[], over: Partial<PlayOptions> = {}) {
  const shown: string[] = [];
  const prompts = new PassThrough();
  const reader = createLineReader(
    Readable.from(lines.map((l) => `${l}\n`)),
    prompts,
  );
  const run = () =>
    playInteractive({
      seedId: SEED,
      mode: 'fake',
      only: undefined,
      budgetUsd: 0.25,
      ports: fakePorts(),
      runtime: fakeRuntime({ allowUnconfirmedProviders: false }),
      identity: IDENTITY,
      displayName: 'Nam',
      reader,
      out: (text) => shown.push(text),
      now: () => 1_700_000_000_000,
      ...over,
    }).finally(() => reader.close());
  return { run, shown, text: () => shown.join('\n') };
}

describe('playInteractive', () => {
  it('chơi trọn ca ở chế độ fake: in tóm tắt và bước chấm, ghi hai file chạy lại được', async () => {
    const lines = typedLines(await appliedSteps('lam-tot'));
    // Chèn lệnh sai, lệnh xem trạng thái và nhận xét ở ranh giới giữa các bước (không giữa form).
    const split = lines.indexOf('/xong') + 1;
    const input = [
      '/giup',
      '/bay',
      '/lam khong_co',
      '/chon a',
      ...lines.slice(0, 3),
      '/tt',
      '/ghichu seed hỏi hơi dài ở nút mở',
      ...lines.slice(3, split),
      '/ghichu rubric chưa hỏi về lời hứa',
      ...lines.slice(split),
    ];
    const out = join(tmp, 'full');
    const h = harness(input, { outDir: out });
    const played = await h.run();
    const text = h.text();

    expect(played.quit).toBe(false);
    expect(played.result.outcome).toBe('ended');
    expect(played.result.state.ended).toBe(true);

    // Lượt in: lời NPC có tên và vai, dòng trạng thái, danh sách hành động.
    expect(text).toMatch(/\[anh An · [^\]]+ · [a-z_]+\]/);
    expect(text).toMatch(/\[\d{1,2}:\d{2}\] đã dùng \d+\/28 điểm thời gian/);
    expect(text).toContain('/lam open_log —');
    // Lệnh sai báo lỗi, không văng.
    expect(text).toContain('✘ Không có lệnh /bay');
    expect(text).toContain('✘ Không có hành động "khong_co"');
    expect(text).toContain('✘ Chưa có phương án nào để chọn');
    // /tt và /ghichu.
    expect(text).toContain('Trạng thái nội bộ (tester):');
    expect(text).toContain('✔ Đã ghi nhận xét 2');
    expect(played.notes.map((n) => n.text)).toEqual([
      'seed hỏi hơi dài ở nút mở',
      'rubric chưa hỏi về lời hứa',
    ]);
    expect(played.notes[0].afterStep).toBeLessThan(played.notes[1].afterStep);
    // Hết ca: tóm tắt, rồi bước chấm của AI-5.
    expect(text).toContain('Tóm tắt ca');
    expect(text).toContain('Bước AI-5 chấm theo checklist');
    expect(text).toContain('graded');

    // Hai file, đúng khuôn.
    expect(played.files).toHaveLength(2);
    const [scriptPath, reportPath] = played.files;
    expect(scriptPath).toMatch(/choi-thu-\d{8}-\d{6}\.json$/);
    expect(reportPath).toMatch(/choi-thu-\d{8}-\d{6}\.md$/);

    const report = readFileSync(reportPath, 'utf-8');
    expect(report).toContain('## Ghi nhận của tester');
    expect(report.indexOf('seed hỏi hơi dài')).toBeLessThan(
      report.indexOf('rubric chưa hỏi'),
    );
    for (const heading of [
      '## Sổ lời',
      '## Lượt gọi AI',
      '## Cờ lúc kết thúc',
      '## Kết quả chấm',
    ])
      expect(report).toContain(heading);

    // Chạy lại file kịch bản bằng runner: cùng trạng thái cuối.
    const replayed = loadPlaythrough(scriptPath);
    const [viaSelect] = selectPlaythroughs(DIR, scriptPath);
    expect(viaSelect).toEqual(replayed);
    const replay = await runPlaythrough(replayed, {
      ctx,
      ports: fakePorts(),
      budgetUsd: 1,
    });
    expect(replay.outcome).toBe('ended');
    expect(replay.state).toEqual(played.result.state);
    expect(replay.summary).toEqual(played.result.summary);
  });

  it('thoát giữa ca vẫn lưu file và nhận xét, không chấm', async () => {
    const out = join(tmp, 'quit');
    const h = harness(['Dạ anh', '/ghichu dừng sớm', '/thoat', 'không đọc'], {
      outDir: out,
    });
    const played = await h.run();
    expect(played.quit).toBe(true);
    expect(played.result.outcome).toBe('incomplete');
    expect(h.text()).toContain('Đã thoát giữa ca');
    expect(h.text()).not.toContain('Bước AI-5');
    const report = readFileSync(played.files[1], 'utf-8');
    expect(report).toContain('dừng sớm');
    expect(report).toContain('ca chưa kết thúc nên chưa chấm');
    expect(loadPlaythrough(played.files[0]).steps).toHaveLength(2);
  });

  it('hết đầu vào (Ctrl+D) coi như thoát', async () => {
    const h = harness([]);
    const played = await h.run();
    expect(played.quit).toBe(true);
    expect(played.files).toEqual([]);
  });

  it('engine từ chối thì báo lỗi và in lại việc dùng được, ca vẫn chạy tiếp', async () => {
    const h = harness(['Dạ anh', 'Xin chào', '/lam open_log', '/thoat']);
    const played = await h.run();
    const text = h.text();
    expect(text).toContain(
      '✘ Engine từ chối: Hãy chọn người để trò chuyện trước.',
    );
    expect(text).toContain('/lam open_log —');
    // Lời từ chối không thành bước kịch bản.
    expect(
      played.result.steps.filter((s) => !s.skipped).map((s) => s.step.do),
    ).toEqual(['start', 'say', 'action']);
  });

  it('form: /bo bỏ form mà không gửi gì cho engine', async () => {
    const h = harness(['Dạ anh', '/lam message_su_co', '/bo', '/thoat']);
    const played = await h.run();
    expect(h.text()).toContain('Đã bỏ form');
    expect(
      played.result.steps.filter((s) => !s.skipped).map((s) => s.step.do),
    ).toEqual(['start', 'say']);
  });

  it('form: Enter giữ bản đã lưu của ô, bỏ trống toàn bộ thì engine từ chối', async () => {
    const h = harness([
      'Dạ anh',
      '/lam message_su_co',
      '',
      '/lam message_su_co',
      'Em đang xử lý',
      '/thoat',
    ]);
    const played = await h.run();
    expect(h.text()).toContain('✘ Engine từ chối: Tài liệu còn trống');
    const action = played.result.steps.at(-1)?.step;
    expect(action).toEqual({
      do: 'action',
      key: 'message_su_co',
      fields: { noi_dung: 'Em đang xử lý' },
    });
  });

  describe('đồng hồ chọn phương án', () => {
    let toChoice: string[] = [];
    beforeAll(async () => {
      const lines = typedLines(await appliedSteps('lam-tot'));
      toChoice = lines.slice(0, lines.indexOf('/lam wait') + 1);
    });

    /** Reader giả để xen đồng hồ vào giữa các dòng: đồng hồ nhảy trước khi dòng cho trước được đọc. */
    function timed(lines: string[], jumpBefore: Record<string, number>) {
      const t = { ms: 1_000_000 };
      let i = 0;
      const reader: LineReader = {
        read: async () => {
          const line = lines[i++] ?? null;
          if (line !== null && jumpBefore[line] !== undefined)
            t.ms += jumpBefore[line];
          return line;
        },
        close: () => undefined,
      };
      return { reader, now: () => t.ms };
    }

    it('chọn kịp giờ: ghi elapsedMs đo từ lúc phương án hiện ra', async () => {
      const { reader, now } = timed([...toChoice, '/chon a', '/thoat'], {
        '/chon a': 4_000,
      });
      const h = harness([], { reader, now });
      const played = await h.run();
      expect(h.text()).toContain('Đồng hồ: 30 giây');
      const choose = played.result.steps
        .map((s) => s.step)
        .find((s) => s.do === 'choose');
      expect(choose).toEqual({ do: 'choose', option: 'a', elapsedMs: 4000 });
    });

    it('chọn trễ: tính là hết giờ (D-86) và nói rõ', async () => {
      const { reader, now } = timed([...toChoice, '/chon a', '/thoat'], {
        '/chon a': 31_000,
      });
      const h = harness([], { reader, now });
      const played = await h.run();
      expect(h.text()).toContain('tính là hết giờ');
      expect(played.result.steps.map((s) => s.step.do)).toContain('timeout');
      expect(played.result.state.nodes['n1'].timedOut).toBe(true);
    });

    it('lệnh sai không reset đồng hồ', async () => {
      const { reader, now } = timed(
        [...toChoice, '/chon z', '/chon a', '/thoat'],
        { '/chon z': 20_000, '/chon a': 12_000 },
      );
      const h = harness([], { reader, now });
      const played = await h.run();
      // 20s + 12s = 32s kể từ lúc phương án hiện ra, dù /chon z báo lỗi giữa chừng.
      expect(played.result.steps.map((s) => s.step.do)).toContain('timeout');
    });
  });

  describe('hết model giữa ca', () => {
    it('ca tạm dừng, /lai thử lại và đi tiếp khi model về', async () => {
      let down = true;
      const inner = new FakeShiftNarrator();
      const narrator: ShiftNarrator = {
        narrate: async (req) =>
          down
            ? { status: 'unavailable', reason: 'no_model' }
            : inner.narrate(req),
      };
      const ports: LabPorts = {
        narrator,
        checker: new FakeShiftChecker(),
        narratorMode: 'fake',
        checkerMode: 'fake',
        drain: emptyDetail,
      };
      const shown: string[] = [];
      let i = 0;
      const lines = ['Dạ anh', '/lai', '/lai', '/thoat'];
      const reader: LineReader = {
        read: async () => {
          const line = lines[i++] ?? null;
          if (line === '/lai' && i === 3) down = false;
          return line;
        },
        close: () => undefined,
      };
      const played = await playInteractive({
        seedId: SEED,
        mode: 'fake',
        only: undefined,
        budgetUsd: 0.25,
        ports,
        runtime: fakeRuntime({ allowUnconfirmedProviders: false }),
        identity: IDENTITY,
        displayName: 'Nam',
        reader,
        out: (t) => shown.push(t),
      });
      const text = shown.join('\n');
      expect(text).toContain('Hết model dùng được: no_model');
      expect(text).toContain('/lai để thử lại');
      expect(played.result.state.pending).toBeNull();
      expect(played.result.calls.some((c) => c.status === 'unavailable')).toBe(
        true,
      );
      expect(played.result.calls.some((c) => c.status === 'ok')).toBe(true);
    });
  });

  it('seed không có thì báo kèm danh sách seed', async () => {
    const h = harness([], { seedId: 'KHONG.L1.m1' });
    await expect(h.run()).rejects.toThrow(/Seed có: .*SWE_BACKEND\.L3\.m2/);
  });
});
