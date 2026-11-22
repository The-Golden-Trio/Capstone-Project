import { expect, it } from 'vitest';
import { fixtureShiftContext } from '../testing/fixture.js';
import { initialState, step } from './engine.js';
import { lintObserves } from './grading/observe.js';
import { lintSeed } from './lint.js';
import type { PlayerInput, ShiftInput } from './state.js';
import { FAKE_EVENTS, FAKE_RULES, FAKE_SCRIPTS } from './testing/fakeRules.js';
import { fakeChecks, fakeNarration } from './testing/fakes.js';
import { sceneView } from './view.js';

const seedId = 'SWE_BACKEND.L3.m2';
const context = fixtureShiftContext(seedId);

it('validates the v5.2 seed and its checklist references', () => {
  expect(context.seed.version).toBe(5);
  expect(lintSeed(context.seed, context.pack)).toEqual([]);
  expect(lintObserves(context.seed.observes ?? [], context.seed)).toEqual([]);
  expect(
    context.seed.artefacts.find(({ id }) => id === 'bang_so_lieu')?.unlocks,
  ).toEqual(['f4']);
});

it('replays Lan’s v5.2 walkthrough and keeps all three promises in 26 points', () => {
  let state = initialState(context);
  function apply(input: ShiftInput): void {
    const result = step(state, input, context);
    state = result.state;
    for (const effect of result.effects) {
      if (effect.type === 'narrate')
        apply({
          type: 'NARRATION',
          requestId: effect.request.requestId,
          beats: fakeNarration(effect.request, FAKE_SCRIPTS[seedId]),
          provenance: { adapter: 'fake' },
        });
      if (effect.type === 'check')
        apply({
          type: 'CHECKS',
          requestId: effect.request.requestId,
          answers: fakeChecks(
            effect.request,
            FAKE_RULES[seedId],
            FAKE_EVENTS[seedId],
          ),
          provenance: { adapter: 'fake' },
        });
    }
  }
  const send = (input: PlayerInput) => apply(input);
  const say = (text: string) => send({ type: 'SAY', text });
  const action = (
    key: string,
    fields?: Record<string, string>,
    ticks?: string[],
  ) => send({ type: 'ACTION', key, fields, ticks });
  const heard = (text: string) =>
    expect(state.transcript.some((line) => line.text === text)).toBe(true);
  const expectTime = (points: number) => expect(state.points).toBe(points);
  const notebook = () => sceneView(state, context).notebook;
  const fact = (id: string) =>
    notebook().facts.find((entry) => entry.id === id);
  const callPromise = 'Gọi chị Linh lúc 11:30';
  const filePromise = 'Gửi chị Linh danh sách đơn trước 11:10';
  const approvalPromise = 'Báo chị Linh khi anh An duyệt bản sửa';

  send({ type: 'START' });
  say('dạ em coi liền a. sao a nghĩ là DB quá tải vậy ạ');
  heard('Anh chưa coi dashboard.');
  expectTime(0);

  for (const key of ['open_wiki', 'open_log', 'open_dashboard', 'open_code']) {
    action(key);
  }
  expectTime(4);
  expect(state.facts.map(({ id }) => id)).toEqual([
    'f1',
    'f3',
    'f6',
    'f10',
    'f14',
    'f18',
    'f4',
    'f5',
    'f15',
    'f8',
  ]);

  action('talk_support');
  expectTime(5);
  expect(fact('f16')).toBeUndefined();
  heard('Alo, Linh nghe nè em.');
  say('chị ơi khách phàn nàn gì vậy chị');
  heard('Trời ơi em, sáng giờ chị nhận ba cuộc rồi á, toàn bên Minh Phát.');
  say('sao hnay mới bị vậy chị, hôm qua có gì thay đổi k ạ');
  heard('Sáng nay mới bị vậy đó em.');
  say(
    'dạ em coi log rồi, lỗi ở API bên em chứ k phải mạng khách đâu chị. 11h30 em gọi báo chị nha',
  );
  heard('Ừ, vậy 11 rưỡi chị chờ em nha.');
  expectTime(5);
  // The 10:05 bot post waits until the call with chị Linh ends (WT).
  expect(state.transcript.some((l) => l.speaker === 'bot_deploy')).toBe(false);
  expect(fact('f16')).toBeUndefined();

  action('talk_mentor');
  expectTime(6);
  expect(state.transcript).toContainEqual(
    expect.objectContaining({
      at: 5,
      kind: 'system',
      speaker: 'bot_deploy',
      text: 'Build module thanh toán #482 bắt đầu chạy…',
    }),
  );
  expect(fact('f16')?.text).toBe('Build thanh toán #482 bắt đầu 10:05.');
  say(
    'a ơi khách MP-0042 900 đơn mà API hỏi CSDL 901 lần, Bà Ba 240 đơn hỏi 241 lần. CPU DB có 24% à. em nghĩ do bước 2 trong code em lấy món từng đơn 1',
  );
  heard('Vậy hổng phải DB rồi.');
  expectTime(6);

  action(
    'write_patch',
    { ghi_chu: 'gom truy vấn cho hết vòng lặp + phân trang' },
    ['v1', 'v2'],
  );
  expectTime(11);
  expect(state.promises).toEqual([
    expect.objectContaining({
      label: callPromise,
      status: 'open',
      dueAt: 22,
      channel: 'call',
    }),
  ]);
  action('run_staging');
  expectTime(13);
  expect(state.artefacts.log_staging.lines).toEqual([
    'GET /orders/history?customer=MP-0042&page=1   (app 3.x)              0.18s  db_queries=2  rows=50',
    'GET /orders/history?customer=MP-0042          (app 2.x, máy tính bảng) 0.18s  db_queries=2  rows=50',
    '⚠ app 2.x không có nút "xem thêm": chỉ hiện 50 đơn gần nhất (khoảng 1 ngày của 6 quán)',
  ]);
  heard('Build #482 xong ✅');
  expect(fact('f9')).toBeUndefined();
  expect(fact('f13')).toBeUndefined();
  expect(fact('f2')?.text).toBe('Chị Linh: 3 cuộc phàn nàn, đều từ Minh Phát.');
  expect(notebook().facts.some(({ text }) => text.includes('12 cuộc'))).toBe(
    false,
  );

  action('wait');
  expectTime(15);
  expect(state.nodes.n1.openedAt).toBe(14);
  expect(state.await).toEqual({ kind: 'node_choice', node: 'n1' });
  heard(
    'Alo em ơi, chị Linh nè. Chị có nói với khách là bên kỹ thuật thấy lỗi rồi.',
  );
  expect(fact('f9')?.text).toBe(
    'Chị Linh: 12 cuộc phàn nàn từ Minh Phát. Họ doạ ngưng hợp đồng nếu trưa còn lỗi.',
  );
  expect(fact('f13')).toBeUndefined();
  expect(sceneView(state, context).node).toMatchObject({
    timeLimitSeconds: 40,
    options: [
      {
        key: 'a',
        text: 'Em chưa dám hứa giờ chị ạ. Tới giờ hẹn em báo chị như đã nói.',
      },
      { key: 'b', text: 'Chắc trưa là xong thôi chị.' },
      {
        key: 'c',
        text: 'Giờ em chưa nói được. Nhưng khách cần lịch sử để đặt lại đơn phải không chị? Em xuất danh sách đơn của họ gửi chị trong 15 phút.',
      },
    ],
  });
  send({ type: 'CHOOSE', option: 'c', elapsedMs: 25_000 });
  heard('Ờ đúng rồi, họ bấm đặt lại đơn tuần trước á.');
  expect(fact('f13')?.text).toBe('Bếp Minh Phát đặt lại đơn của tuần trước.');
  say('dạ file em gửi liền ạ. 11h30 em vẫn gọi chị như hẹn nha');
  heard('Ừ, chị chờ em nha.');
  expectTime(15);

  action('xuat_file_action');
  expectTime(17);
  heard('MP-0042_lich_su_don.xlsx · 900 đơn · đã gửi chị Linh');
  heard('Chị nhận rồi nè em, để bên chị đặt giùm họ.');
  expect(
    sceneView(state, context).cast.find(({ slot }) => slot === 'mentor')
      ?.status,
  ).toBe('Đang họp · 11:20 trả lời');
  expect(state.promises).toContainEqual(
    expect.objectContaining({
      label: filePromise,
      byAction: 'xuat_file_action',
      status: 'kept',
    }),
  );

  action(
    'rewrite_patch',
    {
      ghi_chu:
        'gom truy vấn cho hết vòng lặp + phân trang\napp 2.x k gửi số trang thì vẫn trả đủ đơn (cho máy tính bảng của khách)',
    },
    ['v1', 'v2', 'v3'],
  );
  expectTime(19);
  expect(state.await).toEqual({ kind: 'node_reply', node: 'e1' });
  expect(state.nodes.e1.openedAt).toBe(18);
  expect(state.suspended).toEqual({ key: 'rewrite_patch', remaining: 2 });
  heard('Bên em sửa tới đâu rồi? Có cách nào nhanh hơn hông em?');
  say(
    'dạ em có bản sửa chạy thử rồi chị, đang chỉnh thêm cho máy tính bảng bên Minh Phát. mà phải có a An duyệt mới đưa lên được, a họp tới 11h20. 11h30 em gọi chị như hẹn nha',
  );
  heard('Có tin em báo chị liền nha.');
  expect(state.transcript).toContainEqual(
    expect.objectContaining({
      at: 19,
      kind: 'system',
      speaker: 'bot_giam_sat',
      channel: 'group',
      text: '3 yêu cầu lịch sử đơn của MP-0042 bị app tự ngắt vì quá 5 giây (11:12–11:15).',
    }),
  );
  expectTime(21);
  expect(state.nodes.n2.openedAt).toBe(20);
  expect(state.suspended).toEqual({ key: 'rewrite_patch', remaining: 1 });
  expect(
    sceneView(state, context).cast.find(({ slot }) => slot === 'mentor')
      ?.status,
  ).toBeUndefined();
  heard('Em ghi giùm anh cái ghi chú sự cố nha, chiều anh dán vào báo cáo.');

  send({
    type: 'SAVE_ARTEFACT',
    artefact: 'ghi_chu_su_co',
    fields: {
      hien_tuong:
        'Từ 8:00, mở lịch sử đơn của khách nhiều đơn bị chậm: Minh Phát 4,4 giây, Bà Ba 1,3 giây; khách ít đơn vẫn 0,2 giây. Từ 11:12 app bắt đầu tự ngắt với Minh Phát.',
      nguyen_nhan:
        'API lịch sử đơn (phần em viết) lấy món của từng đơn trong vòng lặp, nên số lần hỏi CSDL bằng số đơn cộng 1 (901/900, 241/240, code bước 2). Tối qua gộp tài khoản nên Minh Phát lên 900 đơn, lỗi mới lộ ra.',
      da_lam:
        'Viết bản vá gom truy vấn và phân trang, chạy thử staging còn 0,18 giây. Đang chỉnh thêm cho app 2.x. Đã gửi chị Linh danh sách đơn của Minh Phát để đặt giùm khách.',
      h1__why: 'CPU 24–26%, dưới 80%; khách ít đơn cùng giờ vẫn nhanh',
      h2__why: 'Thời gian trong log do máy chủ đo, chưa tính mạng',
      h3__why: '901/900, 241/240, code bước 2',
      h4__why: 'Trả cả 900 đơn một lần',
      h5__why: 'Build bắt đầu 10:05, còn chậm từ 8:00',
      h6__why: '',
    },
    ticks: ['h1=loai', 'h2=loai', 'h3=giu', 'h4=giu', 'h5=loai', 'h6=chua_ro'],
  });
  heard('Số lần hỏi khớp số đơn, anh thấy rồi.');
  expect(state.nodes.n2.hookUsed).toBe(
    'Mấy cái em để chưa rõ, em tính kiểm bằng gì?',
  );
  say(
    'dạ log vẫn trả 200, đủ 900 đơn nên chắc dữ liệu k hỏng, chỉ là nhiều đơn hơn. em đổi thành loại ạ',
  );
  heard('Ok.');
  expectTime(22);
  heard(
    'Đồng hồ góc màn hình nhảy sang 11:30, nhóm chat bắt đầu réo ai đặt cơm.',
  );

  action('talk_support');
  expectTime(23);
  heard('Alo em, chị nghe nè.');
  say(
    'chị ơi bản sửa xong rồi, em chạy thử lại rồi gửi a An duyệt. có duyệt em báo chị liền nha',
  );
  heard('Ừ, nhanh nha em, khách hối quá trời.');
  expectTime(23);
  expect(state.promises).toContainEqual(
    expect.objectContaining({
      label: callPromise,
      dueAt: 22,
      channel: 'call',
      status: 'kept',
    }),
  );

  action('run_staging');
  expectTime(25);
  expect(state.artefacts.log_staging.lines).toEqual([
    'GET /orders/history?customer=MP-0042&page=1   (app 3.x)              0.18s  db_queries=2  rows=50',
    'GET /orders/history?customer=MP-0042          (app 2.x, máy tính bảng) 1.12s  db_queries=2  rows=900',
  ]);
  expect(
    context.seed.nodes.find(({ id }) => id === 'n3')?.trigger.fallback_at,
  ).toBe('11:45');
  expect(state.nodes.n3.status).toBe('pending');
  action('gui_anh_an');
  expectTime(25);
  expect(state.await).toEqual({ kind: 'confirm_end', node: 'n3' });
  send({ type: 'CONFIRM_END' });
  expectTime(26);
  expect(state.nodes.n3).toMatchObject({ openedAt: 25, via: 'player' });
  send({
    type: 'SAVE_ARTEFACT',
    artefact: 'email_an',
    fields: {
      tieu_de: 'Sự cố API lịch sử đơn, xin duyệt bản sửa',
      nguyen_nhan:
        'API lịch sử đơn (phần em viết) lấy món của từng đơn bằng một lần hỏi CSDL riêng, nên Minh Phát 900 đơn phải hỏi 901 lần, mất 4,4 giây. Trưa đông thì quá 5 giây và app tự ngắt, đã bị từ 11:12. CPU DB chỉ 24–26% nên không phải quá tải.',
      huong_xu_ly:
        'Gom truy vấn còn 2 lần hỏi, phân trang 50 đơn cho app 3.x, app 2.x không gửi số trang thì vẫn trả đủ đơn. Chạy thử trên staging với MP-0042: app 3.x từ 4,4 giây còn 0,18 giây, app 2.x còn 1,12 giây, đều chỉ 2 lần hỏi. Anh duyệt giúp em đưa lên production nha.',
      rui_ro:
        'Nếu lên rồi có lỗi, em bấm Rollback trên công cụ deploy, khoảng 2 phút là về bản cũ.',
    },
  });
  heard('Anh chỉ sợ lên rồi hỏng chỗ khác, máy khách đủ loại mà.');
  expect(state.nodes.n3.hookUsed).toBe('Lên rồi sao em biết là ổn?');
  say(
    'dạ lên xong em canh log 15p, xem Minh Phát mở lịch sử dưới 2s và chỉ hỏi CSDL 2 lần. k đúng vậy là em rollback liền',
  );
  heard('Ok Lan, anh duyệt.');
  expect(state.nodes.n3.approved).toBe(true);
  expect(state.await).toEqual({
    kind: 'last_word',
    to: 'support',
    prompt: 'Nhắn chị Linh trước khi kết ca?',
  });
  expectTime(26);
  say(
    'chị ơi a An duyệt rồi, em đưa lên liền nha. chị báo khách là bên em đang đưa bản sửa lên ạ',
  );

  expectTime(26);
  expect(state.await).toEqual({ kind: 'ended' });
  expect(state.promises).toHaveLength(3);
  expect(state.promises.map(({ status }) => status)).toEqual([
    'kept',
    'kept',
    'kept',
  ]);
  expect(state.promises).toContainEqual(
    expect.objectContaining({
      label: approvalPromise,
      event: 'su_kien.duyet',
      status: 'kept',
    }),
  );
  expect(notebook().promises.map(({ label }) => label)).toEqual([
    callPromise,
    filePromise,
    approvalPromise,
  ]);
  expect(
    state.actionLog.map(({ key, at, points, completedAt }) => [
      key,
      at,
      points,
      completedAt,
    ]),
  ).toEqual([
    ['open_wiki', 0, 1, 1],
    ['open_log', 1, 1, 2],
    ['open_dashboard', 2, 1, 3],
    ['open_code', 3, 1, 4],
    ['talk_support', 4, 1, 5],
    ['talk_mentor', 5, 1, 6],
    ['write_patch', 6, 5, 11],
    ['run_staging', 11, 2, 13],
    ['wait', 13, 1, 14],
    ['xuat_file_action', 15, 2, 17],
    ['rewrite_patch', 17, 3, 22],
    ['talk_support', 22, 1, 23],
    ['run_staging', 23, 2, 25],
  ]);
  expect(
    Object.entries(state.nodes).map(([id, { openedAt, doneAt }]) => [
      id,
      openedAt,
      doneAt,
    ]),
  ).toEqual([
    ['n0', 0, 0],
    ['n1', 14, 15],
    ['e1', 18, 19],
    ['n2', 20, 21],
    ['n3', 25, 26],
  ]);
  for (const flag of [
    'tu_dua_len',
    'hua_chac_trua',
    'de_support_tin_sai',
    'tre_hen',
  ]) {
    expect(state.flags).not.toContain(flag);
  }
  expect(
    state.transcript.some(({ context }) => context.startsWith('review:')),
  ).toBe(false);
  expect(state.facts.map(({ id }) => id).sort()).toEqual(
    context.seed.facts
      .map(({ id }) => id)
      .filter((id) => id !== 'f12')
      .sort(),
  );
  heard('Trời, vậy chị báo khách liền nha em!');
  expect(
    state.transcript
      .filter(({ context }) => context === 'epilogue')
      .map(({ speaker, text }) => [speaker, text]),
  ).toEqual([
    ['bot_deploy', 'Bản sửa lên production lúc 12:06.'],
    ['bot_giam_sat', '12:20 · MP-0042: 1,12s · 2 lần hỏi CSDL.'],
    ['support', 'Minh Phát nói mở được rồi nè em, hú hồn!'],
  ]);
});
