import type { RecipeShoppingListItem } from '../types/models.ts'

export function getItemDisplay(item: RecipeShoppingListItem): { name: string; detail?: string } {
  const name = item.productName || item.ingredientName
  let detail = item.rawText.trim()

  if (!detail || detail.toLowerCase() === name.toLowerCase()) {
    return { name }
  }

  const nameLower = name.toLowerCase()
  const rawLower = detail.toLowerCase()
  if (rawLower.startsWith(nameLower)) {
    detail = detail.slice(name.length).replace(/^[\s,.:-]+/, '').trim()
  }

  if (!detail || detail.toLowerCase() === nameLower) {
    return { name }
  }

  return { name, detail }
}
