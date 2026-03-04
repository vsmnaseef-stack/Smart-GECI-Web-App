// types/auth.ts

export type UserRole = 'guest' | 'authorized' | 'admin';

export type AuthMode = 'demo' | 'real';

export interface AuthUser {
  id?: number | string;
  username?: string;
  role: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  authMode: AuthMode;
  /** Derived: user?.role ?? 'guest'. Kept as a field for selector convenience. */
  role: UserRole;
  isAuthenticated: boolean;
  loginDemoAuthorized: () => void;
  loginDemoAdmin: () => void;
  loginReal: (username: string, password: string) => Promise<void>;
  /** @deprecated Use loginDemoAuthorized instead */
  loginAsAuthorized: () => void;
  /** @deprecated Use loginDemoAdmin instead */
  loginAsAdmin: () => void;
  logout: () => void;
}
