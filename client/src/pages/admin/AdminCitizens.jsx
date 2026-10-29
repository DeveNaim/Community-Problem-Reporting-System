import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../api/client.js';
import AdminNav from '../../components/AdminNav.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

export default function AdminCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Confirmation modal state
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [citizenToDelete, setCitizenToDelete] = useState(null);
  const [deletingCitizen, setDeletingCitizen] = useState(false);

  const loadCitizens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/users?role=citizen');
      setCitizens(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load citizen accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCitizens();
  }, [loadCitizens]);

  const stats = useMemo(() => {
    const total = citizens.length;
    const active = citizens.filter((c) => c.status === 'active').length;
    const blocked = citizens.filter((c) => c.status === 'disabled').length;
    return { total, active, blocked };
  }, [citizens]);

  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = c.name?.toLowerCase().includes(q);
        const emailMatch = c.email?.toLowerCase().includes(q);
        const phoneMatch = c.phone?.toLowerCase().includes(q);
        return nameMatch || emailMatch || phoneMatch;
      }
      return true;
    });
  }, [citizens, statusFilter, searchQuery]);

  async function handleToggleStatus(citizen) {
    const nextStatus = citizen.status === 'active' ? 'disabled' : 'active';
    setProcessingId(citizen.id);
    setActionNotice(null);
    setError(null);

    try {
      await apiFetch(`/api/users/${citizen.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });

      setCitizens((prev) =>
        prev.map((item) => (item.id === citizen.id ? { ...item, status: nextStatus } : item))
      );

      setActionNotice(
        nextStatus === 'disabled'
          ? `Citizen "${citizen.name}" has been blocked from accessing CPRS.`
          : `Citizen "${citizen.name}" has been unblocked and restored.`
      );
    } catch (err) {
      setError(err.message || 'Failed to update citizen status.');
    } finally {
      setProcessingId(null);
      setConfirmTarget(null);
    }
  }

  async function handleDeleteCitizen() {
    if (!citizenToDelete) return;
    setDeletingCitizen(true);
    setError(null);
    try {
      await apiFetch(`/api/users/${citizenToDelete.id}`, { method: 'DELETE' });
      setActionNotice(`Citizen account "${citizenToDelete.name}" was permanently deleted.`);
      setCitizens((prev) => prev.filter((c) => c.id !== citizenToDelete.id));
      setCitizenToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete citizen account.');
    } finally {
      setDeletingCitizen(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminNav
        currentTitle="Citizen Users Management"
        subtitle="Review community residents, inspect account details, and block or unblock citizen access."
      />

      {/* Notifications */}
      {actionNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="rounded-lg px-2 py-1 text-emerald-700 hover:bg-emerald-100 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <ErrorState
          variant={citizens.length > 0 ? 'banner' : 'card'}
          title="Unable to Load Citizen Accounts"
          errorDetail={error}
          onRetry={loadCitizens}
          retrying={loading}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Quick Metrics */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Citizens</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{stats.total}</p>
          <p className="mt-1.5 text-xs text-slate-500">Registered community resident accounts</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Active Citizens</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{stats.active}</p>
          <p className="mt-1.5 text-xs text-emerald-700">Authorized to report problems & comment</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-800">Blocked / Disabled</p>
          <p className="mt-2 text-3xl font-extrabold text-rose-700">{stats.blocked}</p>
          <p className="mt-1.5 text-xs text-rose-700">Restricted from logging in or filing complaints</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
              Status:
            </span>
            {[
              { id: 'all', label: `All (${citizens.length})` },
              { id: 'active', label: `Active (${stats.active})` },
              { id: 'disabled', label: `Blocked (${stats.blocked})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Citizen List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Registered Citizens ({filteredCitizens.length})
          </h2>
          <button
            type="button"
            onClick={loadCitizens}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Refreshing…' : 'Refresh List'}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 space-y-2.5">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
            <p>Loading citizen profiles…</p>
          </div>
        ) : filteredCitizens.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <svg
              className="mx-auto h-10 w-10 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-2.5 text-sm font-bold text-slate-700">No citizens match your criteria</p>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-xs">
                <tr>
                  <th className="py-4 pl-6 pr-3">Citizen</th>
                  <th className="px-4 py-4">Contact Info</th>
                  <th className="px-4 py-4">Registered On</th>
                  <th className="px-4 py-4">Account Status</th>
                  <th className="py-4 pl-3 pr-6 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCitizens.map((citizen) => {
                  const isBlocked = citizen.status === 'disabled';
                  const isProcessing = processingId === citizen.id;

                  return (
                    <tr
                      key={citizen.id}
                      className={`transition-colors hover:bg-slate-50/60 ${
                        isBlocked ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm uppercase ${
                              isBlocked
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {citizen.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{citizen.name}</p>
                            <p className="text-xs text-slate-500 truncate">{citizen.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-4 text-slate-700 font-mono text-xs">
                        {citizen.phone || '—'}
                      </td>

                      {/* Created date */}
                      <td className="px-4 py-4 text-slate-500">
                        {citizen.createdAt
                          ? new Date(citizen.createdAt).toLocaleDateString()
                          : '—'}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            isBlocked
                              ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                              : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isBlocked ? 'bg-rose-600' : 'bg-emerald-600'
                            }`}
                          />
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>

                      {/* Block / Unblock & Delete Action */}
                      <td className="py-4 pl-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          {isBlocked ? (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleToggleStatus(citizen)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 cursor-pointer disabled:opacity-50 transition"
                            >
                              <span>{isProcessing ? 'Updating…' : 'Unblock'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => setConfirmTarget(citizen)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50/50 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-100 cursor-pointer disabled:opacity-50 transition"
                            >
                              <span>{isProcessing ? 'Updating…' : 'Block'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setCitizenToDelete(citizen)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs hover:bg-rose-50 hover:border-rose-300 cursor-pointer transition"
                          >
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL TO BLOCK CITIZEN */}
      <DeleteConfirmModal
        isOpen={Boolean(confirmTarget)}
        title="Block Citizen Account?"
        message="Are you sure you want to block this user? While blocked, this citizen cannot sign in or file municipal complaints."
        itemDetail={confirmTarget ? `${confirmTarget.name} (${confirmTarget.email})` : null}
        confirmLabel="Yes, Block Citizen"
        loading={Boolean(processingId)}
        onConfirm={() => handleToggleStatus(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
      />

      {/* CONFIRMATION MODAL TO DELETE CITIZEN */}
      <DeleteConfirmModal
        isOpen={Boolean(citizenToDelete)}
        title="Delete Citizen Account?"
        message="Are you sure you want to permanently delete this citizen account? All account profile data will be permanently removed."
        itemDetail={citizenToDelete ? `${citizenToDelete.name} (${citizenToDelete.email})` : null}
        confirmLabel="Yes, Delete Account"
        loading={deletingCitizen}
        onConfirm={handleDeleteCitizen}
        onClose={() => setCitizenToDelete(null)}
      />
    </div>
  );
}
