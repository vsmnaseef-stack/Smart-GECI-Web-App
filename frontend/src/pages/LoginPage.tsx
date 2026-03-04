import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginDemoAuthorized, loginDemoAdmin, loginReal, isAuthenticated } = useAuthStore();

  // Real-login form state
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already authenticated → redirect to map
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleDemoAuthorized = () => {
    loginDemoAuthorized();
    navigate('/');
  };

  const handleDemoAdmin = () => {
    loginDemoAdmin();
    navigate('/');
  };

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setIsSubmitting(true);
    try {
      await loginReal(username.trim(), password);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string })?.message;
        toast.error(msg ?? 'Login failed. Check your credentials.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

        {/* ── header ── */}
        <div className="bg-slate-800 px-8 pt-8 pb-6 text-center">
          <span className="text-emerald-400 text-4xl">⬡</span>
          <h1 className="text-white text-xl font-bold mt-2 tracking-wide">Smart GECI</h1>
          <p className="text-slate-400 text-sm mt-1">Smart Campus GIS Platform</p>
        </div>

        <div className="px-8 py-6 flex flex-col gap-5">

          {/* ══ SECTION A: Real Login ══════════════════════════════════════ */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sign in with account
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <form onSubmit={handleRealLogin} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={isSubmitting || !username.trim() || !password}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold transition-colors"
              >
                {isSubmitting ? 'Signing in…' : 'Login'}
              </button>
            </form>
          </div>

          {/* ── divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">or demo mode</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* ══ SECTION B: Demo Login ══════════════════════════════════════ */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleDemoAuthorized}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 transition-all group"
            >
              <span className="text-xl">👤</span>
              <div className="text-left">
                <p className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">
                  Demo — Authorized User
                </p>
                <p className="text-xs text-slate-400">Access restricted campus layers</p>
              </div>
            </button>

            <button
              onClick={handleDemoAdmin}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100 transition-all group"
            >
              <span className="text-xl">🛡️</span>
              <div className="text-left">
                <p className="font-semibold text-slate-700 group-hover:text-purple-700 text-sm">
                  Demo — Admin
                </p>
                <p className="text-xs text-slate-400">Full access + Admin Console</p>
              </div>
            </button>
          </div>

          {/* ── guest ── */}
          <div className="border-t border-slate-100 pt-3 -mb-2">
            <button
              onClick={() => navigate('/')}
              className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
