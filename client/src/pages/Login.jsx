import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordField from '../components/PasswordField.jsx';

export default function Login() {
  const { login, restrictedNotice, clearRestrictedNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from;
  const successMessage = location.state?.message;

  function defaultPathForRole(role) {
    if (role === 'admin') return '/admin';
    if (role === 'authority') return '/assigned';
    return '/complaints';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsRestricted(false);
    if (clearRestrictedNotice) clearRestrictedNotice();
    setSubmitting(true);

    try {
      const loggedInUser = await login(email, password);
      const destination = from || defaultPathForRole(loggedInUser.role);
      navigate(destination, { replace: true });
    } catch (err) {
      const restricted =
        err.restricted ||
        err.status === 403 ||
        err.message?.toLowerCase().includes('restricted') ||
        err.message?.toLowerCase().includes('blocked');

      setIsRestricted(Boolean(restricted));
      setError(
        err.message || 'Unable to sign in. Please verify your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const activeRestrictedMessage =
    (isRestricted && error) || restrictedNotice || null;

  return (
    <AuthLayout
      tagline="Welcome back"
      heading="Login your account"
      description="Access your CPRS citizen or authority dashboard to track report timelines, submit municipal issues, and communicate directly with field response teams."
    >
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sign in</h2>
          <p className="mt-1 text-xs text-gray-500">
            Enter your registered email and password to access your account.
          </p>
        </div>

        {successMessage && !activeRestrictedMessage && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Dedicated Account Restricted Banner */}
        {activeRestrictedMessage ? (
          <div className="mb-5 rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-4 text-rose-900 shadow-xs animate-shake">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                  <span>Account Access Restricted</span>
                  <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                    Disabled
                  </span>
                </h3>
                <p className="mt-1 text-xs font-medium text-rose-800 leading-relaxed">
                  {activeRestrictedMessage}
                </p>
                <div className="mt-2.5 rounded-lg bg-white/70 px-3 py-1.5 text-[11px] font-medium text-rose-900 border border-rose-200/80">
                  An administrator has disabled login privileges for this account. If you believe this is an error, please reach out to municipal support.
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2">
            <svg className="h-4 w-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (isRestricted) setIsRestricted(false);
              }}
              placeholder="name@example.com"
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (isRestricted) setIsRestricted(false);
            }}
            placeholder="••••••••"
            rightHeaderAction={
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-blue-800 hover:text-blue-900 hover:underline"
              >
                Forgot password?
              </Link>
            }
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center text-xs text-gray-500">
          Do not have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-800 hover:text-blue-900 hover:underline">
            Register as Citizen
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
