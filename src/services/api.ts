import type { RecipeShoppingList } from '../types/models.ts'
import { buildMockShoppingList } from '../data/mock-data.ts'

// In dev (no VITE_API_URL), calls hit the Vite dev server which proxies to /api/*
// In production, Vercel routes /api/* to serverless functions automatically
const API_BASE = '/api'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function extractRecipeFromUrl(url: string): Promise<RecipeShoppingList> {
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
    await new Promise((r) => setTimeout(r, 1200)) // simulate latency
    return buildMockShoppingList(url)
  }

  const res = await fetch(`${API_BASE}/parse-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`)
  }
  return res.json() as Promise<RecipeShoppingList>
}

export async function extractRecipeFromScreenshot(file: File): Promise<RecipeShoppingList> {
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
    await new Promise((r) => setTimeout(r, 1500))
    return buildMockShoppingList()
  }

  const imageBase64 = await fileToBase64(file)
  const res = await fetch(`${API_BASE}/parse-screenshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType: file.type || 'image/jpeg' }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`)
  }
  return res.json() as Promise<RecipeShoppingList>
}
