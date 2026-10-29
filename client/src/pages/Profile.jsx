import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordField from '../components/PasswordField.jsx';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load user data and saved avatar from localStorage
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
      }));

      const storageKey = `cprs_avatar_${user.id || user.email}`;
      const savedAvatar = user.avatar || localStorage.getItem(storageKey);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    }
  }, [user]);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be under 5MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setAvatar(result);
      if (user) {
        const storageKey = `cprs_avatar_${user.id || user.email}`;
        localStorage.setItem(storageKey, result);
        window.dispatchEvent(new CustomEvent('cprs_avatar_change', { detail: result }));
      }
      setMessage('Profile photo updated.');
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setAvatar(null);
    if (user) {
      const storageKey = `cprs_avatar_${user.id || user.email}`;
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new CustomEvent('cprs_avatar_change', { detail: null }));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setMessage('Profile photo removed.');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (form.password && form.password !== form.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (form.password && !form.currentPassword) {
      setError('Please provide your current password to set a new password.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
    };

    if (form.password) {
      payload.password = form.password;
      payload.currentPassword = form.currentPassword;
    }

    try {
      await updateProfile(payload);
      setMessage('Profile updated successfully.');
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4 sm:py-6">
      {/* 1. Standard Profile Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar with Image Upload Place */}
          <div className="relative group shrink-0 self-center sm:self-auto">
            <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-md bg-gradient-to-tr from-blue-700 to-indigo-600 text-white">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.name || 'User avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-700">
                  <svg className="h-14 w-14 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Camera Quick Button on Avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile image"
              className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-800 text-white shadow-md transition hover:bg-blue-700 hover:scale-105"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* User Basic Info & Image Action Buttons */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {user?.name || 'Citizen User'}
              </h1>
              <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-800">
                {user?.role || 'Citizen'}
              </span>
            </div>

            <p className="text-sm text-gray-500">{user?.email}</p>

            {/* Image upload controls */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:text-gray-900"
              >
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Photo</span>
              </button>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="rounded-xl border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
                >
                  Remove
                </button>
              )}

              <span className="text-[11px] text-gray-400">JPG, PNG or WEBP · Max 5MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Feedback Alerts */}
      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-2xs">
          <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-2xs">
          <svg className="h-5 w-5 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 3. Account Details & Security Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Personal Information */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Update your primary identification and contact phone number.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                disabled={submitting}
                value={form.name}
                onChange={update('name')}
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                disabled={submitting}
                value={form.phone}
                onChange={update('phone')}
                placeholder="+880 1XXXXXXXXX"
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">Email Address</label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                />
                <span className="absolute right-3 top-3 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Email is linked to official civic credentials.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">Account Role</label>
              <div className="mt-1.5">
                <input
                  type="text"
                  disabled
                  value={(user?.role || 'Citizen').toUpperCase()}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold text-blue-900 cursor-not-allowed uppercase"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Assigned by Municipal Corporation Administrator.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Security & Password */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Security & Password</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Leave password fields blank if you do not wish to change your password.
            </p>
          </div>

          <div className="space-y-4 max-w-lg">
            <PasswordField
              id="currentPassword"
              label="Current Password"
              labelClassName="block text-sm font-semibold text-gray-900"
              disabled={submitting}
              value={form.currentPassword}
              onChange={update('currentPassword')}
              placeholder="Enter existing password to verify"
              inputClassName="rounded-xl"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                id="password"
                label="New Password"
                labelClassName="block text-sm font-semibold text-gray-900"
                disabled={submitting}
                value={form.password}
                onChange={update('password')}
                placeholder="Minimum 6 characters"
                inputClassName="rounded-xl"
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm New Password"
                labelClassName="block text-sm font-semibold text-gray-900"
                disabled={submitting}
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                placeholder="Re-enter new password"
                inputClassName="rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving Changes…</span>
              </>
            ) : (
              <span>Save Profile Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
