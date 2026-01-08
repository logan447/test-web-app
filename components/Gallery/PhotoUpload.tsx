"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { showToast } from "@/lib/toast";

interface PhotoUploadProps {
  photos: string[];
  coverPhoto: string | null;
  onPhotosChange: (photos: string[], coverPhoto: string | null) => void;
}

export default function PhotoUpload({ photos, coverPhoto, onPhotosChange }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Limit to 10 photos total
    if (photos.length + files.length > 10) {
      showToast.error('Maximum 10 photos allowed');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/images', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newPhotos = [...photos, ...uploadedUrls];

      // Set first uploaded photo as cover if no cover exists
      const newCoverPhoto = coverPhoto || uploadedUrls[0];

      onPhotosChange(newPhotos, newCoverPhoto);
      showToast.success(`${uploadedUrls.length} photo(s) uploaded successfully`);
    } catch (error: any) {
      showToast.error(error.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [photos, coverPhoto]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files);
    }
  };

  const handleRemove = (photoUrl: string) => {
    const newPhotos = photos.filter(p => p !== photoUrl);
    let newCoverPhoto = coverPhoto;

    // If removing the cover photo, set the first remaining photo as cover
    if (photoUrl === coverPhoto) {
      newCoverPhoto = newPhotos.length > 0 ? newPhotos[0] : null;
    }

    onPhotosChange(newPhotos, newCoverPhoto);
    showToast.success('Photo removed');
  };

  const handleSetCover = (photoUrl: string) => {
    onPhotosChange(photos, photoUrl);
    showToast.success('Cover photo updated');
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    onPhotosChange(newPhotos, coverPhoto);
  };

  return (
    <div>
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary-600 hover:text-primary-700 font-medium"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Click to upload'}
          </button>
          <span className="text-gray-600"> or drag and drop</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          PNG, JPG, WebP up to 5MB (max 10 photos)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Photos ({photos.length}/10)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo + index}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
              >
                <Image
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />

                {/* Cover badge */}
                {photo === coverPhoto && (
                  <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded z-10">
                    Cover
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {photo !== coverPhoto && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo)}
                      className="bg-white text-gray-900 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100"
                      title="Set as cover"
                    >
                      Set Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(photo)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700"
                    title="Remove"
                  >
                    Remove
                  </button>
                </div>

                {/* Reorder buttons */}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleReorder(index, index - 1)}
                      className="bg-white text-gray-900 p-1 rounded shadow hover:bg-gray-100"
                      title="Move left"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {index < photos.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleReorder(index, index + 1)}
                      className="bg-white text-gray-900 p-1 rounded shadow hover:bg-gray-100"
                      title="Move right"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
