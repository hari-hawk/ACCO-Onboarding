import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'up' | 'down' | 'neutral';
  icon?: string;
  footer?: ReactNode;
  style?: CSSProperties;
}

export function StatCard({ label, value, delta, deltaTone = 'neutral', icon, footer, style, ...rest }: StatCardProps) {
  const dc = deltaTone === 'up' ? 'var(--status-pre-approved)' : deltaTone === 'down' ? 'var(--status-action-mandatory)' : 'var(--muted-foreground)';
  return (
    <div
      data-ds="kpi-tile"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-4)',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--elev-2)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: 'var(--ls-overline)', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{label}</span>
        {icon && (
          <span style={{ color: 'var(--muted-foreground)' }}>
            <Icon name={icon} size="md" />
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <strong style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, lineHeight: 'var(--lh-none)', letterSpacing: 'var(--ls-tighter)', fontVariantNumeric: 'tabular-nums' }}>{value}</strong>
        {delta && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-0-5)', color: dc, fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            {deltaTone !== 'neutral' && <Icon name={deltaTone === 'up' ? 'trending-up' : 'trending-down'} size="xs" />}
            {delta}
          </span>
        )}
      </div>
      {footer && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', lineHeight: 'var(--lh-base)' }}>{footer}</span>}
    </div>
  );
}
