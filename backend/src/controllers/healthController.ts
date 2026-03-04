import type { Request, Response, NextFunction } from 'express';
import db from '../config/db';

/**
 * GET /health
 *
 * Returns server and database connectivity status.
 * Safe for load-balancer / uptime monitoring tools.
 */
export async function healthCheck(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Lightweight DB round-trip
    const { rows } = await db.query<{ now: string }>('SELECT NOW() AS now');
    const dbTime = rows[0]?.now ?? null;

    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'] ?? 'unknown',
      database: {
        connected: true,
        serverTime: dbTime,
      },
    });
  } catch (err) {
    // DB is down but the API is still up — degrade gracefully
    const message = err instanceof Error ? err.message : String(err);
    res.status(200).json({
      success: true,
      status: 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'] ?? 'unknown',
      database: {
        connected: false,
        error: message,
      },
    });

    // Do NOT call next(err) — degraded is not a 500
    void next;
  }
}
