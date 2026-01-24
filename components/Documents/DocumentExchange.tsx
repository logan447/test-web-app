"use client";

import { useState } from "react";
import DocumentUpload from "./DocumentUpload";
import DocumentList from "./DocumentList";
import { type CareDocument } from "@/lib/documentUtils";

interface DocumentExchangeProps {
  documents: CareDocument[];
  onUpload: (document: CareDocument) => void;
  onDelete?: (documentId: string) => void;
  currentUserId?: string;
  isProvider?: boolean;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export default function DocumentExchange({
  documents,
  onUpload,
  onDelete,
  currentUserId,
  isProvider = false,
  disabled = false,
  title = "Shared Documents",
  description,
}: DocumentExchangeProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpload = (document: CareDocument) => {
    onUpload(document);
    setShowUploader(false);
    setSuccessMessage("Document uploaded successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
          </div>

          {!showUploader && !disabled && (
            <button
              onClick={() => setShowUploader(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {showUploader ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Upload a Document</h4>
              <button
                onClick={() => setShowUploader(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <DocumentUpload
              onUpload={handleUpload}
              onError={handleError}
              disabled={disabled}
            />
          </div>
        ) : (
          <DocumentList
            documents={documents}
            onDelete={onDelete}
            currentUserId={currentUserId}
            emptyMessage={
              isProvider
                ? "Share important documents with families here"
                : "Upload care-related documents to share with your provider"
            }
          />
        )}
      </div>

      {/* Footer Info */}
      {!showUploader && documents.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {documents.length} document{documents.length !== 1 ? "s" : ""} shared &bull;
            Documents are encrypted and stored securely
          </p>
        </div>
      )}

      {/* Security Notice */}
      {showUploader && (
        <div className="px-6 py-3 border-t border-gray-100 bg-amber-50">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-xs text-amber-800">
              <strong>Privacy Notice:</strong> Only upload documents you have permission to share.
              Sensitive information like Social Security numbers should be redacted before uploading.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
