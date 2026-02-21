import React from 'react';
import clsx from 'clsx';

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'soft' | 'row';
  interactive?: boolean;
};

export function Panel({ variant = 'default', interactive, className, ...rest }: PanelProps) {
  return (
    <div
      className={clsx(
        'panel',
        variant === 'soft' && 'panel--soft',
        variant === 'row' && 'panel--row',
        interactive && 'panel--interactive',
        className
      )}
      {...rest}
    />
  );
}
