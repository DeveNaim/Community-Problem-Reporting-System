import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordField from '../components/PasswordField.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      tagline="Welcome to CPRS"
      heading="Complete your registration"
      description="Create your citizen account to report municipal problems, upload photo evidence, track live progress, and help build a safer, cleaner community."
    >
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create Account</h2>
          <p className="mt-1 text-xs text-gray-500">
            Fill in your basic details below to register as an active citizen.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={update('name')}
              placeholder="e.g. John Doe"
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              placeholder="name@example.com"
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={form.phone}
              onChange={update('phone')}
              placeholder="01XXXXXXXXX"
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            placeholder="At least 8 chars with 1 number"
            helperText="Must be at least 8 characters with at least one number."
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create Citizen Account'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-800 hover:text-blue-900 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
