export function SkeletonLine({ className = 'h-4 w-full', rounded = 'rounded-md' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200/80 ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

export function ComplaintListSkeleton({ count = 4 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <ul className="divide-y divide-gray-100">
        {Array.from({ length: count }).map((_, idx) => (
          <li key={idx} className="p-4 sm:px-6 animate-pulse">
            <div className="flex items-center gap-4">
              {/* Image thumbnail skeleton slot */}
              <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl bg-gray-200" />

              <div className="flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 flex-1 max-w-md">
                  {/* Title */}
                  <div className="h-5 w-3/4 rounded-md bg-gray-200/90" />
                  {/* ID · Category · Location */}
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-20 rounded bg-gray-200" />
                    <span className="text-gray-300">·</span>
                    <div className="h-3.5 w-24 rounded bg-gray-200" />
                    <span className="text-gray-300">·</span>
                    <div className="h-3.5 w-32 rounded bg-gray-200" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  <div className="h-6 w-24 rounded-full bg-gray-200" />
                  {/* Date */}
                  <div className="h-3.5 w-16 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotificationSkeleton({ count = 3 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs divide-y divide-gray-100">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 animate-pulse flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-4/5 rounded bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="h-3 w-28 rounded bg-gray-200" />
              <div className="h-3 w-16 rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-4 w-12 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export function ComplaintDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back button & Header skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 rounded bg-gray-200" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-8 w-3/5 rounded-lg bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <span className="text-gray-300">·</span>
              <div className="h-4 w-28 rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-7 w-28 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* Grid: Main Info + Timeline Sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="h-32 rounded-lg bg-gray-200" />
                <div className="h-32 rounded-lg bg-gray-200" />
                <div className="h-32 rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Timeline Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="space-y-6 pt-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-3 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-40 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

