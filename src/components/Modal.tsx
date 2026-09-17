import type { CSSProperties, ReactNode } from 'react';
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
  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={stop}
      style={{ width, padding: padded ? 24 : 0, gap: padded ? 14 : 0, ...style }}
    >
      {children}
    </div>
  );
}
