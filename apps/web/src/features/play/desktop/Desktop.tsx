import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  BookOpen,
  FileCode2,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Mail,
  Maximize2,
  MessageSquare,
  Minimize2,
  Pencil,
  SquareTerminal,
  Table2,
  X,
} from 'lucide-react';
import './desktop.css';

export interface DesktopEntry {
  id: string;
  title: string;
  type?: string;
}

const ICONS = {
  code: FileCode2,
  wiki: BookOpen,
  table: Table2,
  dashboard: LayoutDashboard,
  terminal: SquareTerminal,
  file: FileSpreadsheet,
  patch: FileCode2,
  mail: Mail,
  note: Pencil,
  channel: MessageSquare,
};

const FOCUSABLE =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function Desktop({
  documents,
  windows,
  onOpen,
  onRaise,
  onClose,
  renderWindow,
  children,
}: {
  documents: DesktopEntry[];
  windows: DesktopEntry[];
  onOpen: (id: string) => void;
  onRaise: (id: string) => void;
  onClose: (id: string) => void;
  renderWindow: (id: string) => ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  const surface = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLElement>(null);
  const [dockEdges, setDockEdges] = useState({ start: false, end: false });
  const opener = useRef<HTMLElement | null>(null);
  const active = windows[windows.length - 1]?.id;
  const modal = active !== undefined;

  useLayoutEffect(() => {
    if (modal) {
      const focused = document.activeElement;
      opener.current = focused instanceof HTMLElement ? focused : null;
    } else if (opener.current) {
      const previous = opener.current;
      opener.current = null;
      if (previous.isConnected && !previous.closest('[inert]'))
        previous.focus();
      if (document.activeElement === document.body)
        document.getElementById('stage-dialog')?.focus();
    }
  }, [modal]);

  useLayoutEffect(() => {
    if (!active) return;
    const target = surface.current?.querySelector<HTMLElement>(
      '[data-active-window]',
    );
    if (!target) return;
    target.focus();
    if (document.activeElement === target) return;
    const frame = requestAnimationFrame(() => target.focus());
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const hasDock = documents.length > 0;
  useEffect(() => {
    const el = dock.current;
    if (!el) return;
    const update = () => {
      const start = el.scrollLeft > 1;
      const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      setDockEdges((prev) =>
        prev.start === start && prev.end === end ? prev : { start, end },
      );
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [hasDock, documents.length]);

  useEffect(() => {
    dock.current
      ?.querySelector('[aria-pressed="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active, documents.length]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!active || event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose(active);
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter(
      (element) =>
        !element.closest('[inert], [hidden]') &&
        element.getClientRects().length > 0 &&
        getComputedStyle(element).visibility !== 'hidden',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const focused = document.activeElement;
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (
      event.shiftKey &&
      (focused === first || !focusable.includes(focused as HTMLElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && focused === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={surface}
      className="play-desktop"
      role={modal ? 'dialog' : undefined}
      aria-modal={modal || undefined}
      aria-labelledby={modal ? titleId : undefined}
      onKeyDown={onKeyDown}
    >
      {hasDock && (
        <div
          className="desktop-dock-wrap"
          data-more-start={dockEdges.start || undefined}
          data-more-end={dockEdges.end || undefined}
        >
          <nav ref={dock} aria-label="Tài liệu đã mở" className="desktop-dock">
            {documents.map((doc) => {
              const Icon = ICONS[doc.type as keyof typeof ICONS] ?? FileText;
              const open = windows.some((entry) => entry.id === doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  aria-pressed={active === doc.id}
                  title={doc.title}
                  data-open={open}
                  onClick={() => onOpen(doc.id)}
                >
                  <Icon size={16} aria-hidden />
                  <span>{doc.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
      <div className="desktop-stage">
        <div
          className="desktop-background"
          inert={modal || undefined}
          aria-hidden={modal || undefined}
        >
          {children}
        </div>
        {modal && (
          <div className="desktop-overlay">
            {windows.map((entry, index) => (
              <WindowFrame
                key={entry.id}
                entry={entry}
                index={index}
                active={entry.id === active}
                titleId={titleId}
                onRaise={() => onRaise(entry.id)}
                onClose={() => onClose(entry.id)}
              >
                {renderWindow(entry.id)}
              </WindowFrame>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WindowFrame({
  entry,
  index,
  active,
  titleId,
  onRaise,
  onClose,
  children,
}: {
  entry: DesktopEntry;
  index: number;
  active: boolean;
  titleId: string;
  onRaise: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const placement = useRef(index);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [maximized, setMaximized] = useState(false);
  const frame = useRef<HTMLElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const Icon = ICONS[entry.type as keyof typeof ICONS] ?? FileText;

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (
      maximized ||
      event.button !== 0 ||
      event.pointerType === 'touch' ||
      (event.target as HTMLElement).closest('button')
    )
      return;
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const rect = frame.current?.getBoundingClientRect();
    const area = frame.current?.parentElement?.getBoundingClientRect();
    if (!drag.current || !rect || !area) return;
    setPosition({
      x: Math.min(
        Math.max(0, area.width - rect.width),
        Math.max(0, event.clientX - area.left - drag.current.dx),
      ),
      y: Math.min(
        Math.max(0, area.height - rect.height),
        Math.max(0, event.clientY - area.top - drag.current.dy),
      ),
    });
  };

  return (
    <section
      ref={frame}
      tabIndex={-1}
      data-active-window={active || undefined}
      data-maximized={maximized}
      className="desktop-window"
      aria-hidden={!active || undefined}
      style={
        {
          zIndex: index + 1,
          '--window-offset': `${(placement.current % 4) * 18}px`,
          ...(position && {
            '--window-x': `${position.x}px`,
            '--window-y': `${position.y}px`,
          }),
        } as React.CSSProperties
      }
      onPointerDown={() => {
        if (!active) onRaise();
      }}
    >
      <div
        className="desktop-titlebar"
        onPointerDown={startDrag}
        onPointerMove={move}
        onPointerUp={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <div className="desktop-traffic" inert={!active || undefined}>
          <button
            type="button"
            className="desktop-close"
            aria-label="Đóng cửa sổ"
            onClick={onClose}
          >
            <X size={12} aria-hidden />
          </button>
          <button
            type="button"
            className="desktop-maximize"
            aria-label={maximized ? 'Khôi phục kích thước' : 'Phóng to cửa sổ'}
            onClick={() => setMaximized((value) => !value)}
          >
            {maximized ? (
              <Minimize2 size={11} aria-hidden />
            ) : (
              <Maximize2 size={11} aria-hidden />
            )}
          </button>
        </div>
        <h2 id={active ? titleId : undefined}>
          <Icon size={15} aria-hidden />
          <span>{entry.title}</span>
        </h2>
      </div>
      <div className="desktop-content" inert={!active || undefined}>
        {children}
      </div>
    </section>
  );
}
