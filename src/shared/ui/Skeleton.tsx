import clsx from 'clsx'

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-2xl bg-white/5',
        className,
      )}
    />
  )
}
