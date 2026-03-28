import { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'ui-button';
    const variantClasses = `ui-button--${variant}`;
    const sizeClasses = `ui-button--${size}`;
    const loadingClasses = isLoading ? 'ui-button--loading' : '';
    const widthClasses = fullWidth ? 'ui-button--full' : '';
    const disabledClasses = disabled || isLoading ? 'ui-button--disabled' : '';

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${loadingClasses} ${widthClasses} ${disabledClasses} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <span className="ui-button__loader">Loading...</span> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
