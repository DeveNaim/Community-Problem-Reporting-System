import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorState from '../components/ErrorState.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import ImageViewerModal from '../components/ImageViewerModal.jsx';
import { COMPLAINT_CATEGORIES, MAX_IMAGES, MAX_IMAGE_SIZE } from '../constants/categories.js';

export default function EditComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(COMPLAINT_CATEGORIES);

  // Form Fields
  const [complaintId, setComplaintId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [currentImages, setCurrentImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [fileError, setFileError] = useState(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // In-App Image Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Load existing complaint and available categories
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [complaintRes, catRes] = await Promise.all([
        apiFetch(`/api/complaints/${id}`),
        apiFetch('/api/categories').catch(() => null),
      ]);

      const c = complaintRes.complaint;
      setComplaintId(c.complaintId);
      setTitle(c.title);
      setCategory(c.category);
      setDescription(c.description);
      setLocation(c.location);
      setCurrentImages(c.images || []);

      if (catRes?.categories?.length > 0) {
        setCategories(catRes.categories.map((item) => item.name));
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleFileChange(e) {
    setFileError(null);
    const selected = Array.from(e.target.files || []);

    if (selected.length > MAX_IMAGES) {
      setFileError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const invalidSize = selected.some((f) => f.size > MAX_IMAGE_SIZE);
    if (invalidSize) {
      setFileError('Each image must be 5MB or less.');
      return;
    }

    setNewFiles(selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (newFiles.length > 0) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('category', category);
        formData.append('description', description.trim());
        formData.append('location', location.trim());
        newFiles.forEach((f) => formData.append('images', f));

        await apiFetch(`/api/complaints/${id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await apiFetch(`/api/complaints/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: title.trim(),
            category,
            description: description.trim(),
            location: location.trim(),
          }),
        });
      }

      navigate(`/complaints/${id}`, {
        state: { message: 'Complaint was updated successfully.' },
      });
    } catch (err) {
      setError(err.message || 'Failed to update complaint.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    setError(null);

    try {
      await apiFetch(`/api/complaints/${id}`, { method: 'DELETE' });
      setShowDeleteModal(false);
      const destination =
        user?.role === 'admin'
          ? '/admin/complaints'
          : user?.role === 'authority'
          ? '/assigned/complaints'
          : '/complaints';
      navigate(destination, {
        state: { message: `Complaint ${complaintId} was deleted successfully.` },
      });
    } catch (err) {
      setError(err.message || 'Failed to delete complaint.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center text-xs text-gray-500 space-y-2">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-800 border-t-transparent" />
        <p>Loading complaint for editing…</p>
      </div>
    );
  }

  if (error && !complaintId) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <ErrorState
          title="Unable to Load Complaint for Editing"
          message="We could not retrieve the complaint details needed to populate the edit form."
          errorDetail={error}
          onRetry={loadData}
          retrying={loading}
          backLink={`/complaints/${id}`}
          backLabel="← Back to Complaint"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Top Header */}
      <div>
        <Link
          to={`/complaints/${id}`}
          className="text-xs font-semibold text-blue-800 hover:text-blue-950 underline"
        >
          ← Back to View Complaint
        </Link>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Edit Complaint
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              Ref ID: {complaintId}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 shadow-2xs hover:bg-rose-50 hover:border-rose-300 cursor-pointer transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete Complaint</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          variant="banner"
          title="Unable to Save Changes"
          errorDetail={error}
          onRetry={loadData}
          retrying={loading}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Complaint Title *
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Category *
          </label>
          <select
            id="category"
            required
            disabled={user?.role === 'authority'}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold focus:outline-none ${
              user?.role === 'authority'
                ? 'border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed opacity-85'
                : 'border-gray-300 text-gray-900 focus:border-blue-700 focus:ring-2 focus:ring-blue-100'
            }`}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Specific Location *
          </label>
          <input
            id="location"
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Detailed Description *
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Existing Images */}
        {currentImages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Current Uploaded Photos
              </label>
              <span className="text-[11px] text-slate-500">Click to preview in image viewer</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {currentImages.map((src, i) => (
                <button
                  type="button"
                  key={src}
                  onClick={() => {
                    setViewerIndex(i);
                    setViewerOpen(true);
                  }}
                  className="group relative h-24 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <img src={src} alt={`Attachment ${i + 1}`} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Preview
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Replace or Upload New Images */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Replace Photos (Optional, max 3)
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleFileChange}
            className="mt-1.5 block w-full text-xs text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-800 hover:file:bg-blue-100"
          />
          {fileError && <p className="mt-1 text-xs text-red-600 font-semibold">{fileError}</p>}
          {newFiles.length > 0 && (
            <p className="mt-1 text-[11px] text-emerald-700 font-medium">
              Selected {newFiles.length} replacement image(s): {newFiles.map((f) => f.name).join(', ')}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100">
          <Link
            to={`/complaints/${id}`}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-center text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-800 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Saving Changes…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* CONFIRM DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Complaint?"
        message="Are you sure you want to permanently delete this complaint? All associated activity and timelines will be removed. This action cannot be undone."
        itemDetail={`${complaintId}: "${title}"`}
        confirmLabel="Yes, Delete Complaint"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* IN-APP IMAGE VIEWER MODAL */}
      <ImageViewerModal
        isOpen={viewerOpen}
        images={currentImages}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
