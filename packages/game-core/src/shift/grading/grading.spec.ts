import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { fixtureShiftContext } from '../../testing/fixture.js';
import { initialState, step } from '../engine.js';
import type { PlayerInput, ShiftInput, ShiftState } from '../state.js';
import { fakeChecks, fakeNarration } from '../testing/fakes.js';
import { FAKE_EVENTS, FAKE_RULES } from '../testing/fakeRules.js';
import {
  closedSegments,
  evidenceSegments,
  findTurn,
  turnsOf,
  verifyQuote,
  type EvidenceSegment,
  type EvidenceTurn,
} from './evidence.js';
import {
  CHECKLIST_FLAGS,
  CHECKLIST_GROUPS,
  CHECKLIST_ITEMS,
  HARD_FLAGS,
  OVERLAP_GROUPS,
  checklistItem,
} from './library.js';
import { lintObserves, type ObserveItem } from './observe.js';
import {
  checkOutput,
  consensusFlags,
  expectedPairs,
  fixedPairLevels,
  flagPenalty,
  groupScores,
  itemLevel,
  normalizeFlags,
  pairLevels,
  quoteReliability,
  subLevels,
  type CheckedFlag,
  type CheckedItem,
  type FlagInstance,
  type RawAnswer,
  type RawItem,
} from './scoring.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SPEC = readFileSync(
  join(
    HERE,
    '..',
    '..',
    '..',
    '..',
    '..',
    'occupation-data',
    'specs',
    'spec-checklist-softskill.md',
  ),
  'utf-8',
).split(/\r?\n/);

const SEED = 'SWE_BACKEND.L3.m2';
const ctx = fixtureShiftContext(SEED);
const OBSERVES = ctx.seed.observes ?? [];

/* ── Thư viện so khớp spec ────────────────────────────────────────────── */

function specRows(section: RegExp): string[][] {
  const start = SPEC.findIndex((l) => section.test(l));
  const rows: string[][] = [];
  for (const line of SPEC.slice(start + 1)) {
    if (line.startsWith('## ') || line.startsWith('**Cách áp dụng')) break;
    if (!line.startsWith('|')) continue;
    rows.push(
      line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim()),
    );
  }
  return rows;
}

describe('thư viện checklist chép từ spec', () => {
  const itemRows = CHECKLIST_GROUPS.flatMap((g) =>
    specRows(new RegExp(`^## Nhóm ${g.no} `)).filter((r) =>
      /^\d\.\d$/.test(r[0]),
    ),
  );

  it('số lượng khớp spec: 7 nhóm, 13 cờ, mọi dòng mục con', () => {
    expect(CHECKLIST_GROUPS).toHaveLength(7);
    expect(CHECKLIST_FLAGS).toHaveLength(13);
    expect(CHECKLIST_ITEMS).toHaveLength(itemRows.length);
    // D-143: 43 mục con, nhóm 2 có 2.1–2.7.
    expect(CHECKLIST_ITEMS).toHaveLength(43);
    expect(
      CHECKLIST_GROUPS.map(
        (g) => CHECKLIST_ITEMS.filter((i) => i.group === g.no).length,
      ),
    ).toEqual([6, 7, 6, 7, 6, 5, 6]);
  });

  it('từng ô của từng mục con khớp spec', () => {
    const fromSpec = itemRows.map(([sub, name, when, A, B, C, flags]) => ({
      sub,
      name,
      when,
      A,
      B,
      C,
      flags: flags === '—' ? [] : flags.split(',').map((f) => f.trim()),
    }));
    const fromCode = CHECKLIST_ITEMS.map(
      ({ sub, name, when, A, B, C, flags }) => ({
        sub,
        name,
        when,
        A,
        B,
        C,
        flags,
      }),
    );
    expect(fromCode).toEqual(fromSpec);
  });

  it('13 cờ khớp spec, nhóm nhận phạt theo bảng 5/11', () => {
    const rows = specRows(/^## Cờ chung/).filter((r) => /^C\d+$/.test(r[0]));
    expect(CHECKLIST_FLAGS.map((f) => [f.code, f.behaviour, f.except])).toEqual(
      rows.map(([code, behaviour, except]) => [code, behaviour, except]),
    );

    const group = (codes: string[]) =>
      codes.map((c) => CHECKLIST_FLAGS.find((f) => f.code === c)?.group);
    expect(group(['C1', 'C2', 'C10', 'C11', 'C12'])).toEqual([2, 2, 2, 2, 2]);
    expect(group(['C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C13'])).toEqual([
      7, 7, 7, 7, 7, 7, 7,
    ]);
    expect(group(['C9'])).toEqual([1]);
    const line = SPEC.find((l) => l.startsWith('- **Mỗi cờ có một nhóm'));
    expect(line).toContain('C1, C2, C10, C11, C12 → nhóm 2');
    expect(line).toContain('C9 → nhóm 1');
  });

  it('luật trùng và cờ nặng khớp spec', () => {
    const start = SPEC.findIndex((l) => l.startsWith('## Luật trùng'));
    const overlap = SPEC.slice(start + 1)
      .filter((l) => l.startsWith('- '))
      .slice(0, 9)
      .map((l) => [...new Set(l.match(/\d\.\d/g) ?? [])]);
    expect(OVERLAP_GROUPS.map((g) => [...g])).toEqual(overlap);
    expect([...HARD_FLAGS]).toEqual(['C4', 'C5', 'C6', 'C8']);
  });
});

/* ── observes ─────────────────────────────────────────────────────────── */

describe('observes của seed L3.m2 (nháp, chờ DE duyệt)', () => {
  it('qua lint: 5 mục con hợp lệ, from trỏ nút có thật, không trùng nhóm', () => {
    expect(lintObserves(OBSERVES, ctx.seed)).toEqual([]);
    expect(OBSERVES.map((o) => o.sub)).toEqual([
      '4.2',
      '7.1',
      '1.5',
      '7.4',
      '1.1',
    ]);
    expect(OBSERVES.map((o) => checklistItem(o.sub)?.group)).toEqual([
      4, 7, 1, 7, 1,
    ]);
  });

  it('lint bắt: số lượng, mã lạ, from lạ, trùng nhóm', () => {
    const o = (sub: string, from = ['pha']): ObserveItem => ({ sub, from });
    expect(lintObserves([o('1.1'), o('4.2')])).toEqual([
      'Mỗi màn khai 3–6 mục con, đang có 2',
    ]);
    const bad = lintObserves(
      [o('9.9'), o('7.1', ['n9']), o('5.6'), o('7.4'), o('5.5')],
      ctx.seed,
    );
    expect(bad).toContain('Mục con 9.9 không có trong thư viện');
    expect(bad).toContain('7.1: from "n9" không phải nút của seed');
    expect(bad).toContain('Luật trùng: chỉ chọn một trong 7.1, 5.6');
    expect(bad).toContain('Luật trùng: chỉ chọn một trong 7.4, 5.5');
    expect(
      lintObserves([o('7.1', ['review']), o('1.1'), o('4.2')], ctx.seed),
    ).toEqual([]);
    expect(
      lintObserves([o('7.1', ['review']), o('1.1'), o('4.2')], {
        ...ctx.seed,
        review: [],
      }),
    ).toEqual(['7.1: from "review" mà seed không có "Nhìn lại ca"']);
  });
});

/* ── Dựng đoạn bằng chứng từ một ca chơi ──────────────────────────────── */

class Run {
  state: ShiftState = initialState(ctx);
  send(input: PlayerInput): this {
    this.apply(input);
    return this;
  }
  private apply(input: ShiftInput): void {
    const { state, effects } = step(this.state, input, ctx);
    this.state = state;
    for (const e of effects) {
      if (e.type === 'narrate')
        this.apply({
          type: 'NARRATION',
          requestId: e.request.requestId,
          beats: fakeNarration(e.request),
        });
      if (e.type === 'check')
        this.apply({
          type: 'CHECKS',
          requestId: e.request.requestId,
          answers: fakeChecks(e.request, FAKE_RULES[SEED], FAKE_EVENTS[SEED]),
        });
    }
  }
  action(key: string, fields?: Record<string, string>, ticks?: string[]) {
    return this.send({ type: 'ACTION', key, fields, ticks });
  }
  say(text: string) {
    return this.send({ type: 'SAY', text });
  }
}

const PATCH = {
  ghi_chu:
    'Bỏ vòng lặp, gom chi tiết đơn bằng một truy vấn. Thêm phân trang 50 đơn.',
};
const NOTE = {
  hien_tuong: 'API lịch sử đơn chậm hơn 4 giây với khách nhiều đơn.',
  nguyen_nhan: 'Gọi DB trong vòng lặp, 901 lần cho MP-0042.',
  da_lam: 'Viết bản vá, chạy staging.',
};
const EMAIL = {
  tieu_de: 'Xin duyệt bản sửa API lịch sử đơn',
  nguyen_nhan: 'API gọi DB trong vòng lặp, 901 lần cho MP-0042.',
  huong_xu_ly: 'Gom truy vấn, thêm phân trang.',
  rui_ro: 'Lỗi thì rollback về bản cũ.',
};
const SUPPORT_UPDATE = 'Chị ơi em tìm ra lỗi rồi, đang sửa.';
const SUPPORT_APPOINTMENT = `${SUPPORT_UPDATE} 11:30 em gọi báo lại chị nha.`;

function fullRun(supportUpdate = SUPPORT_APPOINTMENT): ShiftState {
  const d = new Run().send({ type: 'START' }).say('Dạ em coi liền anh.');
  d.action('open_log')
    .action('open_code')
    .action('open_bang')
    .action('open_dashboard');
  d.action('talk_mentor').say(
    'Anh ơi API gọi DB trong vòng lặp, 901 lần cho MP-0042. Khách ít đơn cùng giờ vẫn nhanh nên không phải DB.',
  );
  d.action('talk_support').say(supportUpdate);
  d.action('write_patch', PATCH, ['v1', 'v2', 'v3'])
    .action('run_staging')
    .action('wait');
  d.send({ type: 'CHOOSE', option: 'a', elapsedMs: 9000 });
  d.say('Dạ em đang sửa rồi chị.');
  d.action('chot_nguyen_nhan');
  d.send({
    type: 'SAVE_ARTEFACT',
    artefact: 'ghi_chu_su_co',
    fields: NOTE,
    ticks: ['h3=giu', 'h6=chua_ro'],
  });
  d.say(
    'Em giữ khả năng API trả hết đơn không giới hạn vì app cũ không gửi số trang.',
  );
  d.action('meeting');
  d.say('Em có bản sửa chạy thử rồi, còn chờ anh An duyệt.');
  d.send({ type: 'END_CONVERSATION' });
  d.action('talk_support');
  d.action('gui_anh_an');
  d.send({ type: 'CONFIRM_END' });
  d.send({ type: 'SAVE_ARTEFACT', artefact: 'email_an', fields: EMAIL });
  d.say('Nếu khách nhiều đơn hơn thì em theo dõi log, lỗi thì rollback.');
  return d.state;
}

describe('closedSegments', () => {
  it('nút đã xong thì chấm được ngay; pha và review chờ ca kết thúc', () => {
    const state = fullRun();
    const mid = structuredClone(state);
    mid.ended = false;
    const ids = (s: ShiftState) =>
      closedSegments(s, ctx, OBSERVES).map((x) => x.id);
    expect(ids(mid)).not.toContain('pha');
    expect(ids(mid)).toContain('n1');
    const done = structuredClone(state);
    done.ended = true;
    expect(ids(done)).toContain('pha');
  });

  it('nút chưa xong không có đoạn đóng', () => {
    const early = new Run().send({ type: 'START' }).say('Dạ em coi liền anh.');
    expect(closedSegments(early.state, ctx, OBSERVES)).toEqual([]);
  });
});

describe('evidenceSegments', () => {
  const state = fullRun();
  const segments = evidenceSegments(state, ctx, OBSERVES);
  const byId = (id: string): EvidenceSegment => {
    const found = segments.find((s) => s.id === id);
    if (!found) throw new Error(`thiếu đoạn ${id}`);
    return found;
  };

  it('một đoạn cho mỗi nơi lấy bằng chứng: nút theo thứ tự seed, rồi pha', () => {
    expect(segments.map((s) => s.id)).toEqual(['n1', 'e1', 'n2', 'n3', 'pha']);
    expect(byId('n1').subs).toEqual(['1.5', '7.4']);
    expect(byId('e1').subs).toEqual(['1.5', '7.4']);
    expect(byId('n2').subs).toEqual(['4.2', '7.1']);
    expect(byId('n3').subs).toEqual(['4.2', '7.1', '1.1']);
    expect(byId('pha').subs).toEqual(['4.2', '7.1', '1.5', '7.4']);
    expect(segments.every((s) => s.outcome === 'answered')).toBe(true);
  });

  it('mỗi lượt nói có mã ổn định, không trùng giữa các đoạn', () => {
    const codes = segments.flatMap((s) => turnsOf(s).map((t) => t.code));
    expect(new Set(codes).size).toBe(codes.length);
    for (const s of segments)
      for (const t of turnsOf(s))
        expect(t.code).toMatch(/^(t\d+|act\d{2}|art_[a-z_]+)$/);
    // Mã `t` là vị trí trong sổ lời: đọc lại đúng dòng người chơi.
    for (const t of turnsOf(byId('n1')))
      expect(state.transcript[Number(t.code.slice(1))].text).toBe(t.text);
    expect(fullRun()).toEqual(state);
  });

  it.each([
    [
      'mặc định',
      SUPPORT_UPDATE,
      'Em chưa dám hứa giờ chị ạ. 11h30 em gọi báo chị tình hình nha.',
    ],
    [
      'đổi theo hẹn',
      SUPPORT_APPOINTMENT,
      'Em chưa dám hứa giờ chị ạ. Tới giờ hẹn em báo chị như đã nói.',
    ],
  ])(
    'nút đóng: chữ phương án %s không vào đoạn, lời nói thêm thì có',
    (_, supportUpdate, option) => {
      const run = fullRun(supportUpdate);
      const n1 = evidenceSegments(run, ctx, OBSERVES).find(
        (segment) => segment.id === 'n1',
      );
      if (!n1) throw new Error('Thiếu đoạn n1');
      expect(turnsOf(n1).map((t) => t.text)).toEqual([
        'Dạ em đang sửa rồi chị.',
      ]);
      expect(run.transcript).toContainEqual(
        expect.objectContaining({
          kind: 'player',
          context: 'node:n1',
          text: option,
        }),
      );
      expect(JSON.stringify(n1)).not.toContain(option);
    },
  );

  it('nút artefact: cả bài nộp là một lượt, kèm câu trả lời probe riêng', () => {
    const n3 = turnsOf(byId('n3'));
    expect(n3.map((t) => [t.code, t.kind])).toEqual([
      ['art_email_an', 'artefact'],
      [expect.stringMatching(/^t\d+$/), 'say'],
    ]);
    expect(n3[0].text).toBe(Object.values(EMAIL).join('\n'));
    expect(n3[0].parts?.map((p) => p.label)).toEqual(
      ctx.seed.artefacts
        .find((a) => a.id === 'email_an')
        ?.fields?.map((f) => f.label),
    );
    // Lời probe (NPC) chỉ là bối cảnh, không trích được.
    const npc = byId('n3').entries.filter((e) => e.role === 'npc');
    expect(npc.length).toBeGreaterThan(0);
    expect(turnsOf(byId('n3')).map((t) => t.text)).not.toContain(
      (npc[0] as { text: string }).text,
    );
  });

  it('pha: lời trong trò chuyện cộng nhật ký hành động theo đúng thứ tự', () => {
    const pha = byId('pha');
    const actions = turnsOf(pha).filter((t) => t.kind === 'action');
    expect(actions.map((t) => t.code)).toEqual(
      state.actionLog.map((_, i) => `act${String(i + 1).padStart(2, '0')}`),
    );
    expect(actions[0].text).toContain('open_log');
    expect(turnsOf(pha).some((t) => t.text === SUPPORT_APPOINTMENT)).toBe(true);
    // Kết quả chạy thử có mặt như bối cảnh hệ thống.
    expect(pha.entries.some((e) => e.role === 'system')).toBe(true);
    // Mỗi lượt không đi trước lượt trước nó.
    const ats = pha.entries.map((e) =>
      e.role === 'player' ? e.turn.at : e.at,
    );
    expect([...ats].sort((a, b) => a - b)).toEqual(ats);
  });

  it('kèm dữ kiện đã mở tới cuối đoạn và quy định đã được nghe', () => {
    const n1Facts = byId('n1').facts.map((f) => f.id);
    expect(n1Facts).toEqual(expect.arrayContaining(['f5', 'f4']));
    expect(byId('n1').rulesHeard.map((r) => r.id)).toEqual(['r1', 'r2']);
    expect(byId('pha').promises).toEqual([
      expect.objectContaining({ status: expect.any(String) }),
    ]);
    expect(byId('n2').brief).toContain(ctx.seed.goal);
  });

  it('bản vá nộp trong pha là một lượt art_ban_va của đoạn pha (D-144)', () => {
    const pha = byId('pha');
    const patch = turnsOf(pha).find((t) => t.code === 'art_ban_va');
    expect(patch).toMatchObject({ kind: 'artefact', text: PATCH.ghi_chu });
    expect(patch?.parts).toEqual([
      { label: 'Ghi chú cho người review', text: PATCH.ghi_chu },
    ]);
    // Bài nộp của nút không lặp lại trong pha.
    expect(turnsOf(pha).some((t) => t.code === 'art_email_an')).toBe(false);
    expect(
      verifyQuote(pha, 'art_ban_va', 'gom chi tiết đơn bằng một truy vấn'),
    ).toBe(true);
  });

  it('"Nhìn lại ca" là đoạn review; chưa mục nào bật thì không có đoạn (D-144)', () => {
    expect(segments.some((s) => s.id === 'review')).toBe(false);
    const copy = structuredClone(state);
    const at = Math.max(...copy.transcript.map((l) => l.at));
    const base = copy.transcript.length;
    copy.transcript.push(
      {
        ...copy.transcript[0],
        seq: base,
        at,
        kind: 'npc',
        speaker: 'support',
        context: 'review:tre_hen',
        text: 'Lúc 11:30 chị chờ hoài, em kẹt gì vậy?',
      },
      {
        ...copy.transcript[0],
        seq: base + 1,
        at,
        kind: 'player',
        speaker: 'player',
        context: 'review:tre_hen',
        text: 'Dạ em xin lỗi chị, em mải chạy staging nên quên báo.',
      },
    );
    const review = evidenceSegments(copy, ctx, OBSERVES).find(
      (s) => s.id === 'review',
    );
    expect(review).toMatchObject({ kind: 'review', subs: ['7.4'] });
    expect(turnsOf(review as EvidenceSegment).map((t) => t.code)).toEqual([
      `t${base + 1}`,
    ]);
    expect(review?.entries[0]).toMatchObject({ role: 'npc' });
    expect(review?.promises.length).toBe(copy.promises.length);
  });

  it('nút chưa tới thì không có đoạn (không xét, D2); chưa làm gì ở pha thì không có đoạn pha', () => {
    const early = new Run().send({ type: 'START' }).say('Dạ em coi liền anh.');
    expect(evidenceSegments(early.state, ctx, OBSERVES)).toEqual([]);
  });

  it('hết giờ mà không nói thêm gì: đoạn timed_out, mức 0 không qua judge (D-86)', () => {
    const copy = structuredClone(state);
    copy.nodes.n1.timedOut = true;
    copy.transcript = copy.transcript.filter(
      (l) => !(l.kind === 'player' && l.context === 'node:n1'),
    );
    const seg = evidenceSegments(copy, ctx, OBSERVES).find(
      (s) => s.id === 'n1',
    );
    expect(seg).toMatchObject({ outcome: 'timed_out', subs: ['1.5', '7.4'] });
    expect(fixedPairLevels([seg as EvidenceSegment])).toEqual([
      {
        sub: '1.5',
        segment: 'n1',
        level: 0,
        forcedZero: false,
        fixed: 'timed_out',
      },
      {
        sub: '7.4',
        segment: 'n1',
        level: 0,
        forcedZero: false,
        fixed: 'timed_out',
      },
    ]);
    expect(expectedPairs([seg as EvidenceSegment])).toEqual([]);
  });

  it('verifyQuote: chuỗi con sau chuẩn hoá khoảng trắng, đúng lượt, đúng đoạn', () => {
    const n3 = byId('n3');
    const email = turnsOf(n3)[0];
    expect(verifyQuote(n3, email.code, '901 lần   cho\nMP-0042')).toBe(true);
    expect(verifyQuote(n3, email.code, '901 lần cho MP-0099')).toBe(false);
    expect(verifyQuote(n3, email.code, '')).toBe(false);
    expect(verifyQuote(n3, email.code, 'rollback về bản cũ')).toBe(true);
    // D-145: ít nhất 3 tiếng, trừ khi trích trọn lượt nói.
    expect(verifyQuote(n3, email.code, 'rollback')).toBe(false);
    expect(verifyQuote(n3, email.code, 'về bản')).toBe(false);
    const short = seg('n9', [], [turn('t9', 'Dạ ok chị.')]);
    expect(verifyQuote(short, 't9', 'Dạ ok chị.')).toBe(true);
    expect(verifyQuote(short, 't9', 'ok chị')).toBe(false);
    // Chữ hoa thường phải khớp.
    expect(verifyQuote(n3, email.code, 'ROLLBACK')).toBe(false);
    // Lượt của đoạn khác, hay mã không tồn tại.
    const other = turnsOf(byId('n1'))[0];
    expect(verifyQuote(n3, other.code, other.text)).toBe(false);
    expect(verifyQuote(n3, 't9999', 'rollback')).toBe(false);
    // Hành động: trích bằng mã, hoặc chữ trong dòng mô tả.
    const pha = byId('pha');
    const act = turnsOf(pha).find((t) => t.kind === 'action') as EvidenceTurn;
    expect(verifyQuote(pha, act.code, act.code)).toBe(true);
    expect(verifyQuote(pha, act.code, 'open_log')).toBe(true);
    expect(verifyQuote(pha, act.code, 'act99')).toBe(false);
    // Lời NPC không phải lượt của người chơi.
    const npcText = (
      pha.entries.find((e) => e.role === 'npc') as { text: string }
    ).text;
    expect(findTurn(segments, 't0')).toBeUndefined();
    expect(turnsOf(pha).every((t) => t.text !== npcText)).toBe(true);
  });
});

/* ── Quy ra mức và cờ ─────────────────────────────────────────────────── */

const turn = (
  code: string,
  text: string,
  kind: EvidenceTurn['kind'] = 'say',
): EvidenceTurn => ({
  code,
  kind,
  at: 1,
  time: '9:45',
  text,
});
const seg = (
  id: string,
  subs: string[],
  turns: EvidenceTurn[],
): EvidenceSegment => ({
  id,
  label: id,
  kind: id === 'pha' ? 'pha' : 'node',
  subs,
  outcome: 'answered',
  entries: turns.map((t) => ({ role: 'player' as const, turn: t })),
  facts: [],
  rulesHeard: [],
  promises: [],
  brief: '',
});

const SEGMENTS = [
  seg(
    'n2',
    ['7.1', '4.2'],
    [
      turn('t1', 'Dạ anh, API em viết gọi DB trong vòng lặp nên chậm.'),
      turn('t2', 'Em báo là đã sửa xong rồi, 901 lần giờ còn 2 lần.'),
    ],
  ),
  seg(
    'pha',
    ['7.4'],
    [
      turn('t5', 'Chị yên tâm, 11:30 em báo chị.'),
      turn('act01', 'Mở log API (open_log, 1 điểm)', 'action'),
    ],
  ),
];

const no: RawAnswer = { yes: false, quote: '', turn: '' };
const yes = (turnCode: string, quote: string): RawAnswer => ({
  yes: true,
  quote,
  turn: turnCode,
});
const raw = (
  over: Partial<RawItem> & Pick<RawItem, 'sub' | 'segment'>,
): RawItem => ({
  applicable: true,
  A: no,
  B: no,
  C: no,
  ...over,
});
const checked = (item: RawItem): CheckedItem => {
  const out = checkOutput(SEGMENTS, { items: [item], flags: [] });
  return out.items[0];
};

describe('quy ra mức (D-116)', () => {
  const A = yes('t1', 'API em viết gọi DB trong vòng lặp');
  const B = yes('t1', 'trong vòng lặp nên chậm');
  const C = yes('t2', '901 lần giờ còn 2 lần');

  it('không có A → 0, dù có B hoặc C', () => {
    expect(itemLevel(checked(raw({ sub: '7.1', segment: 'n2' })))).toBe(0);
    expect(itemLevel(checked(raw({ sub: '7.1', segment: 'n2', B, C })))).toBe(
      0,
    );
  });
  it('A → 1; A và B hoặc C → 2', () => {
    expect(itemLevel(checked(raw({ sub: '7.1', segment: 'n2', A })))).toBe(1);
    expect(itemLevel(checked(raw({ sub: '7.1', segment: 'n2', A, B })))).toBe(
      2,
    );
    expect(itemLevel(checked(raw({ sub: '7.1', segment: 'n2', A, C })))).toBe(
      2,
    );
    expect(
      itemLevel(checked(raw({ sub: '7.1', segment: 'n2', A, B, C }))),
    ).toBe(2);
  });
  it('mục con không xét → null, kể cả khi judge lỡ trả "có"', () => {
    expect(
      itemLevel(checked(raw({ sub: '7.1', segment: 'n2', applicable: false }))),
    ).toBeNull();
    expect(
      itemLevel(
        checked(raw({ sub: '7.1', segment: 'n2', applicable: false, A })),
      ),
    ).toBeNull();
  });
  it('câu trích sai hoặc sai lượt thì câu đó tính "không" (luật 6)', () => {
    const fake = yes('t1', 'em đã test kỹ rồi');
    const wrongTurn = yes('t2', 'API em viết gọi DB trong vòng lặp');
    const out = checkOutput(SEGMENTS, {
      items: [raw({ sub: '7.1', segment: 'n2', A: fake, B, C: wrongTurn })],
      flags: [],
    });
    expect(itemLevel(out.items[0])).toBe(0);
    expect(out.items[0].A.valid).toBe(false);
    expect(out.items[0].B.valid).toBe(true);
    expect(out.rejected).toHaveLength(2);
    // A đúng, B sai: vẫn là 1.
    const half = checkOutput(SEGMENTS, {
      items: [raw({ sub: '7.1', segment: 'n2', A, B: fake })],
      flags: [],
    });
    expect(itemLevel(half.items[0])).toBe(1);
  });
  it('hành động làm bằng chứng bằng mã; đoạn không có lượt đó thì không tính', () => {
    const act = yes('act01', 'act01');
    expect(
      itemLevel(checked(raw({ sub: '7.4', segment: 'pha', A: act }))),
    ).toBe(1);
    expect(
      itemLevel(
        checked(raw({ sub: '7.4', segment: 'pha', A: yes('act02', 'act02') })),
      ),
    ).toBe(0);
    // Trích lượt của đoạn n2 khi đang chấm đoạn pha.
    expect(
      itemLevel(
        checked(raw({ sub: '7.4', segment: 'pha', A: yes('t1', 'nên chậm') })),
      ),
    ).toBe(0);
  });
  it('đoạn lạ thì bỏ dòng đó', () => {
    const out = checkOutput(SEGMENTS, {
      items: [raw({ sub: '7.1', segment: 'n9', A })],
      flags: [],
    });
    expect(out.items).toEqual([]);
  });
  it('độ tin câu trích của một judge (D-145): từ 2 câu sai và từ 1/3 số "có"', () => {
    const fake = yes('t1', 'em đã test kỹ rồi');
    const reliability = (items: RawItem[]) =>
      quoteReliability(checkOutput(SEGMENTS, { items, flags: [] }));
    expect(
      reliability([raw({ sub: '7.1', segment: 'n2', A, B, C: fake })]),
    ).toEqual({ yes: 3, rejected: 1, unreliable: false });
    expect(
      reliability([
        raw({ sub: '7.1', segment: 'n2', A, B: fake, C: fake }),
        raw({ sub: '4.2', segment: 'n2', A, B, C }),
      ]),
    ).toEqual({ yes: 6, rejected: 2, unreliable: true });
    // 2 câu sai trên 7 câu "có" là dưới 1/3: chưa cảnh báo.
    expect(
      reliability([
        raw({ sub: '7.1', segment: 'n2', A, B: fake, C: fake }),
        raw({ sub: '4.2', segment: 'n2', A, B, C }),
        raw({ sub: '7.4', segment: 'pha', A: yes('act01', 'act01') }),
      ]).unreliable,
    ).toBe(false);
    // Cặp không xét thì "có" không tính.
    expect(
      reliability([
        raw({ sub: '7.1', segment: 'n2', applicable: false, A: fake, B: fake }),
      ]),
    ).toEqual({ yes: 0, rejected: 0, unreliable: false });
  });
});

describe('cờ', () => {
  const flag = (
    code: string,
    turnCode = 't2',
    quote = 'đã sửa xong rồi',
  ): CheckedFlag =>
    ({ code, quote, turn: turnCode, segment: 'n2' }) as CheckedFlag;

  it('code kiểm cờ: mã lạ, lượt lạ hay câu trích sai thì bỏ', () => {
    const out = checkOutput(SEGMENTS, {
      items: [],
      flags: [
        { code: 'C5', quote: 'đã sửa xong rồi', turn: 't2' },
        { code: 'C99', quote: 'đã sửa xong rồi', turn: 't2' },
        { code: 'C4', quote: 'bịa', turn: 't2' },
        { code: 'C7', quote: 'em báo chị', turn: 't77' },
      ],
    });
    expect(out.flags).toEqual([
      { code: 'C5', quote: 'đã sửa xong rồi', turn: 't2', segment: 'n2' },
    ]);
    expect(out.rejected).toHaveLength(3);
  });

  it('mỗi loại cờ tối đa một lần mỗi màn', () => {
    expect(
      normalizeFlags([
        flag('C7', 't1'),
        flag('C7', 't2'),
        flag('C9', 't2'),
      ]).map((f) => [f.code, f.turn]),
    ).toEqual([
      ['C7', 't1'],
      ['C9', 't2'],
    ]);
  });

  it('cặp gần nhau trong cùng lượt: chỉ giữ cờ cụ thể (C12>C1, C5>C4, C8>C13, C6>C8)', () => {
    const codes = (fs: CheckedFlag[]) => normalizeFlags(fs).map((f) => f.code);
    expect(codes([flag('C1'), flag('C12')])).toEqual(['C12']);
    expect(codes([flag('C4'), flag('C5')])).toEqual(['C5']);
    expect(codes([flag('C13'), flag('C8')])).toEqual(['C8']);
    expect(codes([flag('C8'), flag('C6')])).toEqual(['C6']);
    // Khác lượt thì là hai tác hại riêng.
    expect(codes([flag('C4', 't1'), flag('C5', 't2')])).toEqual(['C4', 'C5']);
    // Cặp khác nhau không loại nhau.
    expect(codes([flag('C10'), flag('C11')])).toEqual(['C10', 'C11']);
  });

  it('đa số: 2/3 judge thì có cờ, 1/3 thì không; hai judge thì cả hai', () => {
    const c7 = flag('C7');
    expect(consensusFlags([[c7], [c7], []]).map((f) => f.code)).toEqual(['C7']);
    expect(consensusFlags([[c7], [], []])).toEqual([]);
    expect(consensusFlags([[c7], []])).toEqual([]);
    expect(consensusFlags([[c7], [c7]])).toHaveLength(1);
    expect(consensusFlags([[c7], [c7], []])[0]).toMatchObject({
      raisedBy: 2,
      panelSize: 3,
      group: 7,
    });
  });

  it('lượt nêu bởi nhiều judge nhất thắng; hoà thì theo thứ tự ghế', () => {
    const picked = consensusFlags([
      [flag('C7', 't1')],
      [flag('C7', 't2')],
      [flag('C7', 't2')],
    ]);
    expect(picked[0].turn).toBe('t2');
    expect(
      consensusFlags([[flag('C7', 't1')], [flag('C7', 't2')]])[0].turn,
    ).toBe('t1');
  });

  it('giao nhóm theo bảng đã chốt', () => {
    const groups = consensusFlags([
      ['C1', 'C9', 'C3', 'C12'].map((c) => flag(c, 't1')),
    ]);
    expect(groups.map((f) => [f.code, f.group])).toEqual([
      ['C1', 2],
      ['C9', 1],
      ['C3', 7],
      ['C12', 2],
    ]);
  });
});

describe('ép về 0 của cờ nặng', () => {
  const instance = (
    code: string,
    turnCode: string,
    segment = 'n2',
  ): FlagInstance => ({
    code: code as FlagInstance['code'],
    group: 7,
    quote: 'x',
    turn: turnCode,
    segment,
    raisedBy: 1,
    panelSize: 1,
  });
  const A = yes('t1', 'API em viết gọi DB trong vòng lặp');
  const C = yes('t2', '901 lần giờ còn 2 lần');
  const items = (): CheckedItem[] =>
    checkOutput(SEGMENTS, {
      items: [
        raw({ sub: '7.1', segment: 'n2', A, C }), // trích ở t1 và t2
        raw({ sub: '4.2', segment: 'n2', A }), // trích ở t1
        raw({ sub: '7.4', segment: 'pha', A: yes('t5', '11:30 em báo chị') }),
      ],
      flags: [],
    }).items;

  it('(a) mục con mang cờ trong cột Cờ bị ép về 0 ở đoạn có câu vi phạm', () => {
    // 7.1 có C4, C5 trong cột Cờ; 4.2 có C4.
    const out = pairLevels(items(), [instance('C5', 't9')]);
    expect(out.find((p) => p.sub === '7.1')).toMatchObject({
      level: 0,
      forcedZero: true,
    });
    expect(out.find((p) => p.sub === '4.2')).toMatchObject({
      level: 1,
      forcedZero: false,
    });
  });

  it('(b) mọi mục con có câu trích trong cùng lượt nói với câu vi phạm', () => {
    // C6 không nằm ở cột Cờ của 7.1 hay 4.2; chỉ bắt theo lượt t1.
    const out = pairLevels(items(), [instance('C6', 't1')]);
    expect(out.find((p) => p.sub === '7.1')).toMatchObject({
      level: 0,
      forcedZero: true,
    });
    expect(out.find((p) => p.sub === '4.2')).toMatchObject({
      level: 0,
      forcedZero: true,
    });
  });

  it('(b) lượt khác thì không bị kéo theo', () => {
    const out = pairLevels(items(), [instance('C8', 't2')]);
    // 7.1 có câu trích ở t2 → 0. 4.2 chỉ trích ở t1 và 4.2 không mang C8 → giữ nguyên.
    expect(out.find((p) => p.sub === '7.1')?.level).toBe(0);
    expect(out.find((p) => p.sub === '4.2')?.level).toBe(1);
  });

  it('chỉ ép trong đoạn chứa câu vi phạm, không lan sang đoạn khác', () => {
    const out = pairLevels(items(), [instance('C4', 't2')]);
    expect(out.find((p) => p.sub === '7.4')).toMatchObject({
      level: 1,
      forcedZero: false,
    });
  });

  it('cờ thường không ép về 0', () => {
    const out = pairLevels(items(), [
      instance('C7', 't1'),
      instance('C3', 't1'),
    ]);
    expect(out.map((p) => p.level)).toEqual([2, 1, 1]);
  });

  it('(a) ép cả khi judge nói "không xét": seed đã dựng thì luôn xét', () => {
    const skipped = checkOutput(SEGMENTS, {
      items: [raw({ sub: '7.1', segment: 'n2', applicable: false })],
      flags: [],
    }).items;
    expect(pairLevels(skipped, [])[0].level).toBeNull();
    expect(pairLevels(skipped, [instance('C5', 't2')])[0]).toMatchObject({
      level: 0,
      forcedZero: true,
    });
  });
});

describe('mức mục con trong màn và điểm nhóm', () => {
  const observes: ObserveItem[] = [
    { sub: '7.1', from: ['n2', 'n3'] },
    { sub: '4.2', from: ['n2'] },
    { sub: '1.1', from: ['n3'] },
  ];
  it('trung bình các đoạn; "không xét" bỏ khỏi trung bình; toàn null thì null', () => {
    const subs = subLevels(observes, [
      { sub: '7.1', segment: 'n2', level: 2 },
      { sub: '7.1', segment: 'n3', level: 1 },
      { sub: '4.2', segment: 'n2', level: null },
      { sub: '1.1', segment: 'n3', level: 0 },
    ]);
    expect(subs.map((s) => [s.sub, s.group, s.level])).toEqual([
      ['7.1', 7, 1.5],
      ['4.2', 4, null],
      ['1.1', 1, 0],
    ]);
    expect(
      subLevels(observes, [
        { sub: '7.1', segment: 'n2', level: 2 },
        { sub: '7.1', segment: 'n3', level: null },
      ])[0].level,
    ).toBe(2);
    // Nút chưa tới: không đoạn nào → không xét.
    expect(subLevels(observes, [])[0]).toMatchObject({
      level: null,
      segments: [],
    });
  });

  it('hệ số phạt theo cấp: 0,25 · 0,35 · 0,5', () => {
    expect([1, 2, 3, 5, 6, 8].map(flagPenalty)).toEqual([
      0.25, 0.25, 0.35, 0.35, 0.5, 0.5,
    ]);
  });

  it('điểm nhóm = trần × (trung bình ÷ 2 − phạt × số cờ), có thể âm', () => {
    const subs = subLevels(observes, [
      { sub: '7.1', segment: 'n2', level: 2 },
      { sub: '7.1', segment: 'n3', level: 1 },
      { sub: '1.1', segment: 'n3', level: 0 },
    ]);
    const [g1, g7] = groupScores(subs, [{ group: 7 }], {
      ceilings: { 1: 100, 7: 200 },
      band: 3,
    });
    expect(g1).toMatchObject({ group: 1, mean: 0, flags: 0, score: 0 });
    // 200 × (1,5/2 − 0,35 × 1) = 80
    expect(g7.score).toBeCloseTo(80);
    const [, neg] = groupScores(
      subs,
      [{ group: 7 }, { group: 7 }, { group: 7 }],
      {
        ceilings: { 1: 100, 7: 200 },
        band: 3,
      },
    );
    expect(neg.score).toBeLessThan(0);
  });

  it('nhóm nhận phạt không có trần thì trừ vào nhóm có trần lớn nhất', () => {
    const subs = subLevels(observes, [{ sub: '7.1', segment: 'n2', level: 2 }]);
    const out = groupScores(subs, [{ group: 2 }], {
      ceilings: { 1: 100, 7: 300, 4: 50 },
      band: 1,
    });
    expect(out.map((g) => [g.group, g.flags])).toEqual([
      [1, 0],
      [4, 0],
      [7, 1],
    ]);
  });

  it('chưa có trần thì không có điểm nhóm: chỉ dừng ở mức và cờ', () => {
    expect(groupScores([], [{ group: 7 }], { ceilings: {}, band: 3 })).toEqual(
      [],
    );
  });
});
