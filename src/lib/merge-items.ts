import type { RecipeShoppingListItem } from '../types/models.ts'

/** Parsed numeric amount from recipe text (supports fractions). */
export function parseRecipeAmount(rawText: string): number {
  const m = rawText.trim().match(/^(\d+\s*\/\s*\d+|\d+(?:\.\d+)?)/)
  if (!m) return 1
  const token = m[1]
  if (token.includes('/')) {
    const [a, b] = token.split('/').map((s) => Number(s.trim()))
    return b ? a / b : 1
  }
  const n = Number(token)
  return Number.isFinite(n) ? n : 1
}

type MergedEntry = {
  item: RecipeShoppingListItem
  recipeAmount: number
}

function quantityForMerged(entry: MergedEntry, incoming: RecipeShoppingListItem): number {
  const { item } = entry

  // Bulk / pantry items: one store package covers small amounts across recipes
  if (item.hasLeftovers && incoming.hasLeftovers) {
    return 1
  }

  // Discrete items (onions, meat, canned goods): sum packages/units needed
  return item.quantityToBuy + incoming.quantityToBuy
}

export function mergeItems(
  existing: RecipeShoppingListItem[],
  incoming: RecipeShoppingListItem[],
): RecipeShoppingListItem[] {
  const byProduct = new Map<string, MergedEntry>()
  const rest: RecipeShoppingListItem[] = []

  for (const item of [...existing, ...incoming]) {
    if (item.notFound || !item.productId) {
      rest.push({ ...item, id: crypto.randomUUID() })
      continue
    }
    const prev = byProduct.get(item.productId)
    if (!prev) {
      byProduct.set(item.productId, {
        item: { ...item, id: crypto.randomUUID() },
        recipeAmount: parseRecipeAmount(item.rawText),
      })
      continue
    }
    const qty = quantityForMerged(prev, item)
    const combinedRaw = `${prev.item.rawText}; ${item.rawText}`
    byProduct.set(item.productId, {
      item: {
        ...prev.item,
        quantityToBuy: qty,
        lineTotal: Math.round(prev.item.price * qty * 100) / 100,
        rawText: combinedRaw,
      },
      recipeAmount: prev.recipeAmount + parseRecipeAmount(item.rawText),
    })
  }

  return [...[...byProduct.values()].map((e) => e.item), ...rest]
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
