import { useEffect, useRef, useState } from 'react'

export default function CountUp({ value, duration = 320 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    if (prev.current === value) {
      setDisplay(value)
      return
    }
    const from = prev.current
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - (1 - p) ** 3
      setDisplay(from + (value - from) * eased)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        prev.current = value
        setDisplay(value)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{display.toFixed(2)}</>
}
