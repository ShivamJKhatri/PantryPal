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
  // Staples toggled "not on hand" — removed from parent so shopping lists see them,
  // but kept locally so the user can toggle back without re-typing.
  const [removedStaples, setRemovedStaples] = useState<PantryStaple[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const allIds = [...staples.map(s => s.id), ...removedStaples.map(s => s.id)]
  const flipRef = useFlip(allIds)

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

  function handleToggle(staple: PantryStaple, currentlyActive: boolean) {
    if (currentlyActive) {
      // Mark as "not on hand": remove from parent staples (so shopping lists update),
      // keep in local list so we can still render it as crossed out.
      setRemovedStaples(prev => [...prev, staple])
      onRemove(staple.id)
    } else {
      // Restore: add back to parent staples, clear from local removed list.
      setRemovedStaples(prev => prev.filter(s => s.id !== staple.id))
      onAdd(staple.label)
    }
  }

  function toggleQuick(label: string) {
    const existing = staples.find((s) => s.label.toLowerCase() === label.toLowerCase())
    if (existing) {
      onRemove(existing.id)
      showToast(`Removed ${label}`, 'default')
    } else if (onAdd(label)) {
      // Clear from removed list in case it was there
      setRemovedStaples(prev => prev.filter(s => s.label.toLowerCase() !== label.toLowerCase()))
      showToast(`Added ${label}`, 'success')
    }
  }

  const displayItems = [
    ...staples.map(s => ({ staple: s, active: true })),
    ...removedStaples.map(s => ({ staple: s, active: false })),
  ]

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

      {displayItems.length > 0 && (
        <ul className="pantry-staple-list stagger">
          {displayItems.map(({ staple, active }, index) => (
            <li
              key={staple.id}
              ref={flipRef(staple.id)}
              className={`pantry-staple-row${!active ? ' pantry-staple-row--disabled' : ''}`}
              style={{ '--i': index } as React.CSSProperties}
            >
              <span className="pantry-staple-dot" />
              <div className="pantry-staple-info">
                <div className="pantry-staple-name">{staple.label}</div>
                <div className="pantry-staple-meta">
                  {active ? 'On hand · auto-excluded from lists' : 'Not on hand · will appear on lists'}
                </div>
              </div>
              <label className="toggle" aria-label={`Toggle ${staple.label}`}>
                <input
                  type="checkbox"
                  className="toggle__input"
                  checked={active}
                  onChange={() => handleToggle(staple, active)}
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
        {staples.length} on hand{removedStaples.length > 0 ? ` · ${removedStaples.length} not on hand` : ''}
      </p>
    </div>
  )
}
