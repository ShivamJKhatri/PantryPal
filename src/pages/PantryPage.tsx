import { useRef, useState } from 'react'
import type { PantryStaple } from '../types/models.ts'
import PageShell from '../components/PageShell.tsx'
import Card from '../components/Card.tsx'
import EmptyState from '../components/EmptyState.tsx'
import Chip from '../components/Chip.tsx'
import IconButton from '../components/IconButton.tsx'
import { IconJar, IconPlus, IconClose } from '../components/icons.tsx'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const flipRef = useFlip(staples.map((s) => s.id))

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
    <PageShell title="My pantry" subtitle="Items here are auto-excluded from your shopping lists">
      {staples.length === 0 ? (
        <EmptyState
          icon={<IconJar size={28} />}
          title="Mark what you already have"
          description="We'll skip these ingredients on every shopping list you build."
          action={{ label: 'Add your first staple', onClick: () => inputRef.current?.focus() }}
        />
      ) : null}

      <Card>
        <form className="add-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Add an item…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="icon-btn press" aria-label="Add staple" disabled={!input.trim()}>
            <IconPlus size={18} />
          </button>
        </form>
      </Card>

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

      {staples.length > 0 && (
        <>
          <p className="pantry-section-title">Your staples ({staples.length})</p>
          <ul className="staple-list stagger">
            {staples.map((staple, index) => (
              <li
                key={staple.id}
                ref={flipRef(staple.id)}
                className="staple-row"
                style={{ '--i': index } as React.CSSProperties}
              >
                <span>{staple.label}</span>
                <IconButton label={`Remove ${staple.label}`} onClick={() => onRemove(staple.id)}>
                  <IconClose size={18} />
                </IconButton>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  )
}
