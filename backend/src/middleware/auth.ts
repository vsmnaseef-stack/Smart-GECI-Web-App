import type { Request, Response, NextFunction } from 'express';

/**
 * Placeholder: attach auth context to each request.
 * Replace with real JWT verification when authentication is implemented.
 *
 * Reads the `Authorization: Bearer <token>` header and attaches a decoded
 * user object to `req.user`. If no token is present the request continues
 * as a guest (unauthenticated) — actual route protection is enforced by
 * `requireAuth` / `requireRole` guards on individual routes.
 */
export function authContext(_req: Request, _res: Response, next: NextFunction): void {
  // TODO: decode JWT and attach req.user
  // const token = req.headers.authorization?.split(' ')[1];
  // if (token) { req.user = verifyToken(token); }
  next();
}

/**
 * Guard: requires an authenticated user (any role).
 */
export function requireAuth(_req: Request, _res: Response, next: NextFunction): void {
  // TODO: check req.user is set
  // if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized', statusCode: 401 } });
  next();
}

/**
 * Guard: requires a specific role.
 */
export function requireRole(_role: string) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // TODO: check req.user.role === role
    next();
  };
}
