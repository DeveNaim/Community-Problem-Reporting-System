import React from 'react';

/**
 * Global React Error Boundary that catches unexpected runtime/render errors
 * and renders a fancy fallback screen with a prominent Retry button.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CPRS ErrorBoundary]', error, errorInfo);
  }

  handleRetry() {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  }

  render() {
    if (this.state.hasError) {
      const errorMessage =
        this.state.error?.message || 'An unexpected client error occurred while rendering this page.';

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-8">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-rose-200 bg-white p-8 sm:p-12 text-center shadow-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-lg shadow-rose-600/25 ring-8 ring-rose-50">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.85}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700 ring-1 ring-inset ring-rose-600/20">
              Application Error
            </span>

            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Something Went Wrong
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              The page encountered an unexpected issue. Click <strong>Retry</strong> below to recover or reload the application.
            </p>

            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-2.5 text-xs font-mono text-rose-800 break-words">
              {errorMessage}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-600 cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Retry</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer"
              >
                <span>Reload Browser</span>
              </button>

              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-5 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
              >
                <span>Return Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

