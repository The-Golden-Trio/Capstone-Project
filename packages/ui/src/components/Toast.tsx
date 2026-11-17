import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { Sparkle } from '../motifs/Sparkle';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger' | 'gold';
export interface ToastInput {
  title: string;
  description?: string;
  tone: ToastTone;
}
const colors = {
  info: 'border-info/40 text-info',
  success: 'border-success/40 text-success',
  warning: 'border-warning/40 text-warning',
  danger: 'border-danger/40 text-danger',
  gold: 'border-line-gold text-gold-300',
};
const ToastContext = createContext<{
  toast: (input: ToastInput) => void;
} | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Array<ToastInput & { id: number }>>([]);
  const serial = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((old) => old.filter((item) => item.id !== id));
  }, []);
  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++serial.current;
      setItems((old) => [...old, { ...input, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 5000),
      );
    },
    [dismiss],
  );
  useEffect(() => {
    const active = timers.current;
    return () => {
      active.forEach(clearTimeout);
      active.clear();
    };
  }, []);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Thông báo"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex w-full animate-rise items-start gap-3 rounded-xl border bg-night-850 p-4 shadow-lift',
              colors[item.tone],
            )}
          >
            <span aria-hidden className="mt-0.5">
              {item.tone === 'gold' ? (
                <Sparkle size={20} />
              ) : item.tone === 'success' ? (
                <CheckCircle2 size={20} />
              ) : item.tone === 'info' ? (
                <Info size={20} />
              ) : (
                <TriangleAlert size={20} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description && (
                <p className="mt-1 text-xs text-ink-muted">
                  {item.description}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Đóng thông báo"
              onClick={() => dismiss(item.id)}
              className="rounded p-1 text-ink-faint hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast phải nằm trong ToastProvider');
  return context;
}
