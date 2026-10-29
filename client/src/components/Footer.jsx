import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/assets/images/cprs-logo_2_30.png"
                alt="CPRS Logo"
                className="h-20 w-auto object-contain brightness-110"
              />
              {/* <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">CPRS</span>
                <span className="text-[10px] font-medium tracking-wide uppercase text-blue-400">
                  Civic Portal
                </span>
              </div> */}
            </Link>
            <p className="text-xs leading-relaxed text-gray-400">
              Community Problem Reporting System connects citizens directly with municipal
              authorities to track, report, and resolve public issues transparently.
            </p>
            <div className="rounded-md border border-gray-800 bg-gray-800/60 p-2.5 text-xs text-gray-300">
              <span className="font-semibold text-white">Emergency Hotline:</span> 999 ·{' '}
              <span className="font-semibold text-white">Civic Desk:</span> 333
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link to="/" className="text-gray-400 transition hover:text-white">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 transition hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/complaints/new" className="text-gray-400 transition hover:text-white">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/complaints" className="text-gray-400 transition hover:text-white">
                  Track My Reports
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 transition hover:text-white">
                  Account Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 transition hover:text-white">
                  Staff & Citizen Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Issue Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Report Categories
            </h3>
            <ul className="mt-4 space-y-2 text-xs text-gray-400">
              <li>Road Damage & Potholes</li>
              <li>Waste Management & Dumps</li>
              <li>Water Leakage & Mains</li>
              <li>Streetlight Outages</li>
              <li>Drainage & Waterlogging</li>
              <li>Public Parks & Security</li>
            </ul>
          </div>

          {/* Column 4: Platform & Status */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Platform Status
            </h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 rounded-md bg-gray-800/80 px-3 py-2 text-gray-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-medium text-emerald-400">All Services Operational</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Official reports are verified and routed according to municipal regulations.
              </p>
              <div className="text-[11px] text-gray-500">
                Version 1.0 · Secured with TLS & JWT
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 text-center text-xs text-gray-400 sm:flex-row sm:text-left">
          <p>© {currentYear} Community Problem Reporting System (CPRS). All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-gray-500 hover:text-gray-400">Citizen Transparency</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 hover:text-gray-400">Public Accountability</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

