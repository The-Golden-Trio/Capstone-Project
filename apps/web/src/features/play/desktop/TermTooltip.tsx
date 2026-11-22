import { useCallback, useEffect, useId, useRef, useState } from 'react';

export function TermTooltip({ token, text }: { token: string; text: string }) {
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, above: false });
  const visible = hovered || focused || pinned;

  const place = useCallback(() => {
    const rect = button.current?.getBoundingClientRect();
    if (!rect) return;
    const above = window.innerHeight - rect.bottom < 130;
    const maxWidth = Math.min(224, window.innerWidth * 0.7);
    setAnchor({
      x: Math.max(8, Math.min(rect.left, window.innerWidth - maxWidth - 8)),
      y: above ? rect.top - 4 : rect.bottom + 4,
      above,
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [visible, place]);

  return (
    <span className="term-tooltip">
      <button
        ref={button}
        type="button"
        aria-describedby={id}
        onPointerEnter={(event) => {
          if (event.pointerType === 'touch') return;
          place();
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onClick={() => {
          place();
          setPinned((open) => !open);
        }}
        onFocus={(event) => {
          if (!event.currentTarget.matches(':focus-visible')) return;
          place();
          setFocused(true);
        }}
        onBlur={() => {
          setPinned(false);
          setFocused(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && visible) {
            event.preventDefault();
            event.stopPropagation();
            setPinned(false);
            setFocused(false);
            setHovered(false);
          }
        }}
      >
        {token}
      </button>
      <span
        id={id}
        role="tooltip"
        hidden={!visible}
        style={{
          left: anchor.x,
          top: anchor.y,
          translate: anchor.above ? '0 -100%' : undefined,
        }}
      >
        {text}
      </span>
    </span>
  );
}

export function splitTerms(text: string, terms: string[]) {
  if (!terms.length) return [text];
  const pattern = [...new Set(terms.filter(Boolean))]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  if (!pattern) return [text];
  return text.split(
    new RegExp(`(?<![\\p{L}\\p{N}_])(${pattern})(?![\\p{L}\\p{N}_])`, 'giu'),
  );
}
