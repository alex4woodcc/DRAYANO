/**
 * Button component bridging the app's API with Bootstrap styles.
 * Semantic `variant` and `size` props map to Bootstrap classes such as
 * `btn-primary`, `btn-outline-secondary`, and `btn-sm`.
 * Focus states are enhanced via minimal custom CSS in `button.css`.
 */
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import './button.css';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button mapped to Bootstrap variants. */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  /** Size of the button mapped to Bootstrap sizing utilities. */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Render the underlying element from children when true. */
  asChild?: boolean;
}

/**
 * Maps `variant` and `size` to Bootstrap classes and renders either a native
 * `<button>` or the provided child element via `Slot`.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: 'btn-primary',
      secondary: 'btn-secondary',
      destructive: 'btn-danger',
      outline: 'btn-outline-secondary',
      ghost: 'btn-outline-secondary border-0',
      link: 'btn-link',
    };

    const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
      default: '',
      sm: 'btn-sm',
      lg: 'btn-lg',
      icon: 'btn-icon',
    };

    const classes = clsx('btn', variantClasses[variant], sizeClasses[size], className);

    return <Comp ref={ref} className={classes} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button };
