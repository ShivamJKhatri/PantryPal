import './load-env.ts'

import { getPool } from '../db/index.ts'

const result = await getPool().query('SELECT NOW() AS now, current_database() AS db')
console.log('Connected:', result.rows[0])
await getPool().end()
