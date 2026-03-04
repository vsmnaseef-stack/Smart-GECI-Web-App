import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// ─── lazy-loaded pages ────────────────────────────────────────────────────────
const MapPage   = lazy(() => import('@/pages/MapPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));

const PageFallback = (
  <div className="flex items-center justify-center h-screen w-screen bg-gray-50 text-gray-500 text-sm">
    Loading…
  </div>
);

// ─── router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Suspense fallback={PageFallback}><MapPage /></Suspense>,
  },
  {
    path: '/login',
    element: <Suspense fallback={PageFallback}><LoginPage /></Suspense>,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <Suspense fallback={PageFallback}><AdminPage /></Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
