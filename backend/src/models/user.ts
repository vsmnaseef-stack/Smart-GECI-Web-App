// ─── Database row (snake_case mirrors DB column names) ───────────────────────

export interface UserRow {
  id:            string;
  username:      string;
  password_hash: string;
  role:          'authorized' | 'admin';
  created_at:    Date;
}

// ─── Application model (no password field) ───────────────────────────────────

/**
 * Safe public representation of a user — password_hash intentionally omitted.
 */
export interface User {
  id:        string;
  username:  string;
  role:      'authorized' | 'admin';
  createdAt: Date;
}

// ─── JWT payload ──────────────────────────────────────────────────────────────

/**
 * Shape embedded inside the signed JWT.
 * Kept minimal — only what downstream code needs from a token.
 */
export interface JwtPayload {
  id:   string;
  role: 'authorized' | 'admin';
}

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CreateUserInput {
  username:     string;
  passwordHash: string;
  role:         'authorized' | 'admin';
}

// ─── Row → Model mapper ───────────────────────────────────────────────────────

export function rowToUser(row: UserRow): User {
  return {
    id:        row.id,
    username:  row.username,
    role:      row.role,
    createdAt: row.created_at,
  };
}
