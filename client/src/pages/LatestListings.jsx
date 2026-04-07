import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import ImageCarousel from "../components/ImageCarousel";

export default function LatestListings() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestCars();
  }, []);

  const fetchLatestCars = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/cars/latest");
      setCars(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch latest listings");
      console.error("Error fetching latest cars:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1f1410] via-[#2a1b14] to-[#23150f] rounded-2xl border border-[#3a241a] shadow-2xl p-10 text-center text-white">
        <div className="mx-auto h-14 w-14 rounded-full border-4 border-t-transparent border-amber-500 animate-spin" />
        <p className="mt-4 text-amber-100/90 tracking-wide">Loading latest listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-10 px-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-[#3a241a] bg-gradient-to-br from-[#1f1410] via-[#2a1b14] to-[#23150f] p-8 shadow-2xl w-full">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,#b87333,transparent_45%)]" />

          <div className="relative flex flex-wrap items-start gap-4 md:items-center justify-between mb-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                Live feed
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-amber-50">Check Latest Listings</h2>
              <p className="text-amber-100/80 mt-1 max-w-xl">
                Fresh drops curated for you. Tap a card to dive into the full details.
              </p>
            </div>
            <button
              onClick={() => navigate("/cars")}
              className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 transition hover:-translate-y-[1px] hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
            >
              View all
              <span aria-hidden>→</span>
            </button>
          </div>

          {cars.length === 0 ? (
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-amber-50">
              <p className="text-lg font-semibold">No listings available</p>
              <p className="text-sm text-amber-100/80 mt-2">Check back soon for fresh rides.</p>
            </div>
          ) : (
            <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5">
              {cars.map((car) => (
                <div
                  key={car._id}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-b from-[#2c1b15] via-[#2a1b14] to-[#23150f] shadow-lg shadow-black/30 transition duration-200 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-amber-500/20"
                  onClick={() => navigate(`/cars/${car._id}`)}
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-[#3a241a]">
                    <ImageCarousel
                      images={car.images && car.images.length > 0 ? car.images : (car.image ? [car.image] : [])}
                      alt={`${car.brand} ${car.model}`}
                    />
                    <div className="absolute top-3 right-3 z-20">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                          car.condition === "new"
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f1410]/70 via-transparent to-transparent group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-4 space-y-2 text-amber-50">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold leading-tight">
                        {car.brand} {car.model}
                      </h3>
                      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-100 border border-amber-400/30">
                        {car.year}
                      </span>
                    </div>
                    <p className="text-sm text-amber-100/80">Year: {car.year}</p>
                    <p className="text-2xl font-extrabold text-amber-200">
                      ৳{car.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

