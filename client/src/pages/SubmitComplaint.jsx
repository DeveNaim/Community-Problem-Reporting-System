import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUpload } from '../api/client.js';
import ImageViewerModal from '../components/ImageViewerModal.jsx';
import { COMPLAINT_CATEGORIES, MAX_IMAGE_SIZE, MAX_IMAGES } from '../constants/categories.js';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

function validateFiles(files) {
  if (files.length > MAX_IMAGES) {
    return `Maximum ${MAX_IMAGES} images allowed`;
  }

  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPG and PNG images are allowed';
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return 'Each image must be 5MB or less';
    }
  }

  return null;
}

export default function SubmitComplaint() {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function setSelectedFiles(selected) {
    const nextFiles = Array.from(selected);
    const validationError = validateFiles(nextFiles);
    if (validationError) {
      setError(validationError);
      return;
    }

    previews.forEach((url) => URL.revokeObjectURL(url));
    setError(null);
    setFiles(nextFiles);
    setPreviews(nextFiles.map((file) => URL.createObjectURL(file)));
  }

  function handleFileChange(e) {
    setSelectedFiles(e.target.files);
  }

  function handleDrop(e) {
    e.preventDefault();
    setSelectedFiles(e.dataTransfer.files);
  }

  function removeFile(index) {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.category) {
      setError('Please select a category');
      return;
    }

    const fileError = validateFiles(files);
    if (fileError) {
      setError(fileError);
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('category', form.category);
      body.append('title', form.title);
      body.append('description', form.description);
      body.append('location', form.location);
      files.forEach((file) => body.append('images', file));

      const data = await apiUpload('/api/complaints', body);
      setSubmitted(data.complaint);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setFiles([]);
      setPreviews([]);
      setForm({ category: '', title: '', description: '', location: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">Complaint Registered Successfully</h1>
        <p className="mt-1.5 text-sm text-gray-600">
          Your community grievance has been officially recorded and queued for municipal verification.
        </p>

        {/* Case Ticket Details Card */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/70 p-5 text-left text-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500">
                Official Case ID
              </span>
              <p className="font-bold text-base text-gray-900">{submitted.complaintId}</p>
            </div>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
              {submitted.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <span className="text-gray-500">Category</span>
              <p className="font-semibold text-gray-800 mt-0.5">{submitted.category}</p>
            </div>
            <div>
              <span className="text-gray-500">Submitted On</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {new Date(submitted.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Location</span>
              <p className="font-semibold text-gray-800 mt-0.5">{submitted.location}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-gray-200/60">
              <span className="text-gray-500">Photos & Evidence (Click to preview)</span>
              {submitted.images?.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {submitted.images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => {
                        setViewerIndex(i);
                        setViewerOpen(true);
                      }}
                      className="group relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <img
                        src={src}
                        alt={`Evidence ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                      />
                      <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-white text-gray-400">
                  <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-400">No image attached</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps Guidance */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-900">Next Steps</p>
          <ul className="mt-2 space-y-1.5 text-xs text-blue-800">
            <li className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-900">1</span>
              <span>City Corporation admin will verify issue validity within 24 hours.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-900">2</span>
              <span>Designated department field officer will be dispatched to the site.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-900">3</span>
              <span>You will receive live status notifications at each resolution milestone.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={`/complaints/${submitted.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-xs"
          >
            <span>View Case Details</span>
            <span>→</span>
          </Link>
          <button
            type="button"
            onClick={() => setSubmitted(null)}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Submit Another Report
          </button>
          <Link
            to="/complaints"
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            My Complaints
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">File a Community Grievance</h1>
        <p className="text-sm text-gray-500">
          Provide accurate issue details, address location, and photo proof for prompt municipal dispatch.
        </p>
      </div>

      {/* 3 Step Visual Indicators */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-y border-gray-100 py-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-blue-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px]">1</span>
          <span>Category</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-blue-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px]">2</span>
          <span>Location</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-blue-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px]">3</span>
          <span>Photos</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-700 flex items-start gap-2">
            <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-900">
            Municipal Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            required
            disabled={submitting}
            value={form.category}
            onChange={update('category')}
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
          >
            <option value="">Select the responsible municipal category</option>
            {COMPLAINT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
            Issue Title / Summary <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            disabled={submitting}
            value={form.title}
            onChange={update('title')}
            placeholder="e.g. Hazardous pothole obstructing traffic on 4th Avenue"
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
            Detailed Problem Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={4}
            disabled={submitting}
            value={form.description}
            onChange={update('description')}
            placeholder="Describe the severity, duration, and any safety hazards for the repair team..."
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-900">
            Exact Location / Area Landmark <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            type="text"
            required
            disabled={submitting}
            value={form.location}
            onChange={update('location')}
            placeholder="Street address, ward number, or nearby landmark"
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-900">
              Photos & Evidence (Optional)
            </label>
            <span className="text-xs font-medium text-gray-500">
              {files.length} of {MAX_IMAGES} attached
            </span>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
              files.length >= MAX_IMAGES
                ? 'border-gray-200 bg-gray-50 opacity-60 pointer-events-none'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50/20'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 font-medium">
              Drag & drop photos here, or{' '}
              <button
                type="button"
                disabled={files.length >= MAX_IMAGES || submitting}
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-800 underline hover:text-blue-900 font-semibold cursor-pointer"
              >
                browse files
              </button>
            </p>
            <p className="mt-1 text-[11px] text-gray-400">JPG or PNG · Up to 5MB each (Max 3)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              disabled={submitting}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {previews.map((src, index) => (
                <div key={src} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <img
                    src={src}
                    alt={`Attachment preview ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => removeFile(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white shadow-xs transition hover:bg-black cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-800 px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting Grievance Report…</span>
              </>
            ) : (
              <span>Submit Grievance Report →</span>
            )}
          </button>
        </div>
      </form>

      {/* In-App Image Viewer Modal */}
      <ImageViewerModal
        isOpen={viewerOpen}
        images={submitted?.images || previews}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
