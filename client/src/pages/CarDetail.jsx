import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useChat } from "../context/ChatContext";
import axiosInstance from "../utils/axios";
import ImageCarousel from "../components/ImageCarousel";
import ChatBox from "../components/ChatBox";

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startChat, activeChat, closeChat } = useChat();
  const [showChat, setShowChat] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // Customization State
  const [selections, setSelections] = useState({
    color: "",
    rims: "",
    accessories: [],
  });

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/cars/${id}`);
      setCar(response.data.data);
      // Initialize default selections if options exist
      const carData = response.data.data;
      setSelections({
        color: carData.customizationOptions?.colors?.[0] || "",
        rims: carData.customizationOptions?.rims?.[0] || "",
        accessories: [],
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch car details");
      console.error("Error fetching car:", err);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = () => {
    if (!user || !car) return false;
    if (user.role === "admin") return true;
    if (user.role === "seller" && car.seller?._id === user.id) return true;
    return false;
  };

  const canDelete = () => {
    if (!user || !car) return false;
    if (user.role === "admin") return true;
    if (user.role === "seller" && car.seller?._id === user.id) return true;
    return false;
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this car listing?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/cars/${id}`);
      navigate("/cars");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete car");
      console.error("Error deleting car:", err);
    }
  };

  const { addToCart } = useCart();

  const handleSelectionChange = (type, value) => {
    setSelections(prev => {
      if (type === 'accessories') {
        const newAccessories = prev.accessories.includes(value)
          ? prev.accessories.filter(item => item !== value)
          : [...prev.accessories, value];
        return { ...prev, accessories: newAccessories };
      }
      return { ...prev, [type]: value };
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      ...car,
      type: 'car',
      quantity: 1,
      customizations: selections
    });
    alert(`${car.brand} ${car.model} added to cart!`);
  };

  const handleContactSeller = async () => {
    if (!user) {
      alert("Please login to contact the seller");
      navigate("/login");
      return;
    }

    if (!car.seller || car.seller._id === user.id) {
      alert("Cannot contact yourself");
      return;
    }

    try {
      setChatLoading(true);
      await startChat(car.seller._id, car._id);
      setShowChat(true);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleCloseChat = () => {
    closeChat();
    setShowChat(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || "Car not found"}</p>
          <button
            onClick={() => navigate("/cars")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  const carImages = car.images && car.images.length > 0 ? car.images : (car.image ? [car.image] : []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      {/* Chat Box - appears on left side */}
      {showChat && activeChat && car.seller && (
        <div className="fixed left-0 top-0 h-full w-96 z-50">
          <ChatBox
            sellerName={car.seller.name || car.seller.email}
            sellerId={car.seller._id}
            carId={car._id}
            onClose={handleCloseChat}
          />
        </div>
      )}

      <div className={`${showChat ? 'ml-96' : ''} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/cars")}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Cars
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left Side - Image Carousel */}
            <div className="space-y-4">
              <div className="relative">
                <ImageCarousel
                  images={carImages}
                  alt={`${car.brand} ${car.model}`}
                />
                <div className="absolute top-4 right-4 z-20">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${car.condition === "new"
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white"
                    }`}>
                    {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Car Details */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {car.brand} {car.model}
                </h1>
                <p className="text-xl text-gray-600 mb-4">Year: {car.year}</p>
                <p className="text-4xl font-bold text-blue-600">
                  ৳{car.price.toLocaleString()}
                </p>

              </div>

              {/* Customization Options */}
              {car.customizationOptions && (
                <div className="space-y-6 border-t border-b py-6">
                  <h3 className="text-lg font-bold text-gray-900">Customize Your Car</h3>

                  {/* Colors */}
                  {car.customizationOptions.colors?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Select Color</h4>
                      <div className="flex flex-wrap gap-2">
                        {car.customizationOptions.colors.map(color => (
                          <button
                            key={color}
                            onClick={() => handleSelectionChange('color', color)}
                            className={`px-4 py-2 rounded-lg border ${selections.color === color
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                              }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rims */}
                  {car.customizationOptions.rims?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Select Rims</h4>
                      <div className="flex flex-wrap gap-2">
                        {car.customizationOptions.rims.map(rim => (
                          <button
                            key={rim}
                            onClick={() => handleSelectionChange('rims', rim)}
                            className={`px-4 py-2 rounded-lg border ${selections.rims === rim
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                              }`}
                          >
                            {rim}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accessories */}
                  {car.customizationOptions.accessories?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Select Accessories</h4>
                      <div className="space-y-2">
                        {car.customizationOptions.accessories.map(acc => (
                          <label key={acc} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selections.accessories.includes(acc)}
                              onChange={() => handleSelectionChange('accessories', acc)}
                              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{acc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Brand</p>
                  <p className="text-lg font-semibold text-gray-900">{car.brand}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Model</p>
                  <p className="text-lg font-semibold text-gray-900">{car.model}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Year</p>
                  <p className="text-lg font-semibold text-gray-900">{car.year}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Condition</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{car.condition}</p>
                </div>
              </div>

              {/* Seller Information */}
              {car.seller && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Seller Information</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {car.seller.name || car.seller.email}
                  </p>
                  {car.seller.email && car.seller.name && (
                    <p className="text-sm text-gray-600 mt-1">{car.seller.email}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                {(canEdit() || canDelete()) && (
                  <>
                    {canEdit() && (
                      <button
                        onClick={() => navigate(`/cars/edit/${car._id}`)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                      >
                        Edit Listing
                      </button>
                    )}
                    {canDelete() && (
                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                      >
                        Delete Listing
                      </button>
                    )}
                  </>
                )}


                {/* Add to Cart for buyers (not sellers/owners) */}
                {user && car && car.seller?._id !== user.id && (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                  >
                    🛒 Add to Cart
                  </button>
                )}

                {/* Contact Seller Button - for buyers only */}
                {user && car && car.seller && car.seller._id !== user.id && (
                  <button
                    onClick={handleContactSeller}
                    disabled={chatLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    {chatLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Contact Seller
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div >
  );
}
