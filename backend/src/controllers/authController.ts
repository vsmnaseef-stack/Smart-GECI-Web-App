import type { Request, Response, NextFunction } from 'express';
import { login, register }  from '../services/authService';
import { AppError }         from '../middleware/errorHandler';
import { successResponse }  from '../utils';

// ─── loginHandler ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 *
 * Body: { "username": string, "password": string }
 *
 * 200 — { token: string, user: { id, username, role, createdAt } }
 * 400 — missing username or password field
 * 401 — invalid credentials
 */
export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password } = req.body as {
      username?: unknown;
      password?: unknown;
    };

    if (typeof username !== 'string' || username.trim() === '') {
      return next(new AppError('username is required', 400));
    }
    if (typeof password !== 'string' || password === '') {
      return next(new AppError('password is required', 400));
    }

    const result = await login(username.trim(), password);

    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

// ─── registerHandler ──────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * Admin-only (enforced by requireAdmin in the router).
 *
 * Body: { "username": string, "password": string, "role": "authorized" | "admin" }
 *
 * 201 — { user: { id, username, role, createdAt } }
 * 400 — missing / invalid fields
 * 401 — unauthenticated
 * 403 — not admin
 * 409 — username already taken
 */
export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password, role } = req.body as {
      username?: unknown;
      password?: unknown;
      role?:     unknown;
    };

    if (typeof username !== 'string' || username.trim() === '') {
      return next(new AppError('username is required', 400));
    }
    if (typeof password !== 'string' || password.length < 8) {
      return next(new AppError('password is required and must be at least 8 characters', 400));
    }
    if (typeof role !== 'string') {
      return next(new AppError("role is required ('authorized' | 'admin')", 400));
    }

    const result = await register(username.trim(), password, role);

    res.status(201).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}
