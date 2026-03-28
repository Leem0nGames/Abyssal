import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  variant?: 'default' | 'highlight' | 'warning' | 'danger';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  className = '',
  padding = 'md',
  onClick,
  hoverable = false,
}: CardProps) {
  const baseClasses = 'ui-card';
  const variantClasses = `ui-card--${variant}`;
  const paddingClasses = `ui-card--p-${padding}`;
  const clickableClasses = onClick ? 'ui-card--clickable' : '';
  const hoverableClasses = hoverable ? 'ui-card--hoverable' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${paddingClasses} ${clickableClasses} ${hoverableClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {(title || subtitle || icon) && (
        <div className="ui-card__header">
          {icon && <span className="ui-card__icon">{icon}</span>}
          <div className="ui-card__title-group">
            {title && <h3 className="ui-card__title">{title}</h3>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="ui-card__content">{children}</div>
    </div>
  );
}
