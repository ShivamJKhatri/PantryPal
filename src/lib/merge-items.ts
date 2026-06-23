import type { RecipeShoppingListItem } from '../types/models.ts'

export function mergeItems(
  existing: RecipeShoppingListItem[],
  incoming: RecipeShoppingListItem[],
): RecipeShoppingListItem[] {
  const byProduct = new Map<string, RecipeShoppingListItem>()
  const rest: RecipeShoppingListItem[] = []

  for (const item of [...existing, ...incoming]) {
    if (item.notFound || !item.productId) {
      rest.push({ ...item, id: crypto.randomUUID() })
      continue
    }
    const prev = byProduct.get(item.productId)
    if (!prev) {
      byProduct.set(item.productId, { ...item, id: crypto.randomUUID() })
      continue
    }
    const qty = prev.quantityToBuy + item.quantityToBuy
    byProduct.set(item.productId, {
      ...prev,
      quantityToBuy: qty,
      lineTotal: Math.round(prev.price * qty * 100) / 100,
      rawText: `${prev.rawText}; ${item.rawText}`,
    })
  }

  return [...byProduct.values(), ...rest]
}

export function calcTotal(items: RecipeShoppingListItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100
}

export function calcActiveTotal(items: RecipeShoppingListItem[]): number {
  return Math.round(
    items
      .filter((i) => !i.excluded && !i.notFound)
      .reduce((sum, item) => sum + item.lineTotal, 0) * 100,
  ) / 100
}
