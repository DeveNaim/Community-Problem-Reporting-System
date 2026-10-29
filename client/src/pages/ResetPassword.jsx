import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordField from '../components/PasswordField.jsx';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      navigate('/login', { replace: true, state: { message: 'Password reset successful. Please log in.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout
        tagline="Recover your account"
        heading="Invalid Reset Link"
        description="This password reset link is invalid or has expired. Please request a new link from the forgot password page."
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Link Invalid or Expired</h2>
          <p className="mt-2 text-xs text-gray-500">
            The token provided in the URL is missing or no longer valid.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-block rounded-lg bg-blue-800 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      tagline="Recover your account"
      heading="Reset your password"
      description="Choose a strong, unique password to secure your account. Once updated, you can immediately sign in with your new credentials."
    >
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Set New Password</h2>
          <p className="mt-1 text-xs text-gray-500">
            Please enter and confirm your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="password"
            label="New Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            helperText="Minimum 8 characters with at least 1 number."
          />

          <PasswordField
            id="confirm"
            label="Confirm Password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Resetting…' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center text-xs text-gray-500">
          <Link to="/login" className="font-semibold text-blue-800 hover:text-blue-900 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
