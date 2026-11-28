import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createDemoApi } from './index';
import { context } from './data';
import { stateOf } from './rules';
import { db, player, save, type SavedRun } from './store';

const api = createDemoApi();
const taskId = 'SWE_BACKEND.L3.m2';
const key = 'jq-demo:database:v1';
const version = context(taskId).seed.version;

async function fast<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync();
  return promise;
}

function storedRun(overrides: Partial<SavedRun>): SavedRun {
  return {
    id: 'previous-run',
    taskId,
    enrolmentId: null,
    events: [{ type: 'START' }, { type: 'ACTION', key: 'old_action' }],
    notes: [],
    flags: [],
    reflection: null,
    realism: null,
    grade: null,
    at: '2026-11-21T10:00:00.000Z',
    turnId: 'previous-turn',
    paused: false,
    ...overrides,
  };
}

function persistedRuns(): SavedRun[] {
  const data = JSON.parse(localStorage.getItem(key) ?? '{}');
  return data.players[0].runs;
}

beforeEach(async () => {
  vi.useFakeTimers();
  db.players = [];
  db.current = null;
  save();
  await fast(
    api.auth.register({
      email: 'demo-version@example.test',
      password: 'demo-pass',
      displayName: 'Người khám phá',
      dateOfBirth: '2006-06-12',
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  db.players = [];
  db.current = null;
  save();
});

it('pins the seed version when creating a run and resumes that version', async () => {
  const run = await fast(api.play.start(taskId, null));
  expect(persistedRuns()).toEqual([
    expect.objectContaining({ id: run.runId, seedVersion: version }),
  ]);
  expect((await fast(api.play.start(taskId, null))).runId).toBe(run.runId);
});

it('drops unfinished mismatched, unversioned and unreadable runs before reopening the task', async () => {
  const old = storedRun({ id: 'old', seedVersion: version - 1 });
  const unversioned = storedRun({ id: 'unversioned', events: [] });
  const unreadable = storedRun({ id: 'unreadable', seedVersion: version });
  player().runs.push(old, unversioned, unreadable);
  save();

  const run = await fast(api.play.start(taskId, null));
  expect([old, unversioned, unreadable].map((item) => item.stale)).toEqual([
    true,
    true,
    true,
  ]);
  expect(unversioned.seedVersion).toBeUndefined();
  expect(persistedRuns()).toEqual([
    expect.objectContaining({ id: run.runId, seedVersion: version }),
  ]);
  expect(run.ended).toBe(false);
  expect((await fast(api.play.scene(run.runId))).await).toEqual({
    kind: 'node_reply',
    node: 'n0',
  });
});

it('opens a new run after reloading an unversioned session from localStorage', async () => {
  player().runs.push(storedRun({}));
  save();
  vi.resetModules();

  const { createDemoApi: createReloadedDemoApi } = await import('./index');
  const reloaded = createReloadedDemoApi();
  const fresh = await fast(reloaded.play.start(taskId, null));
  expect(fresh.runId).not.toBe('previous-run');
  expect(persistedRuns()).toEqual([
    expect.objectContaining({ id: fresh.runId, seedVersion: version }),
  ]);
});

it('keeps saved results in the journal and never uses an old run as the new session', async () => {
  const grade = {
    status: 'READY',
    score: 82,
    ending: null,
    feedback: null,
    softSkills: [],
    keywordsGained: [],
  } as const;
  const archived = storedRun({
    reflection: { 'node:n0': 3 },
    grade: { ...grade, softSkills: [], keywordsGained: [] },
  });
  const reflected = storedRun({
    id: 'reflection-only',
    reflection: { 'node:n0': 2 },
  });
  player().runs.push(archived, reflected);
  save();

  const record = await fast(api.progress.record());
  expect(record.journal).toEqual([
    expect.objectContaining({ runId: archived.id, score: 82 }),
    expect.objectContaining({ runId: reflected.id, score: null }),
  ]);
  expect((await fast(api.play.summary(archived.id))).grade).toEqual(grade);
  expect((await fast(api.play.summary(reflected.id))).grade.status).toBe(
    'NOT_AVAILABLE',
  );
  expect(persistedRuns()).toEqual([
    expect.objectContaining({
      id: archived.id,
      stale: true,
      grade,
      reflection: archived.reflection,
    }),
    expect.objectContaining({
      id: reflected.id,
      stale: true,
      reflection: reflected.reflection,
    }),
  ]);
  const fresh = await fast(api.play.start(taskId, null));
  expect([archived.id, reflected.id]).not.toContain(fresh.runId);
});

it('marks a current seed run stale when folding its event log fails', () => {
  const run = storedRun({ seedVersion: version });
  expect(stateOf(run)).toMatchObject({
    await: { kind: 'start' },
    ended: false,
  });
  expect(run.stale).toBe(true);
});
