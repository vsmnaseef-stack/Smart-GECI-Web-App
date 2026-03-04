// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { AuthState, AuthUser, UserRole } from '../types/auth';

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the x-role header for demo mode requests.
 * Safe to call outside React components (uses getState, not hook).
 */
export function getDemoRoleHeaders(): Record<string, string> {
  const { authMode, user } = useAuthStore.getState();
  if (authMode === 'demo' && user) {
    return { 'x-role': user.role };
  }
  return {};
}

// ─── store ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      authMode: 'demo',
      role: 'guest' as UserRole,
      isAuthenticated: false,

      // ── demo login ──────────────────────────────────────────────────────
      loginDemoAuthorized: () => {
        const user: AuthUser = { role: 'authorized' };
        set({ user, token: 'demo-token', authMode: 'demo', role: 'authorized', isAuthenticated: true });
      },

      loginDemoAdmin: () => {
        const user: AuthUser = { role: 'admin' };
        set({ user, token: 'demo-token', authMode: 'demo', role: 'admin', isAuthenticated: true });
      },

      // ── real login ──────────────────────────────────────────────────────
      loginReal: async (username: string, password: string) => {
        const response = await axios.post<{ token: string; user: AuthUser }>(
          `${API_BASE}/auth/login`,
          { username, password },
        );
        const { token, user } = response.data;
        set({
          user,
          token,
          authMode: 'real',
          role: user.role,
          isAuthenticated: true,
        });
        toast.success(`Welcome back, ${user.username ?? user.role}!`);
      },

      // ── logout ──────────────────────────────────────────────────────────
      logout: () => {
        set({ user: null, token: null, authMode: 'demo', role: 'guest', isAuthenticated: false });
      },

      // ── deprecated aliases (backward-compat) ────────────────────────────
      loginAsAuthorized: () => {
        const user: AuthUser = { role: 'authorized' };
        set({ user, token: 'demo-token', authMode: 'demo', role: 'authorized', isAuthenticated: true });
      },

      loginAsAdmin: () => {
        const user: AuthUser = { role: 'admin' };
        set({ user, token: 'demo-token', authMode: 'demo', role: 'admin', isAuthenticated: true });
      },
    }),
    {
      name: 'smart-geci-auth',
      // Only persist the serialisable data; actions are recreated from the store definition
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        authMode: state.authMode,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
