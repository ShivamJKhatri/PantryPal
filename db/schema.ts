import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  preferredStoreId: text('preferred_store_id').notNull(),
  zipCode: text('zip_code').notNull(),
})

export const recipes = pgTable('recipes', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  title: text('title').notNull(),
  sourceType: text('source_type').notNull(),
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
})

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id),
  rawText: text('raw_text').notNull(),
  sortOrder: integer('sort_order').notNull(),
})
