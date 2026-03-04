import { Pool } from 'pg';
import { env } from './env';

/**
 * Singleton pg connection pool.
 * Import `db` and call `db.query(...)` for all database interactions.
 * Never create a second Pool instance — reuse this one everywhere.
 */
const db = new Pool({
  host:     env.DB_HOST,
  port:     env.DB_PORT,
  database: env.DB_NAME,
  user:     env.DB_USER,
  password: env.DB_PASSWORD,
  ssl:      env.DB_SSL ? { rejectUnauthorized: false } : false,

  // ── Pool tuning ──────────────────────────────────────────────────────
  max:                     20,      // maximum active connections
  min:                      2,      // keep at least 2 warm
  idleTimeoutMillis:    30_000,      // idle client closed after 30 s
  connectionTimeoutMillis: 5_000,   // throw if no connection within 5 s
  allowExitOnIdle:         false,    // keep process alive between requests
});

// Surface pool-level errors so they don't disappear silently
db.on('error', (err: Error) => {
  console.error('[DB] Unexpected idle-client error:', err.message);
});

db.on('connect', () => {
  if (env.isDevelopment) {
    console.debug('[DB] New client connected to pool.');
  }
});

// ─── connectDb ────────────────────────────────────────────────────────────────

/**
 * Validates connectivity at startup with a lightweight round-trip query.
 * Non-fatal: the server starts regardless so that it can serve traffic
 * once the DB becomes available (e.g. container startup ordering).
 */
export async function connectDb(): Promise<void> {
  try {
    const client = await db.connect();
    const { rows } = await client.query<{ now: string; version: string }>(
      'SELECT NOW() AS now, version() AS version',
    );
    client.release();
    const pg = rows[0];
    console.log(`[DB] Connected — server time: ${pg.now}`);
    console.log(`[DB] PostgreSQL: ${pg.version.split(',')[0]}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[DB] Connection failed: ${message}`);
    console.warn(
      '[DB] Server will start but DB queries will fail until PostgreSQL is reachable.',
    );
  }
}

// ─── disconnectDb ─────────────────────────────────────────────────────────────

/**
 * Drains the connection pool gracefully.
 * Call this during SIGTERM / SIGINT shutdown so in-flight queries finish
 * before the process exits.
 */
export async function disconnectDb(): Promise<void> {
  try {
    await db.end();
    console.log('[DB] Connection pool drained and closed.');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[DB] Error while closing pool: ${message}`);
  }
}

export default db;
