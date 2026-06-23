import type { ReactNode } from 'react'

type CardProps = {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

export default function Card({ padding = 'md', children, className = '' }: CardProps) {
  return <div className={`card card--${padding} ${className}`.trim()}>{children}</div>
}
