import React from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
};

export function Button({ variant = 'ghost', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'btn',
        variant === 'primary' && 'btn--primary',
        variant === 'ghost' && 'btn--ghost',
        size === 'sm' && 'btn--sm',
        className
      )}
      {...rest}
    />
  );
}
