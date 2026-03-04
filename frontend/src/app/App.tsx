import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

/**
 * On mount, if the persisted session is a real JWT session, validate it.
 * If the backend returns 401 (token expired), the api interceptor will auto-logout.
 * Demo sessions need no validation — they are always "valid".
 */
function useAuthRestore() {
  const authMode = useAuthStore(state => state.authMode);
  const logout   = useAuthStore(state => state.logout);
  const token    = useAuthStore(state => state.token);

  useEffect(() => {
    if (authMode !== 'real' || !token) return;
    api.get('/auth/me').catch(() => {
      // If /auth/me fails with non-401 (network error etc.) don't force logout
      // The api interceptor handles the 401 case automatically
      logout();
    });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function App() {
  useAuthRestore();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '0.875rem' },
        }}
      />
    </>
  );
}
