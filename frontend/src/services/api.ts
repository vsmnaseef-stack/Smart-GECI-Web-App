import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── request interceptor (attach JWT when available) ─────────────────────────
api.interceptors.request.use(
  (config) => {
    // Future: read JWT from authStore or localStorage and attach as Bearer token
    // const token = localStorage.getItem('smart-geci-token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── response interceptor (global error handling) ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Future: handle 401 → redirect to login, 403 → show forbidden
    return Promise.reject(error);
  },
);

export default api;
