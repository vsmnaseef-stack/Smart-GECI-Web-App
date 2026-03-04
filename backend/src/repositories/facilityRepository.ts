import type { PoolClient } from 'pg';
import db from '../config/db';

// ─── Result type ─────────────────────────────────────────────────────────────

/**
 * Raw row returned by the `academic_blocks` PostGIS query.
 *
 * Extend this interface when new columns are added to the table.
 * All non-geometry columns are carried through as-is; the `geom` column
 * is intentionally excluded from SELECT to keep the payload small.
 */
export interface AcademicBlockRow {
  id:          number | string;
  name:        string;
  [key: string]: unknown;   // allow any extra columns without breaking the type
}

// ─── FacilityRepository ───────────────────────────────────────────────────────

/**
 * Data-access layer for spatial facility queries.
 *
 * All queries use PostGIS functions and parameterised `$n` placeholders.
 * No business logic lives here — only SQL + raw row returns.
 */
export const FacilityRepository = {
  /**
   * Returns every `academic_blocks` feature whose geometry contains the
   * supplied WGS-84 coordinate (longitude, latitude).
   *
   * PostGIS note: `ST_Point($1, $2)` expects (longitude, latitude) — i.e. (X, Y).
   * The caller is responsible for passing them in that order.
   *
   * Returns an empty array when no feature matches (never throws on empty).
   */
  async findByLocation(
    lng: number,
    lat: number,
    client?: PoolClient,
  ): Promise<AcademicBlockRow[]> {
    const query = `
      SELECT *
      FROM   academic_blocks
      WHERE  ST_Contains(
               geom,
               ST_SetSRID(ST_Point($1, $2), 4326)
             )
    `;
    const conn   = client ?? db;
    const result = await conn.query<AcademicBlockRow>(query, [lng, lat]);
    return result.rows;
  },
};
