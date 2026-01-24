/**
 * Document Utilities
 * Types and helpers for the document exchange system
 */

// Document categories for care-related document exchange
export type DocumentCategory =
  | "care_plan"
  | "medical_record"
  | "insurance"
  | "legal"
  | "assessment"
  | "medication"
  | "financial"
  | "identification"
  | "other";

export interface CareDocument {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number;
  category: DocumentCategory;
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName?: string;
}

// Supported document MIME types
export const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const DOCUMENT_EXTENSIONS = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/plain": ".txt",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

// Max file size: 10MB for documents
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

// Category configuration
export const DOCUMENT_CATEGORIES: Record<DocumentCategory, { label: string; description: string; icon: string }> = {
  care_plan: {
    label: "Care Plan",
    description: "Care plans, daily routines, and care instructions",
    icon: "clipboard-document-list",
  },
  medical_record: {
    label: "Medical Records",
    description: "Medical history, doctor notes, test results",
    icon: "heart",
  },
  insurance: {
    label: "Insurance",
    description: "Insurance cards, policy documents, coverage details",
    icon: "shield-check",
  },
  legal: {
    label: "Legal Documents",
    description: "Power of attorney, advance directives, legal forms",
    icon: "document-text",
  },
  assessment: {
    label: "Assessments",
    description: "Care assessments, evaluations, intake forms",
    icon: "clipboard-document-check",
  },
  medication: {
    label: "Medications",
    description: "Medication lists, prescriptions, dosage schedules",
    icon: "beaker",
  },
  financial: {
    label: "Financial",
    description: "Payment information, invoices, financial agreements",
    icon: "banknotes",
  },
  identification: {
    label: "Identification",
    description: "ID cards, photos, emergency contacts",
    icon: "identification",
  },
  other: {
    label: "Other",
    description: "Other relevant documents",
    icon: "document",
  },
};

/**
 * Check if a file type is supported
 */
export function isSupportedDocumentType(mimeType: string): boolean {
  return SUPPORTED_DOCUMENT_TYPES.includes(mimeType as typeof SUPPORTED_DOCUMENT_TYPES[number]);
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromType(mimeType: string): string {
  return DOCUMENT_EXTENSIONS[mimeType as keyof typeof DOCUMENT_EXTENSIONS] || "";
}

/**
 * Get a user-friendly file type label
 */
export function getFileTypeLabel(mimeType: string): string {
  const typeLabels: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "Word Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
    "application/vnd.ms-excel": "Excel Spreadsheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel Spreadsheet",
    "text/plain": "Text File",
    "image/jpeg": "JPEG Image",
    "image/png": "PNG Image",
    "image/webp": "WebP Image",
  };
  return typeLabels[mimeType] || "Document";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Check if a document is an image
 */
export function isImageDocument(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/**
 * Check if a document is a PDF
 */
export function isPdfDocument(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

/**
 * Generate a unique document ID
 */
export function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate a file before upload
 */
export function validateDocument(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!isSupportedDocumentType(file.type)) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload PDF, Word, Excel, text, or image files.",
    };
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${formatFileSize(MAX_DOCUMENT_SIZE)}.`,
    };
  }

  return { valid: true };
}

/**
 * Get icon name for a document type
 */
export function getDocumentIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "photo";
  if (mimeType === "application/pdf") return "document-text";
  if (mimeType.includes("word")) return "document";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "table-cells";
  if (mimeType === "text/plain") return "document";
  return "paper-clip";
}

/**
 * Sort documents by date (newest first)
 */
export function sortDocumentsByDate(documents: CareDocument[]): CareDocument[] {
  return [...documents].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

/**
 * Group documents by category
 */
export function groupDocumentsByCategory(
  documents: CareDocument[]
): Record<DocumentCategory, CareDocument[]> {
  const grouped: Record<DocumentCategory, CareDocument[]> = {
    care_plan: [],
    medical_record: [],
    insurance: [],
    legal: [],
    assessment: [],
    medication: [],
    financial: [],
    identification: [],
    other: [],
  };

  for (const doc of documents) {
    grouped[doc.category].push(doc);
  }

  return grouped;
}
