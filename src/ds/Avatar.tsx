import type { CSSProperties, HTMLAttributes } from 'react';

const SIZE = { sm: 'var(--space-6)', md: 'var(--space-8)', lg: 'var(--space-10)' } as const;
const FONT = { sm: 'var(--text-2xs)', md: 'var(--text-xs)', lg: 'var(--text-md)' } as const;

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string;
  size?: keyof typeof SIZE;
  tone?: 'navy' | 'neutral';
  style?: CSSProperties;
}

export function Avatar({ name = '', size = 'md', tone = 'navy', style, ...rest }: AvatarProps) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  return (
    <span
      title={name}
      aria-label={name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZE[size],
        height: SIZE[size],
        flex: '0 0 auto',
        background: tone === 'navy' ? 'var(--ds-bg-blue-light)' : 'var(--muted)',
        color: tone === 'navy' ? 'var(--primary)' : 'var(--muted-foreground)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-full)',
        fontSize: FONT[size],
        fontWeight: 600,
        letterSpacing: 'var(--ls-tight)',
        ...style,
      }}
      {...rest}
    >
      {initials || '?'}
    </span>
  );
}
