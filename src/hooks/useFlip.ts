import { useLayoutEffect, useRef } from 'react'

// ponytail: FLIP via Web Animations API — upgrade to layout lib only if jank shows up
export function useFlip<T extends string | number>(ids: T[]) {
  const positions = useRef(new Map<T, DOMRect>())
  const refs = useRef(new Map<T, HTMLElement>())

  useLayoutEffect(() => {
    refs.current.forEach((el, id) => {
      const prev = positions.current.get(id)
      const next = el.getBoundingClientRect()
      if (prev) {
        const dx = prev.left - next.left
        const dy = prev.top - next.top
        if (dx || dy) {
          el.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
            { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          )
        }
      }
      positions.current.set(id, next)
    })
  }, [ids.join('|')])

  return (id: T) => (el: HTMLElement | null) => {
    if (el) refs.current.set(id, el)
    else refs.current.delete(id)
  }
}
