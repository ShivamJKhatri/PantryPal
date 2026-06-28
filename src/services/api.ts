import type { RecipeShoppingList, StoreOptionsResponse } from '../types/models.ts'
import type { UserPrefs } from '../hooks/useUserPrefs.ts'

const API_BASE = '/api'
const _urlCache = new Map<string, RecipeShoppingList>()

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
  const cacheKey = `${url}|${prefs?.storeId ?? ''}|${prefs?.zipCode ?? ''}`
  const cached = _urlCache.get(cacheKey)
  if (cached) return cached
  const res = await fetch(`${API_BASE}/parse-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, storeId: prefs?.storeId, zipCode: prefs?.zipCode }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`)
  }
  const data = await res.json() as RecipeShoppingList
  _urlCache.set(cacheKey, data)
  return data
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

export async function getStoreOptions(zipCode: string, estimatedTotal?: number): Promise<StoreOptionsResponse> {
  const params = new URLSearchParams({ zipCode })
  if (estimatedTotal !== undefined) params.set('estimatedTotal', estimatedTotal.toString())
  const res = await fetch(`${API_BASE}/store-options?${params}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`)
  }
  return res.json() as Promise<StoreOptionsResponse>
}

export async function matchIngredientLine(rawText: string): Promise<RecipeShoppingList['items'][number]> {
  const res = await fetch(`${API_BASE}/match-item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`)
  }
  const data = (await res.json()) as { item: RecipeShoppingList['items'][number] }
  return data.item
}
