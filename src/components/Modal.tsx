import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useEscape } from './hooks';
import { stop } from '../lib/utils';

export interface ScrimProps {
  onClose?: () => void;
  dark?: boolean;
  zIndex?: number | string;
  children: ReactNode;
  style?: CSSProperties;
}

/** Full-viewport scrim. Clicking the backdrop closes; clicks inside children do not bubble. */
export function Scrim({ onClose, dark, zIndex, children, style }: ScrimProps) {
  useEscape(!!onClose, onClose ?? (() => {}));
  return (
    <div className={`scrim${dark ? ' scrim-dark' : ''}`} onClick={onClose} style={{ zIndex, ...style }}>
      {children}
    </div>
  );
}

export interface ModalProps {
  width: number;
  label: string;
  padded?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function Modal({ width, label, padded = true, children, style }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  /* Move keyboard focus into the dialog on open and hand it back to the opener on close (WCAG 2.4.3). */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>('input, button:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])');
    (first ?? el)?.focus();
    return () => { opener?.focus?.(); };
  }, []);
  return (
    <div
      ref={ref}
      tabIndex={-1}
      data-ds="dialog"
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={stop}
      style={{ width, padding: padded ? 24 : 0, gap: padded ? 14 : 0, outline: 'none', ...style }}
    >
      {children}
    </div>
  );
}
