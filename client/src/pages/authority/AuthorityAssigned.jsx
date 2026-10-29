import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  extractAuthorityEmailToken,
  getAuthorityCategoryFromUser,
} from '../../utils/authorityCategory.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';
import ImageViewerModal from '../../components/ImageViewerModal.jsx';
import { ComplaintListSkeleton } from '../../components/Skeleton.jsx';
import { COMPLAINT_CATEGORIES } from '../../constants/categories.js';
import { COMPLAINT_STATUSES } from '../../constants/statuses.js';

const AUTHORITY_UPDATE_STATUSES = ['In Progress', 'Resolved', 'Unable to Resolve'];

export default function AuthorityAssigned() {
  const { user } = useAuth();
  const authorityCategory = getAuthorityCategoryFromUser(user);
  const emailToken = extractAuthorityEmailToken(user?.email);

  const [complaints, setComplaints] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Filters (Category is automatically set from authority email after '.' and before '@' and disabled)
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Status Update Modal State
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Delete Confirm Modal State
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // In-App Image Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [statusFilter, searchQuery]);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/complaints/assigned${queryString}`);
      setComplaints(data.complaints || []);
      if (data.stats) {
        setServerStats(data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load department complaints.');
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // Metrics (use serverStats for consistent unfiltered department totals, with fallback to loaded complaints)
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
    const active = complaints.filter((c) =>
      ['Verified', 'Assigned', 'In Progress'].includes(c.status)
    ).length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const closed = complaints.filter((c) =>
      ['Rejected', 'Unable to Resolve'].includes(c.status)
    ).length;
    return { total, pending, active, resolved, closed };
  }, [complaints, serverStats]);

  async function handleStatusUpdate(e) {
    e.preventDefault();
    if (!statusTarget) return;

    setSubmitting(true);
    setStatusError(null);
    try {
      await apiFetch(`/api/complaints/${statusTarget.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, note }),
      });
      setActionNotice(
        `Complaint ${statusTarget.complaintId} status updated to "${newStatus}".`
      );
      setStatusTarget(null);
      setNote('');
      await loadComplaints();
    } catch (err) {
      setStatusError(err.message || 'Failed to update complaint status.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!complaintToDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await apiFetch(`/api/complaints/${complaintToDelete.id}`, { method: 'DELETE' });
      setActionNotice(
        `Complaint ${complaintToDelete.complaintId} was deleted successfully.`
      );
      setComplaintToDelete(null);
      await loadComplaints();
    } catch (err) {
      setError(err.message || 'Failed to delete complaint.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-blue-700 ring-1 ring-inset ring-blue-700/10">
                Authority Workspace
              </span>
              <span className="text-sm text-slate-300">/</span>
              <span className="text-sm font-medium text-slate-600">Department Complaints</span>
              {authorityCategory && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                  <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Locked Category: {authorityCategory}
                </span>
              )}
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {authorityCategory ? `${authorityCategory} Complaints` : 'Assigned Complaints'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 max-w-3xl">
              Complaints are automatically filtered for your department based on your login identifier (<code className="font-mono text-xs text-blue-700">.{emailToken || 'authority'}@</code>). Update resolution status, inspect details, or edit records.
            </p>
          </div>
        </div>
      </div>

      {/* Notices */}
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
          variant={complaints.length > 0 ? 'banner' : 'card'}
          title="Unable to Load Department Complaints"
          errorDetail={error}
          onRetry={loadComplaints}
          retrying={loading}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Metrics Row */}
      <div className="grid gap-5 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total {authorityCategory || 'Department'}
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{metrics.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Pending Verification
          </p>
          <p className="mt-2 text-3xl font-extrabold text-amber-800">{metrics.pending}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
            Active / In Progress
          </p>
          <p className="mt-2 text-3xl font-extrabold text-blue-800">{metrics.active}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Resolved
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{metrics.resolved}</p>
        </div>
      </div>

      {/* Filter Bar — Category Filter is automatically set & disabled */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* 1. Disabled Category Filter (auto-selected from email after '.' and before '@') */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Department Category (Locked)
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Auto from .{emailToken || 'email'}@
              </span>
            </div>
            <select
              value={authorityCategory || ''}
              disabled
              title="Category filter is automatically locked to your authority department"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-600 cursor-not-allowed select-none"
            >
              {authorityCategory ? (
                <option value={authorityCategory}>{authorityCategory}</option>
              ) : (
                <option value="">All Assigned Categories</option>
              )}
              {COMPLAINT_CATEGORIES.filter((c) => c !== authorityCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Status Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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

          {/* 3. Search Keywords */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Search Keywords
            </label>
            <input
              type="search"
              placeholder="Search title, ID, or location…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {authorityCategory || 'Department'} Complaint Records ({complaints.length})
          </h2>
          <button
            type="button"
            onClick={loadComplaints}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-6">
            <ComplaintListSkeleton count={5} />
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={`No ${authorityCategory || 'Department'} Complaints Found`}
              description="There are no complaints matching your current status or keyword filters for your department."
              actionLabel={statusFilter || searchQuery ? 'Clear Filters' : undefined}
              onAction={() => {
                setStatusFilter('');
                setSearchQuery('');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-xs">
                <tr>
                  <th className="py-4 pl-6 pr-3">Complaint Ref / Title</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Citizen</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="py-4 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => {
                  const canUpdateStatus = [
                    'Pending Verification',
                    'Verified',
                    'Assigned',
                    'In Progress',
                  ].includes(c.status);

                  return (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50/60">
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

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-700/15">
                          {c.category}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {c.citizen ? c.citizen.name : '—'}
                      </td>

                      <td className="px-4 py-4 text-slate-600 truncate max-w-[180px]">
                        {c.location}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {canUpdateStatus && (
                            <button
                              type="button"
                              onClick={() => {
                                setStatusTarget(c);
                                setNewStatus(
                                  c.status === 'In Progress' ? 'Resolved' : 'In Progress'
                                );
                                setNote('');
                                setStatusError(null);
                              }}
                              className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-800 shadow-2xs transition hover:bg-blue-100 cursor-pointer"
                            >
                              Update Status
                            </button>
                          )}

                          <Link
                            to={`/complaints/${c.id}`}
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            View
                          </Link>

                          <Link
                            to={`/complaints/${c.id}/edit`}
                            className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs transition hover:bg-amber-100"
                          >
                            Edit
                          </Link>

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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPDATE STATUS MODAL */}
      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Update Complaint Status</h3>
                <p className="mt-0.5 text-xs font-mono text-slate-500">
                  {statusTarget.complaintId} · {statusTarget.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatusTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {statusError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
                {statusError}
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {AUTHORITY_UPDATE_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Progress / Resolution Note *
                </label>
                <textarea
                  required
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe field inspection, maintenance crew action, or resolution details…"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusTarget(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Save Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(complaintToDelete)}
        title="Delete Department Complaint?"
        message="Are you sure you want to permanently delete this complaint record? All timeline history and attached images will be removed."
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
