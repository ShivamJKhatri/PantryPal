import type { RecipeShoppingList } from '../types/models.ts'
import type { UserPrefs } from '../hooks/useUserPrefs.ts'

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

export async function extractRecipeFromUrl(url: string, prefs?: UserPrefs): Promise<RecipeShoppingList> {
  const res = await fetch(`${API_BASE}/parse-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, storeId: prefs?.storeId, zipCode: prefs?.zipCode }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`)
  }
  return res.json() as Promise<RecipeShoppingList>
}

export async function extractRecipeFromScreenshot(file: File, prefs?: UserPrefs): Promise<RecipeShoppingList> {
  const imageBase64 = await fileToBase64(file)
  const res = await fetch(`${API_BASE}/parse-screenshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType: file.type || 'image/jpeg', storeId: prefs?.storeId, zipCode: prefs?.zipCode }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`)
  }
  return res.json() as Promise<RecipeShoppingList>
}
