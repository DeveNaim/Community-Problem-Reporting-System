import { useEffect, useState, useCallback } from 'react';

export default function ImageViewerModal({
  isOpen,
  images = [],
  initialIndex = 0,
  onClose,
}) {
  const imageList = Array.isArray(images)
    ? images.filter(Boolean)
    : images
    ? [images]
    : [];

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Sync index when opening or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, imageList.length - 1)));
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, initialIndex, imageList.length]);

  const handleNext = useCallback(() => {
    if (imageList.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
    setZoom(1);
    setRotation(0);
  }, [imageList.length]);

  const handlePrev = useCallback(() => {
    if (imageList.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    setZoom(1);
    setRotation(0);
  }, [imageList.length]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, prev - 0.25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0' || e.key.toLowerCase() === 'r') {
        handleReset();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Lock body scroll while viewer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || imageList.length === 0) {
    return null;
  }

  const currentSrc = imageList[currentIndex];

  function handleDownload(e) {
    e.stopPropagation();
    try {
      const filename =
        currentSrc.split('/').pop()?.split('?')[0] || `cprs-evidence-${currentIndex + 1}.jpg`;
      const link = document.createElement('a');
      link.href = currentSrc;
      link.download = filename;
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Fallback
      window.open(currentSrc, '_self');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Previewer"
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/92 backdrop-blur-md p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex items-center justify-between z-10 max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white tracking-wide border border-white/15">
            {currentIndex + 1} / {imageList.length}
          </span>
          <span className="hidden sm:inline text-xs text-slate-300">
            Use arrow keys to navigate · Esc to close
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Out */}
          <button
            type="button"
            title="Zoom Out (-)"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-40 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          {/* Zoom Level Indicator / Reset */}
          <button
            type="button"
            title="Reset Zoom & Rotation (0 / R)"
            onClick={handleReset}
            className="flex h-9 items-center justify-center rounded-xl bg-white/10 px-3 text-xs font-mono font-bold text-white hover:bg-white/20 transition cursor-pointer"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            title="Zoom In (+)"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-40 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Rotate Clockwise */}
          <button
            type="button"
            title="Rotate 90° Clockwise"
            onClick={handleRotate}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Download Original Image */}
          <button
            type="button"
            title="Download Image"
            onClick={handleDownload}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Close Button */}
          <button
            type="button"
            title="Close Preview (Esc)"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/90 text-white hover:bg-rose-600 transition cursor-pointer ml-1"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-3">
        {/* Previous Button (if multiple images) */}
        {imageList.length > 1 && (
          <button
            type="button"
            title="Previous Image (←)"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-6 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-black/75 transition cursor-pointer shadow-lg"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scaled & Rotated Image */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-full max-w-full flex items-center justify-center select-none"
        >
          <img
            key={currentSrc}
            src={currentSrc}
            alt={`Evidence preview ${currentIndex + 1}`}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
            }}
            className="max-h-[72vh] max-w-[88vw] object-contain rounded-xl shadow-2xl pointer-events-auto"
            draggable={false}
          />
        </div>

        {/* Next Button (if multiple images) */}
        {imageList.length > 1 && (
          <button
            type="button"
            title="Next Image (→)"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-6 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-black/75 transition cursor-pointer shadow-lg"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip (if multiple images) */}
      {imageList.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 overflow-x-auto p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 max-w-full z-10"
        >
          {imageList.map((imgUrl, idx) => (
            <button
              type="button"
              key={imgUrl + idx}
              onClick={() => {
                setCurrentIndex(idx);
                setZoom(1);
                setRotation(0);
              }}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                idx === currentIndex
                  ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/30'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

