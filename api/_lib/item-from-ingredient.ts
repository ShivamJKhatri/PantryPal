import type { RecipeShoppingListItem } from '../../src/types/models.js'
import { matchIngredient, suggestSubstitutes } from './store-catalog.js'
import { parseLeadingQty } from './parse-qty.js'

export function itemFromIngredient(rawText: string, confidence?: number): RecipeShoppingListItem {
  const match = matchIngredient(rawText)
  if (!match) {
    const subs = suggestSubstitutes(rawText)
    return {
      id: crypto.randomUUID(),
      ingredientName: rawText,
      rawText,
      productId: '',
      productName: 'Not found in store',
      price: 0,
      quantityToBuy: 0,
      lineTotal: 0,
      excluded: false,
      hasLeftovers: false,
      notFound: true,
      confidence,
      suggestions: subs.map((s) => ({ productId: s.id, productName: s.name, price: s.price, aisle: s.aisle })),
    }
  }

  const qty = match.hasLeftovers ? 1 : parseLeadingQty(rawText)
  return {
    id: crypto.randomUUID(),
    ingredientName: match.name,
    rawText,
    productId: match.id,
    productName: match.name,
    productBrand: match.brand,
    aisle: match.aisle,
    price: match.price,
    quantityToBuy: qty,
    lineTotal: Math.round(match.price * qty * 100) / 100,
    excluded: false,
    hasLeftovers: match.hasLeftovers,
    notFound: false,
    confidence,
  }
}
