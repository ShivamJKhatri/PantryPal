import type { ShoppingList } from '../types/models.ts'
import { mockShoppingList } from '../data/mock-data.ts'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function extractRecipeFromUrl(url: string): Promise<ShoppingList> {
  if (!API_BASE) return mockShoppingList

  const res = await fetch(`${API_BASE}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<ShoppingList>
}

export async function extractRecipeFromScreenshot(file: File): Promise<ShoppingList> {
  if (!API_BASE) return mockShoppingList

  const form = new FormData()
  form.append('screenshot', file)

  const res = await fetch(`${API_BASE}/extract-image`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<ShoppingList>
}
