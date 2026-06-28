import { useRef, useState } from 'react'
import type { PantryStaple } from '../types/models.ts'
import Card from '../components/Card.tsx'
import Chip from '../components/Chip.tsx'
import { IconPlus } from '../components/icons.tsx'
import { showToast } from '../hooks/useToast.ts'
import { useFlip } from '../hooks/useFlip.ts'

const QUICK_ADD = [
  'Salt', 'Pepper', 'Olive oil', 'Garlic', 'Butter',
  'Eggs', 'Onion', 'Flour', 'Sugar', 'Rice',
]

interface Props {
  staples: PantryStaple[]
  onAdd: (label: string) => boolean
  onRemove: (id: string) => void
}

export default function PantryPage({ staples, onAdd, onRemove }: Props) {
  const [input, setInput] = useState('')
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const flipRef = useFlip(staples.map((s) => s.id))

  function toggleDisabled(id: string) {
    setDisabledIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const labelsLower = new Set(staples.map((s) => s.label.toLowerCase()))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const label = input.trim()
    if (!label) return
    if (onAdd(label)) {
      setInput('')
      showToast('Added to pantry', 'success')
    }
  }

  function toggleQuick(label: string) {
    const existing = staples.find((s) => s.label.toLowerCase() === label.toLowerCase())
    if (existing) {
      onRemove(existing.id)
      showToast(`Removed ${label}`, 'default')
    } else if (onAdd(label)) {
      showToast(`Added ${label}`, 'success')
    }
  }

  return (
    <div className="pantry-page-wrap">
      <h1 className="pantry-page-title">Pantry staples</h1>
      <p className="pantry-page-subtitle">
        Items marked "on hand" are automatically skipped on every shopping list you build.
      </p>

      <Card>
        <form className="add-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Add a staple…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="icon-btn press" aria-label="Add staple" disabled={!input.trim()}>
            <IconPlus size={18} />
          </button>
        </form>
      </Card>

      {staples.length > 0 && (
        <ul className="pantry-staple-list stagger">
          {staples.map((staple, index) => (
            <li
              key={staple.id}
              ref={flipRef(staple.id)}
              className={`pantry-staple-row${disabledIds.has(staple.id) ? ' pantry-staple-row--disabled' : ''}`}
              style={{ '--i': index } as React.CSSProperties}
            >
              <span className="pantry-staple-dot" />
              <div className="pantry-staple-info">
                <div className="pantry-staple-name">{staple.label}</div>
                <div className="pantry-staple-meta">
                  {disabledIds.has(staple.id) ? 'Not on hand' : 'On hand · auto-excluded from lists'}
                </div>
              </div>
              <label className="toggle" aria-label={`Toggle ${staple.label}`}>
                <input
                  type="checkbox"
                  className="toggle__input"
                  checked={!disabledIds.has(staple.id)}
                  onChange={() => toggleDisabled(staple.id)}
                />
                <span className="toggle__track" />
                <span className="toggle__thumb" />
              </label>
            </li>
          ))}
        </ul>
      )}

      <p className="pantry-section-title">Quick add</p>
      <div className="chip-grid">
        {QUICK_ADD.map((label) => (
          <Chip
            key={label}
            label={label}
            selected={labelsLower.has(label.toLowerCase())}
            onClick={() => toggleQuick(label)}
          />
        ))}
      </div>

      <p className="pantry-footer-note">
        Pre-seeded with common staples · {staples.length} currently on hand
      </p>
    </div>
  )
}
