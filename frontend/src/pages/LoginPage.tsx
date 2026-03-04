import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const loginAsAuthorized = useAuthStore(state => state.loginAsAuthorized);
  const loginAsAdmin      = useAuthStore(state => state.loginAsAdmin);
  const role              = useAuthStore(state => state.role);

  // Already logged in → back to map
  if (role !== 'guest') {
    navigate('/', { replace: true });
    return null;
  }

  const handleAuthorized = () => {
    loginAsAuthorized();
    navigate('/');
  };

  const handleAdmin = () => {
    loginAsAdmin();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* header */}
        <div className="bg-slate-800 px-8 pt-8 pb-6 text-center">
          <span className="text-emerald-400 text-4xl">⬡</span>
          <h1 className="text-white text-xl font-bold mt-2 tracking-wide">Smart GECI</h1>
          <p className="text-slate-400 text-sm mt-1">Smart Campus GIS Platform</p>
        </div>

        {/* body */}
        <div className="px-8 py-8 flex flex-col gap-4">
          <p className="text-slate-500 text-sm text-center mb-2">
            Select your access level to continue
          </p>

          {/* Authorized User */}
          <button
            onClick={handleAuthorized}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 transition-all group"
          >
            <span className="text-2xl">👤</span>
            <div className="text-left">
              <p className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">
                Login as Authorized User
              </p>
              <p className="text-xs text-slate-400">Access restricted campus layers</p>
            </div>
          </button>

          {/* Admin */}
          <button
            onClick={handleAdmin}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100 transition-all group"
          >
            <span className="text-2xl">🛡️</span>
            <div className="text-left">
              <p className="font-semibold text-slate-700 group-hover:text-purple-700 text-sm">
                Login as Admin
              </p>
              <p className="text-xs text-slate-400">Full access + Admin Console</p>
            </div>
          </button>

          <div className="border-t border-slate-100 pt-4 mt-2">
            <button
              onClick={() => navigate('/')}
              className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Continue as Guest
            </button>
          </div>
        </div>

        {/* demo notice */}
        <div className="px-8 pb-6">
          <p className="text-xs text-center text-slate-300 bg-slate-50 rounded-lg p-2">
            Demo mode — no backend authentication required
          </p>
        </div>
      </div>
    </div>
  );
}
