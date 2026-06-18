import { useState } from 'react'
import type { PantryStaple } from '../types/models.ts'

interface Props {
  staples: PantryStaple[]
  onAdd: (label: string) => void
  onRemove: (id: string) => void
}

export default function PantryPage({ staples, onAdd, onRemove }: Props) {
  const [input, setInput] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const label = input.trim()
    if (!label) return
    onAdd(label)
    setInput('')
  }

  return (
    <div className="pantry-page">
      <h1>My Pantry</h1>
      <p className="subtitle">Items here are excluded from your shopping lists.</p>

      <form className="add-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="e.g. olive oil, salt, garlic…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={!input.trim()}>Add</button>
      </form>

      {staples.length === 0 ? (
        <p className="empty-state">No staples added yet.</p>
      ) : (
        <ul className="staple-list">
          {staples.map((staple) => (
            <li key={staple.id} className="staple-row">
              <span>{staple.label}</span>
              <button className="remove-btn" onClick={() => onRemove(staple.id)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
