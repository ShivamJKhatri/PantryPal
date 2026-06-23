import type { ReactNode } from 'react'
import Button from './Button.tsx'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state-page anim-scale-in">
      <div className="empty-state-page__icon">{icon}</div>
      <p className="empty-title">{title}</p>
      {description && <p className="empty-sub">{description}</p>}
      {action && (
        <Button className="empty-state-page__cta" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
