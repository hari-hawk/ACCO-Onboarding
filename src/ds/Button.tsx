import { useState, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'action' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const HEIGHT: Record<ButtonSize, string> = { xs: 'var(--control-xs)', sm: 'var(--control-sm)', md: 'var(--control-md)', lg: 'var(--control-lg)' };
const FONT: Record<ButtonSize, string> = { xs: 'var(--text-xs)', sm: 'var(--text-sm)', md: 'var(--text-sm)', lg: 'var(--text-md)' };
const PAD: Record<ButtonSize, string> = { xs: 'var(--space-2)', sm: 'var(--space-3)', md: 'var(--space-4)', lg: 'var(--space-6)' };
const VARIANT: Record<ButtonVariant, CSSProperties> = {
  primary: { background: 'var(--primary)', color: 'var(--primary-foreground)', border: '1px solid transparent' },
  action: { background: 'var(--gradient-action)', color: 'var(--action-foreground)', border: '1px solid transparent' },
  outline: { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border-strong)' },
  ghost: { background: 'transparent', color: 'var(--foreground)', border: '1px solid transparent' },
  destructive: { background: 'var(--destructive)', color: '#FFFFFF', border: '1px solid transparent' },
  link: { background: 'transparent', color: 'var(--primary)', border: '1px solid transparent' },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: string;
  iconRight?: string;
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', size = 'md', iconLeft, iconRight, fullWidth, disabled, children, style, ...rest }: ButtonProps) {
  const [hover, setHover] = useState(false);
  const flat = variant === 'outline' || variant === 'ghost' || variant === 'link';
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-1-5)',
        height: HEIGHT[size],
        padding: `0 ${PAD[size]}`,
        width: fullWidth ? '100%' : undefined,
        fontFamily: 'var(--font-family)',
        fontSize: FONT[size],
        fontWeight: 'var(--weight-semibold)' as unknown as number,
        lineHeight: 'var(--lh-none)',
        borderRadius: 'var(--radius-sm)',
        whiteSpace: 'nowrap',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : hover && !flat ? 0.9 : 1,
        transition: 'opacity var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard)',
        textDecoration: variant === 'link' && hover ? 'underline' : 'none',
        ...VARIANT[variant],
        ...(flat && hover && !disabled && variant !== 'link' ? { background: 'var(--muted)' } : null),
        ...style,
      }}
      {...rest}
    >
      {iconLeft ? <Icon name={iconLeft} size={size === 'lg' ? 'md' : 'sm'} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={size === 'lg' ? 'md' : 'sm'} /> : null}
    </button>
  );
}
