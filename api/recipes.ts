import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { getDb } from './_lib/db.js'
import { recipeIngredients, recipes } from './_lib/schema.js'
import { enforceRateLimit, RATE_LIMITS } from './_lib/rate-limit.js'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!(await enforceRateLimit(request, response, RATE_LIMITS.recipes))) return

  try {
    const db = getDb()
    const recipeId = typeof request.query.recipeId === 'string' ? request.query.recipeId : undefined

    if (recipeId) {
      const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId))
      if (!recipe) {
        response.status(404).json({ error: 'Recipe not found' })
        return
      }
      const ingredients = await db
        .select()
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, recipeId))
      response.status(200).json({ recipe, ingredients })
    } else {
      const allRecipes = await db.select().from(recipes)
      response.status(200).json({ recipes: allRecipes })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    response.status(500).json({ error: message })
  }
}
