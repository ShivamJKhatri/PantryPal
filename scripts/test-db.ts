import 'dotenv/config'

import { pool } from '../db/index.ts'

const result = await pool.query('SELECT NOW() AS now, current_database() AS db')
console.log('Connected:', result.rows[0])
await pool.end()
