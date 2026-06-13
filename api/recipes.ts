import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { getPool } from '../db/index.js'
import { recipeIngredients, recipes } from '../db/schema.js'

export default async function handler(_request: Request): Promise<Response> {
  try {
    const db = drizzle(getPool())

    const allRecipes = await db.select().from(recipes)
    const ingredients = await db
      .select()
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, 'rec-1'))

    return Response.json({
      recipes: allRecipes,
      ingredients,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
