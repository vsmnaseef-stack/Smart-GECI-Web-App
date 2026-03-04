/**
 * Simple SQL migration runner.
 *
 * Usage:
 *   npx ts-node src/scripts/migrate.ts
 *
 * Reads every *.sql file from /migrations in filename order and
 * executes them inside a single transaction.  A `schema_migrations`
 * tracking table prevents files from running twice.
 */

import path from 'path';
import fs   from 'fs';
import { Pool } from 'pg';
import dotenv    from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function migrate(): Promise<void> {
  const pool = new Pool({
    host:     process.env['DB_HOST']     ?? 'localhost',
    port:     parseInt(process.env['DB_PORT'] ?? '5432', 10),
    database: process.env['DB_NAME']!,
    user:     process.env['DB_USER']!,
    password: process.env['DB_PASSWORD']!,
    ssl:      process.env['DB_SSL'] === 'true' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    // ── Ensure tracking table exists ──────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // ── Collect migration files ────────────────────────────────────────────
    const migrationsDir = path.resolve(__dirname, '../../migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();                   // lexicographic = 001_, 002_, 003_ …

    if (files.length === 0) {
      console.log('[Migrate] No migration files found.');
      return;
    }

    // ── Execute each file if not already applied ──────────────────────────
    for (const file of files) {
      const { rows } = await client.query<{ filename: string }>(
        'SELECT filename FROM schema_migrations WHERE filename = $1',
        [file],
      );

      if (rows.length > 0) {
        console.log(`[Migrate] Skipping (already applied): ${file}`);
        continue;
      }

      console.log(`[Migrate] Applying: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`[Migrate] ✓ Applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('[Migrate] All migrations up to date.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('[Migrate] Failed:', message);
  process.exit(1);
});
