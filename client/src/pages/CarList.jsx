import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axiosInstance from "../utils/axios";
import CarImage from "../components/CarImage";
import { filterCars } from "../utils/carFilters";

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMyListings, setShowMyListings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    brand: "all",
    condition: "all",
    yearMin: "",
    yearMax: "",
    priceMin: "",
    priceMax: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/cars");
      const allCars = response.data.data || [];
      const filteredCars = user 
        ? allCars.filter(car => car.seller?._id !== user.id) 
        : allCars; 
      
      setCars(filteredCars);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch cars");
      console.error("Error fetching cars:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/cars/my-listings");
      setCars(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch your listings");
      console.error("Error fetching my listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMyListingsClick = () => {
    if (showMyListings) {
      setShowMyListings(false);
      fetchCars();
    } else {
      setShowMyListings(true);
      fetchMyListings();
    }
  };

  const handleDelete = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this car listing?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/cars/${carId}`);
      setCars(cars.filter((car) => car._id !== carId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete car");
      console.error("Error deleting car:", err);
    }
  };

  const handleAddToCart = (car, e) => {
    e.stopPropagation();
    addToCart({
      ...car,
      type: 'car',
    });
    // Optional: Show a toast notification
    alert(`${car.brand} ${car.model} added to cart!`);
  };

  const canEdit = (car) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "seller" && car.seller?._id === user.id) return true;
    return false;
  };

  const canDelete = (car) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "seller" && car.seller?._id === user.id) return true;
    return false;
  };

  const canAdd = () => {
    return user !== null; // Any authenticated user can add
  };

  const brandOptions = useMemo(() => {
    const set = new Set();
    cars.forEach((c) => c.brand && set.add(c.brand));
    return ["all", ...Array.from(set)];
  }, [cars]);

  const yearBounds = useMemo(() => {
    const years = cars.map((c) => c.year).filter(Boolean);
    if (!years.length) return { min: "", max: "" };
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [cars]);

  const filteredCars = useMemo(() => {
    return filterCars(cars, {
      ...filters,
      search: searchTerm,
      yearMin: filters.yearMin === "" ? undefined : Number(filters.yearMin),
      yearMax: filters.yearMax === "" ? undefined : Number(filters.yearMax),
      priceMin: filters.priceMin === "" ? undefined : Number(filters.priceMin),
      priceMax: filters.priceMax === "" ? undefined : Number(filters.priceMax),
    });
  }, [cars, filters, searchTerm]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      brand: "all",
      condition: "all",
      yearMin: "",
      yearMax: "",
      priceMin: "",
      priceMax: "",
    });
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f]">
        <div className="text-center text-amber-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-amber-100/80">Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-3 sm:px-6">
      <div className="max-w-[1500px] mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-[#3a241a] bg-gradient-to-br from-[#23150f] via-[#2c1b15] to-[#1c0f0d] p-5 sm:p-7 shadow-2xl">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,#b87333,transparent_45%)]" />

          <div className="relative flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex gap-3">
              {(user?.role === "seller" || user?.role === "admin") && (
                <button
                  onClick={handleMyListingsClick}
                  className={`font-semibold py-2 px-5 rounded-full transition duration-200 border border-amber-400/40 text-white ${
                    showMyListings
                      ? "bg-[#3a241a] hover:bg-[#4a2e21]"
                      : "bg-amber-600 hover:bg-amber-500"
                  }`}
                >
                  {showMyListings ? "Show All" : "My Listings"}
                </button>
              )}
              {canAdd() && (
                <button
                  onClick={() => navigate("/cars/add")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-5 rounded-full transition duration-200 shadow-lg shadow-emerald-500/25"
                >
                  + Add Car
                </button>
              )}
            </div>

            <form
              className="flex flex-1 min-w-[260px] gap-3 items-center justify-end"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="flex flex-1 gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by brand or model..."
                  className="flex-1 rounded-xl bg-[#2c1b15] border border-amber-500/30 text-amber-50 placeholder:text-amber-100/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:-translate-y-[1px] hover:bg-amber-500"
                >
                  Search
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="ml-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#3a241a] px-4 py-3 text-sm font-semibold text-amber-100 border border-amber-500/30 hover:bg-[#4a2e21] transition"
              >
                {showFilters ? "Hide Filters" : "Filters"}
              </button>
            </form>
          </div>

          {showFilters && (
            <div className="relative mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-100 mb-2">Brand</p>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange("brand", e.target.value)}
                  className="w-full rounded-xl bg-[#2c1b15] border border-amber-500/30 text-amber-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b === "all" ? "All brands" : b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-100 mb-2">Condition</p>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange("condition", e.target.value)}
                  className="w-full rounded-xl bg-[#2c1b15] border border-amber-500/30 text-amber-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="all">All</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-100 mb-2">Year</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.yearMin}
                    placeholder={yearBounds.min || "Min"}
                    onChange={(e) => handleFilterChange("yearMin", e.target.value)}
                    className="w-1/2 rounded-xl bg-[#2c1b15] border border-amber-500/30 text-amber-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="number"
                    value={filters.yearMax}
                    placeholder={yearBounds.max || "Max"}
                    onChange={(e) => handleFilterChange("yearMax", e.target.value)}
                    className="w-1/2 rounded-xl bg-[#2c1b15] border border-amber-500/30 text-amber-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-100 mb-2">Price</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.priceMin}
                    placeholder="Min"
                    onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                    className="w-1/2 rounded-xl bg-[#2c1b15] border border-amber-500/30 text-amber-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="number"
                    value={filters.priceMax}
                    placeholder="Max"
                    onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                    className="w-1/2 rounded-xl bg-[#2c1b15] border border-amber-500/30 text-amber-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {filteredCars.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-amber-50">
              <p className="text-lg font-semibold">
                {showMyListings ? "You haven't listed any cars yet" : "No cars match the filters"}
              </p>
              {canAdd() && (
                <button
                  onClick={() => navigate("/cars/add")}
                  className="mt-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-full transition duration-200 shadow-lg shadow-amber-500/25"
                >
                  {showMyListings ? "Add Your First Listing" : "Add Your First Car"}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <div
                  key={car._id}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-b from-[#2c1b15] via-[#2a1b14] to-[#23150f] shadow-lg shadow-black/30 transition duration-200 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-amber-500/20"
                  onClick={() => navigate(`/cars/${car._id}`)}
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-[#3a241a]">
                    <CarImage
                      images={car.images && car.images.length > 0 ? car.images : (car.image ? [car.image] : [])}
                      alt={`${car.brand} ${car.model}`}
                      className="h-48"
                    />
                    {car.images && car.images.length > 1 && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                        {car.images.length} photos
                      </div>
                    )}
                    <div className="absolute top-3 right-3 z-20">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                          car.condition === "new" ? "bg-emerald-500 text-white" : "bg-amber-600 text-white"
                        }`}
                      >
                        {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f1410]/70 via-transparent to-transparent group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-5 space-y-2 text-amber-50">
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

                    {car.seller && (
                      <p className="text-xs text-amber-100/70">
                        <span className="font-semibold">Seller:</span>{" "}
                        {car.seller.name || car.seller.email}
                      </p>
                    )}

                    {(canEdit(car) || canDelete(car)) && (
                      <div className="flex gap-2 pt-3" onClick={(e) => e.stopPropagation()}>
                        {canEdit(car) && (
                          <button
                            onClick={() => navigate(`/cars/edit/${car._id}`)}
                            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded transition duration-200"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete(car) && (
                          <button
                            onClick={() => handleDelete(car._id)}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded transition duration-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}

                    {!canEdit(car) && !canDelete(car) && (
                      <button
                        onClick={(e) => handleAddToCart(car, e)}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200"
                      >
                        🛒 Add to Cart
                      </button>
                    )}
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

