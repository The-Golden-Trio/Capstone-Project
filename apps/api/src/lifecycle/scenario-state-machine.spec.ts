import type { ScenarioStatus, UserRoleKind } from '../generated/prisma/enums';
import { Problem } from '../core/problem';
import { ScenarioStateMachine, type Tx } from './scenario-state-machine';
import {
  allowedActions,
  LIFECYCLE_ACTIONS,
  nextStatus,
  TRANSITIONS,
  type LifecycleAction,
} from './transitions';

const STATUSES: ScenarioStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'APPROVED',
  'IN_PLAYTEST',
  'READY',
  'PUBLISHED',
  'RETIRED',
];
const ROLES: UserRoleKind[] = [
  'EXPLORER',
  'DOMAIN_EXPERT',
  'CONTENT_ADMIN',
  'SYSTEM_ADMIN',
];

/** Cạnh của SM-01, chép tay từ `reports/master/plantuml/SM-01_ScenarioLifecycle.puml`. */
const SM01: Array<[ScenarioStatus | null, LifecycleAction, ScenarioStatus]> = [
  [null, 'OPEN', 'DRAFT'],
  ['DRAFT', 'SUBMIT', 'SUBMITTED'],
  ['SUBMITTED', 'START_REVIEW', 'IN_REVIEW'],
  ['IN_REVIEW', 'REQUEST_CHANGES', 'DRAFT'],
  ['IN_REVIEW', 'REJECT', 'RETIRED'],
  ['IN_REVIEW', 'APPROVE', 'APPROVED'],
  ['APPROVED', 'BUILD_DRAFT', 'IN_PLAYTEST'],
  ['IN_PLAYTEST', 'REPORT_DISPLAY_ISSUE', 'APPROVED'],
  ['IN_PLAYTEST', 'REPORT_CONTENT_ISSUE', 'DRAFT'],
  ['IN_PLAYTEST', 'PASS_PLAYTEST', 'READY'],
  ['READY', 'PUBLISH', 'PUBLISHED'],
  ['PUBLISHED', 'DELETE', 'RETIRED'],
];

function fakeTx(status: ScenarioStatus) {
  const state = { status, logs: [] as Array<Record<string, unknown>> };
  const tx = {
    scenario: {
      updateMany: async ({
        where,
        data,
      }: {
        where: { status: ScenarioStatus };
        data: { status: ScenarioStatus };
      }) => {
        if (where.status !== state.status) return { count: 0 };
        state.status = data.status;
        return { count: 1 };
      },
    },
    lifecycleLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.logs.push(data);
        return data;
      },
    },
  } as unknown as Tx;
  return { tx, state };
}

describe('SM-01 transitions', () => {
  it('bảng TRANSITIONS khớp đúng các cạnh của SM-01', () => {
    expect(LIFECYCLE_ACTIONS).toHaveLength(SM01.length);
    for (const [from, action, to] of SM01) {
      expect(TRANSITIONS[action]).toMatchObject({ from, to });
    }
  });

  it('mọi cặp (trạng thái, action) ngoài SM-01 đều bị từ chối', () => {
    for (const status of STATUSES)
      for (const action of LIFECYCLE_ACTIONS) {
        const edge = SM01.find(([f, a]) => f === status && a === action);
        expect(nextStatus(status, action)).toBe(edge ? edge[2] : null);
      }
  });

  it('RETIRED là trạng thái cuối', () => {
    for (const role of ROLES)
      expect(allowedActions('RETIRED', [role])).toEqual([]);
  });

  it('allowedActions chỉ trả action đúng vai', () => {
    expect(allowedActions('DRAFT', ['CONTENT_ADMIN'])).toEqual([]);
    expect(allowedActions('DRAFT', ['DOMAIN_EXPERT'])).toEqual(['SUBMIT']);
    expect(allowedActions('IN_REVIEW', ['DOMAIN_EXPERT'])).toEqual([
      'REQUEST_CHANGES',
      'REJECT',
      'APPROVE',
    ]);
    expect(allowedActions('APPROVED', ['CONTENT_ADMIN'])).toEqual([
      'BUILD_DRAFT',
    ]);
    expect(allowedActions('READY', ['EXPLORER', 'SYSTEM_ADMIN'])).toEqual([]);
  });
});

describe('ScenarioStateMachine.apply', () => {
  const machine = new ScenarioStateMachine({} as never);

  it.each(SM01.filter(([from]) => from !== null))(
    '%s --%s--> %s ghi đúng một dòng log',
    async (from, action, to) => {
      const { tx, state } = fakeTx(from as ScenarioStatus);
      const role = TRANSITIONS[action].role;
      const result = await machine.apply(
        tx,
        's1',
        action as Exclude<LifecycleAction, 'OPEN'>,
        { id: 'u1', roles: [role] },
        'ghi chú',
      );
      expect(result).toBe(to);
      expect(state.status).toBe(to);
      expect(state.logs).toEqual([
        expect.objectContaining({
          scenarioId: 's1',
          fromStatus: from,
          toStatus: to,
          action,
          actorId: 'u1',
          note: 'ghi chú',
        }),
      ]);
    },
  );

  it('sai trạng thái nguồn → 409 INVALID_TRANSITION, không ghi log', async () => {
    for (const status of STATUSES)
      for (const action of LIFECYCLE_ACTIONS) {
        if (action === 'OPEN' || TRANSITIONS[action].from === status) continue;
        const { tx, state } = fakeTx(status);
        const err = await machine
          .apply(tx, 's1', action, {
            id: 'u1',
            roles: [TRANSITIONS[action].role],
          })
          .catch((e: unknown) => e);
        expect(err).toBeInstanceOf(Problem);
        expect((err as Problem).code).toBe('INVALID_TRANSITION');
        expect(state.status).toBe(status);
        expect(state.logs).toHaveLength(0);
      }
  });

  it('sai vai → 403, trạng thái giữ nguyên', async () => {
    const { tx, state } = fakeTx('APPROVED');
    const err = await machine
      .apply(tx, 's1', 'BUILD_DRAFT', { id: 'u1', roles: ['DOMAIN_EXPERT'] })
      .catch((e: unknown) => e);
    expect((err as Problem).getStatus()).toBe(403);
    expect(state.status).toBe('APPROVED');
  });
});
