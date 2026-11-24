import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  ArrowLeft,
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

export const iconOf = (type?: string) =>
  ICONS[type as keyof typeof ICONS] ?? FileText;

/**
 * Tài liệu hoặc bản soạn đang mở, gắn trong bàn làm việc chứ không nổi đè
 * lên sân khấu: người chơi vừa đọc vừa nghe nhân vật được. Giữ dáng cửa sổ
 * phần mềm thật (seed D3), thanh tiêu đề có nút quay lại và mở rộng.
 */
export function DocumentPane({
  entry,
  expanded,
  onToggleExpand,
  onClose,
  backLabel,
  mobileBackLabel = backLabel,
  toolbar,
  children,
}: {
  entry: DesktopEntry;
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  /** Nơi nút đóng đưa người chơi về, ví dụ "Tài liệu". */
  backLabel: string;
  /** Điện thoại: tài liệu mở từ sân khấu thì đóng là về "Cảnh". */
  mobileBackLabel?: string;
  /** Việc gắn với tài liệu này (seed D3). */
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  const frame = useRef<HTMLElement>(null);
  const Icon = iconOf(entry.type);

  const opener = useRef<Element | null>(document.activeElement);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useLayoutEffect(() => {
    const target = frame.current;
    if (!target) return;
    target.focus();
    if (document.activeElement === target) return;
    const id = requestAnimationFrame(() => target.focus());
    return () => cancelAnimationFrame(id);
  }, [entry.id]);

  useEffect(() => {
    const previous = opener.current;
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    // Focus drops to <body> after a click on the stage; Escape should still close.
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        !event.isComposing &&
        event.target === document.body
      ) {
        event.preventDefault();
        closeRef.current();
      }
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.key !== 'Escape' ||
      event.defaultPrevented ||
      event.nativeEvent.isComposing
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  return (
    <section
      ref={frame}
      tabIndex={-1}
      data-active-window
      aria-labelledby={titleId}
      className="desktop-window"
      onKeyDown={onKeyDown}
    >
      <div className="desktop-titlebar">
        <button type="button" className="desktop-close" onClick={onClose}>
          <ArrowLeft size={15} aria-hidden />
          <span className="sr-only">Đóng, về </span>
          <span className="max-sm:sr-only lg:hidden">{mobileBackLabel}</span>
          <span className="max-lg:hidden">{backLabel}</span>
        </button>
        <h2 id={titleId}>
          <Icon size={15} aria-hidden />
          <span>{entry.title}</span>
        </h2>
        <button
          type="button"
          className="desktop-maximize"
          aria-pressed={expanded}
          aria-label={expanded ? 'Thu gọn tài liệu' : 'Mở rộng tài liệu'}
          onClick={onToggleExpand}
        >
          {expanded ? (
            <Minimize2 size={14} aria-hidden />
          ) : (
            <Maximize2 size={14} aria-hidden />
          )}
        </button>
      </div>
      {toolbar && (
        <div
          role="group"
          aria-label="Việc gắn với tài liệu"
          className="desktop-actions"
        >
          {toolbar}
        </div>
      )}
      <div className="desktop-content">{children}</div>
    </section>
  );
}
