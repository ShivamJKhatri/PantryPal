import { drizzle } from 'drizzle-orm/node-postgres'
import { getPool } from './pool.js'
import * as schema from './schema.js'

export function getDb() {
  return drizzle(getPool(), { schema })
}
