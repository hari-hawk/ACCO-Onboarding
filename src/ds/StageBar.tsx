import { Fragment, type CSSProperties } from 'react';
import { Icon } from './Icon';

export interface Stage { id: string; label: string; icon: string }

export interface StageBarProps {
  stages: Stage[];
  activeId: string;
  completed?: string[];
  onSelect?: (id: string) => void;
  style?: CSSProperties;
}

export function StageBar({ stages, activeId, completed = [], onSelect, style }: StageBarProps) {
  return (
    <ol
      data-ds="stage-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        margin: 0,
        padding: 'var(--space-2) var(--space-3)',
        listStyle: 'none',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        flexWrap: 'wrap',
        ...style,
      }}
    >
      {stages.map((s, i) => {
        const on = s.id === activeId;
        const done = completed.includes(s.id);
        const fg = on ? 'var(--primary)' : done ? 'var(--status-pre-approved)' : 'var(--muted-foreground)';
        return (
          <Fragment key={s.id}>
            <li>
              <button
                type="button"
                onClick={() => onSelect?.(s.id)}
                aria-current={on ? 'step' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1-5)',
                  height: 'var(--control-xs)',
                  padding: '0 var(--space-2-5)',
                  background: on ? 'var(--ds-bg-blue-light)' : 'transparent',
                  border: on ? '1px solid var(--ds-primary-300)' : '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  color: fg,
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: on ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon name={done ? 'circle-check' : s.icon} size="sm" />
                {s.label}
              </button>
            </li>
            {i < stages.length - 1 && (
              <li aria-hidden="true" style={{ color: 'var(--ds-neutral-300)', display: 'inline-flex' }}>
                <Icon name="chevron-right" size="sm" />
              </li>
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
