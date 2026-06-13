import './load-env.ts'

import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { drizzle } from 'drizzle-orm/node-postgres'

import { getPool } from '../db/index.ts'

const db = drizzle(getPool())

await migrate(db, { migrationsFolder: './db/migrations' })
console.log('Migrations applied')
await getPool().end()
