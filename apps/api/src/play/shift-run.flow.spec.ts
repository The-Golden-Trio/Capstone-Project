/**
 * Trọn luồng ca làm phía máy chủ, không cần Postgres hay Redis:
 * ShiftRunService nhận lượt → đẩy job → ShiftTurnProcessor gọi AI (bản giả)
 * → ghi bản ghi có khoá → đẩy tin. Queue và stream thay bằng mảng.
 */
import { randomUUID } from 'node:crypto';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { FakeShiftChecker, FakeShiftNarrator } from '../ai/shift/fake';
import type { ShiftNarrator } from '../ai/shift/types';
import { ShiftTurnProcessor } from '../assessment/shift-turn.processor';
import { Problem } from '../core/problem';
import type { ShiftTurnJob } from '../core/queues';
import { ShiftLogService } from '../core/shift-log.service';
import type { StreamEvent } from '../core/stream.service';
import type { TurnDto } from './shift.dto';
import { ShiftRunService } from './shift-run.service';
import { memoryPrisma } from './testing/memory-prisma';

const SEED = 'SWE_BACKEND.L3.m2';
const USER = 'u1';

/** Một lượt chưa có `turnId` (Omit phân phối trên từng nhánh của union). */
type TurnInput = TurnDto extends infer T
  ? T extends unknown
    ? Omit<T, 'turnId'> & { turnId?: string }
    : never
  : never;

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
  const jobs: ShiftTurnJob[] = [];
  const published: StreamEvent[] = [];
  const log = new ShiftLogService(prisma as never, content as never);
  const queues = {
    enqueueShiftTurn: async (job: ShiftTurnJob) => void jobs.push(job),
  };
  const service = new ShiftRunService(
    prisma as never,
    content as never,
    log,
    queues as never,
  );
  const stream = {
    publish: async (_u: string, e: StreamEvent) => {
      published.push(e);
      return String(published.length);
    },
  };
  const processor = new ShiftTurnProcessor(
    'redis://unused',
    prisma as never,
    log,
    stream as never,
    narrator,
    new FakeShiftChecker(),
  );
  const drain = async () => {
    for (let job = jobs.shift(); job; job = jobs.shift())
      await processor.run(job);
  };
  const play = async (runId: string, turn: TurnInput) => {
    const res = await service.submitTurn(USER, runId, {
      turnId: randomUUID(),
      ...turn,
    } as TurnDto);
    await drain();
    return res;
  };
  return { prisma, service, jobs, published, drain, play };
}

async function problemOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (err) {
    if (err instanceof Problem)
      return { status: err.getStatus(), code: err.code };
    throw err;
  }
  throw new Error('Không ném lỗi');
}

describe('luồng ca làm (API + worker)', () => {
  it('liệt kê ca làm của một cấp theo phiên bản nội dung đang phục vụ', async () => {
    const { service, prisma } = setup();
    await prisma.shiftSeedDoc.create({
      data: {
        version: 7,
        seedId: SEED,
        levelRef: 'SWE_BACKEND.L3',
        title: 'x',
        body: {},
      },
    });
    await prisma.shiftSeedDoc.create({
      data: {
        version: 6,
        seedId: 'CU.L3.m1',
        levelRef: 'SWE_BACKEND.L3',
        title: 'cũ',
        body: {},
      },
    });
    expect(await service.tasks('SWE_BACKEND', 'L3')).toEqual([
      expect.objectContaining({
        taskId: SEED,
        title: 'Sự cố hệ thống giờ cao điểm!',
        minutes: 140,
      }),
    ]);
    expect(await service.tasks('SWE_BACKEND', 'L1')).toEqual([]);
  });

  it('mở lượt 201, mở lại trả lượt đang dở (NFR-03); nhiệm vụ lạ thì 409', async () => {
    const { service, prisma } = setup();
    const first = await service.start(USER, { taskId: SEED });
    expect(first.created).toBe(true);
    expect(first.run).toMatchObject({
      status: 'IN_PROGRESS',
      releaseVersion: `${SEED}@7`,
    });
    expect(prisma.scenarioRun.rows[0]).toMatchObject({
      flow: 'shift',
      scenarioKey: SEED,
    });
    expect((await service.start(USER, { taskId: SEED })).created).toBe(false);
    expect(
      await problemOf(service.start(USER, { taskId: 'KHONG.L1.m1' })),
    ).toMatchObject({
      status: 409,
      code: 'SCENARIO_UNAVAILABLE',
    });
  });

  it('lượt cần AI trả 202, worker ghi kết quả, ai_job SUCCEEDED, đẩy turn.lines rồi turn.done', async () => {
    const { service, jobs, drain, published, prisma } = setup();
    const { run } = await service.start(USER, { taskId: SEED });
    const turnId = randomUUID();
    const res = await service.submitTurn(USER, run.id, {
      kind: 'say',
      turnId,
      text: 'Dạ em coi liền.',
    });
    expect(res.status).toBe(202);
    expect(jobs).toEqual([{ aiJobId: turnId, runId: run.id, turnId }]);
    expect((await service.scene(USER, run.id)).pendingTurnId).toBe(turnId);
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
    expect(published.map((p) => p.type)).toEqual(['turn.lines', 'turn.done']);
    expect(prisma.aiJob.rows[0]).toMatchObject({
      id: turnId,
      kind: 'SHIFT_TURN',
      status: 'SUCCEEDED',
    });
    expect((await service.scene(USER, run.id)).mode).toBe('phase');

    const repeat = await service.submitTurn(USER, run.id, {
      kind: 'say',
      turnId,
      text: 'khác',
    });
    expect(repeat.status).toBe(200);
    expect(repeat.body.lines.map((l) => l.kind)).toEqual(['player', 'npc']);
  });

  it('lượt không cần AI xong ngay 200; thao tác sai luật 422; người khác 404', async () => {
    const { service, play } = setup();
    const { run } = await service.start(USER, { taskId: SEED });
    await play(run.id, { kind: 'say', text: 'Dạ.' });
    const open = await play(run.id, { kind: 'action', key: 'open_log' });
    expect(open.status).toBe(200);
    if (open.status === 200)
      expect(open.body.scene.notebook.facts.map((f) => f.id)).toContain('f5');
    expect(
      await problemOf(play(run.id, { kind: 'say', text: 'Ai đó?' })),
    ).toMatchObject({
      status: 422,
      code: 'TURN_INVALID',
    });
    expect(await problemOf(service.scene('u2', run.id))).toMatchObject({
      status: 404,
    });
  });

  it('hết model thì tạm dừng giữ tiến độ, tiếp tục được khi có model lại (D-92)', async () => {
    let down = true;
    const fake = new FakeShiftNarrator();
    const narrator: ShiftNarrator = {
      narrate: async (req) =>
        down
          ? { status: 'unavailable', reason: 'no_model' }
          : fake.narrate(req),
    };
    const { service, play, published, drain, prisma } = setup(narrator);
    const { run } = await service.start(USER, { taskId: SEED });
    await play(run.id, { kind: 'say', text: 'Dạ.' });
    expect(published.at(-1)).toMatchObject({
      type: 'run.paused',
      payload: { reason: 'no_model' },
    });
    expect(await service.get(USER, run.id)).toMatchObject({ paused: true });
    expect(prisma.aiJob.rows[0].status).toBe('PAUSED');
    expect(
      await problemOf(play(run.id, { kind: 'action', key: 'open_log' })),
    ).toMatchObject({ code: 'RUN_PAUSED' });

    down = false;
    await service.resume(USER, run.id);
    await drain();
    expect(published.at(-1)?.type).toBe('turn.done');
    expect(await service.get(USER, run.id)).toMatchObject({
      paused: false,
      pendingTurnId: null,
    });
  });

  it('chơi trọn ca: FINISHED, tổng kết chưa chấm; ghi chú và báo lỗi nằm cùng chuỗi', async () => {
    const { service, play, prisma } = setup();
    const { run } = await service.start(USER, { taskId: SEED });
    await play(run.id, { kind: 'say', text: 'Dạ.' });
    await service.addNote(USER, run.id, 'Nhớ xem log trước');
    await play(run.id, { kind: 'action', key: 'open_log' });
    await play(run.id, { kind: 'action', key: 'talk_mentor' });
    await play(run.id, {
      kind: 'say',
      text: 'Lỗi do vòng lặp gọi DB 901 lần, khách ít đơn vẫn nhanh.',
    });
    await play(run.id, {
      kind: 'action',
      key: 'write_patch',
      fields: { mo_ta: 'Bỏ vòng lặp, gom một truy vấn.' },
    });
    await play(run.id, { kind: 'action', key: 'open_code' });
    while ((await service.scene(USER, run.id)).mode === 'phase')
      await play(run.id, { kind: 'action', key: 'wait' });
    await play(run.id, { kind: 'choose', option: 'c', elapsedMs: 5000 });
    await play(run.id, { kind: 'say', text: 'Dạ em đang sửa chị.' });
    await service.flag(USER, run.id, {
      activityKey: 'n1',
      reason: 'Câu thoại hơi gượng',
    });
    await play(run.id, { kind: 'action', key: 'chot_nguyen_nhan' });
    await play(run.id, {
      kind: 'save_artefact',
      artefact: 'ghi_chu_su_co',
      fields: { hien_tuong: 'Chậm', nguyen_nhan: 'Vòng lặp', da_lam: 'Vá' },
      ticks: ['h3', 'h4'],
    });
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

    expect((await service.get(USER, run.id)).status).toBe('FINISHED');
    // Ca làm chưa chấm: không ghi completedAt, nên tiến độ và mở cấp của luồng cũ không tính nó.
    expect(
      prisma.scenarioRun.rows.find((r) => r.id === run.id)?.completedAt,
    ).toBeNull();
    const summary = await service.summary(USER, run.id);
    expect(summary).toMatchObject({ graded: false, seedId: SEED });
    expect(summary.nodes.every((n) => n.status === 'done')).toBe(true);
    expect((await service.scene(USER, run.id)).notes).toEqual([
      expect.objectContaining({ text: 'Nhớ xem log trước' }),
    ]);
    const events = prisma.runEvent.rows.filter((r) => r.runId === run.id);
    expect(events.map((r) => r.seq)).toEqual(events.map((_, i) => i + 1));
    expect(events.some((r) => r.type === 'CONTENT_FLAGGED')).toBe(true);
    // Mở lại sau khi xong: lượt mới.
    expect((await service.start(USER, { taskId: SEED })).created).toBe(true);
  });
});
