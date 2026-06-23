import type { ButtonHTMLAttributes } from 'react'
import Spinner from './Spinner.tsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    'press',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}
