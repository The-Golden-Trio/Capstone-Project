import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { initialState, pendingRequest, step } from './engine.js';
import { allTurns, evidenceSegments, verifyQuote } from './grading/evidence.js';
import { LevelPackSchema, ShiftSeedSchema, type NodeSchema } from './schema.js';
import type { PlayerInput, ShiftState } from './state.js';
import type { ShiftContext } from './context.js';
import { sceneView } from './view.js';
import { fakeChecks, fakeNarration, type FakeScript } from './testing/fakes.js';

type NodeInput = z.input<typeof NodeSchema>;
type SeedInput = z.input<typeof ShiftSeedSchema>;

const line = (text: string, speaker = 'mentor') => ({ text, speaker });
const node = (id: string, overrides: Partial<NodeInput> = {}): NodeInput => ({
  id,
  kind: 'mid',
  trigger: { by: 'player', action: id },
  speaker: 'mentor',
  channel: 'chat',
  core: 'Kiểm tra cách xử lý trong ca.',
  format: 'free_reply',
  points: 0,
  ...overrides,
});
const start = node('start', { kind: 'open', trigger: { by: 'start' } });
const end = node('end', { kind: 'end', points: 1 });
const cast: SeedInput['cast'] = ['mentor', 'support'].map((slot) => ({
  slot,
  name: slot === 'mentor' ? 'Anh An' : 'Chị Linh',
  relation: 'Đồng nghiệp',
  source: 'resident',
  want: 'Hoàn thành ca làm',
  pressure: 'Còn ít thời gian',
  stance: 'Bình tĩnh',
  default_channel: 'call',
  expertise: 1,
  disclosure_style: 'Trả lời khi được hỏi',
  voice: 'Nói ngắn',
}));
const pack = LevelPackSchema.parse({
  id: 'TEST.L3',
  company: { name: 'Giao Nhanh', profile: 'Giao nhận' },
  workplace: 'Văn phòng',
  level_scope: 'Trực sự cố',
  resident_npcs: ['mentor', 'support'],
  rules: [],
  minutes_per_point: 5,
});

function context(overrides: Partial<SeedInput>): ShiftContext {
  return {
    pack,
    seed: ShiftSeedSchema.parse({
      id: 'TEST.L3.m2',
      version: 5,
      level_ref: pack.id,
      title: 'Ca trực',
      task_ref: 'Sự cố kỹ thuật',
      player_role: 'Kỹ sư',
      limits: { decide_alone: [], need_approval: [], not_allowed: [] },
      situation: 'Bạn bắt đầu ca.',
      goal: 'Hoàn thành ca.',
      stakes: 'Khách đang chờ.',
      clock: {
        start: '09:00',
        deadline: '11:00',
        budget: 24,
        warn_remaining: 1,
        warning: line('Sắp hết giờ.', 'canh'),
      },
      glossary: [],
      facts: [],
      artefacts: [],
      cast,
      story_flags: [],
      actions: [],
      nodes: [start, end],
      ...overrides,
    }),
  };
}

class Driver {
  state: ShiftState;

  constructor(
    readonly ctx: ShiftContext,
    private readonly script?: FakeScript,
  ) {
    this.state = initialState(ctx);
  }

  send(input: PlayerInput): this {
    this.state = step(this.state, input, this.ctx).state;
    for (
      let pending = pendingRequest(this.state, this.ctx);
      pending;
      pending = pendingRequest(this.state, this.ctx)
    ) {
      const { request } = pending;
      this.state = step(
        this.state,
        pending.type === 'narrate'
          ? {
              type: 'NARRATION',
              requestId: request.requestId,
              beats: fakeNarration(pending.request, this.script),
            }
          : {
              type: 'CHECKS',
              requestId: request.requestId,
              answers: fakeChecks(pending.request, {}),
            },
        this.ctx,
      ).state;
    }
    return this;
  }

  open() {
    return this.send({ type: 'START' }).send({
      type: 'SAY',
      text: 'Dạ, em làm ngay.',
    });
  }

  action(key: string, fields?: Record<string, string>, ticks?: string[]) {
    return this.send({ type: 'ACTION', key, fields, ticks });
  }

  get view() {
    return sceneView(this.state, this.ctx);
  }
}

const openAction = (points: number) => ({
  key: 'open',
  label: 'Mở tài liệu',
  kind: 'open' as const,
  target: 'docs',
  points,
});
const document = { id: 'docs', title: 'Tài liệu', kind: 'document' as const };
const triggerAction = (id: string) => ({
  key: id,
  label: 'Bắt đầu',
  target: id,
  kind: 'trigger' as const,
  points: 0,
});

describe('Shift engine v5', () => {
  it.each([false, true])(
    'keeps free replies and omits authored choice text from judge evidence (variant = %s)',
    (variant) => {
      const ctx = context({
        nodes: [
          node('start', {
            ...start,
            format: 'choice',
            free_turn_after_reaction: true,
            options: [
              {
                key: 'a',
                text: 'Em sẽ báo lại.',
                text_if: [
                  {
                    if: variant ? {} : { all: ['promised'] },
                    text: 'Em sẽ báo như đã hẹn.',
                  },
                ],
                reaction: [line('Anh chờ nhé.')],
              },
            ],
          }),
          end,
        ],
      });
      const ownReply = 'Em sẽ kiểm tra log sau khi lên.';
      const d = new Driver(ctx)
        .send({ type: 'START' })
        .send({ type: 'CHOOSE', option: 'a' })
        .send({ type: 'SAY', text: ownReply });
      expect(
        d.state.transcript.find((entry) => entry.kind === 'player')?.text,
      ).toBe(variant ? 'Em sẽ báo như đã hẹn.' : 'Em sẽ báo lại.');
      const segments = evidenceSegments(d.state, ctx, [
        { sub: '7.4', from: ['start'] },
      ]);
      expect(allTurns(segments).map((turn) => turn.text)).toEqual([ownReply]);
    },
  );

  it('applies timed updates on schedule and emits notices without cutting the action', () => {
    const hidden = { visibility: 'ai_only' as const, known_by: ['mentor'] };
    const d = new Driver(
      context({
        intro_slides: [{ title: 'Trực sự cố', body: 'Khách đang chờ.' }],
        bots: [{ id: 'bot', name: 'Giám sát' }],
        facts: [
          ...[
            'via_notice',
            'via_silent',
            'via_action',
            'via_doc',
            'via_doc_too',
          ].map((id) => ({ id, text: 'Dữ kiện cũ.', ...hidden })),
          { id: 'hidden', text: 'Lỗi kín', values: ['Lỗi kín'], ...hidden },
        ],
        artefacts: [
          {
            ...document,
            unlocks: ['via_doc', 'via_doc_too'],
            view: { type: 'table', columns: ['Giờ'], rows: [['09:05']] },
          },
        ],
        actions: [
          {
            ...openAction(3),
            unlocks: ['via_action'],
            beats: [line('Lỗi kín', 'bot')],
          },
        ],
        timeline: [
          {
            at: '09:05',
            kind: 'notice',
            speaker: 'bot',
            text: 'Lỗi kín',
            unlocks: ['via_notice'],
          },
          {
            at: '09:10',
            kind: 'silent',
            fact_update: { fact: 'via_silent', text: 'Dữ kiện mới.' },
            unlocks: ['via_silent', 'via_doc'],
            presence: { slot: 'mentor', text: 'Đang họp' },
          },
          {
            at: '09:20',
            kind: 'notice',
            speaker: 'mentor',
            text: 'Đã họp xong.',
            presence: { slot: 'mentor', text: null },
          },
        ],
      }),
    )
      .open()
      .action('open');

    expect(d.state.actionLog[0]).toEqual({
      at: 0,
      key: 'open',
      points: 3,
      completedAt: 3,
    });
    expect(d.state.timelineDone).toEqual([0, 1]);
    expect(
      d.state.transcript.filter((entry) => entry.speaker === 'bot'),
    ).toEqual([
      expect.objectContaining({
        at: 3,
        context: 'action:open',
        kind: 'system',
        channel: 'chat',
      }),
      expect.objectContaining({ at: 1, context: 'timeline', kind: 'system' }),
    ]);
    expect(d.view.notebook.facts.map((fact) => fact.id)).toEqual([
      'via_silent',
      'via_doc',
      'via_doc_too',
      'via_action',
      'via_notice',
    ]);
    expect(d.state.facts).toContainEqual({ id: 'via_notice', at: 3 });
    expect(
      d.view.notebook.facts.find(({ id }) => id === 'via_silent')?.text,
    ).toBe('Dữ kiện mới.');
    expect(d.view.cast[0].status).toBe('Đang họp');
    expect(d.view.introSlides).toHaveLength(1);
    expect(d.view.bots).toEqual([{ id: 'bot', name: 'Giám sát' }]);
    expect(d.view.documents[0].view).toMatchObject({ type: 'table' });
    d.action('open');
    expect(d.view.cast[0].status).toBeUndefined();
    expect(d.state.transcript).toContainEqual(
      expect.objectContaining({
        context: 'timeline',
        kind: 'npc',
        speaker: 'mentor',
        text: 'Đã họp xong.',
      }),
    );
  });

  it('applies notice updates during a call and emits the text with its scheduled time after the call', () => {
    const d = new Driver(
      context({
        bots: [{ id: 'bot', name: 'Giám sát' }],
        facts: [{ id: 'alert', text: 'Đang theo dõi.', visibility: 'ai_only' }],
        actions: [
          {
            key: 'call',
            label: 'Gọi anh An',
            kind: 'talk',
            target: 'mentor',
            points: 1,
          },
        ],
        timeline: [
          {
            at: '09:10',
            kind: 'silent',
            presence: { slot: 'mentor', text: null },
            fact_update: { fact: 'alert', text: 'Đã xử lý xong.' },
          },
          {
            at: '09:05',
            kind: 'notice',
            speaker: 'bot',
            channel: 'group',
            text: 'Đang xử lý cảnh báo.',
            presence: { slot: 'mentor', text: 'Đang bận' },
            fact_update: { fact: 'alert', text: 'Đang xử lý.' },
            unlocks: ['alert'],
          },
        ],
      }),
    )
      .open()
      .action('call');
    const botPosts = () =>
      d.state.transcript.filter((entry) => entry.speaker === 'bot');
    expect(d.view.cast[0].status).toBe('Đang bận');
    expect(d.view.notebook.facts).toEqual([]);
    expect(d.state.factText.alert).toBe('Đang xử lý.');
    expect(botPosts()).toEqual([]);

    for (let turn = 0; turn < 4; turn++)
      d.send({ type: 'SAY', text: 'Em đang kiểm tra.' });
    expect(d.state.points).toBe(2);
    expect(d.view.cast[0].status).toBeUndefined();
    expect(d.view.notebook.facts).toEqual([]);
    expect(d.state.factText.alert).toBe('Đã xử lý xong.');
    expect(botPosts()).toEqual([]);

    d.send({ type: 'END_CONVERSATION' });
    expect(botPosts()).toEqual([
      expect.objectContaining({
        at: 1,
        channel: 'group',
        text: 'Đang xử lý cảnh báo.',
        context: 'timeline',
      }),
    ]);
    expect(d.view.cast[0].status).toBeUndefined();
    expect(d.state.facts).toContainEqual({ id: 'alert', at: 2 });
    expect(d.view.notebook.facts[0].text).toBe('Đã xử lý xong.');
  });

  it('flushes due notices and silent updates before closing the shift', () => {
    const d = new Driver(
      context({
        nodes: [start, { ...end, points: 2 }],
        actions: [triggerAction('end')],
        bots: [{ id: 'bot', name: 'Giám sát' }],
        facts: [{ id: 'closing', text: 'Đã báo.', visibility: 'ai_only' }],
        epilogue: [{ if: {}, beats: [line('Ca đã xong.')] }],
        timeline: [
          {
            at: '09:10',
            kind: 'notice',
            speaker: 'bot',
            text: 'Thông báo cuối ca.',
          },
          { at: '09:10', kind: 'silent', unlocks: ['closing'] },
          { at: '09:10', kind: 'scene', text: 'Cảnh nền sau ca.' },
          {
            at: '09:15',
            kind: 'notice',
            speaker: 'bot',
            text: 'Thông báo sau ca.',
          },
        ],
      }),
    )
      .open()
      .action('end')
      .send({ type: 'CONFIRM_END' });
    expect(d.state.facts).toContainEqual({ id: 'closing', at: 2 });
    expect(
      d.state.transcript.some((entry) => entry.context === 'timeline'),
    ).toBe(false);
    d.send({ type: 'SAY', text: 'Em đã báo anh.' });
    expect(d.state.ended).toBe(true);
    expect(d.state.transcript.slice(-3)).toEqual([
      expect.objectContaining({
        context: 'timeline',
        text: 'Thông báo cuối ca.',
        at: 2,
      }),
      expect.objectContaining({ context: 'epilogue' }),
      expect.objectContaining({ context: 'end' }),
    ]);
  });

  it('reveals at most one fact from action dialogue while keeping explicit unlocks', () => {
    const d = new Driver(
      context({
        artefacts: [document],
        bots: [{ id: 'bot', name: 'Giám sát' }],
        facts: ['bot', 'first', 'second', 'explicit'].map((id) => ({
          id,
          text: id,
          values: [id],
          visibility: 'ai_only' as const,
          known_by: ['bot', 'mentor'],
        })),
        actions: [
          {
            ...openAction(1),
            unlocks: ['explicit'],
            beats: [line('bot', 'bot'), line('first'), line('second')],
          },
        ],
      }),
    )
      .open()
      .action('open');
    expect(d.state.facts.map(({ id }) => id)).toEqual(['explicit', 'first']);
    expect(
      d.state.transcript
        .filter(({ context }) => context === 'action:open')
        .slice(-3)
        .map(({ text }) => text),
    ).toEqual(['bot', 'first', 'second']);
    d.action('open');
    expect(d.state.facts.map(({ id }) => id)).toEqual([
      'explicit',
      'first',
      'second',
    ]);
  });

  it('restores flag ownership from completed actions in older v5 snapshots', () => {
    const d = new Driver(
      context({
        artefacts: [
          document,
          {
            id: 'form',
            title: 'Bản vá',
            kind: 'form',
            ticks: [
              { id: 'shared', label: 'Đã kiểm' },
              { id: 'form', label: 'Đã sửa' },
            ],
            tick_flags: { shared: 'checked', form: 'patched' },
          },
        ],
        actions: [
          { ...openAction(1), sets: ['checked'] },
          {
            key: 'write',
            kind: 'write',
            label: 'Lưu bản vá',
            points: 1,
            target: 'form',
          },
          {
            key: 'rewrite',
            kind: 'rewrite',
            label: 'Sửa bản vá',
            points: 1,
            target: 'form',
          },
        ],
      }),
    )
      .open()
      .action('open')
      .action('write', {}, ['shared', 'form']);
    delete d.state.persistentFlags;
    delete d.state.actionLog[0].completedAt;

    d.action('rewrite', {}, []);
    expect(d.state.persistentFlags).toEqual(['checked']);
    expect(d.state.flags).toEqual(['checked']);
  });

  it('saves selections and reasons through write, rewrite and node forms and recalculates flags', () => {
    const d = new Driver(
      context({
        derived_flags: [
          { flag: 'ready', any_of: [{ all: ['chosen'] }, { all: ['manual'] }] },
          { flag: 'chosen', any_of: [{ all: ['keep'] }] },
          {
            flag: 'compatible',
            any_of: [{ none: ['paginate'] }, { all: ['legacy'] }],
          },
        ],
        artefacts: [
          document,
          {
            id: 'form',
            title: 'Ghi chú',
            kind: 'form',
            view: { type: 'note' },
            fields: [
              { id: 'note', label: 'Ghi chú', placeholder: 'Viết ở đây' },
            ],
            ticks: [
              { id: 'v2', label: 'Phân trang' },
              { id: 'v3', label: 'Giữ app cũ' },
            ],
            selects: [
              {
                id: 'h4',
                label: 'Giả thuyết',
                reason: true,
                options: [
                  { id: 'giu', label: 'Giữ' },
                  { id: 'loai', label: 'Loại' },
                ],
              },
            ],
            tick_flags: {
              'h4=giu': 'keep',
              'h4=loai': 'reject',
              v2: 'paginate',
              v3: 'legacy',
            },
          },
        ],
        actions: [
          {
            key: 'write',
            label: 'Viết',
            kind: 'write',
            target: 'form',
            points: 1,
          },
          {
            key: 'rewrite',
            label: 'Sửa lại',
            kind: 'rewrite',
            target: 'form',
            points: 1,
          },
          {
            key: 'manual',
            label: 'Kiểm tra riêng',
            kind: 'open',
            target: 'docs',
            points: 0,
            sets: ['manual'],
          },
          triggerAction('confirm'),
        ],
        nodes: [
          start,
          node('confirm', { format: 'artefact', artefact: 'form' }),
          end,
        ],
      }),
    ).open();
    expect(d.state.flags).toEqual(['compatible']);
    expect(d.view.actions[0].form).toMatchObject({
      view: { type: 'note' },
      fields: [{ id: 'note', multiline: true, placeholder: 'Viết ở đây' }],
      selects: [{ id: 'h4' }],
    });
    expect(() => d.action('write', {}, ['h4=giu', 'h4=loai'])).toThrow(
      'Chỉ chọn một phương án',
    );
    expect(d.state.points).toBe(0);

    d.action(
      'write',
      { h4__why: '  Có bằng chứng. ', extra: 'Không có ô này' },
      ['h4=giu', 'v2', 'unknown'],
    );
    expect(d.state.artefacts.form).toMatchObject({
      fields: { note: '', h4__why: 'Có bằng chứng.' },
      ticks: ['h4=giu', 'v2'],
      status: 'saved',
      flags: ['keep', 'paginate'],
    });
    expect(d.state.artefacts.form.fields).not.toHaveProperty('extra');
    expect(d.state.flags).toEqual(['chosen', 'keep', 'paginate', 'ready']);
    d.action('rewrite', {}, ['v2', 'v3', 'v3']);
    expect(d.state.flags).toEqual(['compatible', 'legacy', 'paginate']);
    expect(d.state.artefacts.form.ticks).toEqual(['v2', 'v3']);

    d.action('manual').action('confirm');
    expect(d.view.node?.form?.view).toEqual({ type: 'note' });
    d.send({
      type: 'SAVE_ARTEFACT',
      artefact: 'form',
      fields: { h4__why: 'Không khớp.' },
      ticks: ['h4=loai'],
    });
    expect(d.state.flags).toEqual(['compatible', 'manual', 'ready', 'reject']);
    expect(
      d.view.documents.find(({ id }) => id === 'form')?.saved?.fields.h4__why,
    ).toBe('Không khớp.');
  });

  it('uses hypothesis choices as evidence labels and reasons as quotable text', () => {
    const ctx = context({
      artefacts: [
        {
          id: 'note',
          title: 'Ghi chú sự cố',
          kind: 'form',
          fields: [{ id: 'summary', label: 'Hiện tượng' }],
          selects: [
            {
              id: 'h1',
              label: 'CSDL quá tải',
              reason: true,
              options: [{ id: 'loai', label: 'Loại' }],
            },
            {
              id: 'h6',
              label: 'Dữ liệu bị hỏng',
              reason: true,
              options: [{ id: 'chua_ro', label: 'Chưa rõ' }],
            },
          ],
        },
      ],
      actions: [triggerAction('notes')],
      nodes: [
        start,
        node('notes', { format: 'artefact', artefact: 'note' }),
        end,
      ],
    });
    const reason = 'Khách ít đơn cùng giờ vẫn nhanh.';
    const d = new Driver(ctx)
      .open()
      .action('notes')
      .send({
        type: 'SAVE_ARTEFACT',
        artefact: 'note',
        fields: {
          summary: 'API lịch sử đơn chậm.',
          h1__why: reason,
          h6__why: '',
        },
        ticks: ['h1=loai', 'h6=chua_ro'],
      });

    const [segment] = evidenceSegments(d.state, ctx, [
      { sub: '4.2', from: ['notes'] },
    ]);
    const [turn] = allTurns([segment]);
    expect(turn).toMatchObject({
      code: 'art_note',
      parts: [
        { label: 'Hiện tượng', text: 'API lịch sử đơn chậm.' },
        { label: 'CSDL quá tải (Loại)', text: reason },
        { label: 'Dữ liệu bị hỏng (Chưa rõ)', text: '' },
      ],
    });
    expect(verifyQuote(segment, turn.code, reason)).toBe(true);
    expect(verifyQuote(segment, turn.code, 'CSDL quá tải (Loại)')).toBe(false);
  });

  const contactOption = {
    key: 'a',
    text: 'Em gọi chị lúc 9:30.',
    reaction: [line('Chị chờ em.', 'support')],
    promise: { to: 'support', channel: 'call' as const, at: '09:30' },
  };

  it('labels promises by their communication channel or event', () => {
    const ctx = context({
      promise_events: [{ id: 'approved', text: 'khi anh An duyệt bản sửa' }],
      nodes: [
        node('start', {
          ...start,
          format: 'choice',
          options: [
            contactOption,
            {
              ...contactOption,
              key: 'chat',
              promise: { ...contactOption.promise, channel: 'chat' },
            },
            {
              ...contactOption,
              key: 'event',
              promise: { to: 'support', channel: 'chat', event: 'approved' },
            },
          ],
        }),
        end,
      ],
    });
    for (const [option, label] of [
      ['a', 'Gọi Chị Linh lúc 09:30'],
      ['chat', 'Nhắn Chị Linh lúc 09:30'],
      ['event', 'Báo Chị Linh khi anh An duyệt bản sửa'],
    ]) {
      const d = new Driver(ctx)
        .send({ type: 'START' })
        .send({ type: 'CHOOSE', option });
      expect(d.view.notebook.promises[0].label).toBe(label);
    }
  });

  const actionOption = {
    ...contactOption,
    text: 'Em gửi file trước 9:20.',
    text_if: [
      {
        if: { all: ['has_contact_promise'] },
        text: 'Em vẫn gọi chị như hẹn, trước 9:20 em gửi file.',
      },
      { if: {}, text: 'Em sẽ gửi file.' },
    ],
    promise: {
      ...contactOption.promise,
      at: '09:20',
      by_action: 'export',
      label: 'Gửi file trước 9:20',
    },
  };
  const promiseContext = (exportPoints = 2) =>
    context({
      artefacts: [document],
      actions: [
        openAction(1),
        { ...openAction(exportPoints), key: 'export' },
        { ...openAction(4), key: 'other' },
        {
          key: 'call',
          label: 'Gọi chị Linh',
          kind: 'talk',
          points: 1,
          target: 'support',
        },
      ],
      nodes: [
        node('start', {
          ...start,
          format: 'choice',
          options: [{ ...contactOption, sets: ['has_contact_promise'] }],
        }),
        node('mid', {
          format: 'choice',
          trigger: { by: 'time', at: '09:05' },
          options: [actionOption],
        }),
        end,
      ],
    });

  it('renders the first matching choice text and keeps contact and action promises independently', () => {
    const d = new Driver(promiseContext())
      .send({ type: 'START' })
      .send({ type: 'CHOOSE', option: 'a' })
      .action('open');
    expect(d.view.node?.options).toEqual([
      { key: 'a', text: actionOption.text_if[0].text },
    ]);
    d.send({ type: 'CHOOSE', option: 'a' });
    expect(d.state.transcript).toContainEqual(
      expect.objectContaining({
        kind: 'player',
        context: 'node:mid',
        text: actionOption.text_if[0].text,
      }),
    );
    expect(d.view.notebook.promises).toHaveLength(2);
    expect(d.view.notebook.promises[1].label).toBe('Gửi file trước 9:20');

    d.action('call');
    expect(d.state.promises.map((p) => p.status)).toEqual(['open', 'open']);
    d.action('export');
    expect(d.state.promises.map((p) => p.status)).toEqual(['open', 'kept']);
    d.action('call');
    expect(d.state.promises.map((p) => p.status)).toEqual(['kept', 'kept']);
  });

  it('leaves an unfinished action promise late when only contact was made', () => {
    const d = new Driver(promiseContext())
      .send({ type: 'START' })
      .send({ type: 'CHOOSE', option: 'a' })
      .action('open')
      .send({ type: 'CHOOSE', option: 'a' })
      .action('call')
      .action('other');
    expect(d.state.promises[1]).toMatchObject({
      status: 'late',
      remindedAt: 5,
    });
    expect(d.state.flags).toContain('tre_hen');
  });

  it('immediately keeps a promise for work completed before making it', () => {
    const d = new Driver(promiseContext(1))
      .send({ type: 'START' })
      .send({ type: 'CHOOSE', option: 'a' })
      .action('export')
      .send({ type: 'CHOOSE', option: 'a' });
    expect(d.state.promises[1]).toMatchObject({
      byAction: 'export',
      status: 'kept',
    });
    d.action('other');
    expect(d.state.points).toBe(5);
    expect(d.state.flags).not.toContain('tre_hen');
    expect(d.state.promises[1].status).toBe('kept');
  });

  it('keeps an already-started action promise only after interrupted work finishes', () => {
    const ctx = promiseContext();
    ctx.seed.nodes[1].free_turn_after_reaction = true;
    const d = new Driver(ctx)
      .send({ type: 'START' })
      .send({ type: 'CHOOSE', option: 'a' })
      .action('export')
      .send({ type: 'CHOOSE', option: 'a' });
    expect(d.state.suspended).toEqual({ key: 'export', remaining: 1 });
    expect(d.state.promises[1].status).toBe('open');
    d.send({ type: 'SAY', text: 'Em đang gửi.' });
    expect(d.state.promises[1].status).toBe('kept');
    expect(d.state.actionLog[0]).toMatchObject({ completedAt: 2, cut: true });
  });

  it('schedules interjections independently of the canon and keeps the remaining work', () => {
    const d = new Driver(
      context({
        artefacts: [document],
        actions: [openAction(4), triggerAction('core')],
        nodes: [
          start,
          node('later', {
            interjection: true,
            trigger: { by: 'time', at: '09:40' },
          }),
          node('core'),
          node('early', {
            interjection: true,
            trigger: { by: 'time', at: '09:05' },
            points: 1,
          }),
          end,
        ],
      }),
    )
      .open()
      .action('open');

    expect(d.state.await).toEqual({ kind: 'node_reply', node: 'early' });
    expect(d.state.suspended).toEqual({ key: 'open', remaining: 3 });
    expect(d.state.nodes.core.status).toBe('pending');
    d.send({ type: 'SAY', text: 'Em tiếp tục nhé.' });
    expect(d.state.points).toBe(5);
    expect(d.state.suspended).toBeNull();
    expect(d.state.nodes.later.status).toBe('pending');
    d.action('core');
    expect(d.state.await).toEqual({ kind: 'node_reply', node: 'core' });
  });

  it('gives the player priority at a fallback after an action but interrupts unfinished work', () => {
    const make = (points: number, playerFirst = true) =>
      context({
        player_first_at_fallback: playerFirst,
        artefacts: [document],
        actions: [openAction(points), triggerAction('core')],
        nodes: [
          start,
          node('core', {
            trigger: { by: 'player', action: 'core', fallback_at: '09:10' },
          }),
          end,
        ],
      });
    const exact = new Driver(make(2)).open().action('open');
    expect(exact.state.await.kind).toBe('phase');
    exact.action('core');
    expect(exact.state.nodes.core).toMatchObject({
      via: 'player',
      openedAt: 2,
    });

    const during = new Driver(make(3)).open().action('open');
    expect(during.state.nodes.core).toMatchObject({
      via: 'fallback',
      openedAt: 2,
    });
    expect(during.state.suspended).toEqual({ key: 'open', remaining: 1 });

    const immediate = new Driver(make(2, false)).open().action('open');
    expect(immediate.state.nodes.core).toMatchObject({
      via: 'fallback',
      openedAt: 2,
    });
  });

  it.each([true, false])(
    'runs epilogue before review after the last word (sent = %s)',
    (sent) => {
      const hold = {
        id: 'approval',
        text: 'Cần duyệt',
        hold_until: 'end',
        resolve_when: { all: ['ready'] },
      };
      const d = new Driver(
        context({
          cast: [{ ...cast[0], concerns: [hold] }, cast[1]],
          bots: [{ id: 'bot', name: 'Deploy' }],
          last_word: {
            to: 'support',
            event: 'approved',
            channel: 'chat',
            prompt: 'Nhắn chị Linh trước khi kết ca?',
            reply: [line('Chị báo khách nhé.', 'support')],
          },
          epilogue: [
            { if: { all: ['ready'] }, beats: [line('Đã triển khai.', 'bot')] },
            { if: { all: ['blocked'] }, beats: [line('Chưa triển khai.')] },
            { if: {}, beats: [line('Khách đã được báo.', 'support')] },
          ],
          review: [
            {
              id: 'open_promise',
              by: 'support',
              channel: 'chat',
              hook: 'Em còn hẹn chị điều gì',
              when_promise_open: true,
            },
          ],
          actions: [triggerAction('end')],
          artefacts: [{ id: 'form', title: 'Mail', kind: 'form' }],
          nodes: [
            node('start', {
              ...start,
              format: 'choice',
              options: [
                {
                  ...contactOption,
                  promise: {
                    to: 'support',
                    channel: 'chat',
                    event: 'approved',
                  },
                  sets: ['ready'],
                },
              ],
            }),
            node('end', {
              ...end,
              format: 'artefact',
              artefact: 'form',
              closing: {
                concern: 'approval',
                approve_beats: [line('Anh duyệt.')],
                defer_hint: 'Hoãn duyệt',
                approve_event: 'approved',
              },
            }),
          ],
        }),
      )
        .send({ type: 'START' })
        .send({ type: 'CHOOSE', option: 'a' })
        .action('end')
        .send({ type: 'CONFIRM_END' })
        .send({ type: 'SAVE_ARTEFACT', artefact: 'form', fields: {} });

      expect(d.view.await).toEqual({
        kind: 'last_word',
        to: 'support',
        prompt: 'Nhắn chị Linh trước khi kết ca?',
      });
      expect(d.state.promises[0].status).toBe('open');
      expect(
        d.state.transcript.some((entry) => entry.context === 'epilogue'),
      ).toBe(false);
      d.send(
        sent
          ? { type: 'SAY', text: 'Chị ơi, anh An duyệt rồi.' }
          : { type: 'END_CONVERSATION' },
      );
      expect(d.state.points).toBe(1);
      expect(d.state.promises[0].status).toBe(sent ? 'kept' : 'carried');
      const tail = d.state.transcript.filter((entry) =>
        [
          'last_word',
          'epilogue',
          'review',
          'review:open_promise',
          'end',
        ].includes(entry.context),
      );
      expect(tail.map((entry) => entry.context)).toEqual(
        sent
          ? ['last_word', 'last_word', 'epilogue', 'epilogue', 'end']
          : ['epilogue', 'epilogue', 'review', 'review:open_promise'],
      );
      expect(tail.find((entry) => entry.context === 'epilogue')).toMatchObject({
        kind: 'system',
        text: 'Đã triển khai.',
      });
    },
  );

  it('passes the reaction node to scripted narration and replays the same pending request', () => {
    const ctx = context({
      nodes: [
        node('start', {
          ...start,
          format: 'choice',
          options: [contactOption],
          reaction_ai_beats: 1,
        }),
        end,
      ],
    });
    const initial = step(initialState(ctx), { type: 'START' }, ctx).state;
    const chosen = step(initial, { type: 'CHOOSE', option: 'a' }, ctx);
    const pending = pendingRequest(chosen.state, ctx);
    expect(pending).toEqual(
      chosen.effects.find((effect) => effect.type === 'narrate'),
    );
    if (pending?.type !== 'narrate')
      throw new Error('Expected a reaction request');
    expect(pending.request.node).toBe('start');
    const script: FakeScript = {
      replies: {},
      probes: [],
      defer: [],
      reactions: { start: [{ ...line('Anh đã nghe.'), expression: 'vui' }] },
    };
    expect(fakeNarration(pending.request, script)).toEqual(
      script.reactions.start,
    );
    const mayReveal = [{ id: 'test', text: 'Bản vá đã chạy.' }];
    expect(
      fakeNarration({
        ...pending.request,
        task: 'reply',
        playerText: 'xong chưa ạ',
        mayReveal,
      })[0].text,
    ).toBe(mayReveal[0].text);
  });

  it('extracts the time next to the promise from a message with two times', () => {
    const answers = fakeChecks(
      {
        requestId: 'r1',
        source: 'node:mid',
        scope: 'Anh họp tới 11h20. 11h30 em gọi chị như hẹn nha.',
        questions: [
          {
            flag: 'promise',
            q: 'Có hẹn không?',
            extract: { fields: ['time', 'channel', 'event'] },
          },
        ],
      },
      { promise: ['em gọi chị như hẹn'] },
    );
    expect(answers[0].extracted).toEqual({ time: '11:30', channel: 'call' });
  });
});
