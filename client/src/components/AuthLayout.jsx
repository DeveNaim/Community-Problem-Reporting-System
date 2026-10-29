export default function AuthLayout({
  badge = 'Community Problem Reporting System',
  tagline = 'Welcome to CPRS',
  heading = 'Citizen & Authority Portal',
  description = 'Empowering residents to report municipal problems, track real-time resolution timelines, and collaborate directly with local city authorities.',
  children,
}) {
  return (
    <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl my-10">
      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Banner Column: sm vertical row (top), md: 6 cols, xl: 8 cols */}
        <div
          className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-cover bg-center p-6 text-white sm:min-h-[360px] sm:p-10 md:col-span-6 md:min-h-[640px] md:p-12 xl:col-span-8"
          style={{ backgroundImage: "url('/assets/images/login-banner.jpg')" }}
        >
          {/* Grayish Drop Effect / Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-900/70 to-gray-900/50 backdrop-blur-[1px]" />

          {/* Top content */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {badge}
            </span>
          </div>

          {/* Bottom descriptive content about CPRS */}
          <div className="relative z-10 max-w-2xl space-y-4 pt-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-400 sm:text-base">
                {tagline}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-gray-200 sm:text-base sm:leading-relaxed">
              {description}
            </p>

            {/* Feature highlights */}
            <div className="hidden pt-2 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-white/15">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Direct Reporting</p>
                <p className="text-[11px] text-gray-300">Fast submission with categories & photo evidence</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Verified Action</p>
                <p className="text-[11px] text-gray-300">Assigned directly to responsible authorities</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Live Tracking</p>
                <p className="text-[11px] text-gray-300">Transparent status updates from start to finish</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Component Column: sm vertical row (bottom), md: 6 cols, xl: 4 cols */}
        <div className="flex flex-col justify-center bg-white p-6 sm:p-8 md:col-span-6 md:p-10 xl:col-span-4">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}