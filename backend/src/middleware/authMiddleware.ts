import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '../types/role';
import type { JwtPayload } from '../models/user';

// ─── Request augmentation ─────────────────────────────────────────────────────

/**
 * Extend Express Request with typed auth fields set by this middleware.
 *
 *   req.user  — decoded JWT payload (id + role), undefined for unauthenticated requests
 *   req.role  — always a UserRole ('guest' when no valid token is present)
 *
 * The `role` field is the single source of truth consumed by all downstream
 * guards (requireAdmin) and services (getLayerHierarchy).
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
      role:  UserRole;
    }
  }
}

// ─── authMiddleware ───────────────────────────────────────────────────────────

/**
 * Global middleware that replaces the old `roleContext` (x-role header) approach.
 *
 * Behaviour:
 *   1. If `Authorization: Bearer <token>` is present and the token is valid:
 *        - req.user = { id, role }  (decoded payload)
 *        - req.role = payload.role
 *   2. If the header is missing or the token is invalid / expired:
 *        - req.user = undefined
 *        - req.role = 'guest'
 *
 * This middleware NEVER rejects the request — routes that require
 * authentication must additionally apply the `requireAuth` guard.
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  req.role = 'guest';
  req.user = undefined;

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7); // strip "Bearer "
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Ensure the payload has the expected shape before trusting it
    if (
      typeof decoded.id   === 'string' &&
      (decoded.role === 'authorized' || decoded.role === 'admin')
    ) {
      req.user = { id: decoded.id, role: decoded.role };
      req.role = decoded.role;
    }
  } catch {
    // Expired / tampered token — treat as unauthenticated (guest)
  }

  next();
}

// ─── requireAuth ─────────────────────────────────────────────────────────────

/**
 * Route guard: rejects unauthenticated requests with 401.
 *
 * Must be placed AFTER authMiddleware in the middleware chain.
 * Use in combination with requireAdmin for admin-only routes.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        message:    'Unauthorized: valid JWT required',
        statusCode: 401,
      },
    });
    return;
  }
  next();
}
