import { Button, EmptyState, IconButton, LoadingBlock } from '@datn/ui';
import { ProblemAlert } from '../components/ui';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { staffApi } from '../api/endpoints';
import type { Notification } from '../api/types';
import { formatDateTime, NOTIFICATION_LABEL } from '../lib/labels';

import { notificationTarget } from './notifications';

const POLL_MS = 60_000;
const SEEN_KEY = 'jq.staff.notifications.seen';

const readSeen = (): string => {
  try {
    return localStorage.getItem(SEEN_KEY) ?? '';
  } catch {
    return '';
  }
};

/**
 * Chuông thông báo (T00, `listNotifications`). Hỏi lại mỗi phút; mốc "đã xem"
 * giữ ở trình duyệt vì hợp đồng chưa có operation đánh dấu đã đọc.
 */
export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(readSeen);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<unknown>();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      staffApi
        .listNotifications()
        .then((page) => {
          if (alive) {
            setItems(
              [...page.items].sort((a, b) =>
                b.createdAt.localeCompare(a.createdAt),
              ),
            );
            setError(undefined);
          }
        })
        .catch((reason: unknown) => {
          if (alive) setError(reason);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    setLoading(true);
    void load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [revision]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const unread = items.filter((n) => !n.readAt && n.createdAt > seen).length;

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && items[0]) {
      setSeen(items[0].createdAt);
      try {
        localStorage.setItem(SEEN_KEY, items[0].createdAt);
      } catch {
        // bỏ qua
      }
    }
  };

  return (
    <div className="relative" ref={panel}>
      <div className="relative">
        <IconButton
          ref={trigger}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={open ? 'staff-notifications' : undefined}
          label={`Thông báo${unread ? `, ${unread} mới` : ''}`}
          icon={
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
            </svg>
          }
        />
        {unread > 0 && (
          <span className="pointer-events-none absolute -top-1 -right-1 rounded-full bg-danger px-1.5 text-[10px] font-bold text-night-900">
            {unread}
          </span>
        )}
      </div>
      {open && (
        <div
          id="staff-notifications"
          role="region"
          aria-label="Thông báo"
          className="fixed inset-x-4 top-16 z-20 mt-1 max-h-[70dvh] overflow-auto sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:max-h-96 sm:w-80 rounded-xl border border-line-gold bg-night-850 shadow-lift"
        >
          <h2 className="border-b border-line px-4 py-3 font-sans text-sm font-semibold">
            Thông báo
          </h2>
          <div className="px-3 pt-2">
            <ProblemAlert error={error} />
            {!!error && (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setRevision((value) => value + 1)}
              >
                Thử lại thông báo
              </Button>
            )}
          </div>
          {loading ? (
            <LoadingBlock />
          ) : !items.length ? (
            !error && <EmptyState title="Chưa có thông báo" />
          ) : (
            <ul>
              {items.map((n) => {
                const link = notificationTarget(n, window.location.origin);
                const text = (
                  <>
                    <p className="font-medium">
                      {NOTIFICATION_LABEL[n.template] ?? n.template}
                    </p>
                    {typeof (n.payload['taskText'] ?? n.payload['title']) ===
                      'string' && (
                      <p className="text-[13px] text-ink-muted">
                        {String(n.payload['taskText'] ?? n.payload['title'])}
                      </p>
                    )}
                    <p className="text-[12px] text-ink-faint">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </>
                );
                return (
                  <li key={n.id} className="border-b border-line last:border-0">
                    {link ? (
                      <Link
                        to={link}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 transition-colors hover:bg-line/50"
                      >
                        {text}
                      </Link>
                    ) : (
                      <div className="px-3 py-2">{text}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
