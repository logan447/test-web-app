import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  SUPPORTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
  generateDocumentId,
  formatFileSize,
} from "@/lib/documentUtils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!SUPPORTED_DOCUMENT_TYPES.includes(file.type as typeof SUPPORTED_DOCUMENT_TYPES[number])) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Supported formats: PDF, Word, Excel, text files, and images.",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_DOCUMENT_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${formatFileSize(MAX_DOCUMENT_SIZE)}.`,
        },
        { status: 400 }
      );
    }

    // Generate unique document ID
    const documentId = generateDocumentId();

    // Create a sanitized filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobPath = `documents/${session.user.id}/${documentId}_${sanitizedName}`;

    // Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Return document metadata
    return NextResponse.json({
      id: documentId,
      name: file.name,
      url: blob.url,
      type: file.type,
      size: file.size,
      category: category || "other",
      description: description || undefined,
      uploadedAt: new Date().toISOString(),
      uploadedBy: session.user.id,
      uploadedByName: session.user.name || undefined,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
