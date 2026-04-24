import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axiosInstance from "../utils/axios";
import CarImage from "../components/CarImage";
import { filterParts } from "../utils/carFilters";

export default function PartList() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMyListings, setShowMyListings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    condition: "all",
    priceMin: "",
    priceMax: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/parts");
      setParts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch parts");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/parts/my-listings");
      setParts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch your part listings");
    } finally {
      setLoading(false);
    }
  };

  const handleMyListingsClick = () => {
    if (showMyListings) {
      setShowMyListings(false);
      fetchParts();
    } else {
      setShowMyListings(true);
      fetchMyListings();
    }
  };

  const handleDelete = async (partId) => {
    if (!window.confirm("Are you sure you want to delete this part listing?")) return;
    try {
      await axiosInstance.delete(`/parts/${partId}`);
      setParts(parts.filter((p) => p._id !== partId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete part");
    }
  };

  const handleAddToCart = (part, e) => {
    e.stopPropagation();
    addToCart({
      ...part,
      type: 'part',
    });
    // Optional: Show a toast notification
    alert(`${part.name} added to cart!`);
  };

  const canEdit = (part) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "seller" && part.seller?._id === user.id) return true;
    return false;
  };

  const canDelete = (part) => canEdit(part);
  const canAdd = () => !!user;

  const categoryOptions = useMemo(() => {
    const set = new Set();
    parts.forEach((p) => p.category && set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [parts]);

  const filteredParts = useMemo(() => {
    return filterParts(parts, {
      ...filters,
      search: searchTerm,
      priceMin: filters.priceMin === "" ? undefined : Number(filters.priceMin),
      priceMax: filters.priceMax === "" ? undefined : Number(filters.priceMax),
    });
  }, [parts, filters, searchTerm]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: "all",
      condition: "all",
      priceMin: "",
      priceMax: "",
    });
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3C2414' }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto" style={{ borderColor: '#5D4037', borderTopColor: '#8D6E63' }}></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderRightColor: '#6D4C41', animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 font-semibold text-lg" style={{ color: '#D7CCC8' }}>Loading parts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-8 px-3 sm:px-6" style={{ backgroundColor: '#3C2414' }}>
      <div className="max-w-[1500px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden" style={{ backgroundColor: '#5D4037' }}>
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-5xl font-black tracking-tight">Parts</h1>
            </div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: '#6D4C41', opacity: 0.1 }}></div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border shadow-2xl p-5 sm:p-7" style={{ backgroundColor: 'rgba(93, 64, 55, 0.9)', borderColor: '#6D4C41' }}>

          <div className="relative flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex gap-3">
              {(user?.role === "seller" || user?.role === "admin") && (
                <button
                  onClick={handleMyListingsClick}
                  className={`font-semibold py-2 px-5 rounded-lg transition duration-200 text-white ${
                    showMyListings
                      ? "bg-amber-700 hover:bg-amber-800"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {showMyListings ? "Show All" : "My Listings"}
                </button>
              )}
              {canAdd() && (
                <button
                  onClick={() => navigate("/parts/add")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-200 shadow-lg"
                >
                  + Add Part
                </button>
              )}
            </div>

            <form
              className="flex flex-1 min-w-[260px] gap-3 items-center justify-end"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-1 gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, category, make..."
                  className="flex-1 rounded-xl px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#5D4037', borderColor: '#6D4C41', borderWidth: '1px', color: '#D7CCC8' }}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-[1px]"
                  style={{ backgroundColor: '#6D4C41' }}
                >
                  Search
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="ml-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition"
                style={{ backgroundColor: '#5D4037', borderColor: '#6D4C41', borderWidth: '1px' }}
              >
                {showFilters ? "Hide Filters" : "Filters"}
              </button>
            </form>
          </div>

          {showFilters && (
            <div className="relative mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(93, 64, 55, 0.5)', borderColor: '#6D4C41', borderWidth: '1px' }}>
                <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: '#D7CCC8' }}>Category</p>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full rounded-xl px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#5D4037', borderColor: '#6D4C41', borderWidth: '1px', color: '#D7CCC8' }}
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All categories" : c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(93, 64, 55, 0.5)', borderColor: '#6D4C41', borderWidth: '1px' }}>
                <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: '#D7CCC8' }}>Condition</p>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange("condition", e.target.value)}
                  className="w-full rounded-xl px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#5D4037', borderColor: '#6D4C41', borderWidth: '1px', color: '#D7CCC8' }}
                >
                  <option value="all">All</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(93, 64, 55, 0.5)', borderColor: '#6D4C41', borderWidth: '1px' }}>
                <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: '#D7CCC8' }}>Price</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.priceMin}
                    placeholder="Min"
                    onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                    className="w-1/2 rounded-xl px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ backgroundColor: '#5D4037', borderColor: '#6D4C41', borderWidth: '1px', color: '#D7CCC8' }}
                  />
                  <input
                    type="number"
                    value={filters.priceMax}
                    placeholder="Max"
                    onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                    className="w-1/2 rounded-xl px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ backgroundColor: '#5D4037', borderColor: '#6D4C41', borderWidth: '1px', color: '#D7CCC8' }}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-600 text-white px-4 py-3 rounded mb-6 font-semibold border-l-4 border-red-800">
              {error}
            </div>
          )}

          {filteredParts.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: 'rgba(93, 64, 55, 0.5)', borderColor: '#6D4C41', borderWidth: '1px' }}>
              <p className="text-lg font-semibold text-white">
                {showMyListings ? "You haven't listed any parts yet" : "No parts match the filters"}
              </p>
              {canAdd() && (
                <button
                  onClick={() => navigate("/parts/add")}
                  className="mt-4 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 shadow-lg"
                  style={{ backgroundColor: '#6D4C41' }}
                >
                  {showMyListings ? "Add Your First Part" : "Add a Part"}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParts.map((part) => (
                <div
                  key={part._id}
                  className="group cursor-pointer rounded-xl border-2 mb-4 relative transition duration-200 hover:-translate-y-1"
                  style={{ backgroundColor: '#F5F5DC', borderColor: '#000000' }}
                  onClick={() => navigate(`/parts/${part._id}`)}
                >
                  {/* Delete Icon Button - Bottom Right */}
                  {canDelete(part) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(part._id);
                      }}
                      className="absolute bottom-3 right-3 z-10 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-110"
                      title="Delete part"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl" style={{ backgroundColor: '#3C2414' }}>
                    <CarImage
                      images={part.images && part.images.length > 0 ? part.images : []}
                      alt={part.name}
                      className="h-48"
                    />
                    {part.images && part.images.length > 1 && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                        {part.images.length} photos
                      </div>
                    )}
                    <div className="absolute top-3 right-3 z-20">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                          part.condition === "new" ? "bg-emerald-500 text-white" : "bg-amber-600 text-white"
                        }`}
                      >
                        {part.condition.charAt(0).toUpperCase() + part.condition.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold leading-tight" style={{ color: '#000000' }}>{part.name}</h3>
                      <span className="rounded-full px-3 py-1 text-[11px] font-semibold border" style={{ backgroundColor: '#F5F5DC', borderColor: '#000000', color: '#000000' }}>
                        {part.category}
                      </span>
                    </div>
                    {part.compatibleMake || part.compatibleModel ? (
                      <p className="text-xs" style={{ color: '#000000' }}>
                        Compatible: {part.compatibleMake} {part.compatibleModel}
                      </p>
                    ) : null}
                    <p className="text-2xl font-extrabold" style={{ color: '#000000' }}>
                      ৳{part.price.toLocaleString()}
                    </p>
                    <p className="text-sm" style={{ color: '#000000' }}>Qty: {part.quantity}</p>

                    {part.seller && (
                      <p className="text-xs" style={{ color: '#000000' }}>
                        <span className="font-semibold">Seller:</span>{" "}
                        {part.seller.name || part.seller.email}
                      </p>
                    )}

                    {canEdit(part) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/parts/edit/${part._id}`);
                        }}
                        className="w-full mt-3 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        style={{ backgroundColor: '#6D4C41' }}
                      >
                        Edit
                      </button>
                    )}

                    {!canEdit(part) && !canDelete(part) && (
                      <button
                        onClick={(e) => handleAddToCart(part, e)}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                      >
                        Add to Cart
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

