export default function AdminNav({ currentTitle, subtitle, action }) {
  return (
    <div className="border-b border-slate-200 pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Admin Workspace
            </span>
            <span className="text-sm text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-600">{currentTitle}</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {currentTitle}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-slate-600 max-w-3xl leading-relaxed">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
