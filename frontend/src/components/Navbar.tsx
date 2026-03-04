import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const role = useAuthStore(state => state.role);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-5 py-2.5 bg-slate-800 text-white shadow-md z-50 shrink-0">
      {/* ── brand ── */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <span className="text-emerald-400 text-xl font-bold tracking-tight">⬡</span>
        <span className="text-base font-semibold tracking-wide">Smart GECI</span>
        <span className="text-xs text-slate-400 font-normal hidden sm:inline">
          Smart Campus GIS
        </span>
      </button>

      {/* ── role badge ── */}
      <div className="flex items-center gap-3">
        {role !== 'guest' && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              role === 'admin'
                ? 'bg-purple-700 text-purple-100'
                : 'bg-emerald-700 text-emerald-100'
            }`}
          >
            {role === 'admin' ? 'Admin' : 'Authorized User'}
          </span>
        )}

        {/* Admin Console — only for admins */}
        {role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 transition-colors font-medium"
          >
            Admin Console
          </button>
        )}

        {/* Login / Logout */}
        {role === 'guest' ? (
          <button
            onClick={() => navigate('/login')}
            className="text-sm px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 transition-colors font-medium"
          >
            Login
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1 rounded bg-slate-600 hover:bg-slate-500 transition-colors font-medium"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
