import { useEffect, useState } from 'react'

export type Toast = { id: number; message: string; tone?: 'default' | 'success' | 'error' }

let toasts: Toast[] = []
let listeners: Array<(next: Toast[]) => void> = []

function emit() {
  listeners.forEach((l) => l(toasts))
}

export function showToast(message: string, tone: Toast['tone'] = 'default') {
  const id = Date.now() + Math.random()
  toasts = [...toasts, { id, message, tone }]
  emit()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, 2400)
}

export function useToasts(): Toast[] {
  const [state, setState] = useState(toasts)
  useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  }, [])
  return state
}
