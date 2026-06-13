import './scripts/load-env.ts'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './api/_lib/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? '',
    database: process.env.PGDATABASE ?? 'postgres',
    ssl: 'require',
  },
})
