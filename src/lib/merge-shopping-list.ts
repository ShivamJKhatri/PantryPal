import type { RecipeShoppingList, RecipeShoppingListItem } from '../types/models.ts'

function calcTotal(items: RecipeShoppingListItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100
}

export function mergeShoppingLists(
  existing: RecipeShoppingList,
  incoming: RecipeShoppingList,
): RecipeShoppingList {
  const byProduct = new Map<string, RecipeShoppingListItem>()
  const rest: RecipeShoppingListItem[] = []

  for (const item of [...existing.items, ...incoming.items]) {
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

  const items = [...byProduct.values(), ...rest]
  const title =
    existing.recipeTitle === incoming.recipeTitle
      ? existing.recipeTitle
      : `${existing.recipeTitle} + ${incoming.recipeTitle}`

  return {
    ...incoming,
    id: existing.id,
    recipeTitle: title,
    sourceUrl: incoming.sourceUrl ?? existing.sourceUrl,
    items,
    estimatedTotal: calcTotal(items),
  }
}
