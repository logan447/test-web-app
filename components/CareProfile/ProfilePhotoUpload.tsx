"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ProfilePhotoUploadProps {
  currentPhoto?: string | null;
  onPhotoChange: (photo: string | null) => void;
}

export default function ProfilePhotoUpload({
  currentPhoto,
  onPhotoChange,
}: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onPhotoChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Preview Circle */}
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
            {preview ? (
              <Image
                src={preview}
                alt="Profile photo"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <svg
                  className="w-16 h-16 text-primary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Profile Photo (Optional)
              </h3>
              <p className="text-sm text-gray-600">
                Adding a photo helps providers connect with your story
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleButtonClick}
                className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors font-medium text-sm"
              >
                {preview ? "Change Photo" : "Upload Photo"}
              </button>

              {preview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="bg-white border-2 border-red-300 text-red-700 px-4 py-2 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Accepted formats: JPG, PNG, GIF (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Privacy Protection
            </h4>
            <p className="text-xs text-blue-800">
              Your photo is only shared with providers you choose to contact. It
              will not be publicly visible and you can remove it at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
