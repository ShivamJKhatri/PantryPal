/** User preferences (MVP: localStorage or stub until auth) */
export type User = {
  id: string
  preferredStoreId: string
  zipCode: string
}

/** What the user already owns — excluded from list and total */
export type PantryStaple = {
  id: string
  userId: string
  canonicalIngredientId: string
  label: string
}

/** A recipe the user captured */
export type Recipe = {
  id: string
  userId: string
  title: string
  sourceType: 'url' | 'screenshot'
  sourceUrl?: string
  createdAt: string
  steps: string[]
}

/** Raw line from extraction — before normalization */
export type RecipeIngredient = {
  id: string
  recipeId: string
  rawText: string
  sortOrder: number
  confidence?: number
}

/** After normalization — mapped to canonical dictionary */
export type NormalizedIngredient = {
  id: string
  recipeIngredientId: string
  canonicalId: string
  name: string
  quantity: number
  unit: string
  packageQuantity?: number
  packageUnit?: string
  hasLeftovers?: boolean
}

/** Store catalog item from API */
export type StoreProduct = {
  id: string
  storeId: string
  name: string
  brand?: string
  price: number
  unit: string
  aisle?: string
  inStock: boolean
  lastPriceUpdated: string
}

/** User's chosen match for one ingredient */
export type ShoppingListItem = {
  id: string
  shoppingListId: string
  normalizedIngredientId: string
  storeProductId: string
  quantityToBuy: number
  lineTotal: number
  excluded: boolean
  userEdited: boolean
}

/** Final priced shopping list */
export type ShoppingList = {
  id: string
  recipeId: string
  userId: string
  storeId: string
  zipCode: string
  items: ShoppingListItem[]
  estimatedTotal: number
  currency: 'USD'
  createdAt: string
  priceFreshness: string
}

export type Store = {
  id: string
  name: string
  supportsLivePricing: boolean
}
