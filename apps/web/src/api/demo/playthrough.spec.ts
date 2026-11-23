import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { shift } from '@datn/game-core';
import { createDemoApi } from './index';
import { AUTOPLAY_SCRIPTS } from './playthroughs';
import { db, save } from './store';
import type { SceneView, TurnInput } from '../types';

const api = createDemoApi();
const script = AUTOPLAY_SCRIPTS.lan;

async function fast<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync();
  return promise;
}

function turnOf(step: shift.Step): TurnInput | null {
  switch (step.do) {
    case 'action':
      return {
        kind: 'action',
        key: step.key,
        fields: step.fields,
        ticks: step.ticks,
      };
    case 'say':
      return { kind: 'say', text: step.text };
    case 'choose':
      return { kind: 'choose', option: step.option, elapsedMs: step.elapsedMs };
    case 'save_artefact':
      return {
        kind: 'save_artefact',
        artefact: step.artefact,
        fields: step.fields,
        ticks: step.ticks,
      };
    case 'confirm_end':
      return { kind: 'confirm_end' };
    default:
      return null;
  }
}

/** Chơi kịch bản qua `PlayService` như giao diện: mỗi việc là một lượt, bước `ifAwait` chỉ chạy khi đúng chỗ. */
async function replay({
  explicitEnd,
  lastWord,
}: {
  explicitEnd: boolean;
  lastWord?: string;
}) {
  await fast(
    api.auth.register({
      email: 'lan@example.test',
      password: 'demo-pass',
      displayName: 'Lan',
      dateOfBirth: '2008-06-12',
    }),
  );
  const run = await fast(api.play.start(script.seed, null));
  let scene: SceneView = await fast(api.play.scene(run.runId));
  for (const step of script.steps) {
    let turn = turnOf(step);
    if (!turn) continue;
    if (lastWord && step.do === 'say' && step.ifAwait === 'last_word')
      turn = { kind: 'say', text: lastWord };
    const wanted = step.ifAwait;
    const kinds = wanted === undefined ? null : [wanted].flat();
    if (kinds && !kinds.includes(scene.await.kind)) continue;
    if (
      explicitEnd &&
      turn.kind === 'action' &&
      scene.mode === 'conversation'
    ) {
      await fast(api.play.turn(run.runId, { kind: 'end_conversation' }));
      scene = await fast(api.play.scene(run.runId));
    }
    await fast(api.play.turn(run.runId, turn));
    scene = await fast(api.play.scene(run.runId));
  }
  return {
    run,
    scene,
    lines: (await fast(api.play.transcript(run.runId))).map((l) => l.text),
    summary: await fast(api.play.summary(run.runId)),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  db.players = [];
  db.current = null;
  save();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('lượt chơi mẫu bản 5.2 (Lan) chạy qua PlayService', () => {
  it('ra đúng lời nhân vật, tin bot, giờ, dữ kiện và lời hứa của kịch bản', async () => {
    const { scene, lines, summary } = await replay({ explicitEnd: false });

    expect(scene.ended).toBe(true);
    expect(scene.clock.time).toBe('11:50');
    expect(scene.clock.remaining).toBe(2);
    expect(scene.clock.budget - scene.clock.remaining).toBe(26);

    for (const line of [
      'Lan ơi, API lịch sử đơn có request chậm từ 8h, bình thường 0,2s mà có lúc lên hơn 4s.',
      'Anh chưa coi dashboard.',
      'Alo, Linh nghe nè em.',
      'Trời ơi em, sáng giờ chị nhận ba cuộc rồi á, toàn bên Minh Phát.',
      'Ừ, vậy 11 rưỡi chị chờ em nha.',
      'Build module thanh toán #482 bắt đầu chạy…',
      'Vậy hổng phải DB rồi.',
      'Build #482 xong ✅',
      'Alo em ơi, chị Linh nè. Chị có nói với khách là bên kỹ thuật thấy lỗi rồi.',
      'Ờ đúng rồi, họ bấm đặt lại đơn tuần trước á.',
      'Chị nhận rồi nè em, để bên chị đặt giùm họ.',
      'Bên em sửa tới đâu rồi? Có cách nào nhanh hơn hông em?',
      '3 yêu cầu lịch sử đơn của MP-0042 bị app tự ngắt vì quá 5 giây (11:12–11:15).',
      'Em ghi giùm anh cái ghi chú sự cố nha, chiều anh dán vào báo cáo.',
      'Số lần hỏi khớp số đơn, anh thấy rồi.',
      'Mấy cái em để chưa rõ, em tính kiểm bằng gì?',
      'Đồng hồ góc màn hình nhảy sang 11:30, nhóm chat bắt đầu réo ai đặt cơm.',
      'Ừ, nhanh nha em, khách hối quá trời.',
      'Anh chỉ sợ lên rồi hỏng chỗ khác, máy khách đủ loại mà.',
      'Lên rồi sao em biết là ổn?',
      'Ok Lan, anh duyệt.',
      'Trời, vậy chị báo khách liền nha em!',
      'Bản sửa lên production lúc 12:06.',
      '12:20 · MP-0042: 1,12s · 2 lần hỏi CSDL.',
      'Minh Phát nói mở được rồi nè em, hú hồn!',
    ])
      expect(lines).toContain(line);

    const story = summary.story;
    expect(story.facts.found).toHaveLength(17);
    expect(story.facts.notOpened).toHaveLength(1);
    expect(story.facts.notOpened[0].text).toContain('app 2.x');
    expect(story.facts.requiredMissed).toBe(0);
    expect(story.flags).toEqual([]);
    expect(story.promises.map(({ status }) => status)).toEqual([
      'kept',
      'kept',
      'kept',
    ]);
    expect(story.promises.map(({ label }) => label)).toEqual([
      'Gọi chị Linh lúc 11:30',
      'Gửi chị Linh danh sách đơn trước 11:10',
      'Báo chị Linh khi anh An duyệt bản sửa',
    ]);
    expect(story.pointsUsed).toBe(26);
    expect(story.budget).toBe(28);
    expect(
      story.timeline.map(({ time, ref, label, points, remaining }) => [
        time,
        ref ?? label,
        points,
        remaining,
      ]),
    ).toEqual([
      ['9:40', 'n0', 0, 28],
      ['9:40–9:45', 'Mở Wiki kỹ thuật', 1, 27],
      ['9:45–9:50', 'Mở log API', 1, 26],
      ['9:50–9:55', 'Mở bảng theo dõi CSDL', 1, 25],
      ['9:55–10:00', 'Mở code API', 1, 24],
      ['10:00–10:05', 'Gọi chị Linh', 1, 23],
      ['10:05–10:10', 'Nhắn anh An', 1, 22],
      ['10:10–10:35', 'Viết bản vá', 5, 17],
      ['10:35–10:45', 'Chạy thử trên staging', 2, 15],
      ['10:45–10:50', 'Tạm làm việc khác', 1, 14],
      ['10:50–10:55', 'n1', 1, 13],
      ['10:55–11:05', 'Xuất danh sách đơn cho chị Linh', 2, 11],
      ['11:05–11:30', 'Sửa lại bản vá', 5, 6],
      ['11:30–11:35', 'Gọi chị Linh', 1, 5],
      ['11:35–11:45', 'Chạy thử trên staging', 2, 3],
      ['11:45–11:50', 'n3', 1, 2],
      ['11:50', 'Nhắn chị Linh trước khi kết ca?', 0, 2],
    ]);
    const rewrite = story.timeline.find(
      ({ label }) => label === 'Sửa lại bản vá',
    );
    expect(rewrite?.interrupts.map(({ ref, points }) => [ref, points])).toEqual(
      [
        ['e1', 1],
        ['n2', 1],
      ],
    );
    expect(story.timeline).toHaveLength(17);
    expect(story.timeline.reduce((sum, row) => sum + row.points, 0)).toBe(26);
    expect(story.review).toEqual([]);
    expect(summary.grade.status).toBe('READY');
  });

  it('không có câu hỏi nhìn lại ca: không có lượt "review" nào trong ca', async () => {
    const { run } = await replay({ explicitEnd: false });
    const lines = await fast(api.play.transcript(run.runId));
    expect(lines.some((l) => l.context.startsWith('review:'))).toBe(false);
  });

  it('bấm kết thúc trò chuyện trước khi chọn việc khác cho cùng kết quả như giao diện', async () => {
    const plain = await replay({ explicitEnd: false });
    db.players = [];
    db.current = null;
    save();
    const ui = await replay({ explicitEnd: true });
    expect(ui.scene.clock).toEqual(plain.scene.clock);
    expect(ui.summary.story.actions).toEqual(plain.summary.story.actions);
    expect(ui.summary.story.facts).toEqual(plain.summary.story.facts);
    expect(ui.summary.story.promises).toEqual(plain.summary.story.promises);
    expect(ui.lines).toEqual(plain.lines);
  });

  it('bảng chấm dự kiến chỉ gắn với lượt chơi đúng kịch bản của Lan', async () => {
    const { summary } = await replay({ explicitEnd: true });
    expect(summary.sampleChecklist?.items.map(({ code }) => code)).toEqual([
      '4.2',
      '7.1',
      '1.5',
      '7.4',
      '1.1',
      'R',
    ]);
    expect(
      summary.sampleChecklist?.items.every(({ level }) => level === 2),
    ).toBe(true);
  });

  it('người chơi nói khác kịch bản thì không có bảng chấm dự kiến', async () => {
    const { scene, summary } = await replay({
      explicitEnd: true,
      lastWord: 'a An duyệt rồi chị',
    });
    expect(scene.ended).toBe(true);
    expect(summary.sampleChecklist).toBeNull();
  });
});
