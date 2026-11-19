import { expect, it } from 'vitest';
import type { Notification } from '../api/types';
import { notificationTarget } from './notifications';
const make = (
  payload: Notification['payload'],
  template = 'REVIEW_ASSIGNED',
): Notification => ({
  id: 'notification',
  template,
  payload,
  createdAt: '2026-11-19T00:00:00Z',
  readAt: null,
});

it.each([
  [
    '/staff/de/scenarios/s-review/review?tab=content#criteria',
    '/de/scenarios/s-review/review?tab=content#criteria',
  ],
  ['/de/scenarios/s-review/review', '/de/scenarios/s-review/review'],
  ['de/scenarios/s-review/review', '/de/scenarios/s-review/review'],
  ['http://localhost:4300/staff/ca/catalogue', '/ca/catalogue'],
  ['https://elsewhere.test/staff/ca/catalogue', null],
  ['javascript:alert(1)', null],
  ['http://[invalid', null],
  ['/galaxy', null],
])('resolves or rejects payload link %s without throwing', (link, expected) => {
  expect(notificationTarget(make({ link }), 'http://localhost:4300')).toBe(
    expected,
  );
});
it('opens known scenario notifications without requiring a link field', () => {
  expect(
    notificationTarget(
      make({ scenarioId: 's-review' }),
      'http://localhost:4300',
    ),
  ).toBe('/de/scenarios/s-review/review');
  expect(
    notificationTarget(
      make({ scenarioId: 's/author' }, 'SCENARIO_ASSIGNED'),
      'http://localhost:4300',
    ),
  ).toBe('/de/scenarios/s%2Fauthor/author');
  expect(
    notificationTarget(
      make({ scenarioId: 'draft' }, 'DRAFT_READY'),
      'http://localhost:4300',
    ),
  ).toBeNull();
});
