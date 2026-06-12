import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'

import { pool } from '../db/index.ts'
import { recipeIngredients, recipes, users } from '../db/schema.ts'

const db = drizzle(pool)

await db
  .insert(users)
  .values({
    id: 'user-1',
    preferredStoreId: 'store-kroger',
    zipCode: '43210',
  })
  .onConflictDoNothing()

await db
  .insert(recipes)
  .values({
    id: 'rec-1',
    userId: 'user-1',
    title: 'Creamy Garlic Pasta',
    sourceType: 'url',
    sourceUrl: 'https://example.com/creamy-garlic-pasta',
    createdAt: new Date(),
  })
  .onConflictDoNothing()

await db
  .insert(recipeIngredients)
  .values([
    { id: 'ri-1', recipeId: 'rec-1', rawText: '1 lb spaghetti', sortOrder: 0 },
    { id: 'ri-2', recipeId: 'rec-1', rawText: '2 tbsp olive oil', sortOrder: 1 },
    { id: 'ri-3', recipeId: 'rec-1', rawText: '4 cloves garlic, minced', sortOrder: 2 },
  ])
  .onConflictDoNothing()

console.log('Seed complete')
await pool.end()
