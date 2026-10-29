import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ErrorState from '../components/ErrorState.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import ImageViewerModal from '../components/ImageViewerModal.jsx';
import { ComplaintDetailSkeleton } from '../components/Skeleton.jsx';

function TimelineItem({ entry, isLast }) {
  return (
    <li className="relative pb-6">
      {!isLast && <span className="absolute left-3 top-6 h-full w-px bg-gray-200" aria-hidden="true" />}
      <div className="relative flex gap-3">
        <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
          •
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.status} />
            <span className="text-xs text-gray-500">
              {new Date(entry.timestamp).toLocaleString()}
            </span>
          </div>
          {entry.changedBy?.name && (
            <p className="mt-1 text-xs text-gray-500">
              Updated by {entry.changedBy.name}
              {entry.changedBy.role ? ` (${entry.changedBy.role})` : ''}
            </p>
          )}
          {entry.note && <p className="mt-1 text-sm text-gray-700">{entry.note}</p>}
        </div>
      </div>
    </li>
  );
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // In-App Image Viewer State (Do not open in different tab)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const loadComplaint = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/complaints/${id}`);
      setComplaint(data.complaint);
    } catch (err) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  const backLink =
    user?.role === 'admin'
      ? '/admin/complaints'
      : user?.role === 'authority'
      ? '/assigned/complaints'
      : '/complaints';

  const backLabel =
    user?.role === 'admin'
      ? 'Admin Complaints'
      : user?.role === 'authority'
      ? 'Authority Complaints'
      : 'My Complaints';

  async function handleDeleteConfirm() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiFetch(`/api/complaints/${id}`, { method: 'DELETE' });
      setShowDeleteModal(false);
      navigate(backLink, {
        state: { message: `Complaint ${complaint?.complaintId || id} was deleted successfully.` },
      });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete complaint.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <ComplaintDetailSkeleton />;
  }

  if (error || !complaint) {
    return (
      <div className="py-8">
        <ErrorState
          title={error ? 'Unable to Load Complaint' : 'Complaint Not Found'}
          message={
            error
              ? 'We encountered a problem retrieving this complaint record from the server. Click Retry below to try again.'
              : `The complaint record with ID "${id}" could not be located or may have been removed.`
          }
          errorDetail={error || null}
          onRetry={loadComplaint}
          retrying={loading}
          backLink={backLink}
          backLabel={`← Back to ${backLabel}`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div>
        <Link to={backLink} className="text-xs font-semibold text-blue-800 hover:text-blue-950 underline">
          ← Back to {backLabel}
        </Link>

        {deleteError && (
          <div className="mt-3">
            <ErrorState
              variant="banner"
              title="Unable to Delete Complaint"
              errorDetail={deleteError}
              onRetry={handleDeleteConfirm}
              retrying={deleting}
              onDismiss={() => setDeleteError(null)}
            />
          </div>
        )}

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{complaint.title}</h1>
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-2">
              <span className="font-mono font-bold text-gray-700">{complaint.complaintId}</span>
              <span>•</span>
              <span className="font-semibold text-blue-800">{complaint.category}</span>
              <span>•</span>
              <span>{complaint.location}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={complaint.status} />

            {/* EDIT BUTTON */}
            <Link
              to={`/complaints/${complaint.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/60 px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs hover:bg-amber-100 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </Link>

            {/* DELETE BUTTON (OPENS CONFIRM MODAL) */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-600 shadow-2xs hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details (2 Columns) */}
        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs lg:col-span-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Problem Description</h2>
            <p className="mt-1.5 text-sm text-gray-800 leading-relaxed whitespace-pre-line">{complaint.description}</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Reported Location</h2>
            <p className="mt-1 text-sm font-semibold text-gray-800">{complaint.location}</p>
          </div>

          {complaint.citizen && (
            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Citizen Reporter</h2>
              <p className="mt-1 text-xs text-gray-700">
                <span className="font-semibold">{complaint.citizen.name}</span> ({complaint.citizen.email})
              </p>
            </div>
          )}

          {complaint.assignedAuthority && (
            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Assigned Authority</h2>
              <p className="mt-1 text-xs text-gray-700">
                <span className="font-semibold">{complaint.assignedAuthority.name}</span> ({complaint.assignedAuthority.email})
              </p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Photos & Evidence</h2>
              {complaint.images?.length > 0 && (
                <span className="text-[11px] font-medium text-slate-500">
                  Click any photo to open image viewer
                </span>
              )}
            </div>
            {complaint.images?.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {complaint.images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      setViewerIndex(index);
                      setViewerOpen(true);
                    }}
                    title="Click to view image in full preview"
                    className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-gray-100 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
                  >
                    <img
                      src={src}
                      alt={`Complaint attachment ${index + 1}`}
                      className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-xs">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center text-gray-400">
                <svg className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-1 text-xs font-semibold text-gray-500">No image attached</p>
              </div>
            )}
          </div>
        </section>

        {/* Timeline Sidebar (1 Column) */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs h-fit">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Resolution Timeline</h2>
          {complaint.statusHistory?.length > 0 ? (
            <ol className="mt-4">
              {complaint.statusHistory.map((entry, index) => (
                <TimelineItem
                  key={`${entry.timestamp}-${entry.status}-${index}`}
                  entry={entry}
                  isLast={index === complaint.statusHistory.length - 1}
                />
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-xs text-gray-400">No status events recorded yet.</p>
          )}
        </section>
      </div>

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete This Complaint?"
        message="Are you sure you want to permanently delete this report? This will erase all timeline events and attachments."
        itemDetail={`${complaint.complaintId}: "${complaint.title}"`}
        confirmLabel="Yes, Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* IN-APP IMAGE VIEWER MODAL (Never opens in separate tab) */}
      <ImageViewerModal
        isOpen={viewerOpen}
        images={complaint.images || []}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
