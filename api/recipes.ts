import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { getPool } from '../db/index'
import { recipeIngredients, recipes } from '../db/schema'

export default async function handler(_request: VercelRequest, response: VercelResponse) {
  try {
    const db = drizzle(getPool())

    const allRecipes = await db.select().from(recipes)
    const ingredients = await db
      .select()
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, 'rec-1'))

    response.status(200).json({
      recipes: allRecipes,
      ingredients,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    response.status(500).json({ error: message })
  }
}
