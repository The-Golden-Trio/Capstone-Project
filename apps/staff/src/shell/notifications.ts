import type { Notification } from '../api/types';

/** Accept staff routes only; malformed or external payload links stay plain text. */
export function notificationTarget(
  item: Notification,
  origin: string,
): string | null {
  const link = item.payload['link'];
  if (typeof link === 'string') {
    try {
      const url = new URL(link, `${origin}/staff/`);
      if (url.origin !== origin) return null;
      const path = url.pathname.startsWith('/staff/')
        ? url.pathname.slice('/staff'.length)
        : url.pathname;
      if (!/^\/(?:ca|de)(?:\/|$)/.test(path)) return null;
      return path + url.search + url.hash;
    } catch {
      return null;
    }
  }
  const id = item.payload['scenarioId'];
  if (typeof id !== 'string' || !id) return null;
  const encoded = encodeURIComponent(id);
  switch (item.template) {
    case 'REVIEW_ASSIGNED':
    case 'SCENARIO_SUBMITTED':
    case 'REVIEW_DUE_SOON':
    case 'REVIEW_OVERDUE':
      return `/de/scenarios/${encoded}/review`;
    case 'SCENARIO_ASSIGNED':
    case 'REVIEW_DECIDED':
      return `/de/scenarios/${encoded}/author`;
    // A draft notification does not establish permission to review it.
    default:
      return null;
  }
}
