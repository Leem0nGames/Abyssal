import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'gold' | 'purple';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  pulse = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`ui-badge ui-badge--${variant} ui-badge--${size} ${pulse ? 'ui-badge--pulse' : ''} ${className}`}
    >
      {icon && <span className="ui-badge__icon">{icon}</span>}
      {children}
    </span>
  );
}

interface CurrencyDisplayProps {
  gold?: number;
  essence?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function CurrencyDisplay({
  gold,
  essence,
  size = 'md',
  showIcon = true,
}: CurrencyDisplayProps) {
  return (
    <div className="ui-currency">
      {gold !== undefined && (
        <span className={`ui-currency__item ui-currency__item--gold ui-currency__item--${size}`}>
          {showIcon && '💰 '}
          {gold.toLocaleString()}
        </span>
      )}
      {essence !== undefined && (
        <span className={`ui-currency__item ui-currency__item--essence ui-currency__item--${size}`}>
          {showIcon && '✨ '}
          {essence.toLocaleString()}
        </span>
      )}
    </div>
  );
}
