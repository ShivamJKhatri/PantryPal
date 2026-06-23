import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
}

export default function IconButton({ label, children, className = '', ...rest }: IconButtonProps) {
  return (
    <button type="button" className={`icon-btn press ${className}`.trim()} aria-label={label} {...rest}>
      {children}
    </button>
  )
}
