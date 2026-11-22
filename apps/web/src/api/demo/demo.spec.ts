import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { profile } from '@datn/game-core';
import { createDemoApi } from './index';
import { db, player, save, clone } from './store';
import { conditions, overlay } from './rules';
import { loadProfile } from './data';
import type { TurnInput } from '../types';
const api = createDemoApi();
const fast = <T>(promise: Promise<T>) => {
  const result = promise;
  return vi.runAllTimersAsync().then(() => result);
};
async function register(email = 'player@example.test') {
  return fast(
    api.auth.register({
      email,
      password: 'demo-pass',
      displayName: 'Người khám phá',
      dateOfBirth: '2006-06-12',
    }),
  );
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
describe('demo ExplorerApi', () => {
  it('register → signIn → me, giữ tài khoản và lỗi tiếng Việt', async () => {
    const s = await register();
    await fast(api.auth.signOut(s.refreshToken));
    const signed = await fast(
      api.auth.signIn('PLAYER@example.test', 'demo-pass'),
    );
    expect(signed.user?.id).toBe(s.user?.id);
    expect((await fast(api.account.me())).dateOfBirth).toBe('2006-06-12');
    await fast(api.account.updateMe({ stage: 'sinh_vien' }));
    expect((await fast(api.account.me())).stage).toBe('sinh_vien');
    const bad = api.auth.signIn('player@example.test', 'wrong');
    const assertion = expect(bad).rejects.toMatchObject({ status: 401 });
    await vi.runAllTimersAsync();
    await assertion;
    const duplicate = api.auth.register({
      email: 'player@example.test',
      password: 'x',
      displayName: 'x',
    });
    const dupAssert = expect(duplicate).rejects.toMatchObject({ status: 409 });
    await vi.runAllTimersAsync();
    await dupAssert;
    await register('other@example.test');
    expect((await fast(api.progress.record())).stats.scenarios).toBe(0);
  });
  it('catalogue đủ 221 nghề, 6 vùng, 23 nhóm; profile tải lười', async () => {
    const c = await fast(api.catalogue.catalogue());
    expect(c.occupations).toHaveLength(221);
    expect(c.regions).toHaveLength(6);
    expect(c.groups).toHaveLength(23);
    const o = await fast(api.catalogue.occupation('SWE_BACKEND'));
    expect(o.levels[2].questCount).toBe(1);
    expect(o.attribution.length).toBeGreaterThan(0);
    expect(o.environments.every((e) => !e.name.startsWith('WE_'))).toBe(true);
  });
  it('enrol, chạy engine thật tới cuối, stream/replay và grade mẫu idempotent', async () => {
    await register();
    const island = await fast(api.progress.enrol('SWE_BACKEND', 1));
    expect(island.onboard.slides).toHaveLength(6);
    expect(island.mainQuests).toHaveLength(0);
    // Nguồn chỉ có L3: xem thử độc lập (enrolmentId=null), không bỏ luật mở cấp.
    const run = await fast(api.play.start('SWE_BACKEND.L3.m2', null));
    const events: string[] = [];
    const unsubscribe = api.play.subscribe(run.runId, (e) =>
      events.push(e.type),
    );
    let scene = await fast(api.play.scene(run.runId));
    for (let i = 0; i < 180 && !scene.ended; i++) {
      let input: TurnInput;
      switch (scene.await.kind) {
        case 'node_choice':
          input = { kind: 'choose', option: scene.node!.options[0].key };
          break;
        case 'confirm_end':
          input = { kind: 'confirm_end' };
          break;
        case 'node_artefact':
          input = {
            kind: 'save_artefact',
            artefact: scene.node!.form!.id,
            fields: Object.fromEntries(
              scene.node!.form!.fields.map((f) => [
                f.id,
                'Em thấy log có vòng lặp 901 query; gom truy vấn và phân trang. Chạy staging, theo dõi và rollback khi lỗi.',
              ]),
            ),
          };
          break;
        case 'conversation':
        case 'last_word':
          input = { kind: 'end_conversation' };
          break;
        case 'node_reply':
        case 'probe_answer':
          input = {
            kind: 'say',
            text: 'Em thấy log 901 query do vòng lặp. Em sẽ chạy staging, theo dõi và rollback, xin anh duyệt.',
          };
          break;
        case 'phase': {
          const action =
            scene.actions.find(
              (a) => a.enabled && a.points > 0 && a.kind === 'talk',
            ) ?? scene.actions.find((a) => a.enabled && a.points > 0);
          expect(action).toBeDefined();
          input = { kind: 'action', key: action!.key };
          break;
        }
        case 'ai':
          await vi.runAllTimersAsync();
          scene = await fast(api.play.scene(run.runId));
          continue;
        default:
          throw new Error(`Cảnh không xử lý: ${scene.await.kind}`);
      }
      await fast(api.play.turn(run.runId, input));
      scene = await fast(api.play.scene(run.runId));
    }
    expect(scene.ended).toBe(true);
    expect(events).toContain('done');
    expect(events).toContain('lines');
    unsubscribe();
    const transcript = await fast(api.play.transcript(run.runId));
    expect(transcript.length).toBeGreaterThan(5);
    expect(
      await fast(api.play.transcript(run.runId, transcript[2].seq)),
    ).toEqual(transcript.filter((l) => l.seq > transcript[2].seq));
    await fast(api.play.addNote(run.runId, 'Xem lại bằng chứng từ log'));
    expect(await fast(api.play.notes(run.runId))).toHaveLength(1);
    const summary = await fast(api.play.summary(run.runId));
    expect(summary.story.graded).toBe(false);
    expect(summary.grade.status).toBe('READY');
    expect(summary.grade.score).toBeGreaterThanOrEqual(0);
    expect(summary.grade.score).toBeLessThanOrEqual(100);
    expect(summary.reflection.prompts.length).toBeGreaterThanOrEqual(2);
    // Kiểm cả nhánh xong cấp trước nhưng thiếu bậc, rồi đủ cả hai.
    const demoProfile = await loadProfile('SWE_BACKEND');
    const synthetic = clone(demoProfile);
    synthetic.levels = [
      { ...demoProfile.levels[2], levelNo: 1 },
      {
        ...demoProfile.levels[3],
        levelNo: 2,
        requirement: { tu_duy_giai_quyet_van_de: 2 },
      },
    ];
    expect(
      conditions(player(), synthetic, synthetic.levels[1]).map((c) => c.met),
    ).toEqual([true, false]);
    const thinking = player().skills.find(
      (s) => s.id === 'tu_duy_giai_quyet_van_de',
    )!;
    const savedPoints = thinking.points;
    thinking.points = 1500;
    expect(overlay(player(), clone(synthetic)).levels[1].access).toBe('OPEN');
    thinking.points = savedPoints;
    const skills = clone(player().skills);
    await fast(api.play.summary(run.runId));
    expect(player().skills).toEqual(skills);
    await fast(
      api.play.reflect(
        run.runId,
        Object.fromEntries(
          summary.reflection.prompts.map((q, i) => [q.key, i === 0 ? 3 : 2]),
        ),
        4,
      ),
    );
    const record = await fast(api.progress.record());
    expect(record.journal).toHaveLength(1);
    expect(record.achievements).toHaveLength(16);
    expect(record.riasec.afterTrying.I.count).toBeGreaterThan(0);
    // Ca xem thử không gắn cấp: bản tổng kết có điểm minh hoạ nhưng hồ sơ kỹ năng giữ nguyên.
    expect(record.softSkills.every((s) => s.scenarios === 0)).toBe(true);
    // Fold từ sự kiện JSON đã lưu cho ra cùng transcript, không gọi fake lại.
    const serialized = JSON.parse(localStorage.getItem('jq-demo:database:v1')!);
    expect(serialized.players[0].runs[0].events.length).toBeGreaterThan(5);
    expect(await fast(createDemoApi().play.transcript(run.runId))).toEqual(
      transcript,
    );
  });
  it('mở cấp cần xong cấp trước VÀ đủ bậc soft skill; cổng D-121 giữ khoá', async () => {
    await register();
    const p = player(),
      o = await loadProfile('SWE_BACKEND');
    expect(overlay(p, clone(o)).levels[1].access).toBe('LOCKED');
    const synthetic = clone(o);
    synthetic.levels[1].requirement = { tu_duy_giai_quyet_van_de: 2 };
    expect(
      conditions(p, synthetic, synthetic.levels[1]).map((c) => c.met),
    ).toEqual([false, false]);
    p.skills.find((s) => s.id === 'tu_duy_giai_quyet_van_de')!.points = 1500;
    expect(
      conditions(p, synthetic, synthetic.levels[1]).map((c) => c.met),
    ).toEqual([false, true]);
    expect(profile.tierOf(1500)).toBe(2);
    const gated = await fast(api.catalogue.occupation('SWE_TECHLEAD'));
    expect(gated.levels[0].access).toBe('LOCKED');
    const attempt = api.progress.enrol('SWE_BACKEND', 3);
    const assertion = expect(attempt).rejects.toMatchObject({ status: 403 });
    await vi.runAllTimersAsync();
    await assertion;
  });
  it('quiz có đúng 18 thẻ, gợi ý ≤3, không từ cấm và xoá kể về bạn', async () => {
    await register();
    const form = await fast(api.quiz.form());
    expect(form.cards).toHaveLength(18);
    expect(form.goals.map((g) => g.id)).toEqual(['g1', 'g2', 'g3', 'g4', 'g5']);
    const answers = {
      cards: Object.fromEntries(
        form.cards.map((c) => [c.id, c.axis === 'I' ? 3 : 2]),
      ) as Record<string, 1 | 2 | 3>,
      interests: ['Đọc sách, truyện'],
      goals: { g1: { picked: ['Giúp đỡ được nhiều người'], note: '' } },
    };
    const result = await fast(api.quiz.submit(answers));
    expect(result.suggestions.length).toBeLessThanOrEqual(3);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(
      result.suggestions.every((s) => result.regions.includes(s.regionId)),
    ).toBe(true);
    for (const s of result.suggestions)
      expect(s.reason).not.toMatch(/phù hợp|hợp nhất|bạn nên|%/i);
    expect(result.selfReported.I).toBe(3);
    const flat = await fast(
      api.quiz.submit({
        ...answers,
        cards: Object.fromEntries(form.cards.map((c) => [c.id, 2])),
      }),
    );
    expect(flat.flat).toBe(true);
    expect(new Set(flat.suggestions.map((s) => s.regionId)).size).toBe(3);
    await fast(api.quiz.deleteAboutMe());
    expect((await fast(api.quiz.current()))?.interests).toEqual([]);
    expect((await fast(api.progress.record())).goals).toBeNull();
  });
  it('BR-04 khoá đánh giá khi còn cấp chưa hoàn thành', async () => {
    await register();
    const f = await fast(api.feedback.ratingForm('SWE_BACKEND'));
    expect(f.locked).toBe(true);
    expect(f.criteria.map((c) => c.code)).toEqual([
      'SALARY',
      'PRESSURE',
      'DIFFICULTY',
      'WORK_LIFE_BALANCE',
      'ENJOYMENT',
    ]);
    expect(f.summary).toEqual({
      responseCount: 0,
      withheld: true,
      averages: {},
    });
    await fast(
      api.feedback.sendAppFeedback({
        category: 'idea',
        message: 'Thêm ca mới',
      }),
    );
    expect(player().feedback).toHaveLength(1);
  });
});
