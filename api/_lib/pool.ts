import { Signer } from '@aws-sdk/rds-signer'
import { attachDatabasePool } from '@vercel/functions'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { Pool } from 'pg'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

let pool: Pool | undefined

export function getPool(): Pool {
  if (pool) {
    return pool
  }

  const signer = new Signer({
    hostname: requireEnv('PGHOST'),
    port: Number(process.env.PGPORT ?? 5432),
    username: requireEnv('PGUSER'),
    region: requireEnv('AWS_REGION'),
    credentials: awsCredentialsProvider({
      roleArn: requireEnv('AWS_ROLE_ARN'),
      clientConfig: { region: requireEnv('AWS_REGION') },
    }),
  })

  pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE ?? 'postgres',
    password: async () => await signer.getAuthToken(),
    port: Number(process.env.PGPORT ?? 5432),
    ssl: { rejectUnauthorized: false },
  })

  attachDatabasePool(pool)
  return pool
}
