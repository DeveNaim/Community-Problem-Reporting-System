import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import ImageViewerModal from '../components/ImageViewerModal.jsx';
import { ComplaintListSkeleton } from '../components/Skeleton.jsx';
import { COMPLAINT_CATEGORIES } from '../constants/categories.js';
import { COMPLAINT_STATUSES } from '../constants/statuses.js';

export default function MyComplaints() {
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(location.state?.message || null);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });

  // Delete Confirm Modal State
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // In-App Image Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.search.trim()) params.set('search', filters.search.trim());
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [filters]);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const complaintsData = await apiFetch(`/api/complaints/mine${queryString}`);
      setComplaints(complaintsData.complaints || []);
    } catch (err) {
      setError(err.message || 'Failed to load your complaints.');
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  async function handleDeleteConfirm() {
    if (!complaintToDelete) return;
    setDeleting(true);
    setError(null);

    try {
      await apiFetch(`/api/complaints/${complaintToDelete.id}`, { method: 'DELETE' });
      setActionNotice(`Complaint ${complaintToDelete.complaintId} was deleted successfully.`);
      setComplaints((prev) => prev.filter((c) => c.id !== complaintToDelete.id));
      setComplaintToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete complaint.');
    } finally {
      setDeleting(false);
    }
  }

  const isFiltering = Boolean(filters.status || filters.category || filters.search.trim());

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Complaints</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track, view, edit, or delete the community problem reports you have submitted.
          </p>
        </div>
        <Link
          to="/complaints/new"
          className="inline-flex items-center justify-center rounded-xl bg-blue-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
        >
          + Submit New Complaint
        </Link>
      </div>

      {/* Success Notice */}
      {actionNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Alert (when complaints already loaded) */}
      {error && complaints.length > 0 && (
        <ErrorState
          variant="banner"
          title="Unable to Sync Complaints"
          errorDetail={error}
          onRetry={loadComplaints}
          retrying={loading}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Filters & Search */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Filter & Search</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-800 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Statuses</option>
            {COMPLAINT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-800 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Categories</option>
            {COMPLAINT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            type="search"
            placeholder="Search title, ID, or location…"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-800 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </section>

      {/* Complaints List / Error State / Empty State / Loading State */}
      <section aria-label="Complaints List">
        {loading ? (
          <ComplaintListSkeleton count={4} />
        ) : error && complaints.length === 0 ? (
          <ErrorState
            title="Unable to Load Your Complaints"
            message="We couldn't fetch your submitted complaints right now. Please check your connection and click Retry."
            errorDetail={error}
            onRetry={loadComplaints}
            retrying={loading}
          />
        ) : complaints.length === 0 ? (
          isFiltering ? (
            <EmptyState
              title="No matching complaints"
              description="No reports match your current filter or search criteria. Try modifying your filters or clearing search."
              actionLabel="Clear Filters"
              onAction={() => setFilters({ status: '', category: '', search: '' })}
            />
          ) : (
            <EmptyState
              title="No complaints submitted yet"
              description="You have not submitted any community reports yet. If you spot a road defect, waste pile, or water leakage, submit a report to alert municipal teams."
              actionLabel="Submit Your First Complaint"
              actionLink="/complaints/new"
            />
          )
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
            <ul className="divide-y divide-gray-100">
              {complaints.map((complaint) => (
                <li
                  key={complaint.id}
                  className="flex flex-col gap-3 p-4 sm:px-6 transition-colors hover:bg-gray-50/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left part: Image Thumbnail + Details */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Image Thumbnail with in-app viewer preview */}
                    {complaint.images && complaint.images.length > 0 ? (
                      <button
                        type="button"
                        title="Click to preview image evidence"
                        onClick={() => {
                          setViewerImages(complaint.images);
                          setViewerIndex(0);
                          setViewerOpen(true);
                        }}
                        className="group relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 block cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-700"
                      >
                        <img
                          src={complaint.images[0]}
                          alt={complaint.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30 flex items-center justify-center">
                          <svg className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </span>
                        {complaint.images.length > 1 && (
                          <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 text-[10px] font-bold text-white leading-none">
                            +{complaint.images.length - 1}
                          </span>
                        )}
                      </button>
                    ) : (
                      <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-400">
                        <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="mt-1 text-[10px] font-medium text-gray-400">No image</span>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <Link
                        to={`/complaints/${complaint.id}`}
                        className="font-bold text-gray-900 hover:text-blue-800 transition truncate block text-sm"
                      >
                        {complaint.title}
                      </Link>
                      <p className="text-xs text-gray-500 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono font-semibold text-gray-700">{complaint.complaintId}</span>
                        <span>•</span>
                        <span className="font-semibold text-blue-800">{complaint.category}</span>
                        <span>•</span>
                        <span className="text-gray-600 truncate max-w-xs">{complaint.location}</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Right part: Status Badge + Action Buttons (View, Edit, Delete) */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                    <StatusBadge status={complaint.status} />

                    <div className="flex items-center gap-2">
                      {/* VIEW BUTTON */}
                      <Link
                        to={`/complaints/${complaint.id}`}
                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-700 shadow-2xs hover:bg-blue-50 hover:text-blue-800 hover:border-blue-200 transition"
                        title="View Full Details"
                      >
                        View
                      </Link>

                      {/* EDIT BUTTON */}
                      <Link
                        to={`/complaints/${complaint.id}/edit`}
                        className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-xs font-bold text-amber-700 shadow-2xs hover:bg-amber-50 hover:border-amber-300 transition"
                        title="Edit Complaint"
                      >
                        Edit
                      </Link>

                      {/* DELETE BUTTON (OPENS CONFIRM MODAL) */}
                      <button
                        type="button"
                        onClick={() => setComplaintToDelete(complaint)}
                        className="rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 shadow-2xs hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer"
                        title="Delete Complaint"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(complaintToDelete)}
        title="Delete Complaint?"
        message="Are you sure you want to delete this complaint? This report and its recorded history will be permanently removed."
        itemDetail={complaintToDelete ? `${complaintToDelete.complaintId}: "${complaintToDelete.title}"` : null}
        confirmLabel="Yes, Delete Complaint"
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
