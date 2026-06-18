import type { RecipeShoppingList, RecipeShoppingListItem } from '../../src/types/models.js'
import type { ExtractedRecipe } from './vision/types.js'
import { matchIngredient } from './store-catalog.js'
import { getDb } from './db.js'
import { recipes, recipeIngredients } from './schema.js'

const DEFAULT_STORE_ID = 'store-kroger'
const DEFAULT_ZIP = '43210'
const DEFAULT_USER_ID = 'user-1'

export type BuildOptions = {
  sourceType: 'url' | 'screenshot'
  sourceUrl?: string
}

export async function buildShoppingList(
  extracted: ExtractedRecipe,
  options: BuildOptions,
): Promise<RecipeShoppingList> {
  const recipeId = crypto.randomUUID()
  const listId = crypto.randomUUID()
  const now = new Date().toISOString()

  const items: RecipeShoppingListItem[] = extracted.ingredients.map((ing) => {
    const match = matchIngredient(ing.rawText)
    if (!match) {
      return {
        id: crypto.randomUUID(),
        ingredientName: ing.rawText,
        rawText: ing.rawText,
        productId: '',
        productName: 'Not found in store',
        price: 0,
        quantityToBuy: 0,
        lineTotal: 0,
        excluded: false,
        hasLeftovers: false,
        notFound: true,
      }
    }
    return {
      id: crypto.randomUUID(),
      ingredientName: match.name,
      rawText: ing.rawText,
      productId: match.id,
      productName: match.name,
      productBrand: match.brand,
      aisle: match.aisle,
      price: match.price,
      quantityToBuy: 1,
      lineTotal: match.price,
      excluded: false,
      hasLeftovers: match.hasLeftovers,
      notFound: false,
    }
  })

  const estimatedTotal = items.reduce((sum, item) => sum + item.lineTotal, 0)

  const list: RecipeShoppingList = {
    id: listId,
    recipeId,
    recipeTitle: extracted.title,
    sourceUrl: options.sourceUrl,
    storeId: DEFAULT_STORE_ID,
    zipCode: DEFAULT_ZIP,
    estimatedTotal: Math.round(estimatedTotal * 100) / 100,
    currency: 'USD',
    createdAt: now,
    items,
  }

  // Persist to DB — non-blocking, don't fail the request if it errors
  saveToDb(recipeId, extracted, options, now).catch((err: unknown) => {
    console.error('DB save failed (non-fatal):', err)
  })

  return list
}

async function saveToDb(
  recipeId: string,
  extracted: ExtractedRecipe,
  options: BuildOptions,
  now: string,
): Promise<void> {
  const db = getDb()

  await db.insert(recipes).values({
    id: recipeId,
    userId: DEFAULT_USER_ID,
    title: extracted.title,
    sourceType: options.sourceType,
    sourceUrl: options.sourceUrl ?? null,
    createdAt: new Date(now),
  })

  if (extracted.ingredients.length > 0) {
    await db.insert(recipeIngredients).values(
      extracted.ingredients.map((ing) => ({
        id: crypto.randomUUID(),
        recipeId,
        rawText: ing.rawText,
        sortOrder: ing.sortOrder,
      })),
    )
  }
}
