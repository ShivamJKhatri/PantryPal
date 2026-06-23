/** What the user already owns — excluded from list and total */
export type PantryStaple = {
  id: string
  userId: string
  canonicalIngredientId: string
  label: string
}

export type SuggestionItem = {
  productId: string
  productName: string
  price: number
  aisle?: string
}

/** One item on a recipe-generated shopping list (flat, display-ready) */
export type RecipeShoppingListItem = {
  id: string
  ingredientName: string
  rawText: string
  productId: string
  productName: string
  productBrand?: string
  aisle?: string
  price: number
  quantityToBuy: number
  lineTotal: number
  excluded: boolean
  hasLeftovers: boolean
  notFound: boolean
  confidence?: number
  suggestions?: SuggestionItem[]
}

/** Full recipe shopping list returned by the API */
export type RecipeShoppingList = {
  id: string
  recipeId: string
  recipeTitle: string
  sourceUrl?: string
  storeId: string
  zipCode: string
  estimatedTotal: number
  currency: 'USD'
  createdAt: string
  items: RecipeShoppingListItem[]
}

/** Saved recipes + merged cart for the session */
export type RecipeCollection = {
  recipes: RecipeShoppingList[]
  cartItems: RecipeShoppingListItem[]
  cartRecipeIds: string[]
}
