import type { Prisma } from '../generated/prisma/client';

/** Phần scenario cần cho danh sách và chi tiết (openapi `ScenarioListItem`). */
export const scenarioListInclude = {
  task: {
    select: {
      id: true,
      text: true,
      level: {
        select: {
          id: true,
          levelNo: true,
          band: true,
          title: true,
          description: true,
          occupationId: true,
          occupation: { select: { id: true, name: true, code: true } },
        },
      },
    },
  },
  author: { select: { id: true, displayName: true, email: true } },
  reviewAssignments: {
    where: { status: 'ACTIVE' },
    include: {
      reviewer: { select: { id: true, displayName: true, email: true } },
    },
  },
  skills: { select: { competencyId: true } },
} satisfies Prisma.ScenarioInclude;

export type ScenarioRow = Prisma.ScenarioGetPayload<{
  include: typeof scenarioListInclude;
}>;

export const nameOf = (
  u: { displayName: string | null; email: string | null } | null | undefined,
): string | null => (u ? (u.displayName ?? u.email ?? null) : null);
