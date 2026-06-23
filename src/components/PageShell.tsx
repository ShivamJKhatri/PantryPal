import type { ReactNode } from 'react'

type PageShellProps = {
  title?: string
  subtitle?: string
  trailing?: ReactNode
  children: ReactNode
}

export default function PageShell({ title, subtitle, trailing, children }: PageShellProps) {
  return (
    <div className="page-shell anim-fade-up">
      {(title || trailing) && (
        <header className="page-shell__header">
          <div>
            {title && <h1>{title}</h1>}
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>
          {trailing}
        </header>
      )}
      {children}
    </div>
  )
}
