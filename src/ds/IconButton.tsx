import { useState, type ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';

const SIZE = { xs: 'var(--control-xs)', sm: 'var(--control-sm)', md: 'var(--control-md)', lg: 'var(--control-lg)' } as const;

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  /** Becomes both aria-label and tooltip — icon-only controls always carry one. */
  label: string;
  variant?: 'ghost' | 'outline' | 'primary' | 'action';
  size?: keyof typeof SIZE;
}

export function IconButton({ icon, label, variant = 'ghost', size = 'sm', disabled, style, ...rest }: IconButtonProps) {
  const [hover, setHover] = useState(false);
  const filled = variant === 'primary' || variant === 'action';
  const bg = variant === 'primary' ? 'var(--primary)' : variant === 'action' ? 'var(--gradient-action)' : 'transparent';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZE[size],
        height: SIZE[size],
        padding: 0,
        background: !filled && hover && !disabled ? 'var(--muted)' : bg,
        color: filled ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
        border: variant === 'outline' ? '1px solid var(--border-strong)' : '1px solid transparent',
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : filled && hover ? 0.9 : 1,
        transition: 'background-color var(--dur-fast) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={size === 'lg' ? 'lg' : 'md'} />
    </button>
  );
}
