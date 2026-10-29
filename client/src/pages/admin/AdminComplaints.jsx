import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
import AdminNav from '../../components/AdminNav.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';
import ImageViewerModal from '../../components/ImageViewerModal.jsx';
import { ComplaintListSkeleton } from '../../components/Skeleton.jsx';
import { COMPLAINT_CATEGORIES } from '../../constants/categories.js';
import { COMPLAINT_STATUSES } from '../../constants/statuses.js';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  });

  // Delete Modal State
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // In-App Image Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Assign Authority Modal / Quick State
  const [assignTarget, setAssignTarget] = useState(null);
  const [selectedAuthorityId, setSelectedAuthorityId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.search.trim()) params.set('search', filters.search.trim());
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [compData, authData] = await Promise.all([
        apiFetch(`/api/complaints${queryString}`),
        apiFetch('/api/users?role=authority').catch(() => ({ users: [] })),
      ]);
      setComplaints(compData.complaints || []);
      if (compData.stats) {
        setServerStats(compData.stats);
      }
      setAuthorities((authData.users || []).filter((u) => u.status === 'active'));
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Metrics (use serverStats for consistent unfiltered totals, with fallback to loaded complaints)
  const metrics = useMemo(() => {
    if (serverStats) {
      return {
        total: serverStats.total ?? 0,
        pending: serverStats.pendingVerification ?? 0,
        active: serverStats.active ?? 0,
        verified: serverStats.verified ?? 0,
        assigned: serverStats.assigned ?? 0,
        inProgressOnly: serverStats.inProgressOnly ?? 0,
        resolved: serverStats.resolved ?? 0,
        closed: serverStats.closed ?? 0,
      };
    }
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending Verification').length;
    const verified = complaints.filter((c) => c.status === 'Verified').length;
    const assigned = complaints.filter((c) => c.status === 'Assigned').length;
    const inProgressOnly = complaints.filter((c) => c.status === 'In Progress').length;
    const active = verified + assigned + inProgressOnly;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const closed = complaints.filter((c) =>
      ['Rejected', 'Unable to Resolve'].includes(c.status)
    ).length;
    return { total, pending, active, verified, assigned, inProgressOnly, resolved, closed };
  }, [complaints, serverStats]);

  // Handle Delete
  async function handleDeleteConfirm() {
    if (!complaintToDelete) return;
    setDeleting(true);
    setError(null);

    try {
      await apiFetch(`/api/complaints/${complaintToDelete.id}`, { method: 'DELETE' });
      setActionNotice(`Complaint ${complaintToDelete.complaintId} was deleted successfully.`);
      setComplaintToDelete(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete complaint.');
    } finally {
      setDeleting(false);
    }
  }

  // Handle Quick Assign Authority
  async function handleAssignSubmit(e) {
    e.preventDefault();
    if (!assignTarget || !selectedAuthorityId) return;

    setAssigning(true);
    setAssignError(null);

    try {
      await apiFetch(`/api/complaints/${assignTarget.id}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ authorityId: selectedAuthorityId }),
      });

      const matchedAuth = authorities.find((a) => a.id === selectedAuthorityId);
      setActionNotice(
        `Complaint ${assignTarget.complaintId} was assigned to ${matchedAuth?.name || 'authority'}.`
      );
      setAssignTarget(null);
      setSelectedAuthorityId('');
      await loadData();
    } catch (err) {
      setAssignError(err.message || 'Failed to assign authority.');
    } finally {
      setAssigning(false);
    }
  }

  // Handle Quick Verify / Reject
  async function handleVerify(complaint, decision) {
    try {
      await apiFetch(`/api/complaints/${complaint.id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({
          decision,
          reason: decision === 'rejected' ? 'Rejected by system administrator' : undefined,
        }),
      });

      setActionNotice(`Complaint ${complaint.complaintId} was ${decision}.`);
      await loadData();
    } catch (err) {
      setError(err.message || `Failed to ${decision} complaint.`);
    }
  }

  return (
    <div className="space-y-6">
      <AdminNav
        currentTitle="Complaints Management"
        subtitle="Review community complaints, verify reports, assign departmental officers, and edit or delete records."
      />

      {/* Action / Success Banner */}
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

      {/* Error Alert */}
      {error && (
        <ErrorState
          variant={complaints.length > 0 ? 'banner' : 'card'}
          title="Complaints Operation Error"
          message="We encountered an error while loading or updating complaint records. Click Retry below to reload."
          errorDetail={error}
          onRetry={loadData}
          retrying={loading}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Metrics Row */}
      <div className="grid gap-5 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Reports</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{metrics.total}</p>
          <p className="mt-1.5 text-xs text-slate-500">
            Showing {complaints.length} of {metrics.total} · {metrics.closed} closed/rejected
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Pending Review</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-800">{metrics.pending}</p>
          <p className="mt-1.5 text-xs text-amber-700">Awaiting admin verification</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Active / In Progress</p>
          <p className="mt-2 text-3xl font-extrabold text-blue-800">{metrics.active}</p>
          <p className="mt-1.5 text-xs text-blue-700">
            {metrics.verified} verified · {metrics.assigned} assigned · {metrics.inProgressOnly} in progress
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Resolved</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{metrics.resolved}</p>
          <p className="mt-1.5 text-xs text-emerald-700">
            {metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0}% resolution rate
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Statuses</option>
              {COMPLAINT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Category Filter
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Search Keywords
            </label>
            <input
              type="search"
              placeholder="Search title, ID, or location…"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Complaints List / Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Complaints Records ({complaints.length})
          </h2>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-6">
            <ComplaintListSkeleton count={5} />
          </div>
        ) : complaints.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-8">
            <EmptyState
              title="No Complaints Found"
              description="No community problem reports match your current filters. Clear the search or filters to see more results."
              actionLabel="Reset Filters"
              onAction={() => setFilters({ status: '', category: '', search: '' })}
            />
          </div>
        ) : (
          /* DATA TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-xs">
                <tr>
                  <th className="py-4 pl-6 pr-3">Complaint Ref / Title</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Citizen</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Assigned Authority</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="py-4 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50/60">
                    {/* Complaint ID & Title */}
                    <td className="py-4 pl-6 pr-3 max-w-xs">
                      <div className="flex items-center gap-3.5">
                        {c.images?.length > 0 ? (
                          <button
                            type="button"
                            title="Click to preview image evidence"
                            onClick={() => {
                              setViewerImages(c.images);
                              setViewerIndex(0);
                              setViewerOpen(true);
                            }}
                            className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <img
                              src={c.images[0]}
                              alt={c.title}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                            />
                            <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25 flex items-center justify-center">
                              <svg className="h-3.5 w-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </span>
                          </button>
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400">
                            No img
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/complaints/${c.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-700 transition truncate block"
                          >
                            {c.title}
                          </Link>
                          <span className="font-mono text-xs text-slate-500">
                            {c.complaintId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {c.category}
                    </td>

                    {/* Citizen */}
                    <td className="px-4 py-4 text-slate-600">
                      {c.citizen ? c.citizen.name : '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Assigned Authority */}
                    <td className="px-4 py-4">
                      {c.assignedAuthority ? (
                        <span className="font-medium text-slate-800">
                          {c.assignedAuthority.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Not Assigned</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTIONS: View, Edit, Delete (Confirm Modal) */}
                    <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {/* Quick Verify / Assign Triage Action */}
                        {c.status === 'Pending Verification' && (
                          <button
                            type="button"
                            onClick={() => handleVerify(c, 'verified')}
                            className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 cursor-pointer"
                          >
                            Verify
                          </button>
                        )}
                        {c.status === 'Verified' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAssignTarget(c);
                              setSelectedAuthorityId('');
                              setAssignError(null);
                            }}
                            className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-800 shadow-2xs transition hover:bg-blue-100 cursor-pointer"
                          >
                            Assign →
                          </button>
                        )}

                        {/* VIEW PAGE */}
                        <Link
                          to={`/complaints/${c.id}`}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          View
                        </Link>

                        {/* EDIT PAGE */}
                        <Link
                          to={`/complaints/${c.id}/edit`}
                          className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs transition hover:bg-amber-100"
                        >
                          Edit
                        </Link>

                        {/* DELETE (OPENS CONFIRM MODAL) */}
                        <button
                          type="button"
                          onClick={() => setComplaintToDelete(c)}
                          className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(complaintToDelete)}
        title="Delete Community Complaint?"
        message="Are you sure you want to permanently delete this complaint record? All photos, assigned progress notes, and citizen notification timelines will be removed."
        itemDetail={
          complaintToDelete
            ? `${complaintToDelete.complaintId}: "${complaintToDelete.title}"`
            : null
        }
        confirmLabel="Yes, Delete Record"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setComplaintToDelete(null)}
      />

      {/* QUICK ASSIGN AUTHORITY MODAL */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Assign Authority to Report
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-mono">
              {assignTarget.complaintId}: {assignTarget.title} ({assignTarget.category})
            </p>

            {assignError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
                {assignError}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Department Authority *
                </label>
                <select
                  required
                  value={selectedAuthorityId}
                  onChange={(e) => setSelectedAuthorityId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Choose Department Officer --</option>
                  {authorities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.category || a.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignTarget(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !selectedAuthorityId}
                  className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 cursor-pointer disabled:opacity-60"
                >
                  {assigning ? 'Assigning…' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Image Viewer Modal */}
      <ImageViewerModal
        isOpen={viewerOpen}
        images={viewerImages}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
