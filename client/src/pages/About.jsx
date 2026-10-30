import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const STEPS = [
  {
    step: '01',
    title: 'Report',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Citizens submit a complaint with a category, description, location, and photo evidence.',
  },
  {
    step: '02',
    title: 'Verify',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Administrators review every report to eliminate duplicates and confirm legitimacy.',
  },
  {
    step: '03',
    title: 'Assign',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    text: 'Verified issues route automatically to the responsible department — roads, waste, or drainage.',
  },
  {
    step: '04',
    title: 'Resolve',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    text: 'Field crews execute the fix, post live updates, and notify the citizen once resolved.',
  },
];

const ROLES = [
  {
    title: 'Citizens',
    tag: 'Report & Track',
    image: '/assets/images/citizens-civic.jpg',
    text: 'Report problems in your neighbourhood, follow a transparent status timeline, and receive real-time notifications as work progresses.',
  },
  {
    title: 'Administrators',
    tag: 'Verify & Coordinate',
    image: '/assets/images/municipal-authority.jpeg',
    text: 'Verify incoming reports, route them to the right municipal department, oversee user access, and analyze citywide response metrics.',
  },
  {
    title: 'Authorities',
    tag: 'Inspect & Resolve',
    image: '/assets/images/city-workers.webp',
    text: 'Receive complaints assigned to your jurisdiction, dispatch field crews, publish progress notes, and close out verified repairs.',
  },
];

const CATEGORIES = [
  { name: 'Road Damage', icon: '🛣️' },
  { name: 'Waste Management', icon: '🗑️' },
  { name: 'Water Leakage', icon: '💧' },
  { name: 'Streetlight Outages', icon: '💡' },
  { name: 'Drainage & Waterlogging', icon: '🌊' },
  { name: 'Public Security & Parks', icon: '🛡️' },
  { name: 'Other Civic Concerns', icon: '📋' },
];

const VALUES = [
  {
    title: 'Transparency',
    text: 'Every single complaint features an immutable, timestamped status history visible to citizens and officials alike.',
  },
  {
    title: 'Accountability',
    text: 'Each reported issue is assigned to a designated authority and tracked with measurable service milestones.',
  },
  {
    title: 'Accessibility',
    text: 'A clean, mobile-optimized experience enabling any community member to report problems in seconds.',
  },
];

export default function About() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-4">
      {/* 1. Hero Section with Side Visual Card */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              About CPRS Civic Network
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl leading-tight">
              Connecting citizens with the people who fix things
            </h1>
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              The Community Problem Reporting System (CPRS) is an open civic platform designed
              to empower residents to report community issues directly to local authorities —
              providing full transparency and accountability at every stage.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> Real-Time Status Tracking
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> Direct Municipal Authority Routing
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> Transparent Public Timelines
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-xl shadow-lg border border-gray-100">
              <img
                src="/assets/images/city-workers.jpg"
                alt="Municipal construction crew at work"
                className="h-64 sm:h-72 w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Municipal Action
                </p>
                <p className="text-sm font-bold">
                  On-ground crews resolving reported infrastructure issues
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mission & Vision with Relevant Construction Images */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Our Purpose & Vision
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Building reliable digital civic bridges between residents and municipal public works.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Mission Card */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src="/assets/images/road-construction.jpeg"
                alt="Road maintenance crew repairing street"
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
              />
              <span className="absolute top-3 left-3 rounded-full bg-blue-800/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                Civic Mission
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Potholes, broken streetlights, water mains bursts, and overflowing waste bins
                  diminish community quality of life. CPRS replaces slow bureaucracy with an
                  instant digital conduit so reports reach designated field engineers immediately,
                  ensuring faster resolution.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-blue-800">
                <span>Fast, verified dispatch to municipal authorities</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src="/assets/images/urban-community.jpeg"
                alt="Clean modern city skyline and infrastructure"
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
              />
              <span className="absolute top-3 left-3 rounded-full bg-emerald-800/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                Future Vision
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  A resilient community where every resident takes pride in participating in civic
                  stewardship. We envision well-maintained cities where municipal agencies operate
                  with modern transparency, actionable public data, and rapid repair lifecycles.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-emerald-800">
                <span>Clean, safe, and accountable neighborhoods</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (Steps Progress with Circles, Inner Count/Title, Outer Descriptions & Connecting Arrows) */}
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/60 p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
            Step-by-Step Workflow
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            How CPRS Works
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            A clear, 4-stage transparent pipeline from your first report to verified resolution.
          </p>
        </div>

        {/* Steps Progress Flow */}
        <div className="mt-12">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4 lg:gap-4">
            {STEPS.map((s, index) => (
              <div key={s.step} className="relative flex flex-col items-center">
                {/* Connecting Arrow for Desktop (between circles) */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-16 left-[calc(50%+4rem)] w-[calc(100%-8rem)] items-center justify-center z-0">
                    <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 to-indigo-400" />
                    <svg
                      className="h-5 w-5 text-indigo-500 shrink-0 -ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}

                {/* Circle Component: Inside has count + title + icon */}
                <div className="relative z-10 flex h-32 w-32 sm:h-36 sm:w-36 flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-xl ring-4 ring-blue-100 transition-all duration-300 hover:scale-105 hover:ring-blue-200">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                    Step {s.step}
                  </span>
                  <div className="my-0.5 text-blue-200">{s.icon}</div>
                  <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                    {s.title}
                  </span>
                </div>

                {/* Outside of Circle (Bottom): Description */}
                <div className="mt-4 text-center max-w-[240px]">
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    {s.text}
                  </p>
                </div>

                {/* Connecting Arrow for Mobile (pointing down) */}
                {index < STEPS.length - 1 && (
                  <div className="flex lg:hidden my-3 text-blue-600">
                    <svg className="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Who Uses CPRS (Roles with Photos) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
            The Community Stakeholders
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Who Uses CPRS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Three dedicated stakeholder roles collaborating seamlessly in one centralized platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {ROLES.map((r) => (
            <div
              key={r.title}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <img
                  src={r.image}
                  alt={r.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-blue-900 shadow-xs">
                  {r.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">{r.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                  {r.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. What You Can Report (Categories Grid) & Core Values */}
      <section className="grid gap-8 lg:grid-cols-12">
        {/* Categories */}
        <div className="lg:col-span-7 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">What You Can Report</h2>
          <p className="mt-1 text-xs text-gray-500">
            Submit issues with photos, descriptions, and exact street locations.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 p-3 text-xs font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50/50"
              >
                <span className="text-lg">{c.icon}</span>
                <span className="leading-tight">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="lg:col-span-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Core Principles</h2>
            <p className="mt-1 text-xs text-gray-500">
              Guiding how civic accountability is upheld in every interaction.
            </p>
            <div className="mt-5 space-y-4">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-lg bg-gray-50 p-3.5 border border-gray-100">
                  <h3 className="text-sm font-bold text-blue-900">{v.title}</h3>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Banner with Dark Drop Overlay */}
      <section
        className="relative overflow-hidden rounded-2xl bg-cover bg-center p-8 text-center text-white sm:p-12"
        style={{ backgroundImage: "url('/assets/images/login-banner.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/80 to-gray-950/85 backdrop-blur-[1px]" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-900">
            Take Action Today
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            See a problem in your neighborhood?
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-xl mx-auto">
            It takes under two minutes to file a verified report with photos. Join your fellow
            citizens in shaping a safer, better-maintained community.
          </p>
          <div className="pt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/complaints/new"
              className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-blue-900 shadow-md transition hover:bg-gray-100"
            >
              Report an Issue Now
            </Link>
            {!user ? (
              <Link
                to="/register"
                className="rounded-lg border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Create Free Citizen Account
              </Link>
            ) : (
              <Link
                to="/complaints"
                className="rounded-lg border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Track My Complaints
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
