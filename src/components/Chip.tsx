type ChipProps = {
  label: string
  selected?: boolean
  onClick?: () => void
}

export default function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      className={`chip press${selected ? ' chip--selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {selected && <span className="chip__check" aria-hidden>✓</span>}
      {label}
    </button>
  )
}
