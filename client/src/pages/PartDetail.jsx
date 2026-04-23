import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useChat } from "../context/ChatContext";
import axiosInstance from "../utils/axios";
import ImageCarousel from "../components/ImageCarousel";
import ChatBox from "../components/ChatBox";
import UserRatingsDropdown from "../components/UserRatingsDropdown";
import "./parts.css";

export default function PartDetail() {
  const { id } = useParams();
  const [part, setPart] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderMessage, setOrderMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startChat, activeChat, closeChat } = useChat();
  const [showChat, setShowChat] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchPart();
    recordView();
    checkIfSaved();
  }, [id]);

  const fetchPart = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/parts/${id}`);
      setPart(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch part details");
    } finally {
      setLoading(false);
    }
  };

  const recordView = async () => {
    try {
      await axiosInstance.post("/analytics/view", {
        listingType: "Part",
        listingId: id
      });
    } catch (err) {
      console.error("Error recording view:", err);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await axiosInstance.get("/analytics/check-save", {
        params: {
          listingType: "Part",
          listingId: id
        }
      });
      setIsSaved(response.data.isSaved);
    } catch (err) {
      console.error("Error checking save:", err);
    }
  };

  const handleSaveListing = async () => {
    try {
      await axiosInstance.post("/analytics/save", {
        listingType: "Part",
        listingId: id
      });
      setIsSaved(!isSaved);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving listing");
      console.error("Error saving listing:", err);
    }
  };

  const handleBuy = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (quantity <= 0) {
      setError("Quantity must be at least 1");
      return;
    }
    try {
      setError(null);
      setOrderMessage("");
      const response = await axiosInstance.post("/orders", {
        items: [{ partId: id, quantity }],
        paymentMethod: "cod",
      });
      setOrderMessage("Order placed successfully!");
      // Refresh part to show updated stock
      fetchPart();
      // Navigate to orders page after brief delay
      setTimeout(() => navigate("/orders"), 600);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    }
  };

  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (quantity <= 0) {
      setError('Quantity must be at least 1');
      return;
    }
    addToCart({
      ...part,
      type: 'part',
      quantity,
    });
    setOrderMessage(`${part.name} (${quantity}) added to cart`);
  };

  const canEdit = () => {
    if (!user || !part) return false;
    if (user.role === "admin") return true;
    if (user.role === "seller" && part.seller?._id === user.id) return true;
    return false;
  };

  const canDelete = () => canEdit();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this part listing?")) return;
    try {
      await axiosInstance.delete(`/parts/${id}`);
      navigate("/parts");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete part");
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      alert("Please login to contact the seller");
      navigate("/login");
      return;
    }

    if (!part.seller || part.seller._id === user.id) {
      alert("Cannot contact yourself");
      return;
    }

    try {
      setChatLoading(true);
      // For parts, we'll use the part ID as the carId parameter (backend may need to handle this)
      await startChat(part.seller._id, part._id);
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
          <p className="mt-4 text-gray-600">Loading part details...</p>
        </div>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || "Part not found"}</p>
          <button
            onClick={() => navigate("/parts")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Back to Parts
          </button>
        </div>
      </div>
    );
  }

  const partImages = part.images && part.images.length > 0 ? part.images : [];
  // Find seller id for comparison
  const sellerId = part?.seller?._id || part?.seller;

  return (
    <div className="parts-page py-8 relative">
      {/* Chat Box - appears on left side */}
      {showChat && activeChat && part.seller && (
        <div className="fixed left-0 top-0 h-full w-96 z-50">
          <ChatBox
            sellerName={part.seller.name || part.seller.email}
            sellerId={part.seller._id}
            carId={part._id}
            onClose={handleCloseChat}
          />
        </div>
      )}

      <div className={`${showChat ? 'ml-96' : ''} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/parts")}
            className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Parts
          </button>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              <div className="space-y-4">
                <div className="relative">
                  <ImageCarousel images={partImages} alt={part.name} />
                  <div className="absolute top-4 right-4 z-20">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${part.condition === "new" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                        }`}
                    >
                      {part.condition.charAt(0).toUpperCase() + part.condition.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{part.name}</h1>
                  <p className="text-xl text-gray-600 mb-2">Category: {part.category}</p>
                  <p className="text-3xl font-bold text-blue-600">৳{part.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-2">Quantity available: {part.quantity}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Compatible Make</p>
                    <p className="text-lg font-semibold text-gray-900">{part.compatibleMake || "Any"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Compatible Model</p>
                    <p className="text-lg font-semibold text-gray-900">{part.compatibleModel || "Any"}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-base text-gray-900 whitespace-pre-line">{part.description}</p>
                </div>

                {part.seller && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Seller Information</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{part.seller.name || part.seller.email}</p>
                        {part.seller.email && part.seller.name && (
                          <p className="text-sm text-gray-600 mt-1">{part.seller.email}</p>
                        )}
                      </div>
                      <UserRatingsDropdown userId={part.seller._id} userName={part.seller.name || "Seller"} />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4 pt-4 border-t">
                  {/* Buy Now & controls only visible if not the seller */}
                  {user && sellerId !== user?.id && part.quantity > 0 && (
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-gray-600">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={part.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <span className="text-sm text-gray-500">Available: {part.quantity}</span>
                    </div>
                  )}

                  {orderMessage && sellerId !== user?.id && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                      {orderMessage}
                    </div>
                  )}
                  {error && sellerId !== user?.id && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  {user && sellerId !== user?.id && (
                    <div className="flex gap-4 flex-wrap">
                      <button
                        onClick={handleBuy}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 min-w-[180px]"
                        disabled={part.quantity <= 0}
                      >
                        {part.quantity > 0 ? "Buy Now" : "Out of Stock"}
                      </button>

                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 min-w-[180px]"
                        disabled={part.quantity <= 0}
                      >
                        🛒 Add to Cart
                      </button>

                      {/* Exchange Button - for logged-in users who don't own the item */}
                      {user && part && part.seller && part.seller._id !== user.id && (
                        <button
                          onClick={() => navigate(`/exchange/${part._id}/part`)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 min-w-[180px]"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          Exchange Request
                        </button>
                      )}

                      {/* Contact Seller Button */}
                      {part.seller && (
                        <button
                          onClick={handleContactSeller}
                          disabled={chatLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 min-w-[180px]"
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

                      {/* Save Button */}
                      {user && (
                        <button
                          onClick={handleSaveListing}
                          className={`flex-1 font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 min-w-[180px] ${isSaved
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-gray-600 hover:bg-gray-700 text-white"
                            }`}
                        >
                          {isSaved ? "❤️ Saved" : "🤍 Save"}
                        </button>
                      )}

                      {canEdit() && (
                        <button
                          onClick={() => navigate(`/parts/edit/${part._id}`)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 min-w-[180px]"
                        >
                          Edit Listing
                        </button>
                      )}
                      {canDelete() && (
                        <button
                          onClick={handleDelete}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 min-w-[180px]"
                        >
                          Delete Listing
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

