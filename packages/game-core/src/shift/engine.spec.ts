import { describe, expect, it } from 'vitest';
import { fixtureShiftContext } from '../testing/fixture.js';
import { initialState, step, ShiftRuleError } from './engine.js';
import { fold } from './fold.js';
import { lintSeed } from './lint.js';
import { sceneView } from './view.js';
import { shiftSummary } from './summary.js';
import { fakeChecks, fakeNarration } from './testing/fakes.js';
import { FAKE_EVENTS, FAKE_RULES } from './testing/fakeRules.js';
import type {
  CheckRequest,
  NarrateRequest,
  PlayerInput,
  ShiftInput,
  ShiftState,
} from './state.js';

const SEED = 'SWE_BACKEND.L3.m2';
const ctx = fixtureShiftContext(SEED);

/** Chạy engine, tự trả lời mọi yêu cầu AI bằng bản giả, ghi lại chuỗi đầu vào. */
class Driver {
  state: ShiftState = initialState(ctx);
  readonly inputs: ShiftInput[] = [];
  readonly narrations: NarrateRequest[] = [];
  readonly checks: CheckRequest[] = [];

  send(input: PlayerInput): this {
    this.apply(input);
    return this;
  }

  private apply(input: ShiftInput): void {
    const { state, effects } = step(this.state, input, ctx);
    this.state = state;
    this.inputs.push(input);
    for (const effect of effects) {
      if (effect.type === 'narrate') {
        this.narrations.push(effect.request);
        this.apply({
          type: 'NARRATION',
          requestId: effect.request.requestId,
          beats: fakeNarration(effect.request),
          provenance: { adapter: 'fake' },
        });
      }
      if (effect.type === 'check') {
        this.checks.push(effect.request);
        this.apply({
          type: 'CHECKS',
          requestId: effect.request.requestId,
          answers: fakeChecks(
            effect.request,
            FAKE_RULES[SEED],
            FAKE_EVENTS[SEED],
          ),
          provenance: { adapter: 'fake' },
        });
      }
    }
  }

  action(key: string, fields?: Record<string, string>, ticks?: string[]) {
    return this.send({ type: 'ACTION', key, fields, ticks });
  }
  say(text: string) {
    return this.send({ type: 'SAY', text });
  }
  get flags() {
    return new Set(this.state.flags);
  }
  get lines() {
    return this.state.transcript.map((l) => l.text);
  }
  /** Tiêu n điểm bằng các cuộc trò chuyện ngắn (mỗi cuộc 1 điểm). */
  spend(n: number) {
    for (let i = 0; i < n && !this.state.activeNode && !this.state.ended; i++)
      this.action(
        this.state.conversation?.slots[0] === 'mentor'
          ? 'talk_support'
          : 'talk_mentor',
      );
    return this;
  }
  /** Bắt đầu ca và trả lời nút mở. */
  open() {
    return this.send({ type: 'START' }).say('Dạ em coi liền anh.');
  }
}

const GOOD_PATCH = {
  mo_ta:
    'Bỏ vòng lặp, gom chi tiết đơn bằng một truy vấn. Thêm phân trang 50 đơn; app cũ không gửi số trang thì giới hạn 200 đơn.',
};
const GOOD_EMAIL = {
  nguyen_nhan: 'API gọi DB trong vòng lặp, 901 lần cho MP-0042.',
  huong_xu_ly: 'Gom truy vấn, thêm phân trang.',
  rui_ro: 'Theo dõi log sau khi lên; lỗi thì rollback về bản cũ.',
};
const NOTE = {
  hien_tuong: 'API lịch sử đơn chậm hơn 4 giây với khách nhiều đơn.',
  nguyen_nhan: 'Gọi DB trong vòng lặp, 901 lần cho MP-0042.',
  da_lam: 'Viết bản vá, chạy staging.',
};

describe('seed SWE_BACKEND.L3.m2', () => {
  it('qua schema và lint sạch', () => {
    expect(lintSeed(ctx.seed, ctx.pack)).toEqual([]);
  });
});

describe('engine ca làm', () => {
  it('nút mở là cuộc trò chuyện: 3 nhịp, rồi người chơi đáp tự do (A2)', () => {
    const d = new Driver().send({ type: 'START' });
    expect(d.state.await).toEqual({ kind: 'node_reply', node: 'n0' });
    const npc = d.state.transcript.filter((l) => l.kind === 'npc');
    expect(npc).toHaveLength(3);
    // E6: situation thành một câu cảnh.
    expect(d.state.transcript[0]).toMatchObject({
      kind: 'scene',
      context: 'intro',
    });
    d.say('Dạ em coi liền.');
    expect(d.state.await.kind).toBe('phase');
    expect(d.state.nodes.n0.status).toBe('done');
    expect(d.state.points).toBe(0);
  });

  it('đường thường: đủ n0 → n3, giữ lời hứa, anh An duyệt', () => {
    const d = new Driver().open();
    d.action('open_log').action('open_code').action('open_bang');
    expect(d.state.points).toBe(3);
    expect(d.state.facts.map((f) => f.id)).toEqual(
      expect.arrayContaining(['f5', 'f4']),
    );

    d.action('talk_mentor').say(
      'Anh ơi API gọi DB trong vòng lặp, 901 lần cho MP-0042. Khách ít đơn cùng giờ vẫn nhanh nên không phải DB.',
    );
    d.action('talk_support').say(
      'Chị ơi em tìm ra lỗi rồi, đang sửa. 11:30 em gọi báo lại chị nha.',
    );
    expect(d.flags.has('nguyen_nhan_da_noi_voi_mentor')).toBe(true);
    expect(d.flags.has('resolved_nguyen_nhan')).toBe(true);

    d.action('write_patch', GOOD_PATCH);
    expect(d.flags.has('support_biet_tim_ra_loi')).toBe(true);
    expect(d.state.promises).toEqual([
      expect.objectContaining({
        to: 'support',
        dueAt: 22,
        channel: 'call',
        status: 'open',
      }),
    ]);
    expect(
      ['bv.bo_vong_lap', 'bv.phan_trang', 'bv.giu_app_cu'].every((f) =>
        d.flags.has(f),
      ),
    ).toBe(true);

    d.action('run_staging');
    expect(d.state.events.map((e) => e.name)).toContain('su_kien.staging_ok');
    expect(d.lines).toContain(
      'GET /orders/history?customer=MP-0042  0.31s  db_queries=2  limit=200  has_more=true',
    );

    // "Tạm làm việc khác" chạy tới cuộc gọi 10:50 (A1b).
    expect(d.state.points).toBe(12);
    d.action('wait');
    expect(d.state.await).toEqual({ kind: 'node_choice', node: 'n1' });
    // Adapt theo cờ: đã biết tìm ra lỗi và đã hẹn báo lại.
    expect(d.lines).toContain(
      'Alo em ơi, chị Linh nè. Em nói tìm ra lỗi rồi, chị báo khách là đang sửa rồi đó.',
    );
    expect(d.state.facts.map((f) => f.id)).toContain('f9');

    d.send({ type: 'CHOOSE', option: 'a', elapsedMs: 9000 });
    expect(d.state.await).toEqual({ kind: 'node_reply', node: 'n1' });
    d.say('Dạ em đang sửa rồi chị.');
    expect(d.state.nodes.n1.status).toBe('done');

    d.action('chot_nguyen_nhan');
    expect(d.state.await).toEqual({
      kind: 'node_artefact',
      node: 'n2',
      artefact: 'ghi_chu_su_co',
    });
    d.send({
      type: 'SAVE_ARTEFACT',
      artefact: 'ghi_chu_su_co',
      fields: NOTE,
      ticks: ['h3'],
    });
    // Hook 1 đã được trả lời trong pha (da_loai_db_bang_chung) nên dùng hook 2 (A7).
    expect(d.state.nodes.n2.hookUsed).toContain('mấy khả năng');
    expect(d.state.await).toEqual({ kind: 'probe_answer', node: 'n2' });
    d.say(
      'Em giữ khả năng API trả hết đơn không giới hạn vì app cũ không gửi số trang.',
    );
    // Ô tick h4 không đánh nhưng nói bằng lời trong nút vẫn bật cờ (A12, D5).
    expect(d.flags.has('gc.h4')).toBe(true);
    expect(d.state.nodes.n2.status).toBe('done');

    d.action('meeting');
    d.send({ type: 'END_CONVERSATION' });
    d.action('talk_support'); // giữ lời trong cửa sổ quanh 11:30
    expect(d.state.promises[0].status).toBe('kept');

    d.action('gui_anh_an');
    // E7: nộp trước hạn chót phải xác nhận bằng giao diện.
    expect(d.state.await).toEqual({ kind: 'confirm_end', node: 'n3' });
    d.send({ type: 'CONFIRM_END' });
    d.send({ type: 'SAVE_ARTEFACT', artefact: 'email_an', fields: GOOD_EMAIL });
    expect(d.flags.has('email.co_rollback')).toBe(true);
    d.say('Nếu khách nhiều đơn hơn thì em theo dõi log, lỗi thì rollback.');
    expect(d.state.nodes.n3.approved).toBe(true);
    expect(d.state.events.map((e) => e.name)).toContain('su_kien.duyet');
    expect(d.state.ended).toBe(true);
    expect(d.state.await).toEqual({ kind: 'ended' });
    expect(d.state.reviewAsked).toEqual([]);

    const summary = shiftSummary(d.state, ctx);
    expect(summary.graded).toBe(false);
    expect(summary.nodes.every((n) => n.status === 'done')).toBe(true);
    expect(summary.promises).toEqual([
      expect.objectContaining({ status: 'kept' }),
    ]);
    expect(
      summary.concerns.find((c) => c.text.startsWith('Sợ bản sửa'))?.resolved,
    ).toBe(true);
  });

  it('hành động dài vắt qua 10:50 thì bị cắt đôi, tài liệu là nháp tới khi xong (A1b)', () => {
    const d = new Driver().open();
    d.spend(10);
    expect(d.state.points).toBe(10);
    d.action('write_patch', GOOD_PATCH);
    expect(d.state.points).toBe(15); // 14 tới mốc + 1 điểm của nút
    expect(d.state.await).toEqual({ kind: 'node_choice', node: 'n1' });
    expect(d.state.artefacts.ban_va.status).toBe('draft');
    expect(d.flags.has('bv.bo_vong_lap')).toBe(false);
    expect(sceneView(d.state, ctx).suspended).toMatchObject({
      key: 'write_patch',
      remaining: 1,
    });

    d.send({ type: 'TIMEOUT' });
    expect(d.state.nodes.n1.timedOut).toBe(true);
    d.say('Em đang coi chị ơi.');
    // Nút xong, bản vá chạy nốt 1 điểm rồi mới lưu và chạy bộ phán.
    expect(d.state.points).toBe(16);
    expect(d.state.artefacts.ban_va.status).toBe('saved');
    expect(d.flags.has('bv.bo_vong_lap')).toBe(true);
    expect(
      d.state.actionLog.find((a) => a.key === 'write_patch'),
    ).toMatchObject({ points: 5, cut: true });
  });

  it('hứa 11:30 mà không gọi thì bị nhắc qua đúng kênh, bật tre_hen (A1b)', () => {
    const d = new Driver().open();
    // Chưa tới cửa sổ 6 điểm trước cuộc gọi 10:50.
    expect(() => d.action('wait')).toThrow(
      expect.objectContaining({ code: 'TURN_INVALID' }),
    );
    d.spend(14);
    expect(d.state.await).toEqual({ kind: 'node_choice', node: 'n1' });
    expect(d.state.points).toBe(15); // nút tốn 1 điểm
    d.send({ type: 'CHOOSE', option: 'a' }).say('Dạ.');
    // Làm việc khác, không liên lạc chị Linh.
    d.action('write_patch', GOOD_PATCH); // 15 → 20, n2 bật dự phòng lúc 11:20
    expect(d.state.await).toMatchObject({ kind: 'node_artefact', node: 'n2' });
    expect(d.lines).toContain(
      'Em ơi, chốt được nguyên nhân chưa? Ghi vào ghi chú sự cố cho anh coi với.',
    );
    d.send({
      type: 'SAVE_ARTEFACT',
      artefact: 'ghi_chu_su_co',
      fields: NOTE,
      ticks: ['h3', 'h4'],
    });
    d.say('Em dựa vào log.');
    d.action('run_staging'); // 2 điểm, không liên lạc chị Linh
    expect(d.state.promises[0].status).toBe('late');
    expect(d.flags.has('tre_hen')).toBe(true);
    expect(d.state.conversation).toMatchObject({
      slots: ['support'],
      channel: 'call',
      byNpc: true,
    });
    expect(d.lines).toContain(
      'Alo em ơi, tới giờ em hẹn rồi nè, bên đó sao rồi em?',
    );
  });

  it('lời hứa theo sự kiện: tới hạn khi staging chạy nhanh (A1b, D5)', () => {
    const d = new Driver().open();
    d.action('talk_support').say(
      'Khi staging chạy ổn em báo lại chị liền nha.',
    );
    d.action('write_patch', GOOD_PATCH);
    expect(d.state.promises[0]).toMatchObject({
      event: 'su_kien.staging_ok',
      status: 'open',
    });
    d.action('run_staging');
    d.action('open_code'); // 1 điểm sau sự kiện mà chưa báo
    expect(d.state.promises[0].status).toBe('late');
    expect(d.flags.has('tre_hen')).toBe(true);
  });

  it('báo chị Linh ngay sau sự kiện thì giữ lời', () => {
    const d = new Driver().open();
    d.action('talk_support').say(
      'Khi staging chạy ổn em báo lại chị liền nha.',
    );
    d.action('write_patch', GOOD_PATCH)
      .action('run_staging')
      .action('talk_support');
    expect(d.state.promises[0].status).toBe('kept');
  });

  it('email thiếu cách lùi lại nhưng nói bằng lời trong nút vẫn gỡ được khúc mắc (A12, A13)', () => {
    const d = new Driver().open();
    d.action('talk_mentor').say('Lỗi do vòng lặp gọi DB 901 lần.');
    // n1 chưa xảy ra: nút "Chốt nguyên nhân" chưa bấm được (A1b).
    expect(() => d.action('chot_nguyen_nhan')).toThrow('Chưa tới lúc');
    d.spend(13);
    d.send({ type: 'CHOOSE', option: 'c' }).say('Dạ.');
    d.action('chot_nguyen_nhan');
    d.send({
      type: 'SAVE_ARTEFACT',
      artefact: 'ghi_chu_su_co',
      fields: NOTE,
      ticks: ['h3', 'h4'],
    });
    d.say('Em dựa vào log.');
    d.action('gui_anh_an').send({ type: 'CONFIRM_END' });
    d.send({
      type: 'SAVE_ARTEFACT',
      artefact: 'email_an',
      fields: { ...GOOD_EMAIL, rui_ro: 'Theo dõi log sau khi lên.' },
    });
    expect(d.flags.has('email.co_rollback')).toBe(false);
    // Probe theo nhánh mặc định (email chưa đủ cách kiểm và cách lùi).
    expect(d.state.nodes.n3.hookUsed).toContain('chưa thấy cách kiểm');
    d.say('Nếu lỗi em deploy lại bản cũ ngay.');
    expect(d.flags.has('n3.co_rollback')).toBe(true);
    expect(d.state.nodes.n3.approved).toBe(true);
  });

  it('email thiếu và không nói thêm thì anh An hoãn, không dặn cách làm', () => {
    const d = new Driver().open();
    d.spend(14);
    d.send({ type: 'CHOOSE', option: 'b' }).say('Dạ.');
    d.action('chot_nguyen_nhan');
    d.send({ type: 'SAVE_ARTEFACT', artefact: 'ghi_chu_su_co', fields: NOTE });
    d.say('Em đoán thôi.');
    d.action('gui_anh_an').send({ type: 'CONFIRM_END' });
    d.send({
      type: 'SAVE_ARTEFACT',
      artefact: 'email_an',
      fields: { nguyen_nhan: 'API chậm.', huong_xu_ly: 'Sửa.', rui_ro: '' },
    });
    d.say('Em chưa nghĩ tới.');
    expect(d.state.nodes.n3.approved).toBe(false);
    const defer = d.narrations.find((n) =>
      n.guidance?.includes('Không dặn cách làm'),
    );
    expect(defer?.slot).toBe('mentor');
    // Hứa chắc trưa xong: "Nhìn lại ca" hỏi lại (A7).
    expect(d.state.reviewAsked).toEqual(['hua_chac_trua']);
  });

  it('"Nhìn lại ca" hỏi tối đa 2 mục, theo thứ tự (A7, D4)', () => {
    const d = new Driver().open();
    d.spend(14);
    d.send({ type: 'CHOOSE', option: 'a' }).say(
      'Chị cứ nói khách trưa là xong.',
    );
    expect(d.flags.has('hua_chac_trua')).toBe(true);
    d.action('write_patch', GOOD_PATCH); // tới n2 dự phòng
    d.send({
      type: 'SAVE_ARTEFACT',
      artefact: 'ghi_chu_su_co',
      fields: NOTE,
      ticks: ['h4'],
    });
    d.say('Em dựa vào log.');
    d.action('run_staging'); // không gọi chị Linh → trễ hẹn, bị nhắc
    expect(d.flags.has('tre_hen')).toBe(true);
    d.say('Dạ 11:55 em gọi báo lại chị nha.'); // hứa mới, còn treo tới hết ca
    d.action('gui_anh_an').send({ type: 'CONFIRM_END' });
    d.send({ type: 'SAVE_ARTEFACT', artefact: 'email_an', fields: GOOD_EMAIL });
    d.say('Em theo dõi log và rollback nếu lỗi.');
    expect(d.state.await).toEqual({ kind: 'probe_answer', review: 'tre_hen' });
    d.say('Lúc đó em đang viết bản vá.');
    expect(d.state.await).toEqual({
      kind: 'probe_answer',
      review: 'hua_con_treo',
    });
    d.say('Chị nói khách là đang sửa.');
    expect(d.state.reviewAsked).toEqual(['tre_hen', 'hua_con_treo']);
    expect(d.state.ended).toBe(true);
  });

  it('hết giờ thì nút kết tự bật, nút chưa tới không xét (D2)', () => {
    const d = new Driver().open();
    d.spend(14);
    d.send({ type: 'CHOOSE', option: 'c' }).say('Dạ.');
    d.action('write_patch', GOOD_PATCH);
    d.send({
      type: 'SAVE_ARTEFACT',
      artefact: 'ghi_chu_su_co',
      fields: NOTE,
      ticks: ['h4'],
    });
    d.say('Log.');
    d.spend(30);
    expect(d.state.activeNode).toBe('n3');
    expect(d.state.nodes.n3.via).toBe('fallback');
    expect(d.lines).toContain('Trưa rồi nè em, gửi anh hướng xử lý nha.');
    // Đang ở nút kết thì không có cảnh timeline hay nhịp báo hết giờ chen vào.
    const lastNpc = d.state.transcript.filter((l) => l.kind === 'npc').at(-1);
    expect(lastNpc?.text).toBe('Trưa rồi nè em, gửi anh hướng xử lý nha.');
  });

  it('xin duyệt giữa pha: tối đa 1 nhịp rồi approval_line (A13, D5)', () => {
    const d = new Driver().open();
    d.action('talk_mentor').say('Anh duyệt cho em đưa bản sửa lên nha.');
    const last = d.state.transcript
      .filter((l) => l.kind === 'npc')
      .slice(-2)
      .map((l) => l.text);
    expect(last[1]).toBe(
      'Em gửi anh email hướng xử lý nha, anh duyệt trên đó.',
    );
    expect(d.narrations.at(-1)?.maxBeats).toBe(1);
  });

  it('hội thoại: 1 điểm cho 3 lượt, lượt thứ 4 tốn thêm 1 điểm (A1)', () => {
    const d = new Driver().open();
    d.action('talk_mentor');
    expect(d.state.points).toBe(1);
    d.say('Một.').say('Hai.').say('Ba.');
    expect(d.state.points).toBe(1);
    d.say('Bốn.');
    expect(d.state.points).toBe(2);
  });

  it('từ chối thao tác sai lúc và lượt đang chờ AI', () => {
    const d = new Driver().open();
    expect(() => step(d.state, { type: 'SAY', text: 'x' }, ctx)).toThrow(
      ShiftRuleError,
    );
    const waiting = step(
      d.state,
      { type: 'ACTION', key: 'talk_mentor' },
      ctx,
    ).state;
    const asking = step(waiting, { type: 'SAY', text: 'Anh ơi' }, ctx).state;
    expect(asking.await.kind).toBe('ai');
    expect(() =>
      step(asking, { type: 'ACTION', key: 'open_log' }, ctx),
    ).toThrow(expect.objectContaining({ code: 'TURN_IN_PROGRESS' }));
  });

  it('hint bậc 1 nhắc nguồn chưa xem, không tốn điểm', () => {
    const d = new Driver().open();
    d.send({ type: 'HINT' });
    expect(d.state.hints[0]).toMatchObject({
      tier: 1,
      text: 'Bạn chưa xem log API lịch sử đơn.',
    });
    expect(d.state.points).toBe(0);
    expect(d.state.await.kind).toBe('phase');
  });

  it('fold chuỗi đầu vào ra đúng trạng thái, không gọi lại AI', () => {
    const d = new Driver().open();
    d.action('talk_support').say(
      'Chị ơi em tìm ra lỗi rồi, 11:30 em báo lại chị.',
    );
    d.action('write_patch', GOOD_PATCH).action('run_staging');
    expect(fold(ctx, d.inputs)).toEqual(d.state);
  });

  it('hồ sơ gửi AI-4 không có câu kiểm, observes hay dữ kiện ai_only của slot khác (C2)', () => {
    const d = new Driver().open();
    d.action('talk_support').say('Chị ơi bên chị nhận bao nhiêu phàn nàn rồi?');
    d.action('talk_mentor').say('Anh ơi app cũ có gửi số trang không?');
    for (const req of d.narrations) {
      const json = JSON.stringify(req);
      for (const q of ctx.seed.conversation_checks)
        expect(json).not.toContain(q.q);
      expect(json).not.toContain('observes');
      if (req.slot === 'support') {
        expect(req.confirmOnly).toEqual([]);
        expect(json).not.toContain('vòng lặp');
      }
    }
    // Lộ dần: mỗi lượt tối đa một dữ kiện mới.
    expect(d.state.facts.map((f) => f.id)).toEqual(
      expect.arrayContaining(['f2', 'f10']),
    );
    const support = d.narrations.find(
      (n) => n.slot === 'support' && n.task === 'reply',
    );
    expect(support?.mayReveal).toHaveLength(1);
  });
});

describe('sceneView', () => {
  it('chỉ cho thấy điều người chơi biết: phương án không kèm reaction hay cờ', () => {
    const d = new Driver().open().spend(14);
    const view = sceneView(d.state, ctx);
    expect(view.mode).toBe('node');
    expect(view.node).toMatchObject({
      id: 'n1',
      format: 'timed_choice',
      timeLimitSeconds: 30,
    });
    expect(view.node?.options.map((o) => Object.keys(o).sort())).toEqual([
      ['key', 'text'],
      ['key', 'text'],
      ['key', 'text'],
    ]);
    expect(view.clock).toMatchObject({ time: '10:55', remaining: 13 });
    expect(JSON.stringify(view)).not.toContain('resolve_when');
  });

  it('hành động bị khoá có lý do; xem lại tài liệu không tốn điểm', () => {
    const d = new Driver().open().action('open_log');
    const view = sceneView(d.state, ctx);
    const byKey = Object.fromEntries(view.actions.map((a) => [a.key, a]));
    expect(byKey.open_log).toMatchObject({ enabled: true, points: 0 });
    expect(byKey.chot_nguyen_nhan).toMatchObject({
      enabled: false,
      reason: 'Chưa tới lúc',
    });
    expect(byKey.rewrite_patch.enabled).toBe(false);
    expect(byKey.write_patch.form?.fields).toEqual([
      { id: 'mo_ta', label: 'Mô tả thay đổi' },
    ]);
    expect(view.documents.map((x) => x.id)).toEqual(['log_api']);
    expect(view.notebook.facts.map((f) => f.id)).toContain('f5');
  });
});

describe('pendingRequest', () => {
  it('dựng lại đúng yêu cầu AI đang chờ từ trạng thái đã fold', async () => {
    const { pendingRequest } = await import('./engine.js');
    const s0 = step(initialState(ctx), { type: 'START' }, ctx).state;
    const r = step(s0, { type: 'SAY', text: 'Dạ.' }, ctx);
    const effect = r.effects.find((e) => e.type === 'narrate');
    expect(effect?.type).toBe('narrate');
    if (effect?.type === 'narrate')
      expect(pendingRequest(r.state, ctx)).toEqual({
        type: 'narrate',
        request: effect.request,
      });
    expect(pendingRequest(s0, ctx)).toBeNull();
  });
});
