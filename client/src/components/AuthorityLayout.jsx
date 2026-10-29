import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  extractAuthorityEmailToken,
  getAuthorityCategoryFromUser,
} from '../utils/authorityCategory.js';

const SIDEBAR_ROUTES = [
  {
    to: '/assigned',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.85}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    to: '/assigned/complaints',
    label: 'Complaints',
    end: false,
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.85}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    to: '/assigned/analytics',
    label: 'Analytics & Export',
    end: false,
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.85}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

export default function AuthorityLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const authorityCategory = getAuthorityCategoryFromUser(user);
  const emailToken = extractAuthorityEmailToken(user?.email);

  // Sidebar collapse state:
  // When xs and sm size (< 768px), automatically show only icons (collapsed = true).
  // User can also manually collapse and expand the sidebar at any time.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Header User Icon Dropdown state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (user) {
      const storageKey = `cprs_avatar_${user.id || user.email}`;
      setAvatar(user.avatar || localStorage.getItem(storageKey));
    } else {
      setAvatar(null);
    }

    const handleAvatarChange = (e) => setAvatar(e.detail);
    window.addEventListener('cprs_avatar_change', handleAvatarChange);
    return () => window.removeEventListener('cprs_avatar_change', handleAvatarChange);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
      {/* HEADER: Left side Logo ONLY, Right side User Icon ONLY (no other routes) */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-2xs sm:px-6">
        {/* Left Side: Logo (links to Home page) */}
        <Link to="/" className="flex items-center gap-2.5" aria-label="CPRS Home">
          <img
            src="/assets/images/cprs-logo_2_30.png"
            alt="CPRS Logo"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Right Side: User Icon ONLY */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-blue-50 text-blue-800 shadow-2xs transition hover:border-blue-300 hover:bg-blue-100 hover:shadow-xs cursor-pointer"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <svg className="h-5 w-5 text-blue-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2.5 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-5 shadow-xl z-50">
                <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-blue-100 bg-blue-50">
                    {avatar ? (
                      <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-8 w-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="mt-2.5 text-base font-bold text-slate-900 truncate max-w-full">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono truncate max-w-full">
                    {user.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                    <span className="inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold capitalize text-blue-800 ring-1 ring-inset ring-blue-700/15">
                      {user.role}
                    </span>
                    {authorityCategory && (
                      <span className="inline-block rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                        {authorityCategory}
                        {emailToken ? ` (.${emailToken})` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
                  >
                    <span>Edit Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* BODY: Left Side Nav + Right Main Workspace */}
      <div className="flex flex-1">
        {/* SIDEBAR NAVIGATION */}
        <aside
          aria-label="Authority Sidebar Navigation"
          className={`sticky top-16 flex h-[calc(100vh-4rem)] shrink-0 flex-col justify-between border-r border-slate-200 bg-white transition-all duration-200 select-none ${
            collapsed ? 'w-[72px] px-2.5 py-5' : 'w-64 px-3.5 py-5'
          }`}
        >
          {/* Top Section: Department Badge + Navigation Routes */}
          <div className="space-y-4">
            {!collapsed && authorityCategory && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Department Scope
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 truncate">
                  {authorityCategory}
                </p>
                {emailToken && (
                  <p className="text-xs font-mono text-slate-500">
                    Code: <span className="font-semibold text-blue-800">.{emailToken}@</span>
                  </p>
                )}
              </div>
            )}

            <nav className="space-y-1.5">
              {SIDEBAR_ROUTES.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    `group flex items-center rounded-xl py-2.5 text-sm font-medium transition-all ${
                      collapsed
                        ? 'justify-center px-2.5'
                        : 'justify-start px-3.5 gap-3'
                    } ${
                      isActive
                        ? 'bg-blue-700 text-white font-semibold shadow-sm shadow-blue-700/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.icon}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Bottom Section: Collapse/Expand Toggle & Logout at Most Bottom */}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`flex w-full items-center rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 cursor-pointer ${
                collapsed
                  ? 'justify-center px-2.5'
                  : 'justify-start px-3.5 gap-3'
              }`}
            >
              <svg
                className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                  collapsed ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.85}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
              {!collapsed && <span className="truncate">Collapse Sidebar</span>}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className={`flex w-full items-center rounded-xl border border-rose-200/80 bg-rose-50/40 py-2.5 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 cursor-pointer ${
                collapsed
                  ? 'justify-center px-2.5'
                  : 'justify-start px-3.5 gap-3'
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.85}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {!collapsed && <span className="truncate">Logout</span>}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-5 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

