import type { RecipeShoppingList, RecipeShoppingListItem } from '../../src/types/models.js'
import type { ExtractedRecipe } from './vision/types.js'
import { itemFromIngredient } from './item-from-ingredient.js'
import { getDb } from './db.js'
import { recipes, recipeIngredients } from './schema.js'

const DEFAULT_STORE_ID = 'store-kroger'
const DEFAULT_ZIP = '43210'
const DEFAULT_USER_ID = 'user-1'

export type BuildOptions = {
  sourceType: 'url' | 'screenshot'
  sourceUrl?: string
  storeId?: string
  zipCode?: string
}

export async function buildShoppingList(
  extracted: ExtractedRecipe,
  options: BuildOptions,
): Promise<RecipeShoppingList> {
  const recipeId = crypto.randomUUID()
  const listId = crypto.randomUUID()
  const now = new Date().toISOString()

  const items: RecipeShoppingListItem[] = extracted.ingredients.map((ing) =>
    itemFromIngredient(ing.rawText, ing.confidence),
  )

  const estimatedTotal = items.reduce((sum, item) => sum + item.lineTotal, 0)

  const list: RecipeShoppingList = {
    id: listId,
    recipeId,
    recipeTitle: extracted.title,
    recipeDescription: extracted.description,
    recipeServings: extracted.servings,
    recipePrepTime: extracted.prepTime,
    recipeCookTime: extracted.cookTime,
    recipeSteps: extracted.steps.length > 0 ? extracted.steps : undefined,
    sourceUrl: options.sourceUrl,
    storeId: options.storeId ?? DEFAULT_STORE_ID,
    zipCode: options.zipCode ?? DEFAULT_ZIP,
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
