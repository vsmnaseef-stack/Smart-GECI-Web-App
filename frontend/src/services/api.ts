import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Read persisted auth state from localStorage (avoids circular import with authStore). */
function getPersistedAuth(): { token?: string; authMode?: string } {
  try {
    const raw = localStorage.getItem('smart-geci-auth');
    if (!raw) return {};
    return (JSON.parse(raw) as { state?: { token?: string; authMode?: string } }).state ?? {};
  } catch {
    return {};
  }
}

// ─── request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const { token } = getPersistedAuth();
    // Attach real JWT; skip demo-token to avoid sending it as a Bearer credential
    if (token && token !== 'demo-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── response interceptor: global error handling ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const { authMode } = getPersistedAuth();
      // Only auto-logout for real sessions; demo sessions remain intact
      if (authMode === 'real') {
        localStorage.removeItem('smart-geci-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
