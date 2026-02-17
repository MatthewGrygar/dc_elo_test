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
        'inline-flex h-10 items-center rounded-2xl border border-white/10 bg-white/5 p-1 text-sm',
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
              active ? 'bg-indigo-500 text-white shadow-soft' : 'text-slate-200 hover:bg-white/5',
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
