import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import ImageCarousel from "../components/ImageCarousel";

export default function LandingPage() {
  const [cars, setCars] = useState([]);
  const [parts, setParts] = useState([]);
  const [stats, setStats] = useState({ totalCars: 0, totalParts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch latest cars
      const carsResponse = await axiosInstance.get("/cars/latest");
      console.log("Cars response:", carsResponse.data);
      setCars(carsResponse.data.data || []);

      // Fetch latest parts
      const partsResponse = await axiosInstance.get("/parts/latest");
      console.log("Parts response:", partsResponse.data);
      setParts(partsResponse.data.data || []);

      // Fetch all cars and parts for stats
      const allCarsResponse = await axiosInstance.get("/cars");
      const allPartsResponse = await axiosInstance.get("/parts");
      
      console.log("All cars count:", allCarsResponse.data.data?.length);
      console.log("All parts count:", allPartsResponse.data.data?.length);
      
      setStats({
        totalCars: allCarsResponse.data.data?.length || 0,
        totalParts: allPartsResponse.data.data?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f]">
      {/* Hero Section - Always visible */}
      <div className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,#b87333,transparent_50%)]" />
        <div className="relative max-w-[1600px] mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-amber-50 mb-6">
            AutoForge
          </h1>
          <p className="text-xl md:text-2xl text-amber-100/80 mb-4 max-w-3xl mx-auto">
            Your Ultimate Destination for Premium Cars and Parts
          </p>
          <p className="text-lg text-amber-100/70 max-w-2xl mx-auto mb-8">
            Discover handpicked vehicles and genuine automotive components from trusted sellers. Whether you're looking for your dream car or the perfect upgrade, we've got you covered.
          </p>
          
          {/* Stats Section - Always visible */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 my-12">
            <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 p-6 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-amber-50">{stats.totalCars}</div>
              <div className="text-amber-100/70 text-sm mt-2">Premium Cars</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 p-6 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-amber-50">{stats.totalParts}</div>
              <div className="text-amber-100/70 text-sm mt-2">Quality Parts</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 p-6 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-emerald-50">100%</div>
              <div className="text-emerald-100/70 text-sm mt-2">Verified</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 p-6 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-blue-50">24/7</div>
              <div className="text-blue-100/70 text-sm mt-2">Support</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button
              onClick={() => navigate("/cars")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-amber-600/30 transition hover:-translate-y-1 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
            >
              Browse Cars
              <span aria-hidden>→</span>
            </button>
            <button
              onClick={() => navigate("/parts")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-8 py-3 text-lg font-semibold text-amber-50 transition hover:bg-amber-500/20 hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
            >
              Browse Parts
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="bg-gradient-to-br from-[#1f1410] via-[#2a1b14] to-[#23150f] rounded-2xl border border-[#3a241a] shadow-2xl p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-full border-4 border-t-transparent border-amber-500 animate-spin" />
            <p className="mt-4 text-amber-100/90 tracking-wide">Loading featured listings...</p>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-[1600px] mx-auto px-4 py-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      ) : (
        <>
          {/* Featured Cars Section */}
          {cars.length > 0 && (
            <div className="max-w-[1600px] mx-auto px-4 py-16">
              <div className="relative overflow-hidden rounded-3xl border border-[#3a241a] bg-gradient-to-br from-[#1f1410] via-[#2a1b14] to-[#23150f] p-8 shadow-2xl w-full">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,#b87333,transparent_45%)]" />

                <div className="relative flex flex-wrap items-start gap-4 md:items-center justify-between mb-8">
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                      Featured
                    </p>
                    <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-amber-50">Latest Premium Cars</h2>
                    <p className="text-amber-100/80 mt-1 max-w-xl">
                      Handpicked vehicles curated just for you. Browse our latest additions.
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
                          alt={`${car.make} ${car.model}`}
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
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-amber-50 group-hover:text-amber-200 transition">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-sm text-amber-100/60 mt-1">{car.year} • {car.trim}</p>
                        <p className="text-amber-400 font-bold text-lg mt-3">
                          ${parseFloat(car.price).toLocaleString()}
                        </p>
                        <div className="mt-3 flex gap-2 text-xs text-amber-100/60">
                          <span>{car.mileage?.toLocaleString()} mi</span>
                          <span>•</span>
                          <span>{car.color}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Featured Parts Section */}
          {parts.length > 0 && (
            <div className="max-w-[1600px] mx-auto px-4 py-16 pb-24">
              <div className="relative overflow-hidden rounded-3xl border border-gray-300 bg-white p-8 shadow-lg w-full">
                <div className="flex flex-wrap items-start gap-4 md:items-center justify-between mb-8">
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                      Featured
                    </p>
                    <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900">Latest Auto Parts</h2>
                    <p className="text-gray-600 mt-1 max-w-xl">
                      Quality parts from verified sellers. Upgrade your ride today.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/parts")}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    View all
                    <span aria-hidden>→</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {parts.map((part) => (
                    <div
                      key={part._id}
                      className="group cursor-pointer rounded-lg border border-gray-200 bg-white shadow-md transition hover:shadow-lg hover:border-blue-400"
                      onClick={() => navigate(`/parts/${part._id}`)}
                    >
                      <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-gray-100">
                        {part.images && part.images.length > 0 ? (
                          <img
                            src={part.images[0]}
                            alt={part.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <span>No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                          {part.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{part.description}</p>
                        <p className="text-blue-600 font-bold text-lg mt-3">
                          ${parseFloat(part.price).toLocaleString()}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">{part.category}</span>
                          <span>{part.compatibility}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Why Choose Us Section */}
          <div className="max-w-[1600px] mx-auto px-4 py-16 pb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-amber-50 mb-4">Why Choose AutoForge?</h2>
              <p className="text-lg text-amber-100/70 max-w-2xl mx-auto">
                We're committed to providing the best experience for buying and selling quality vehicles and parts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Verified Sellers",
                  description: "All sellers are verified and rated by our community.",
                  icon: "✓",
                },
                {
                  title: "Quality Guarantee",
                  description: "Every listing is checked for accuracy and authenticity.",
                  icon: "⭐",
                },
                {
                  title: "Secure Transactions",
                  description: "Safe payment processing and buyer protection.",
                  icon: "🔒",
                },
                {
                  title: "Expert Support",
                  description: "24/7 customer support to help you find what you need.",
                  icon: "💬",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-gradient-to-br from-[#2c1b15] to-[#1f1410] border border-amber-500/20 p-6 text-center hover:border-amber-500/40 transition"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-amber-50 mb-2">{item.title}</h3>
                  <p className="text-amber-100/70 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
