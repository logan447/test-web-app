"use client";

import { useState, useMemo } from "react";
import {
  type CareDocument,
  type DocumentCategory,
  DOCUMENT_CATEGORIES,
  formatFileSize,
  getFileTypeLabel,
  isImageDocument,
  isPdfDocument,
  groupDocumentsByCategory,
  sortDocumentsByDate,
} from "@/lib/documentUtils";

interface DocumentListProps {
  documents: CareDocument[];
  onDelete?: (documentId: string) => void;
  showUploader?: boolean;
  emptyMessage?: string;
  groupByCategory?: boolean;
  currentUserId?: string;
}

export default function DocumentList({
  documents,
  onDelete,
  emptyMessage = "No documents shared yet",
  groupByCategory = false,
  currentUserId,
}: DocumentListProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter((doc) => doc.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          DOCUMENT_CATEGORIES[doc.category].label.toLowerCase().includes(query)
      );
    }

    return sortDocumentsByDate(result);
  }, [documents, filterCategory, searchQuery]);

  // Group documents if needed
  const groupedDocuments = useMemo(() => {
    if (!groupByCategory) return null;
    return groupDocumentsByCategory(filteredDocuments);
  }, [filteredDocuments, groupByCategory]);

  const handleDownload = (doc: CareDocument) => {
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (doc: CareDocument) => {
    if (isImageDocument(doc.type) || isPdfDocument(doc.type)) {
      setPreviewUrl(doc.url);
    } else {
      // For other documents, just open in new tab
      window.open(doc.url, "_blank");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (mimeType === "application/pdf") {
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (mimeType.includes("word")) {
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    }
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  const renderDocumentCard = (doc: CareDocument) => {
    const canDelete = onDelete && currentUserId === doc.uploadedBy;

    return (
      <div
        key={doc.id}
        className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition-all"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
            {getDocumentIcon(doc.type)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    {DOCUMENT_CATEGORIES[doc.category].label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getFileTypeLabel(doc.type)} &bull; {formatFileSize(doc.size)}
                  </span>
                </div>
              </div>
            </div>

            {doc.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{doc.description}</p>
            )}

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-400">
                {doc.uploadedByName ? `Uploaded by ${doc.uploadedByName} on ` : "Uploaded "}
                {formatDate(doc.uploadedAt)}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handlePreview(doc)}
                  className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Preview"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
                {canDelete && (
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGroupedDocuments = () => {
    if (!groupedDocuments) return null;

    return Object.entries(groupedDocuments).map(([category, docs]) => {
      if (docs.length === 0) return null;

      const categoryConfig = DOCUMENT_CATEGORIES[category as DocumentCategory];

      return (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            {categoryConfig.label}
            <span className="text-sm font-normal text-gray-500">({docs.length})</span>
          </h3>
          <div className="space-y-2">{docs.map(renderDocumentCard)}</div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | "all")}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : groupByCategory ? (
        <div className="space-y-6">{renderGroupedDocuments()}</div>
      ) : (
        <div className="space-y-2">{filteredDocuments.map(renderDocumentCard)}</div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {previewUrl.includes(".pdf") || previewUrl.endsWith(".pdf") ? (
              <iframe
                src={previewUrl}
                className="w-full h-[80vh] rounded-lg bg-white"
                title="Document Preview"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Document Preview"
                className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
