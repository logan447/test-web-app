"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { showToast } from "@/lib/toast";

export type PhotoCategory = "exterior" | "interior" | "amenities" | "staff" | "activities" | "other";

export interface PhotoMetadata {
  url: string;
  caption?: string;
  category: PhotoCategory;
}

interface EnhancedPhotoUploadProps {
  photos: PhotoMetadata[];
  coverPhoto: string | null;
  onPhotosChange: (photos: PhotoMetadata[], coverPhoto: string | null) => void;
}

const CATEGORIES = [
  { id: "all" as const, label: "All Photos", icon: "📸" },
  { id: "exterior" as PhotoCategory, label: "Exterior", icon: "🏠" },
  { id: "interior" as PhotoCategory, label: "Interior", icon: "🛋️" },
  { id: "amenities" as PhotoCategory, label: "Amenities", icon: "✨" },
  { id: "staff" as PhotoCategory, label: "Staff", icon: "👥" },
  { id: "activities" as PhotoCategory, label: "Activities", icon: "🎨" },
  { id: "other" as PhotoCategory, label: "Other", icon: "📷" },
];

const PHOTO_TIPS = {
  exterior: [
    "Show your building's curb appeal from different angles",
    "Include landscaping and outdoor spaces",
    "Photograph during golden hour for best lighting",
  ],
  interior: [
    "Capture well-lit, clean, and organized spaces",
    "Show variety: living areas, bedrooms, bathrooms",
    "Include details that make your facility unique",
  ],
  amenities: [
    "Highlight special features and equipment",
    "Show fitness areas, pools, gardens, common spaces",
    "Include accessibility features",
  ],
  staff: [
    "Friendly, professional photos of team members",
    "Action shots of staff interacting with residents",
    "Get consent before photographing staff",
  ],
  activities: [
    "Show residents engaged in programs (with consent)",
    "Capture the atmosphere of social events",
    "Include photos of activity spaces and materials",
  ],
  other: [
    "Awards, certifications, or recognitions",
    "Special events or seasonal decorations",
    "Any other aspects that showcase your facility",
  ],
};

export default function EnhancedPhotoUpload({
  photos,
  coverPhoto,
  onPhotosChange,
}: EnhancedPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | "all">("all");
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null, category: PhotoCategory = "other") => {
    if (!files || files.length === 0) return;

    // Limit to 20 photos total
    if (photos.length + files.length > 20) {
      showToast.error("Maximum 20 photos allowed");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/images", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newPhotoMetadata: PhotoMetadata[] = uploadedUrls.map((url) => ({
        url,
        caption: "",
        category: selectedCategory === "all" ? category : selectedCategory,
      }));

      const updatedPhotos = [...photos, ...newPhotoMetadata];

      // Set first uploaded photo as cover if no cover exists
      const newCoverPhoto = coverPhoto || uploadedUrls[0];

      onPhotosChange(updatedPhotos, newCoverPhoto);
      showToast.success(`${uploadedUrls.length} photo(s) uploaded successfully`);
    } catch (error: any) {
      showToast.error(error.message || "Failed to upload photos");
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [photos, coverPhoto, selectedCategory]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files);
    }
  };

  const handleRemove = (photoUrl: string) => {
    const newPhotos = photos.filter((p) => p.url !== photoUrl);
    let newCoverPhoto = coverPhoto;

    // If removing the cover photo, set the first remaining photo as cover
    if (photoUrl === coverPhoto) {
      newCoverPhoto = newPhotos.length > 0 ? newPhotos[0].url : null;
    }

    onPhotosChange(newPhotos, newCoverPhoto);
    showToast.success("Photo removed");
  };

  const handleSetCover = (photoUrl: string) => {
    onPhotosChange(photos, photoUrl);
    showToast.success("Cover photo updated");
  };

  const handleUpdateCaption = (photoUrl: string, caption: string) => {
    const updatedPhotos = photos.map((photo) =>
      photo.url === photoUrl ? { ...photo, caption } : photo
    );
    onPhotosChange(updatedPhotos, coverPhoto);
    setEditingCaption(null);
    showToast.success("Caption updated");
  };

  const handleUpdateCategory = (photoUrl: string, category: PhotoCategory) => {
    const updatedPhotos = photos.map((photo) =>
      photo.url === photoUrl ? { ...photo, category } : photo
    );
    onPhotosChange(updatedPhotos, coverPhoto);
    showToast.success("Category updated");
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const displayedPhotos = getDisplayedPhotos();
    const newPhotos = [...photos];

    // Find the actual indices in the full array
    const fromPhoto = displayedPhotos[fromIndex];
    const toPhoto = displayedPhotos[toIndex];
    const actualFromIndex = photos.findIndex(p => p.url === fromPhoto.url);
    const actualToIndex = photos.findIndex(p => p.url === toPhoto.url);

    const [movedPhoto] = newPhotos.splice(actualFromIndex, 1);
    newPhotos.splice(actualToIndex, 0, movedPhoto);
    onPhotosChange(newPhotos, coverPhoto);
  };

  const getDisplayedPhotos = () => {
    if (selectedCategory === "all") {
      return photos;
    }
    return photos.filter((photo) => photo.category === selectedCategory);
  };

  const getCategoryCount = (category: PhotoCategory | "all") => {
    if (category === "all") return photos.length;
    return photos.filter((p) => p.category === category).length;
  };

  const displayedPhotos = getDisplayedPhotos();

  return (
    <div>
      {/* Photo Guidelines */}
      {showTips && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Photo Guidelines</h4>
                <button
                  type="button"
                  onClick={() => setShowTips(false)}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Hide
                </button>
              </div>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Upload high-quality, well-lit photos (min 1200x800px recommended)</li>
                <li>Add captions to help families understand what they&apos;re seeing</li>
                <li>Organize photos by category for better presentation</li>
                <li>Your first photo will be the cover image - make it count!</li>
                <li>Profiles with 10+ photos get 5x more inquiries</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!showTips && (
        <button
          type="button"
          onClick={() => setShowTips(true)}
          className="text-primary-600 hover:text-primary-700 text-sm mb-4"
        >
          Show photo guidelines
        </button>
      )}

      {/* Category Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
              {getCategoryCount(cat.id) > 0 && (
                <span className="ml-2 text-xs opacity-75">({getCategoryCount(cat.id)})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category-specific tips */}
      {selectedCategory !== "all" && (
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <h5 className="text-xs font-semibold text-gray-700 mb-2">
            Tips for {CATEGORIES.find((c) => c.id === selectedCategory)?.label} Photos:
          </h5>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            {PHOTO_TIPS[selectedCategory as PhotoCategory]?.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
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
            {uploading ? "Uploading..." : "Click to upload"}
          </button>
          <span className="text-gray-600"> or drag and drop</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          PNG, JPG, WebP up to 5MB (max 20 photos)
        </p>
        {selectedCategory !== "all" && (
          <p className="text-xs text-primary-600 mt-1 font-medium">
            Uploading to: {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          </p>
        )}
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
      {displayedPhotos.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              {selectedCategory === "all"
                ? `All Photos (${photos.length}/20)`
                : `${CATEGORIES.find((c) => c.id === selectedCategory)?.label} Photos (${displayedPhotos.length})`}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPhotos.map((photo, index) => (
              <div
                key={photo.url + index}
                className="relative rounded-lg overflow-hidden border-2 border-gray-200 group bg-white"
              >
                {/* Image */}
                <div className="relative aspect-video">
                  <Image
                    src={photo.url}
                    alt={photo.caption || `Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Cover badge */}
                  {photo.url === coverPhoto && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full z-10 font-medium">
                      ⭐ Cover Photo
                    </div>
                  )}

                  {/* Category badge */}
                  {selectedCategory === "all" && (
                    <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded-full z-10">
                      {CATEGORIES.find((c) => c.id === photo.category)?.icon}{" "}
                      {CATEGORIES.find((c) => c.id === photo.category)?.label}
                    </div>
                  )}

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {photo.url !== coverPhoto && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(photo.url)}
                        className="bg-white text-gray-900 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-100 shadow-lg"
                        title="Set as cover"
                      >
                        Set Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(photo.url)}
                      className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 shadow-lg"
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
                        className="bg-white text-gray-900 p-1.5 rounded shadow-lg hover:bg-gray-100"
                        title="Move left"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    )}
                    {index < displayedPhotos.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleReorder(index, index + 1)}
                        className="bg-white text-gray-900 p-1.5 rounded shadow-lg hover:bg-gray-100"
                        title="Move right"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Caption and Category */}
                <div className="p-3 space-y-2">
                  {/* Caption */}
                  {editingCaption === photo.url ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue={photo.caption}
                        placeholder="Add a caption..."
                        className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateCaption(photo.url, e.currentTarget.value);
                          } else if (e.key === "Escape") {
                            setEditingCaption(null);
                          }
                        }}
                        onBlur={(e) => handleUpdateCaption(photo.url, e.currentTarget.value)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingCaption(photo.url)}
                      className="w-full text-left text-sm text-gray-600 hover:text-gray-900 min-h-[20px]"
                    >
                      {photo.caption || (
                        <span className="text-gray-400 italic">Click to add caption...</span>
                      )}
                    </button>
                  )}

                  {/* Category selector */}
                  <select
                    value={photo.category}
                    onChange={(e) => handleUpdateCategory(photo.url, e.target.value as PhotoCategory)}
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for filtered view */}
      {selectedCategory !== "all" && displayedPhotos.length === 0 && photos.length > 0 && (
        <div className="mt-6 text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            No photos in {CATEGORIES.find((c) => c.id === selectedCategory)?.label} category yet.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Upload photos or change the category of existing photos.
          </p>
        </div>
      )}
    </div>
  );
}
