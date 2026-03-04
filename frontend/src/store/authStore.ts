// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, UserRole } from '../types/auth';

interface AuthStore extends AuthState {
    role: UserRole;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            role: 'guest',
            loginAsAuthorized: () => set({ role: 'authorized' }),
            loginAsAdmin: () => set({ role: 'admin' }),
            logout: () => set({ role: 'guest' }),
        }),
        {
            name: 'smart-geci-auth',
        }
    )
);
