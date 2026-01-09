"use client";

import { useEffect } from "react";

export interface Attachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface AttachmentGalleryProps {
  attachments: Attachment[];
  currentIndex: number;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function AttachmentGallery({
  attachments,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}: AttachmentGalleryProps) {
  const imageAttachments = attachments.filter((a) => a.type.startsWith("image/"));
  const currentAttachment = imageAttachments[currentIndex];

  const hasNext = currentIndex < imageAttachments.length - 1;
  const hasPrevious = currentIndex > 0;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && hasPrevious && onPrevious) {
        onPrevious();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious, hasNext, hasPrevious]);

  // Prevent body scroll when gallery is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!currentAttachment) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black bg-opacity-90
        flex items-center justify-center
      "
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="
          absolute top-4 right-4
          text-white hover:text-gray-300
          transition-colors
          z-10
        "
        aria-label="Close gallery"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Previous Button */}
      {hasPrevious && onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="
            absolute left-4 top-1/2 -translate-y-1/2
            text-white hover:text-gray-300
            transition-colors
            bg-black bg-opacity-50 rounded-full p-3
            z-10
          "
          aria-label="Previous image"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next Button */}
      {hasNext && onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="
            absolute right-4 top-1/2 -translate-y-1/2
            text-white hover:text-gray-300
            transition-colors
            bg-black bg-opacity-50 rounded-full p-3
            z-10
          "
          aria-label="Next image"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-7xl max-h-screen p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentAttachment.url}
          alt={currentAttachment.name}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />

        {/* Image Info */}
        <div className="mt-4 text-center">
          <p className="text-white text-sm font-medium">{currentAttachment.name}</p>
          {imageAttachments.length > 1 && (
            <p className="text-gray-400 text-xs mt-1">
              {currentIndex + 1} of {imageAttachments.length}
            </p>
          )}
        </div>

        {/* Download Button */}
        <div className="mt-4 text-center">
          <a
            href={currentAttachment.url}
            download={currentAttachment.name}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              px-4 py-2
              bg-white text-gray-900
              rounded-lg
              hover:bg-gray-100
              transition-colors
            "
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
