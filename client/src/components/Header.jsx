import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../api/client.js';

const citizenLinks = [
  { to: '/complaints', label: 'My Complaints' },
  { to: '/complaints/new', label: 'Submit Complaint' },
  { to: '/about', label: 'About' },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard' },
  { to: '/about', label: 'About' },
];

const authorityLinks = [
  { to: '/assigned', label: 'Authority Dashboard' },
  { to: '/about', label: 'About' },
];

function getNavLinks(role) {
  if (role === 'admin') return adminLinks;
  if (role === 'authority') return authorityLinks;
  return citizenLinks;
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);

  // Lazy Notification State (fetched ONLY when notification button is clicked)
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navLinks = getNavLinks(user?.role);

  // Sync avatar from localStorage and live custom events
  useEffect(() => {
    if (user) {
      const storageKey = `cprs_avatar_${user.id || user.email}`;
      setAvatar(user.avatar || localStorage.getItem(storageKey));
    } else {
      setAvatar(null);
      setNotifications(null);
      setNotifOpen(false);
    }

    const handleAvatarChange = (e) => {
      setAvatar(e.detail);
    };

    window.addEventListener('cprs_avatar_change', handleAvatarChange);
    return () => window.removeEventListener('cprs_avatar_change', handleAvatarChange);
  }, [user]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications API ONLY when user clicks the notification icon
  async function fetchNotifications() {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const data = await apiFetch('/api/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      setNotifError(err.message || 'Failed to load notifications.');
    } finally {
      setNotifLoading(false);
    }
  }

  async function handleToggleNotifications() {
    const nextState = !notifOpen;
    setNotifOpen(nextState);
    setUserMenuOpen(false);

    // Call notification API that time only when opened
    if (nextState) {
      await fetchNotifications();
    }
  }

  async function handleMarkRead(notificationId) {
    try {
      await apiFetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev ? prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)) : []
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  const unreadCount = notifications
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-800'
        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-800'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-base font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 font-semibold text-blue-800'
        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-800'
    }`;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo → Home */}
        <Link to="/" className="flex h-full items-center" aria-label="CPRS Home">
          <img
            src="/assets/images/cprs-logo_2_30.png"
            alt="CPRS - Community Problem Reporting System"
            className="h-full w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth Controls with Notification Icon & User Menu Button */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* 1. Notification Icon Button (Lazy-fetched on click) */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  aria-label="View notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50/80 text-gray-700 transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={fetchNotifications}
                        disabled={notifLoading}
                        className="text-xs text-blue-700 hover:text-blue-900 font-medium disabled:opacity-50"
                      >
                        {notifLoading ? 'Refreshing…' : 'Refresh'}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifLoading ? (
                        <div className="p-4 space-y-3 animate-pulse">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-1.5">
                              <div className="h-3.5 w-3/4 rounded bg-gray-200" />
                              <div className="h-3 w-1/3 rounded bg-gray-100" />
                            </div>
                          ))}
                        </div>
                      ) : notifError ? (
                        <div className="p-4 text-center text-xs text-red-600 space-y-2">
                          <p>{notifError}</p>
                          <button
                            type="button"
                            onClick={fetchNotifications}
                            className="font-bold underline text-red-800"
                          >
                            Retry
                          </button>
                        </div>
                      ) : !notifications || notifications.length === 0 ? (
                        <div className="py-8 px-4 text-center text-gray-500">
                          <svg
                            className="mx-auto h-8 w-8 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          <p className="mt-2 text-xs font-semibold text-gray-700">No notifications yet</p>
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            You will receive alerts when your complaints are reviewed or resolved.
                          </p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {notifications.map((n) => (
                            <li
                              key={n.id}
                              className={`p-3.5 transition-colors ${
                                n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/60 hover:bg-blue-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="space-y-1 min-w-0 flex-1">
                                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                                    {n.message}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                                    {n.complaint && (
                                      <Link
                                        to={`/complaints/${n.complaint.id}`}
                                        onClick={() => setNotifOpen(false)}
                                        className="font-semibold text-blue-800 hover:underline"
                                      >
                                        View {n.complaint.complaintId} →
                                      </Link>
                                    )}
                                  </div>
                                </div>
                                {!n.isRead && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkRead(n.id)}
                                    className="shrink-0 rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-200 hover:bg-blue-50"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. User Menu Button */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen((prev) => !prev);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-gray-50/80 py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-gray-800 transition hover:border-blue-300 hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {/* Circle Icon / Image */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-blue-100 text-blue-800 shadow-2xs">
                    {avatar ? (
                      <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-5 w-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>

                  {/* User Name */}
                  <span className="max-w-[140px] truncate font-semibold text-gray-900">{user.name}</span>

                  {/* Chevron Down */}
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-gray-200 bg-white p-5 shadow-xl transition-all duration-150 z-50">
                    {/* Top section: Image a little bigger + Name + Role */}
                    <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-blue-100 bg-blue-50 shadow-sm">
                        {avatar ? (
                          <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <svg className="h-10 w-10 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </div>

                      <h3 className="mt-2.5 text-base font-bold text-gray-900 truncate max-w-full">
                        {user.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate max-w-full">{user.email}</p>

                      <div className="mt-2">
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-800">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {/* Bottom section: Each button in one row */}
                    <div className="mt-4 space-y-2">
                      {/* Row 1: Edit Profile Button */}
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-800 transition hover:bg-blue-100"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit Profile</span>
                      </Link>

                      {/* Row 2: Logout Button */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:border-red-300"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="rounded-md px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-800"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-blue-800 px-3.5 py-1.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="space-y-3 border-t border-gray-200 bg-white px-4 pb-5 pt-3 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={mobileLinkClass}
                end
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3">
            {user ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 space-y-4">
                {/* User info with avatar & mobile notification button */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-blue-100 text-blue-800">
                      {avatar ? (
                        <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-7 w-7 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Notification trigger button in mobile */}
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-2xs hover:bg-gray-100"
                    aria-label="View notifications"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Mobile Notification Drawer Display if toggled */}
                {notifOpen && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
                      <span className="font-bold text-gray-900">Notifications</span>
                      <button
                        type="button"
                        onClick={fetchNotifications}
                        className="text-blue-800 font-semibold"
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto mt-2">
                      {notifLoading ? (
                        <p className="text-xs text-gray-400 py-3 text-center">Loading notifications…</p>
                      ) : !notifications || notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 py-3 text-center">No notifications yet.</p>
                      ) : (
                        <ul className="divide-y divide-gray-100 text-xs">
                          {notifications.map((n) => (
                            <li key={n.id} className="py-2 space-y-1">
                              <p className="text-gray-800">{n.message}</p>
                              {n.complaint && (
                                <Link
                                  to={`/complaints/${n.complaint.id}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="text-[11px] font-semibold text-blue-800 block"
                                >
                                  View {n.complaint.complaintId} →
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Mobile buttons: each in one row */}
                <div className="space-y-2 pt-1 border-t border-gray-200">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <NavLink
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-gray-300 px-3 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-blue-800 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 shadow-2xs"
                >
                  Register as Citizen
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
