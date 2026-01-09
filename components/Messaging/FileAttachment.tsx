"use client";

import { useState, useRef } from "react";

export interface Attachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface FileAttachmentProps {
  onFilesSelected: (files: Attachment[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
}

export default function FileAttachment({
  onFilesSelected,
  disabled = false,
  maxFiles = 5,
  maxSizePerFile = 10 * 1024 * 1024, // 10MB default
}: FileAttachmentProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Validate number of files
    if (selectedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at a time.`);
      return;
    }

    // Validate file sizes
    for (const file of Array.from(selectedFiles)) {
      if (file.size > maxSizePerFile) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxSizePerFile / (1024 * 1024)}MB.`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadedAttachments: Attachment[] = [];

      for (const file of Array.from(selectedFiles)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/images", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedAttachments.push({
            url: data.url,
            type: file.type,
            name: file.name,
            size: file.size,
          });
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      onFilesSelected(uploadedAttachments);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      <button
        type="button"
        onClick={handleFileClick}
        disabled={disabled || uploading}
        className="
          p-2 rounded-full
          hover:bg-gray-100
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
        aria-label="Attach file"
        title="Attach file"
      >
        {uploading ? (
          <svg className="w-6 h-6 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
