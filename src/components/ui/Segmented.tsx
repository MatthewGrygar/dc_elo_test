import clsx from 'clsx'

export default function Segmented({
  value,
  options,
  onChange,
  className,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div
      className={clsx(
        'inline-flex h-10 items-center rounded-2xl border p-1 text-sm',
        'border-slate-200/70 bg-white text-slate-800',
        'dark:border-white/10 dark:bg-white/5 dark:text-white',
        className,
      )}
      role="tablist"
      aria-label="mode"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'h-8 rounded-xl px-3 font-semibold transition',
              active
                ? 'bg-indigo-500 text-white shadow-soft'
                : 'text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/10',
            )}
            role="tab"
            aria-selected={active}
            type="button"
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
