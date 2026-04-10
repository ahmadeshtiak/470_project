import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import ImageCarousel from "../components/ImageCarousel";
import "./parts.css";

export default function LatestParts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestParts();
  }, []);

  const fetchLatestParts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/parts/latest");
      setParts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch latest parts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading latest parts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Latest Parts</h2>
        <button
          onClick={() => navigate("/parts")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View All →
        </button>
      </div>

      {parts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No parts available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {parts.map((part) => (
            <div
              key={part._id}
              className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition duration-200 cursor-pointer border border-gray-200"
              onClick={() => navigate(`/parts/${part._id}`)}
            >
              <div className="relative h-40 w-full bg-gray-200">
                <ImageCarousel images={part.images || []} alt={part.name} />
                <div className="absolute top-2 right-2 z-20">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      part.condition === "new"
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {part.condition.charAt(0).toUpperCase() + part.condition.slice(1)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{part.name}</h3>
                <p className="text-xs text-gray-600 mb-2">Category: {part.category}</p>
                <p className="text-lg font-bold text-blue-600">৳{part.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

