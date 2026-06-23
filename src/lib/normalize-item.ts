import type { RecipeShoppingListItem } from '../types/models.ts'

/** One store package is enough for bulk/leftover items — fix legacy qty from recipe amounts. */
export function normalizeItemQuantity(item: RecipeShoppingListItem): RecipeShoppingListItem {
  if (item.notFound || item.excluded || !item.hasLeftovers) return item
  if (item.quantityToBuy <= 1) return item
  return {
    ...item,
    quantityToBuy: 1,
    lineTotal: Math.round(item.price * 100) / 100,
  }
}

export function normalizeItems(items: RecipeShoppingListItem[]): RecipeShoppingListItem[] {
  return items.map(normalizeItemQuantity)
}
