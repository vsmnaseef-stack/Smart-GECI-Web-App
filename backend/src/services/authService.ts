import bcrypt from 'bcrypt';
import jwt    from 'jsonwebtoken';
import { UserRepository }  from '../repositories/userRepository';
import { AppError }        from '../middleware/errorHandler';
import { env }             from '../config/env';
import type { User, JwtPayload } from '../models/user';

// ─── Constants ────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;

// ─── login ────────────────────────────────────────────────────────────────────

export interface LoginResult {
  token: string;
  user:  User;
}

/**
 * Verifies credentials and returns a signed JWT + safe user record.
 *
 * Timing-safe: we always run bcrypt.compare even when the user is not found
 * (dummy hash) so the response time does not leak whether a username exists.
 *
 * @throws AppError(401) on invalid credentials
 */
export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  const row = await UserRepository.findByUsername(username);

  // Dummy hash used when user not found — keeps timing consistent
  const hashToCompare = row?.password_hash ?? '$2b$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const match = await bcrypt.compare(password, hashToCompare);

  if (!row || !match) {
    throw new AppError('Invalid username or password', 401);
  }

  const payload: JwtPayload = { id: row.id, role: row.role };
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  // Return safe user (no password_hash)
  const user: User = {
    id:        row.id,
    username:  row.username,
    role:      row.role,
    createdAt: row.created_at,
  };

  return { token, user };
}

// ─── register ─────────────────────────────────────────────────────────────────

export interface RegisterResult {
  user: User;
}

/**
 * Creates a new user account.  Only callable by an admin (enforced by the
 * route-level `requireAdmin` guard; this function does not re-check the caller).
 *
 * @throws AppError(409) if the username is already taken
 * @throws AppError(400) if role is not 'authorized' | 'admin'
 */
export async function register(
  username: string,
  password: string,
  role: string,
): Promise<RegisterResult> {
  // ── Role validation ────────────────────────────────────────────────────────
  if (role !== 'authorized' && role !== 'admin') {
    throw new AppError("role must be 'authorized' or 'admin'", 400);
  }

  // ── Duplicate username check ───────────────────────────────────────────────
  const existing = await UserRepository.findByUsername(username);
  if (existing) {
    throw new AppError(`Username '${username}' is already taken`, 409);
  }

  // ── Hash + persist ─────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await UserRepository.create({
    username,
    passwordHash,
    role: role as 'authorized' | 'admin',
  });

  return { user };
}
