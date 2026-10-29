import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Fancy full-featured Error & 404 Page with a mandatory Retry button,
 * diagnostic details, and role-aware quick navigation.
 */
export default function ErrorPage({
  statusCode = 404,
  title,
  message,
  errorDetail,
  onRetry,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const is404 = Number(statusCode) === 404;

  const resolvedTitle =
    title ||
    (is404
      ? 'Page Not Found'
      : 'Unexpected Application Error');

  const resolvedMessage =
    message ||
    (is404
      ? `We couldn't find any page matching "${location.pathname}". The link may be broken, or the page may have been moved.`
      : 'Something interrupted the Community Problem Reporting System while rendering this view. Click Retry below to reload and try again.');

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'authority'
      ? '/assigned'
      : user
      ? '/complaints'
      : '/';

  const dashboardLabel =
    user?.role === 'admin'
      ? 'Admin Dashboard'
      : user?.role === 'authority'
      ? 'Authority Dashboard'
      : user
      ? 'My Complaints'
      : 'Home Page';

  function handleRetryClick() {
    setRetrying(true);
    if (typeof onRetry === 'function') {
      Promise.resolve(onRetry()).finally(() => setRetrying(false));
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-8 sm:py-12 px-4">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 sm:p-14 shadow-lg">
        {/* Decorative Background Accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -right-28 h-64 w-64 rounded-full bg-gradient-to-br from-blue-100/70 via-indigo-50/50 to-transparent blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-gradient-to-tr from-rose-100/70 via-amber-50/50 to-transparent blur-2xl"
        />

        <div className="relative flex flex-col items-center text-center">
          {/* Animated Icon + Status Code Pill */}
          <div className="relative mb-6 flex items-center justify-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl ring-8 ${
                is404
                  ? 'bg-gradient-to-br from-blue-700 to-indigo-800 shadow-blue-700/25 ring-blue-50'
                  : 'bg-gradient-to-br from-rose-600 to-red-700 shadow-rose-600/25 ring-rose-50'
              }`}
            >
              {is404 ? (
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>
            <span
              className={`absolute -bottom-2.5 rounded-full px-3 py-0.5 text-xs font-extrabold uppercase tracking-widest shadow-xs ring-2 ring-white ${
                is404
                  ? 'bg-blue-900 text-white'
                  : 'bg-rose-700 text-white'
              }`}
            >
              {is404 ? 'Error 404' : `Error ${statusCode || 500}`}
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {resolvedTitle}
          </h1>

          <p className="mt-3 max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
            {resolvedMessage}
          </p>

          {(errorDetail || location?.pathname) && (
            <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-mono text-slate-600">
              <span className="font-bold text-slate-800">
                {errorDetail ? 'Diagnostic:' : 'Requested Path:'}
              </span>
              <span className="truncate">{errorDetail || location.pathname}</span>
            </div>
          )}

          {/* Primary Action Bar — Always includes Retry Button */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={handleRetryClick}
              disabled={retrying}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-700/25 transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
            >
              <svg
                className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{retrying ? 'Retrying…' : 'Retry Page'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Go Back</span>
            </button>

            <Link
              to={dashboardPath}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-5 py-3 text-sm font-semibold text-blue-800 shadow-2xs transition hover:bg-blue-100"
            >
              <span>Go to {dashboardLabel}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

