import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type NewsItem = {
  tag: string
  title: string
  date: string
  excerpt: string
  image?: string
}

export default function NewsCarousel({ items }: { items: NewsItem[] }) {
  const data = useMemo(() => items.filter(Boolean), [items])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (data.length <= 1) return
    const t = window.setInterval(() => setIdx((i) => (i + 1) % data.length), 6500)
    return () => window.clearInterval(t)
  }, [data.length])

  if (!data.length) return null
  const current = data[idx]

  const prev = () => setIdx((i) => (i - 1 + data.length) % data.length)
  const next = () => setIdx((i) => (i + 1) % data.length)

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
        <button
          onClick={prev}
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          aria-label="previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={next}
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          aria-label="next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.35 }}
            className="p-0"
          >
            <div className="relative aspect-[11/4] w-full">
              {current.image ? (
                <img src={current.image} alt={current.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/25 via-slate-950 to-slate-950" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
                {current.tag}
              </span>
              <span className="text-xs text-slate-400">{current.date}</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-white leading-snug">{current.title}</div>
            <div className="mt-1 text-sm text-slate-300 leading-relaxed">{current.excerpt}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {data.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 w-1.5 rounded-full transition ${i === idx ? 'bg-white/70' : 'bg-white/20 hover:bg-white/35'}`}
            aria-label={`go-to-${i}`}
          />
        ))}
      </div>
    </div>
  )
}
