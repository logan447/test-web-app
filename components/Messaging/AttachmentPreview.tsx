"use client";

export interface Attachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface AttachmentPreviewProps {
  attachments: Attachment[];
  onImageClick?: (index: number) => void;
}

export default function AttachmentPreview({
  attachments,
  onImageClick,
}: AttachmentPreviewProps) {
  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
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
    } else if (type === "application/pdf") {
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
    } else {
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
  };

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment, index) => {
        const isImage = attachment.type.startsWith("image/");

        if (isImage) {
          return (
            <div key={index} className="relative inline-block">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="
                  max-w-sm max-h-60 rounded-lg cursor-pointer
                  hover:opacity-90 transition-opacity
                  border border-gray-200
                "
                onClick={() => onImageClick?.(index)}
              />
            </div>
          );
        } else {
          // Non-image file
          return (
            <a
              key={index}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              download={attachment.name}
              className="
                flex items-center gap-3 p-3
                bg-gray-50 hover:bg-gray-100
                border border-gray-200 rounded-lg
                transition-colors
                max-w-sm
              "
            >
              <div className="text-gray-600">{getFileIcon(attachment.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </a>
          );
        }
      })}
    </div>
  );
}
