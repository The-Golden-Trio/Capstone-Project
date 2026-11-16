import { useEffect, useId, useRef, type ReactNode, type Ref } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { Button, IconButton } from './Button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDialogElement>;
}

// Đếm các hộp thoại để đóng một hộp không mở khoá cuộn của hộp còn lại.
let locks = 0;
let previousOverflow = '';
function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
  className,
  ref,
}: DialogProps) {
  const local = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = local.current;
    if (!dialog || !open) return;
    dialog.showModal();
    if (locks++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      dialog.close();
      if (--locks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  return (
    <dialog
      ref={(node) => {
        local.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={(event) => {
        // Sự kiện `close` tới muộn: nếu effect vừa mở lại hộp (StrictMode
        // chạy effect hai lần) thì hộp vẫn đang mở, không phải người dùng đóng.
        if (open && !event.currentTarget.open) onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
      className={cn(
        'jq-dialog m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] overflow-y-auto rounded-2xl border border-line-gold bg-night-900 p-0 text-ink shadow-lift backdrop:bg-night-950/80 backdrop:backdrop-blur-sm',
        { sm: 'max-w-sm', md: 'max-w-xl', lg: 'max-w-3xl' }[size],
        className,
      )}
    >
      <header className="relative border-b border-line px-6 py-5 pr-16">
        <h2 id={`${id}-title`} className="font-display text-2xl text-gold-100">
          {title}
        </h2>
        {description && (
          <div id={`${id}-description`} className="mt-2 text-sm text-ink-muted">
            {description}
          </div>
        )}
        <IconButton
          label="Đóng"
          icon={<X size={18} />}
          onClick={onClose}
          className="absolute right-3 top-3"
        />
      </header>
      {children && <div className="p-6">{children}</div>}
      {footer && (
        <footer className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-3 border-t border-line bg-night-900/95 px-6 py-4 backdrop-blur-sm">
          {footer}
        </footer>
      )}
    </dialog>
  );
}

export function Dialog(props: DialogProps) {
  return <Modal {...props} />;
}

export interface ConfirmDialogProps extends Omit<DialogProps, 'footer'> {
  tone?: 'default' | 'danger';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}
export function ConfirmDialog({
  tone = 'default',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  onConfirm,
  loading,
  ...props
}: ConfirmDialogProps) {
  return (
    <Dialog
      {...props}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
export interface SheetProps extends DialogProps {
  side?: 'right' | 'bottom';
}
export function Sheet({ side = 'right', className, ...props }: SheetProps) {
  return (
    <Modal
      {...props}
      className={cn(
        side === 'right'
          ? 'jq-sheet-right mr-0 my-0 h-dvh max-h-dvh w-full rounded-r-none sm:w-[28rem]'
          : 'jq-sheet-bottom mb-0 w-full max-w-3xl rounded-b-none',
        className,
      )}
    />
  );
}
