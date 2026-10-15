import { Pool } from 'pg'

// Single shared pool across hot-reloads in dev (avoid exhausting connections).
let pool = globalThis.__adminPgPool
if (!pool) {
  if (!process.env.DATABASE_URL) {
    // Defer throwing until first query so build/import of unrelated modules doesn't crash.
    pool = null
  } else {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Railway managed Postgres terminates TLS; relax verification for the managed cert.
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 5,
    })
  }
  globalThis.__adminPgPool = pool
}

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set — the admin dashboard cannot reach Postgres.')
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 5,
    })
    globalThis.__adminPgPool = pool
  }
  return pool
}

export async function query(text, params) {
  return getPool().query(text, params)
}

// BEGIN/COMMIT must use the same connection, including all queries in between.
export async function transaction(work) {
  const client = await getPool().connect()
  try {
    await client.query('begin')
    const result = await work(client)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
