import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import "./parts.css";
import { useAuth } from "../context/AuthContext";
import RatingModal from "../components/RatingModal";

export default function OrdersTabs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("my"); // "my" or "received"
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [errorSeller, setErrorSeller] = useState(null);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, orderId: null, sellerId: null, sellerName: null });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (tab === "received" && (user?.role === "seller" || user?.role === "admin")) {
      fetchReceivedOrders();
    }
    // eslint-disable-next-line
  }, [tab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/orders/my");
      setOrders(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedOrders = async () => {
    try {
      setLoadingSeller(true);
      const res = await axiosInstance.get("/orders/seller");
      setSellerOrders(res.data.data || []);
      setErrorSeller(null);
    } catch (err) {
      setErrorSeller(err.response?.data?.message || "Failed to load received orders");
    } finally {
      setLoadingSeller(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      console.log(`📤 Updating order ${id} status to ${status}`);
      const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
      console.log("✅ Order status updated:", response.data);
      await fetchReceivedOrders();
      alert(`Order status updated to ${status} successfully!`);
    } catch (err) {
      console.error("❌ Error updating order:", err.response || err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to update order status";
      alert(`Error: ${errorMsg}`);
    }
  };

  const openRatingModal = (orderId, sellerId, sellerName) => {
    setRatingModal({ isOpen: true, orderId, sellerId, sellerName });
  };

  const closeRatingModal = () => {
    setRatingModal({ isOpen: false, orderId: null, sellerId: null, sellerName: null });
  };

  const handleRatingSuccess = () => {
    fetchOrders();
  };

  return (
    <div className="parts-page py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="parts-card p-8">
          <div className="flex gap-2 mb-6 border-b pb-2 text-lg font-semibold">
            <button
              onClick={() => setTab("my")}
              className={`px-4 py-2 rounded-t ${tab === "my" ? "bg-blue-200 text-blue-900" : "bg-gray-200 text-gray-700"}`}
            >
              My Orders
            </button>
            {(user?.role === "seller" || user?.role === "admin") && (
              <button
                onClick={() => setTab("received")}
                className={`px-4 py-2 rounded-t ${tab === "received" ? "bg-blue-200 text-blue-900" : "bg-gray-200 text-gray-700"}`}
              >
                Received Orders
              </button>
            )}
          </div>

          {tab === "my" && (
            loading ? (
              <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading orders...</p></div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                )}
                {orders.length === 0 ? (
                  <p className="text-gray-600">You have not placed any orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-sm text-gray-500">Order ID</p>
                            <p className="font-semibold text-gray-900">{order._id}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === "shipped"
                              ? "bg-green-100 text-green-700"
                              : order.status === "paid"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          Placed: {new Date(order.createdAt).toLocaleString()}
                        </p>

                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-gray-800">
                              <span>
                                {item.name} x {item.quantity}
                              </span>
                              <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t">
                          <div>
                            <span className="text-gray-700 font-semibold mr-2">Total</span>
                            <span className="text-blue-600 font-bold text-lg">৳{order.total.toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/invoice/${order._id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1 hover:underline"
                            >
                              📄 View Invoice
                            </button>
                            {["shipped", "delivered"].includes(order.status) && !order.isRatedByBuyer && (
                              <button
                                onClick={() => {
                                  const seller = order.items[0]?.seller;
                                  openRatingModal(
                                    order._id,
                                    typeof seller === 'string' ? seller : seller?._id,
                                    order.items[0]?.sellerName || "Seller"
                                  );
                                }}
                                className="text-amber-600 hover:text-amber-800 text-sm font-semibold flex items-center gap-1 hover:underline"
                              >
                                ⭐ Rate Seller
                              </button>
                            )}
                            {order.isRatedByBuyer && (
                              <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                                ✓ Rated
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          )}

          {tab === "received" && (user?.role === "seller" || user?.role === "admin") && (
            loadingSeller ? (
              <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading received orders...</p></div>
            ) : (
              <>
                {errorSeller && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{errorSeller}</div>
                )}
                <div className="space-y-4">
                  {sellerOrders.length === 0 ? (
                    <p className="text-gray-600">No received orders for your parts.</p>
                  ) : (
                    sellerOrders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-sm text-gray-500">Order ID</p>
                            <p className="font-semibold text-gray-900">{order._id}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === "shipped"
                              ? "bg-green-100 text-green-700"
                              : order.status === "paid"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="mb-2 text-sm text-gray-700">
                          Buyer: {order.buyer?.name || order.buyer?.email || "-"}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Placed: {new Date(order.createdAt).toLocaleString()}</p>

                        <div className="space-y-2">
                          {order.items
                            .filter((item) => item.seller === user.id || (item.seller?._id || item.seller) === user.id)
                            .map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm text-gray-800">
                                <span>
                                  {item.name} x {item.quantity}
                                </span>
                                <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                        </div>
                        {/* Only allow status update for pending/paid, by seller/admin */}
                        <div className="mt-3 pt-3 border-t flex gap-2">
                          {["pending", "paid"].includes(order.status) && (
                            <>
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg"
                                onClick={() => updateOrderStatus(order._id, "shipped")}
                              >
                                Mark as Shipped
                              </button>
                              <button
                                className="bg-gray-400 hover:bg-gray-500 text-white text-sm font-semibold py-2 px-4 rounded-lg"
                                onClick={() => updateOrderStatus(order._id, "cancelled")}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>

      {ratingModal.isOpen && (
        <RatingModal
          orderId={ratingModal.orderId}
          sellerId={ratingModal.sellerId}
          sellerName={ratingModal.sellerName}
          onClose={closeRatingModal}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
}

