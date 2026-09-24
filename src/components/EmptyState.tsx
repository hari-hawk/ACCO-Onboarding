import type { ReactNode } from 'react';
import { Icon } from '../ds';

export interface EmptyStateProps {
  icon: string;
  iconSize?: number;
  title: string;
  body: string;
  action?: ReactNode;
  card?: boolean;
}

/** Names the missing thing and offers the next action — never an apology. */
export function EmptyState({ icon, iconSize = 24, title, body, action, card = true }: EmptyStateProps) {
  const inner = (
    <div className="col" data-ds="empty-state" style={{ alignItems: 'center', gap: 12, textAlign: 'center', maxWidth: 420 }}>
      <span className="round-icon" style={{ width: 48, height: 48, background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
        <Icon name={icon} size={iconSize} />
      </span>
      <span style={{ fontSize: 16, fontWeight: 600 }}>{title}</span>
      <span className="sub" style={{ lineHeight: 1.6 }}>{body}</span>
      {action}
    </div>
  );
  if (!card) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 40px' }}>{inner}</div>;
  return <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>{inner}</div>;
}
