import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { pool } from '../db/index.ts'
import { recipeIngredients, recipes } from '../db/schema.ts'

export default async function handler(_request: Request): Promise<Response> {
  const db = drizzle(pool)

  const allRecipes = await db.select().from(recipes)
  const ingredients = await db
    .select()
    .from(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, 'rec-1'))

  return Response.json({
    recipes: allRecipes,
    ingredients,
  })
}
