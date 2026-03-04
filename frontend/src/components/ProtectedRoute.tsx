import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: UserRole;
}

/**
 * Renders `children` only when the current role matches `requiredRole`.
 * Works for both demo and real auth modes — role is always derived from the store.
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const role = useAuthStore(state => state.role);

  if (role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
