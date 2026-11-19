import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../services/api";

interface ReviewFormProps {
  bookingId: number;
  revieweeName: string;
  onReviewSubmitted: () => void;
}

const API_URL = API_BASE_URL;

function ReviewForm({
  bookingId,
  revieweeName,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const checkReviewStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/api/reviews/booking/${bookingId}/my-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setHasReviewed(response.data.hasReviewed);
      } catch (err) {
        console.error("Unable to check review status:", err);
      } finally {
        setChecking(false);
      }
    };

    checkReviewStatus();
  }, [bookingId]);

  const submitReview = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/reviews`,
        {
          bookingId,
          rating,
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHasReviewed(true);
      setComment("");
      onReviewSubmitted();

      alert("Review submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Unable to submit review. You may have already reviewed this booking.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <p className="mt-4 text-gray-500">Checking review status...</p>;
  }

  if (hasReviewed) {
    return (
      <p className="mt-5 rounded-lg bg-green-50 p-4 font-medium text-green-700">
        You have already reviewed this booking. Thank you!
      </p>
    );
  }

  return (
    <div className="mt-5 rounded-lg border bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">
        Review {revieweeName}
      </h3>

      <p className="mt-3 text-sm text-gray-600">Your rating</p>

      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-3xl ${
              star <= rating ? "text-yellow-500" : "text-gray-300"
            }`}
            aria-label={`Rate ${star} out of 5`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        maxLength={1000}
        rows={3}
        className="mt-4 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={submitReview}
        disabled={loading}
        className="mt-3 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

export default ReviewForm;
