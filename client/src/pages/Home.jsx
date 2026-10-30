import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const CAROUSEL_SERVICES = [
  {
    id: 'road',
    title: 'Road Damage & Potholes',
    category: 'Road Damage',
    description: 'Report cracked pavement, deep potholes, and street hazards for rapid road maintenance.',
    image: '/assets/images/service-road.jpg',
    tag: 'Infrastructure',
  },
  {
    id: 'waste',
    title: 'Waste Management & Dumps',
    category: 'Waste Management',
    description: 'Alert sanitation crews to overflowing bins, illegal dumping sites, and neighborhood waste.',
    image: '/assets/images/service-waste.jpeg',
    tag: 'Sanitation',
  },
  {
    id: 'water',
    title: 'Water Leakage & Mains',
    category: 'Water Leakage',
    description: 'Flag burst water supply pipes, contaminated lines, and street flooding for plumbing dispatch.',
    image: '/assets/images/service-water.jpeg',
    tag: 'Utilities',
  },
  {
    id: 'streetlight',
    title: 'Streetlight Outages',
    category: 'Streetlight',
    description: 'Restore dark streets, replace damaged lamps, and ensure nighttime safety in your area.',
    image: '/assets/images/service-streetlight.jpeg',
    tag: 'Public Safety',
  },
  {
    id: 'drainage',
    title: 'Drainage & Waterlogging',
    category: 'Drainage',
    description: 'Clear clogged stormwater catchments, open canals, and stagnant water to prevent flooding.',
    image: '/assets/images/service-drainage.jpeg',
    tag: 'Drainage',
  },
  {
    id: 'parks',
    title: 'Public Parks & Security',
    category: 'Security',
    description: 'Report damaged public park infrastructure, playground hazards, and security concerns.',
    image: '/assets/images/service-parks.jpeg',
    tag: 'Community',
  },
];

const BENEFITS = [
  {
    step: '01',
    badge: 'Fast Submission',
    title: 'Rapid Geotagged Reporting',
    text: 'Submit civic issues in under two minutes with accurate GPS coordinates, category tagging, and multi-photo evidence from your mobile or PC.',
    highlights: ['GPS location pin', 'Photo evidence capture', '< 2 min submission'],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    step: '02',
    badge: 'Automated Routing',
    title: 'Direct Authority Dispatch',
    text: 'Eliminate bureaucratic bottlenecks. Reports are verified and routed straight to designated municipal engineering, water, or sanitation teams.',
    highlights: ['Municipal department routing', 'SLA timeline monitoring', 'Zero lost paperwork'],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    step: '03',
    badge: '100% Transparency',
    title: 'Real-Time Progress Tracking',
    text: 'Monitor every stage from initial triage to repair crew dispatch and final inspection with immutable audit timestamps and status alerts.',
    highlights: ['Stage-by-stage timeline', 'Official dispatch notes', 'Status notifications'],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    step: '04',
    badge: 'Citizen Verified',
    title: 'Accountable Resolution',
    text: 'Field teams upload photographic proof of completed work before complaints are resolved, ensuring thorough repairs and community trust.',
    highlights: ['Resolution proof photos', 'Citizen confirmation', 'Public audit trail'],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
];

export default function Home() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-slide carousel
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SERVICES.length);
    }, 5000);

    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const slide = CAROUSEL_SERVICES[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SERVICES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SERVICES.length) % CAROUSEL_SERVICES.length);
  };

  return (
    <div className="w-full text-gray-900">
      {/* 1. Full-Width 90vh Hero Carousel with Content inside Container */}
      <section
        className="relative w-full h-[90vh] min-h-[580px] max-h-[920px] overflow-hidden bg-gray-950"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Full-width Background Image */}
        <div
          key={slide.id}
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out scale-100"
          style={{ backgroundImage: `url('${slide.image}')` }}
        >
          {/* Subtle Minimalist Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/70 to-gray-900/40" />
        </div>

        {/* Content Under Container */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-12 sm:py-16">
          {/* Top category pill */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-blue-200 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {slide.tag}
            </span>
          </div>

          {/* Center Main Slide Content */}
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              {slide.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed max-w-xl">
              {slide.description}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/complaints/new"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 shadow-sm"
              >
                Report This Issue
              </Link>
              <Link
                to="/about"
                className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Know More
              </Link>
            </div>
          </div>

          {/* Bottom Bar: Slide Progress & Simple Nav Arrows */}
          <div className="flex items-center justify-between pt-3">
            {/* Minimalist Indicators */}
            <div className="flex items-center justify-center gap-2 w-full">
              {CAROUSEL_SERVICES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-10 bg-white' : 'w-3 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. About CPRS Summary Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Text Info */}
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              About CPRS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              A transparent civic platform connecting citizens with municipal authorities.
            </h2>
            <p className="text-base leading-relaxed text-gray-600">
              CPRS replaces traditional bureaucratic paperwork with an open, accountable digital
              workflow. Community members report local infrastructure defects, and municipal teams
              verify, dispatch, and document resolutions in public view.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:text-blue-900 group"
              >
                <span>Know More About Our Platform</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* Minimalist Image */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100">
              <img
                src="/assets/images/road-construction.jpg"
                alt="Civic infrastructure works"
                className="h-80 sm:h-96 w-full object-cover transition duration-300 hover:scale-102"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Services Section */}
      <section className="bg-white border-y border-gray-100 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Services
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Municipal Categories We Support
            </h2>
            <p className="text-sm text-gray-500">
              Select a category to submit an official problem report with photos and location.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {CAROUSEL_SERVICES.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-xs"
              >
                <div className="space-y-4">
                  <div className="relative h-44 w-full overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-800 transition">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <Link
                    to="/complaints/new"
                    className="text-xs font-semibold text-blue-800 hover:text-blue-900 inline-flex items-center gap-1 group-hover:underline"
                  >
                    <span>Report issue</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Polished Platform Benefits Section */}
      <section className="bg-slate-50/80 border-y border-slate-200/80 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-3 py-1 rounded-full border border-blue-200">
              Why CPRS · Platform Benefits
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Built for Citizen Speed & Public Accountability
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Every feature of CPRS is engineered to eliminate bureaucratic delay, ensure transparent municipal dispatch, and give citizens real-time visibility into local problem resolution.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div
                key={b.step}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {b.icon}
                    </div>
                    <span className="text-xs font-semibold text-gray-400 font-mono tracking-wider">
                      {b.step}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2">
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-blue-800 bg-blue-50/70 px-2.5 py-0.5 rounded-md">
                      {b.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {b.text}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-1.5">
                  {b.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Key Metrics / Trust Bar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="pt-4 md:pt-0">
                <p className="text-3xl font-extrabold text-blue-800">&lt; 2 Mins</p>
                <p className="mt-1 text-xs text-gray-500 font-medium">Avg. Submission Time</p>
              </div>
              <div className="pt-4 md:pt-0">
                <p className="text-3xl font-extrabold text-blue-800">100%</p>
                <p className="mt-1 text-xs text-gray-500 font-medium">Digital & Paperless Flow</p>
              </div>
              <div className="pt-4 md:pt-0">
                <p className="text-3xl font-extrabold text-blue-800">6 Sectors</p>
                <p className="mt-1 text-xs text-gray-500 font-medium">Municipal Services Covered</p>
              </div>
              <div className="pt-4 md:pt-0">
                <p className="text-3xl font-extrabold text-blue-800">24 / 7</p>
                <p className="mt-1 text-xs text-gray-500 font-medium">Public Grievance Access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Standard Complaint & Grievance Hub */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl">
          {/* Subtle Background Glow Accents */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-12 p-8 sm:p-12 lg:p-16 items-center">
            {/* Left: Complaint Gateway & Quick Steps */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                Municipal Grievance Desk
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Report a Civic Problem in Your Neighborhood
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Notice broken streetlights, cracked roads, hazardous waste dumps, or water leakages?
                Submit an official grievance in minutes and follow the live resolution progress.
              </p>

              {/* 3 Step Quick Flow */}
              <div className="grid gap-3 sm:grid-cols-3 pt-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
                  <span className="text-xs font-mono font-bold text-blue-400">01</span>
                  <p className="mt-1 text-sm font-semibold text-white">Choose Category</p>
                  <p className="text-xs text-slate-400 mt-0.5">Roads, waste, water, lights & more</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
                  <span className="text-xs font-mono font-bold text-blue-400">02</span>
                  <p className="mt-1 text-sm font-semibold text-white">Pin & Attach Proof</p>
                  <p className="text-xs text-slate-400 mt-0.5">Upload photos & location pin</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
                  <span className="text-xs font-mono font-bold text-blue-400">03</span>
                  <p className="mt-1 text-sm font-semibold text-white">Track Progress</p>
                  <p className="text-xs text-slate-400 mt-0.5">Live updates until work done</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/complaints/new"
                  className="rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400 hover:shadow-blue-500/35"
                >
                  Submit a Complaint Now →
                </Link>
                {user ? (
                  <Link
                    to="/complaints"
                    className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    Track My Complaints
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    Register as Citizen
                  </Link>
                )}
              </div>

              {/* Trust badges */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-white/10">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Official Municipal Ticket
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  SLA Timeline Monitored
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  100% Free Public Service
                </span>
              </div>
            </div>

            {/* Right: Realistic Complaint Case Simulation Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/20 bg-white/95 p-6 text-gray-900 shadow-2xl backdrop-blur-md space-y-5">
                {/* Case Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500">
                      Grievance Case
                    </span>
                    <p className="text-sm font-bold text-gray-900">#CP-84920</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    In Progress
                  </span>
                </div>

                {/* Complaint Details */}
                <div className="space-y-1.5">
                  <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                    Road Damage
                  </span>
                  <h4 className="text-base font-bold text-gray-900 leading-snug">
                    Deep asphalt pothole obstructing traffic on Main Boulevard
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 pt-0.5">
                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ward 7 · Sector 4, North Cross Lane
                  </p>
                </div>

                {/* Visual Status Stepper */}
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Resolution Status
                  </p>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-emerald-700 font-medium">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓</span>
                      <span>1. Complaint Submitted & Geo-Verified</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-700 font-medium">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓</span>
                      <span>2. Assigned to Public Works Engineering</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-blue-700 font-bold">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold animate-pulse">●</span>
                      <span>3. Repair Crew On-Site (Patching Asphalt)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-400 font-medium">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold">4</span>
                      <span>4. Final Photo Audit & Issue Close</span>
                    </div>
                  </div>
                </div>

                {/* Department Note */}
                <div className="rounded-lg bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-100">
                  <span className="font-semibold">Authority Note:</span> Maintenance Team #2 dispatched with cold asphalt mix. Estimated resolution within 4 hours.
                </div>

                <div className="pt-1 text-center">
                  <Link
                    to="/complaints/new"
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Have a similar issue to report?</span>
                    <span>Submit now →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
