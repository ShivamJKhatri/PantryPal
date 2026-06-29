import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envLocalPath = path.join(projectRoot, '.env.local')

dotenv.config({ path: envLocalPath })
dotenv.config({ path: path.join(projectRoot, '.env') })

if (!process.env.PGHOST) {
  console.error(
    [
      'Missing PGHOST.',
      'Vercel marks Aurora vars as Sensitive, so `vercel env pull` downloads them as empty strings.',
      'Fix: Vercel Dashboard -> lettuceeat -> Settings -> Environment Variables',
      'Reveal each PG* and AWS_* value and paste them into .env.local manually.',
    ].join('\n'),
  )
}
