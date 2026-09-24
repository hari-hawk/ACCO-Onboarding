import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export interface NavItem { id: string; label: string; icon?: string }

export interface NavBarProps {
  product?: string;
  items?: NavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  /** When set, the ACCO mark and product name become a home control. */
  onHome?: () => void;
  right?: ReactNode;
  style?: CSSProperties;
}

export function NavBar({ product = 'Submittals', items = [], activeId, onSelect, onHome, right, style }: NavBarProps) {
  const brand = (
    <>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 'var(--radius-full)', background: 'var(--brand-navy)', border: '1px solid var(--nav-gold)', color: '#FFFFFF', fontSize: 8, fontWeight: 700, letterSpacing: 'var(--ls-tight)' }}>acco</span>
      <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, letterSpacing: 'var(--ls-tight)', color: '#FFFFFF' }}>ACCO</span>
      <span className="nav-product" style={{ width: 1, height: 'var(--space-4)', background: 'rgba(255,255,255,0.25)' }} />
      <span className="nav-product" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--nav-idle)' }}>{product}</span>
    </>
  );
  return (
    <header
      data-ds="nav-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        height: 'var(--nav-height)',
        padding: '0 var(--space-6)',
        background: 'var(--nav)',
        color: 'var(--nav-foreground)',
        borderBottom: '1px solid color-mix(in srgb, var(--nav-gold) 35%, transparent)',
        position: 'relative',
        zIndex: 'var(--z-nav)' as unknown as number,
        flex: '0 0 auto',
        ...style,
      }}
    >
      {onHome ? (
        <button type="button" className="nav-brand" aria-label={`ACCO ${product} — go to home`} onClick={onHome}>
          {brand}
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '0 0 auto' }}>{brand}</div>
      )}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flex: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {items.map((it) => {
          const on = it.id === activeId;
          return (
            <button
              key={it.id}
              type="button"
              data-ds="nav-item"
              data-ds-active={on || undefined}
              onClick={() => onSelect?.(it.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1-5)',
                height: 'var(--control-xs)',
                padding: '0 var(--space-3)',
                background: on ? 'rgba(255,255,255,0.10)' : 'transparent',
                color: on ? '#FFFFFF' : 'var(--nav-idle)',
                border: 0,
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                fontWeight: on ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: on ? 'inset 0 -2px 0 var(--nav-gold)' : 'none',
                transition: 'background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
              }}
            >
              {it.icon && <Icon name={it.icon} size="sm" />}
              {it.label}
            </button>
          );
        })}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '0 0 auto' }}>{right}</div>
    </header>
  );
}
