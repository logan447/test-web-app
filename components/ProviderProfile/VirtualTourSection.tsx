"use client";

import { useState } from "react";

export interface VirtualTourData {
  // Virtual Tour Link
  virtualTourUrl: string;
  virtualTourType: "youtube" | "vimeo" | "custom" | "";

  // Brochure Upload
  brochureUrl: string;

  // Floor Plans Upload
  floorPlanUrls: string[];
}

interface VirtualTourSectionProps {
  data: VirtualTourData;
  onChange: (data: VirtualTourData) => void;
}

export default function VirtualTourSection({
  data,
  onChange,
}: VirtualTourSectionProps) {
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingFloorPlans, setUploadingFloorPlans] = useState(false);

  const handleBrochureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrochure(true);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      const brochureUrl = result.urls?.[0] || "";

      onChange({ ...data, brochureUrl });
    } catch (error) {
      console.error("Brochure upload failed:", error);
      alert("Failed to upload brochure. Please try again.");
    } finally {
      setUploadingBrochure(false);
    }
  };

  const handleFloorPlanUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFloorPlans(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      const newUrls = result.urls || [];

      onChange({
        ...data,
        floorPlanUrls: [...data.floorPlanUrls, ...newUrls],
      });
    } catch (error) {
      console.error("Floor plan upload failed:", error);
      alert("Failed to upload floor plans. Please try again.");
    } finally {
      setUploadingFloorPlans(false);
    }
  };

  const removeFloorPlan = (urlToRemove: string) => {
    onChange({
      ...data,
      floorPlanUrls: data.floorPlanUrls.filter((url) => url !== urlToRemove),
    });
  };

  const getVideoEmbedUrl = (url: string, type: string) => {
    if (!url) return "";

    if (type === "youtube") {
      // Extract video ID from various YouTube URL formats
      const youtubeRegex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(youtubeRegex);
      return match ? `https://www.youtube.com/embed/${match[1]}` : "";
    } else if (type === "vimeo") {
      // Extract video ID from Vimeo URL
      const vimeoRegex = /vimeo\.com\/(\d+)/;
      const match = url.match(vimeoRegex);
      return match ? `https://player.vimeo.com/video/${match[1]}` : "";
    }

    return url;
  };

  const embedUrl = getVideoEmbedUrl(
    data.virtualTourUrl,
    data.virtualTourType
  );

  return (
    <div className="space-y-8">
      {/* Virtual Tour */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Virtual Tour
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Share a virtual tour or video walkthrough to give families an immersive preview of your facility.
        </p>

        {/* Tour Type Selection */}
        <div className="mb-4">
          <label
            htmlFor="tour-type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            🎥 Virtual Tour Type
          </label>
          <select
            id="tour-type"
            value={data.virtualTourType}
            onChange={(e) =>
              onChange({
                ...data,
                virtualTourType: e.target.value as any,
              })
            }
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select tour type</option>
            <option value="youtube">YouTube Video</option>
            <option value="vimeo">Vimeo Video</option>
            <option value="custom">Custom Link (360° tour, etc.)</option>
          </select>
        </div>

        {/* URL Input */}
        {data.virtualTourType && (
          <div className="mb-4">
            <label
              htmlFor="tour-url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              🔗 Virtual Tour URL
            </label>
            <input
              type="url"
              id="tour-url"
              value={data.virtualTourUrl}
              onChange={(e) =>
                onChange({ ...data, virtualTourUrl: e.target.value })
              }
              placeholder={
                data.virtualTourType === "youtube"
                  ? "https://www.youtube.com/watch?v=..."
                  : data.virtualTourType === "vimeo"
                  ? "https://vimeo.com/..."
                  : "https://..."
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              {data.virtualTourType === "youtube" &&
                "💡 Paste any YouTube URL (we'll handle the formatting)"}
              {data.virtualTourType === "vimeo" &&
                "💡 Paste any Vimeo URL (we'll handle the formatting)"}
              {data.virtualTourType === "custom" &&
                "💡 Paste the full URL to your virtual tour or 360° experience"}
            </p>
          </div>
        )}

        {/* Video Preview */}
        {embedUrl &&
          (data.virtualTourType === "youtube" ||
            data.virtualTourType === "vimeo") && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                📺 Preview
              </p>
              <div className="aspect-video w-full md:w-2/3 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="Virtual Tour Preview"
                />
              </div>
            </div>
          )}

        {/* Custom Link Preview */}
        {data.virtualTourUrl && data.virtualTourType === "custom" && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🔗 Your custom tour link:{" "}
              <a
                href={data.virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline font-medium"
              >
                {data.virtualTourUrl}
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Brochure Upload */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Facility Brochure
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a PDF brochure with details about your facility, services, and amenities.
        </p>

        {data.brochureUrl ? (
          <div className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg bg-white">
            <div className="flex-shrink-0 text-4xl">📄</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Brochure Uploaded
              </p>
              <a
                href={data.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 underline"
              >
                View Brochure
              </a>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...data, brochureUrl: "" })}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <label
              htmlFor="brochure-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition-colors text-sm"
            >
              {uploadingBrochure ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Uploading...
                </>
              ) : (
                <>
                  📤 Upload Brochure (PDF)
                </>
              )}
            </label>
            <input
              type="file"
              id="brochure-upload"
              accept=".pdf,application/pdf"
              onChange={handleBrochureUpload}
              disabled={uploadingBrochure}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 PDF format, maximum 10MB
            </p>
          </div>
        )}
      </div>

      {/* Floor Plans Upload */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Floor Plans
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload floor plans showing room layouts, common areas, and facility layout (PDF or images).
        </p>

        {/* Uploaded Floor Plans */}
        {data.floorPlanUrls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {data.floorPlanUrls.map((url, index) => (
              <div
                key={url}
                className="relative group border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
              >
                <div className="aspect-video w-full flex items-center justify-center">
                  {url.toLowerCase().endsWith(".pdf") ? (
                    <div className="flex flex-col items-center gap-2 p-4">
                      <div className="text-5xl">📄</div>
                      <p className="text-sm text-gray-600 font-medium">
                        Floor Plan {index + 1} (PDF)
                      </p>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 underline"
                      >
                        View PDF
                      </a>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`Floor plan ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFloorPlan(url)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div>
          <label
            htmlFor="floorplan-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition-colors text-sm"
          >
            {uploadingFloorPlans ? (
              <>
                <span className="animate-spin">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                📤 Upload Floor Plans
              </>
            )}
          </label>
          <input
            type="file"
            id="floorplan-upload"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
            multiple
            onChange={handleFloorPlanUpload}
            disabled={uploadingFloorPlans}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 PDF or images, can upload multiple files
          </p>
        </div>
      </div>

      {/* Summary */}
      {(data.virtualTourUrl ||
        data.brochureUrl ||
        data.floorPlanUrls.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Virtual Tour & Media Summary
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                {data.virtualTourUrl && (
                  <p>
                    • Virtual tour: {data.virtualTourType} (
                    {data.virtualTourUrl.substring(0, 40)}...)
                  </p>
                )}
                {data.brochureUrl && <p>• Facility brochure uploaded</p>}
                {data.floorPlanUrls.length > 0 && (
                  <p>• {data.floorPlanUrls.length} floor plan(s) uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
