import { useToasts } from '../hooks/useToast.ts'

export default function ToastStack() {
  const toasts = useToasts()
  if (toasts.length === 0) return null

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone ?? 'default'} anim-fade-up`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
