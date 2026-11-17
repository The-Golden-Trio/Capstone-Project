import {
  cloneElement,
  useId,
  useState,
  type ReactElement,
  type HTMLAttributes,
} from 'react';
import { cn } from '../lib/cn';

export interface TooltipProps {
  content: string;
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  placement?: 'top' | 'bottom';
}
/** Phần tử con cần nhận focus được, ví dụ button hoặc a. */
export function Tooltip({
  content,
  children,
  placement = 'top',
}: TooltipProps) {
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const visible = (hovered || focused) && !dismissed;
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => {
        setHovered(true);
        setDismissed(false);
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        setFocused(true);
        setDismissed(false);
      }}
      onBlur={() => setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setDismissed(true);
      }}
    >
      {cloneElement(children, {
        'aria-describedby':
          [children.props['aria-describedby'], visible ? id : undefined]
            .filter(Boolean)
            .join(' ') || undefined,
      })}
      {visible && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'absolute left-1/2 z-50 w-max max-w-64 -translate-x-1/2 rounded-md border border-line-gold bg-night-950 px-3 py-2 text-center text-xs text-ink shadow-lift',
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
