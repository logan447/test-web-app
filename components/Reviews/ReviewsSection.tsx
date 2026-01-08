"use client";

import { useState, useEffect } from "react";
import { showToast } from "@/lib/toast";

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  content: string;
  relationship?: string | null;
  lengthOfStay?: string | null;
  helpfulCount: number;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ReviewsSectionProps {
  providerId: string;
  averageRating?: number | null;
  reviewCount: number;
  onWriteReview: () => void;
}

export default function ReviewsSection({
  providerId,
  averageRating,
  reviewCount,
  onWriteReview,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");
  const [markingHelpful, setMarkingHelpful] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [page, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/providers/${providerId}/reviews?page=${page}&limit=10&sortBy=${sortBy}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      showToast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    setMarkingHelpful(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to mark review as helpful");
      }

      const data = await response.json();

      // Update the review in the list
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, helpfulCount: data.helpfulCount }
            : review
        )
      );

      showToast.success("Thanks for your feedback!");
    } catch (error) {
      showToast.error("Failed to mark review as helpful");
    } finally {
      setMarkingHelpful(null);
    }
  };

  const renderStars = (rating: number, size: "small" | "large" = "small") => {
    const sizeClass = size === "large" ? "w-8 h-8" : "w-5 h-5";
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    }
  };

  return (
    <div className="mb-8">
      {/* Header with average rating */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
          <button
            onClick={onWriteReview}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
          >
            Write a Review
          </button>
        </div>

        {reviewCount > 0 ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
              <div className="text-5xl font-bold text-gray-900">
                {averageRating?.toFixed(1) || "0.0"}
              </div>
              {renderStars(Math.round(averageRating || 0), "large")}
              <div className="text-sm text-gray-600 mt-2">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>

      {/* Sort options */}
      {reviewCount > 0 && (
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mr-3">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
            >
              {/* Review header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900">
                      {review.user.name}
                    </span>
                    {review.relationship && (
                      <span className="text-sm text-gray-600">
                        • {review.relationship}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                    {review.lengthOfStay && (
                      <span className="text-sm text-gray-500">
                        • Stayed for {review.lengthOfStay}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Review title */}
              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">
                  {review.title}
                </h4>
              )}

              {/* Review content */}
              <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>

              {/* Helpful button */}
              <button
                onClick={() => handleMarkHelpful(review.id)}
                disabled={markingHelpful === review.id}
                className="text-sm text-gray-600 hover:text-primary-600 font-medium inline-flex items-center gap-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                Helpful ({review.helpfulCount})
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
