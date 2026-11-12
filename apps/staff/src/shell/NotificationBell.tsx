import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { staffApi } from '../api/endpoints';
import type { Notification } from '../api/types';
import { formatDateTime, NOTIFICATION_LABEL } from '../lib/labels';

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
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      staffApi
        .listNotifications()
        .then((page) => alive && setItems(page.items))
        .catch(() => undefined);
    void load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const unread = items.filter((n) => n.createdAt > seen).length;

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
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={`Thông báo${unread ? `, ${unread} mới` : ''}`}
        className="relative rounded-md px-2 py-1 text-ink-2 hover:bg-inset"
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 rounded-full bg-bad px-1.5 text-[11px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          role="region"
          aria-label="Thông báo"
          className="absolute right-0 z-20 mt-1 max-h-96 w-80 overflow-auto rounded-lg border border-line bg-surf shadow-lg"
        >
          {items.length === 0 ? (
            <p className="p-4 text-muted">Chưa có thông báo.</p>
          ) : (
            <ul>
              {items.map((n) => {
                const link =
                  typeof n.payload['link'] === 'string'
                    ? new URL(n.payload['link']).pathname.replace(
                        /^\/staff/,
                        '',
                      )
                    : null;
                const text = (
                  <>
                    <p className="font-medium">
                      {NOTIFICATION_LABEL[n.template] ?? n.template}
                    </p>
                    {typeof n.payload['taskText'] === 'string' && (
                      <p className="text-[13px] text-ink-2">
                        {n.payload['taskText']}
                      </p>
                    )}
                    <p className="text-[12px] text-muted">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </>
                );
                return (
                  <li
                    key={n.id}
                    className="border-b border-line-2 last:border-0"
                  >
                    {link ? (
                      <Link
                        to={link}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 hover:bg-inset"
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
