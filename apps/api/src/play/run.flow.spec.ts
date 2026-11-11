/**
 * Trọn luồng ca làm phía máy chủ, không cần Postgres hay Redis:
 * RunService nhận lượt → đẩy job → TurnProcessor gọi AI (bản giả) → ghi
 * sự kiện → đẩy tin. Hàng đợi và pub/sub thay bằng mảng trong bộ nhớ.
 */
import { randomUUID } from 'node:crypto';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { FakeShiftChecker, FakeShiftNarrator } from '../ai/shift/fake';
import type { ShiftNarrator } from '../ai/shift/types';
import { RunStore } from '../assessment/run-store.service';
import { TurnProcessor } from '../assessment/turn.processor';
import { ProblemException } from '../common/problem';
import type { StreamEnvelope } from '../notification/stream.types';
import { FlagService } from '../quality/flag.service';
import type { TurnDto } from './dto/play.dto';
import { RunService } from './run.service';
import { memoryPrisma } from './testing/memory-prisma';

const SEED = 'SWE_BACKEND.L3.m2';

/** Một lượt chưa có `turnId` (Omit phân phối trên từng nhánh của union). */
type TurnInput = TurnDto extends infer T
  ? T extends unknown
    ? Omit<T, 'turnId'> & { turnId?: string }
    : never
  : never;
const USER = 'u1';

function setup(narrator: ShiftNarrator = new FakeShiftNarrator()) {
  const prisma = memoryPrisma();
  void prisma.user.create({
    data: { id: USER, displayName: 'Nam', username: 'nam', email: null },
  });
  const content = {
    activeVersion: async () => 7,
    shiftContextAt: async (_v: number, id: string) =>
      id === SEED ? fixtureShiftContext(SEED) : null,
  };
  const jobs: Array<{ runId: string; turnId: string }> = [];
  const published: StreamEnvelope[] = [];
  const store = new RunStore(prisma as never, content as never);
  const assessment = {
    requestTurn: async (runId: string, turnId: string) => {
      jobs.push({ runId, turnId });
      return turnId;
    },
  };
  const service = new RunService(
    prisma as never,
    content as never,
    store,
    assessment as never,
    new FlagService(prisma as never),
  );
  const stream = {
    publish: async (_u: string, e: StreamEnvelope) => void published.push(e),
  };
  const processor = new TurnProcessor(
    prisma as never,
    store,
    stream as never,
    narrator,
    new FakeShiftChecker(),
  );
  const drain = async () => {
    for (let job = jobs.shift(); job; job = jobs.shift())
      await processor.run(job);
  };
  /** Gửi một lượt; cần AI thì chạy worker luôn. */
  const play = async (runId: string, turn: TurnInput) => {
    const res = await service.submitTurn(USER, runId, {
      turnId: randomUUID(),
      ...turn,
    } as TurnDto);
    await drain();
    return res;
  };
  return { prisma, service, jobs, published, drain, play, processor };
}

async function problemOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (err) {
    if (err instanceof ProblemException)
      return err.getResponse() as { status: number; code: string };
    throw err;
  }
  throw new Error('Không ném lỗi');
}

describe('luồng ca làm (API + worker)', () => {
  it('mở lượt 201, mở lại trả lượt đang dở 200 (NFR-03)', async () => {
    const { service } = setup();
    const first = await service.start(USER, { taskId: SEED });
    expect(first.created).toBe(true);
    expect(first.run).toMatchObject({
      status: 'IN_PROGRESS',
      title: 'Sự cố hệ thống giờ cao điểm!',
      releaseVersion: `${SEED}@7`,
    });
    const again = await service.start(USER, { taskId: SEED });
    expect(again).toMatchObject({ created: false, run: { id: first.run.id } });
    expect(
      await problemOf(service.start(USER, { taskId: 'KHONG.L1.m1' })),
    ).toMatchObject({ status: 409, code: 'SCENARIO_UNAVAILABLE' });
  });

  it('lượt cần AI trả 202, worker ghi kết quả và đẩy turn.lines rồi turn.done', async () => {
    const { service, jobs, drain, published } = setup();
    const { run } = await service.start(USER, { taskId: SEED });
    expect((await service.scene(USER, run.id)).await).toEqual({
      kind: 'node_reply',
      node: 'n0',
    });

    const turnId = randomUUID();
    const res = await service.submitTurn(USER, run.id, {
      kind: 'say',
      turnId,
      text: 'Dạ em coi liền.',
    });
    expect(res.status).toBe(202);
    expect(jobs).toEqual([{ runId: run.id, turnId }]);
    expect((await service.scene(USER, run.id)).pendingTurnId).toBe(turnId);

    // Đang chờ AI: lượt khác bị từ chối.
    expect(
      await problemOf(
        service.submitTurn(USER, run.id, {
          kind: 'action',
          turnId: randomUUID(),
          key: 'open_log',
        }),
      ),
    ).toMatchObject({ status: 409, code: 'TURN_IN_PROGRESS' });

    await drain();
    expect(published.map((p) => p.message.type)).toEqual([
      'turn.lines',
      'turn.done',
    ]);
    expect(published[0].id).toBeDefined();
    const scene = await service.scene(USER, run.id);
    expect(scene.mode).toBe('phase');
    expect(scene.pendingTurnId).toBeNull();

    // Gửi lại cùng turnId: nhận đúng kết quả cũ (NFR-04).
    const repeat = await service.submitTurn(USER, run.id, {
      kind: 'say',
      turnId,
      text: 'Dạ em coi liền.',
    });
    expect(repeat.status).toBe(200);
    expect(repeat.body.lines.map((l) => l.kind)).toEqual(['player', 'npc']);
  });

  it('lượt không cần AI xong ngay 200; thao tác sai luật 422', async () => {
    const { service, play } = setup();
    const { run } = await service.start(USER, { taskId: SEED });
    await play(run.id, { kind: 'say', text: 'Dạ.' });
    const open = await play(run.id, { kind: 'action', key: 'open_log' });
    expect(open.status).toBe(200);
    expect(open.body.lines[0].text).toBe('Bạn mở log API lịch sử đơn.');
    if (open.status === 200)
      expect(open.body.scene.notebook.facts.map((f) => f.id)).toContain('f5');
    expect(
      await problemOf(play(run.id, { kind: 'say', text: 'Ai đó?' })),
    ).toMatchObject({ status: 422, code: 'TURN_INVALID' });
  });

  it('không phải lượt của mình thì 404', async () => {
    const { service } = setup();
    const { run } = await service.start(USER, { taskId: SEED });
    expect(await problemOf(service.scene('u2', run.id))).toMatchObject({
      status: 404,
    });
  });

  it('hết model thì tạm dừng, giữ tiến độ; tiếp tục được khi có model lại (D-92)', async () => {
    let down = true;
    const fake = new FakeShiftNarrator();
    const narrator: ShiftNarrator = {
      narrate: async (req) =>
        down
          ? { status: 'unavailable', reason: 'no_model' }
          : fake.narrate(req),
    };
    const { service, play, published, drain } = setup(narrator);
    const { run } = await service.start(USER, { taskId: SEED });
    await play(run.id, { kind: 'say', text: 'Dạ.' });
    expect(published.at(-1)?.message).toMatchObject({
      type: 'run.paused',
      payload: { reason: 'no_model' },
    });
    expect(await service.get(USER, run.id)).toMatchObject({ paused: true });
    expect(
      await problemOf(play(run.id, { kind: 'action', key: 'open_log' })),
    ).toMatchObject({ code: 'RUN_PAUSED' });

    down = false;
    await service.resume(USER, run.id);
    await drain();
    expect(published.at(-1)?.message.type).toBe('turn.done');
    expect(await service.get(USER, run.id)).toMatchObject({
      paused: false,
      pendingTurnId: null,
    });
  });

  it('chơi trọn ca: kết thúc, lưu tổng kết chưa chấm điểm', async () => {
    const { service, play, prisma } = setup();
    const { run } = await service.start(USER, { taskId: SEED });
    await play(run.id, { kind: 'say', text: 'Dạ.' });
    await play(run.id, { kind: 'action', key: 'open_log' });
    await play(run.id, { kind: 'action', key: 'talk_mentor' });
    await play(run.id, {
      kind: 'say',
      text: 'Lỗi do vòng lặp gọi DB 901 lần, khách ít đơn vẫn nhanh.',
    });
    await play(run.id, {
      kind: 'action',
      key: 'write_patch',
      fields: { mo_ta: 'Bỏ vòng lặp, gom một truy vấn, thêm phân trang.' },
    });
    await play(run.id, { kind: 'action', key: 'open_code' });
    // "Tạm làm việc khác" chỉ hiện khi cuộc gọi 10:50 còn cách ≤ 6 điểm.
    while ((await service.scene(USER, run.id)).mode === 'phase')
      await play(run.id, { kind: 'action', key: 'wait' });
    await play(run.id, { kind: 'choose', option: 'c', elapsedMs: 5000 });
    await play(run.id, { kind: 'say', text: 'Dạ em đang sửa chị.' });
    await play(run.id, { kind: 'action', key: 'chot_nguyen_nhan' });
    await play(run.id, {
      kind: 'save_artefact',
      artefact: 'ghi_chu_su_co',
      fields: { hien_tuong: 'Chậm', nguyen_nhan: 'Vòng lặp', da_lam: 'Vá' },
      ticks: ['h3', 'h4'],
    });
    // Cả hai hook của n2 đã được trả lời trong pha (A7): không có probe.
    expect((await service.scene(USER, run.id)).mode).toBe('phase');
    await play(run.id, { kind: 'action', key: 'gui_anh_an' });
    await play(run.id, { kind: 'confirm_end' });
    await play(run.id, {
      kind: 'save_artefact',
      artefact: 'email_an',
      fields: {
        nguyen_nhan: 'Vòng lặp',
        huong_xu_ly: 'Gom truy vấn',
        rui_ro: 'Theo dõi log, lỗi thì rollback.',
      },
    });
    await play(run.id, {
      kind: 'say',
      text: 'Em theo dõi log và rollback nếu lỗi.',
    });

    const view = await service.get(USER, run.id);
    expect(view.status).toBe('FINISHED');
    const summary = await service.summary(USER, run.id);
    expect(summary).toMatchObject({ graded: false, seedId: SEED });
    expect(summary.nodes.every((n) => n.status === 'done')).toBe(true);
    // Chuỗi sự kiện chỉ thêm, seq liền nhau.
    const seqs = prisma.runEvent.rows
      .filter((r) => r.runId === run.id)
      .map((r) => r.seq);
    expect(seqs).toEqual(seqs.map((_, i) => i + 1));
    // Mở lại nhiệm vụ sau khi xong: lượt mới.
    expect((await service.start(USER, { taskId: SEED })).created).toBe(true);
  });
});
