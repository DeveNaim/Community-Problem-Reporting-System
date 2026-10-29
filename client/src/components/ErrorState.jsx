import { Link } from 'react-router-dom';

/**
 * Fancy, polished Error State component for CPRS client pages.
 * Always includes a prominent "Retry" button (calls `onRetry` or reloads current view).
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an unexpected issue while loading this data. Please check your connection and try again.',
  errorDetail = null,
  onRetry,
  retrying = false,
  retryLabel = 'Retry Now',
  backLink = null,
  backLabel = 'Go Back',
  onDismiss = null,
  variant = 'card', // 'card' | 'banner'
  className = '',
}) {
  const handleRetry = () => {
    if (typeof onRetry === 'function') {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  if (variant === 'banner') {
    return (
      <div
        role="alert"
        className={`relative overflow-hidden rounded-2xl border border-rose-200/90 bg-gradient-to-r from-rose-50 via-white to-rose-50/60 p-4 sm:px-5 shadow-xs ${className}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 ring-1 ring-inset ring-rose-600/20 shadow-2xs">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Error
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-rose-700 font-medium break-words">
                {errorDetail || message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 disabled:opacity-60 cursor-pointer"
            >
              <svg
                className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`}
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
              <span>{retrying ? 'Retrying…' : retryLabel}</span>
            </button>

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss error"
                className="rounded-xl border border-rose-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`relative overflow-hidden rounded-3xl border border-rose-200/80 bg-white p-8 sm:p-12 text-center shadow-sm ${className}`}
    >
      {/* Decorative Soft Gradient Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-gradient-to-b from-rose-100/70 via-amber-50/40 to-transparent blur-2xl"
      />

      <div className="relative mx-auto max-w-lg flex flex-col items-center">
        {/* Layered Icon Badge */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl bg-rose-100/80 animate-pulse"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-lg shadow-rose-600/25 ring-4 ring-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.85}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Status Pill */}
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
          Request Interrupted
        </span>

        {/* Title & Description */}
        <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>

        {/* Technical Error Detail Box */}
        {errorDetail && (
          <div className="mt-4 w-full rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-2.5 text-xs font-mono text-rose-800 break-words">
            {errorDetail}
          </div>
        )}

        {/* Action Buttons — Always includes Retry */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
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
            <span>{retrying ? 'Retrying…' : retryLabel}</span>
          </button>

          {backLink && (
            <Link
              to={backLink}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span>{backLabel}</span>
            </Link>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              <span>Dismiss</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

