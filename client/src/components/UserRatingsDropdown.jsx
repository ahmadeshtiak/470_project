import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../utils/axios";

const UserRatingsDropdown = ({ userId, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRatings = async () => {
    if (!isOpen) return;

    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get(`/ratings/${userId}`, {
        params: { limit: 5 },
      });
      setRatings(response.data.data || []);
    } catch (err) {
      setError("Failed to load ratings");
      console.error("Error fetching ratings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchRatings();
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 hover:bg-amber-100 transition text-sm font-semibold"
      >
        <span>⭐ Reviews</span>
        <span className="text-xs">({ratings.length})</span>
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-t-lg">
            <h3 className="font-bold text-lg mb-1">{userName}</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold">
                {ratings.length > 0
                  ? (
                      ratings.reduce((sum, r) => sum + r.rating, 0) /
                      ratings.length
                    ).toFixed(1)
                  : "No ratings yet"}
              </span>
              {ratings.length > 0 && (
                <span className="text-sm opacity-90">({ratings.length})</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                <p className="mt-2 text-gray-600 text-sm">Loading reviews...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600 text-sm">{error}</div>
            ) : ratings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">No reviews yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {ratings.map((rating) => (
                  <div key={rating._id} className="p-4 hover:bg-gray-50">
                    {/* Rating Stars and Date */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < rating.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Reviewer Name */}
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {rating.ratedBy?.name || "Anonymous"}
                    </p>

                    {/* Review Text */}
                    {rating.review && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {rating.review.length > 150
                          ? rating.review.substring(0, 150) + "..."
                          : rating.review}
                      </p>
                    )}

                    {/* Rating Label */}
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded font-semibold">
                        {rating.rating === 1
                          ? "Poor"
                          : rating.rating === 2
                          ? "Fair"
                          : rating.rating === 3
                          ? "Good"
                          : rating.rating === 4
                          ? "Very Good"
                          : "Excellent"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRatingsDropdown;
