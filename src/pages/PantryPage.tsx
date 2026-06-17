import { useState } from 'react'
import type { PantryStaple } from '../types/models.ts'
import { mockPantryStaples } from '../data/mock-data.ts'

export default function PantryPage() {
  const [staples, setStaples] = useState<PantryStaple[]>(mockPantryStaples)
  const [input, setInput] = useState('')

  function addStaple(e: React.FormEvent) {
    e.preventDefault()
    const label = input.trim()
    if (!label) return
    const newStaple: PantryStaple = {
      id: `ps-${Date.now()}`,
      userId: 'user-1',
      canonicalIngredientId: label.toLowerCase().replace(/\s+/g, '-'),
      label,
    }
    setStaples((prev) => [...prev, newStaple])
    setInput('')
  }

  function removeStaple(id: string) {
    setStaples((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="pantry-page">
      <h1>My Pantry</h1>
      <p className="subtitle">Items here are excluded from your shopping lists.</p>

      <form className="add-form" onSubmit={addStaple}>
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
              <button className="remove-btn" onClick={() => removeStaple(staple.id)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
