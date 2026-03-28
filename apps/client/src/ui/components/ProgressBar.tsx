interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'default',
  size = 'md',
  animated = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getAutoVariant = () => {
    if (percentage <= 25) return 'danger';
    if (percentage <= 50) return 'warning';
    return 'success';
  };

  const finalVariant = variant === 'default' ? getAutoVariant() : variant;

  return (
    <div className={`ui-progress ${className}`}>
      {(label || showValue) && (
        <div className="ui-progress__header">
          {label && <span className="ui-progress__label">{label}</span>}
          {showValue && (
            <span className="ui-progress__value">
              {Math.floor(value)}/{max}
            </span>
          )}
        </div>
      )}
      <div className={`ui-progress__bar ui-progress__bar--${size}`}>
        <div
          className={`ui-progress__fill ui-progress__fill--${finalVariant} ${
            animated ? 'ui-progress__fill--animated' : ''
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
