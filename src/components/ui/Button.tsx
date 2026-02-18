import { forwardRef } from 'react'
import clsx from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'subtle'
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'subtle', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition',
        'focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:ring-offset-0',
        variant === 'primary' &&
          'bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 active:bg-indigo-600/90',
        variant === 'ghost' &&
          clsx(
            'border bg-white text-slate-800 hover:bg-slate-50 active:bg-white',
            'border-slate-200/70',
            'dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:active:bg-white/5',
          ),
        variant === 'subtle' &&
          clsx(
            'border bg-white text-slate-800 hover:bg-slate-50 active:bg-white',
            'border-slate-200/70',
            'dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-white/5 dark:active:bg-white/5',
          ),
        className,
      )}
      {...props}
    />
  )
})

export default Button
