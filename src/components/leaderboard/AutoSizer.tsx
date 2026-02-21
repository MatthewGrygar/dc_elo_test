import { useEffect, useRef, useState } from 'react'

/**
 * Tiny AutoSizer – avoids adding another dependency.
 */
export default function AutoSizer({
  children
}: {
  children: (size: { width: number; height: number }) => JSX.Element
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) })
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  )
}
