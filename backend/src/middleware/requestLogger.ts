import morgan from 'morgan';
import type { RequestHandler } from 'express';

/**
 * Returns an appropriate Morgan logging middleware for the current environment.
 *
 * - development : `dev`   — colorized concise output
 * - production  : `combined` — Apache-style access log
 */
export function createRequestLogger(): RequestHandler {
  const format = process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev';
  return morgan(format);
}
