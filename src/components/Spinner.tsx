type SpinnerProps = { size?: 'sm' | 'md' | 'lg' }

export default function Spinner({ size = 'md' }: SpinnerProps) {
  return <span className={`spinner spinner--${size}`} role="status" aria-label="Loading" />
}
