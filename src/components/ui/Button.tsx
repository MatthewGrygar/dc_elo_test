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
          'bg-indigo-500 text-white shadow-soft hover:bg-indigo-400 active:bg-indigo-500/90',
        variant === 'ghost' &&
          'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 active:bg-white/5',
        variant === 'subtle' &&
          'border border-white/10 bg-slate-950/30 text-slate-100 hover:bg-white/5 active:bg-white/5',
        className,
      )}
      {...props}
    />
  )
})

export default Button
