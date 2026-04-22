import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";

export default function SellerAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (user.role !== "seller") {
      navigate("/dashboard");
      return;
    }
    
    fetchAnalytics();
  }, [user, authLoading, navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/analytics/seller-dashboard");
      setDashboardData(response.data.data);
      setError("");
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-amber-100">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-amber-100">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg">
            No analytics data available
          </div>
        </div>
      </div>
    );
  }

  const { summary, topByViews, topBySaves, allListings } = dashboardData || {};

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg">
            Analytics data is incomplete. Please refresh the page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-50 mb-2">📊 Seller Analytics</h1>
          <p className="text-amber-100/70">Track views and saves on your listings</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 p-6">
            <div className="text-sm text-blue-100/70 mb-2">Total Listings</div>
            <div className="text-4xl font-bold text-blue-50">{summary.totalListings}</div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 p-6">
            <div className="text-sm text-amber-100/70 mb-2">Total Views</div>
            <div className="text-4xl font-bold text-amber-50">{summary.totalViews.toLocaleString()}</div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 p-6">
            <div className="text-sm text-emerald-100/70 mb-2">Total Saves</div>
            <div className="text-4xl font-bold text-emerald-50">{summary.totalSaves.toLocaleString()}</div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 p-6">
            <div className="text-sm text-purple-100/70 mb-2">Avg Views</div>
            <div className="text-4xl font-bold text-purple-50">{summary.avgViewsPerListing}</div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 p-6">
            <div className="text-sm text-pink-100/70 mb-2">Avg Saves</div>
            <div className="text-4xl font-bold text-pink-50">{summary.avgSavesPerListing}</div>
          </div>
        </div>

        {/* Top Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top by Views */}
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#2c1b15] to-[#1f1410] p-6">
            <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
              👁️ Top Viewed
            </h2>
            {topByViews.length > 0 ? (
              <div className="space-y-3">
                {topByViews.map((listing, idx) => (
                  <div key={listing._id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10 hover:border-amber-500/30 transition">
                    <div className="flex-1">
                      <div className="font-semibold text-amber-50">{idx + 1}. {listing.title}</div>
                      <div className="text-sm text-amber-100/60 mt-1">{listing.listingType}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-400">{listing.viewCount}</div>
                      <div className="text-xs text-amber-100/60">views</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-amber-100/60 text-center py-4">No views yet</p>
            )}
          </div>

          {/* Top by Saves */}
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-[#2c1b15] to-[#1f1410] p-6">
            <h2 className="text-2xl font-bold text-emerald-50 mb-6 flex items-center gap-2">
              ❤️ Top Saved
            </h2>
            {topBySaves.length > 0 ? (
              <div className="space-y-3">
                {topBySaves.map((listing, idx) => (
                  <div key={listing._id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10 hover:border-emerald-500/30 transition">
                    <div className="flex-1">
                      <div className="font-semibold text-emerald-50">{idx + 1}. {listing.title}</div>
                      <div className="text-sm text-emerald-100/60 mt-1">{listing.listingType}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-400">{listing.saveCount}</div>
                      <div className="text-xs text-emerald-100/60">saves</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-emerald-100/60 text-center py-4">No saves yet</p>
            )}
          </div>
        </div>

        {/* All Listings Table */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#2c1b15] to-[#1f1410] p-6 overflow-x-auto">
          <h2 className="text-2xl font-bold text-amber-50 mb-6">📈 All Listings Performance</h2>
          {allListings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-500/30">
                    <th className="text-left py-3 px-4 text-amber-50 font-semibold">Listing</th>
                    <th className="text-left py-3 px-4 text-amber-50 font-semibold">Type</th>
                    <th className="text-right py-3 px-4 text-amber-50 font-semibold">Views</th>
                    <th className="text-right py-3 px-4 text-amber-50 font-semibold">Saves</th>
                    <th className="text-right py-3 px-4 text-amber-50 font-semibold">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {allListings.map((listing) => {
                    const engagement = (
                      ((listing.viewCount + listing.saveCount) /
                        Math.max(1, listing.viewCount)) *
                      100
                    ).toFixed(0);
                    return (
                      <tr key={listing._id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-3 px-4 text-amber-100">{listing.title}</td>
                        <td className="py-3 px-4">
                          <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded text-xs">
                            {listing.listingType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                          {listing.viewCount}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                          {listing.saveCount}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-white/10 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2 rounded-full"
                                style={{ width: `${Math.min(100, engagement)}%` }}
                              ></div>
                            </div>
                            <span className="text-amber-300 text-xs font-semibold w-8 text-right">
                              {engagement}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-amber-100/60 text-center py-8">No listings to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
