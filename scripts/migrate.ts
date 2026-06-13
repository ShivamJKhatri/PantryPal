import './load-env.ts'

import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { drizzle } from 'drizzle-orm/node-postgres'

import { pool } from '../db/index.ts'

const db = drizzle(pool)

await migrate(db, { migrationsFolder: './db/migrations' })
console.log('Migrations applied')
await pool.end()
