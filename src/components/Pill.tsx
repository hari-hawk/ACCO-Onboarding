import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../ds';

export type PillTone = 'navy' | 'muted' | 'ok' | 'warn' | 'bad' | 'solid';

export interface PillProps {
  tone?: PillTone;
  /** Explicit colours override `tone` (for status maps that carry their own). */
  bg?: string;
  fg?: string;
  icon?: string;
  iconSize?: number;
  xs?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Pill({ tone = 'muted', bg, fg, icon, iconSize = 12, xs, className = '', style, children }: PillProps) {
  const cls = `pill ${xs ? 'pill-xs' : ''} ${bg ? '' : `pill-${tone}`} ${className}`;
  return (
    <span className={cls} data-ds="status-badge" data-ds-tone={tone} style={{ background: bg, color: fg, ...style }}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </span>
  );
}

export function toneFor(status: 'ok' | 'bad' | 'warn' | 'muted'): PillTone {
  return status;
}
