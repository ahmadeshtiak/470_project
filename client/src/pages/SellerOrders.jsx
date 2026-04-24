import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchSellerOrders();
        }
    }, [user]);

    const fetchSellerOrders = async () => {
        try {
            const res = await axiosInstance.get('/orders/seller');
            const ordersData = res.data.data || res.data || [];
            setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (err) {
            console.error('Error fetching seller orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async (orderId) => {
        try {
            await axiosInstance.patch(`/orders/${orderId}/status`, { status: 'shipped' });
            alert('Order marked as dispatched!');
            fetchSellerOrders(); // Refresh
        } catch (err) {
            alert('Failed to dispatch order');
            console.error(err);
        }
    };

    const handleConfirm = async (orderId) => {
        try {
            await axiosInstance.patch(`/orders/${orderId}/status`, { status: 'confirmed' });
            alert('Order confirmed!');
            fetchSellerOrders();
        } catch (err) {
            alert('Failed to confirm order');
            console.error(err);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1f1410] to-[#2b1a1f] py-8 px-4">
                <div className="max-w-lg mx-auto text-center">
                    <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-amber-50 mb-4">Please log in</h2>
                        <button onClick={() => navigate('/login')} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-full">
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1f1410] to-[#2b1a1f] py-8 px-4">
                <div className="text-center text-amber-50">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-amber-50 mb-8">📦 Seller Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-8 text-center">
                        <p className="text-amber-100/70 text-lg">No orders containing your products yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-6">
                                <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                                    <div>
                                        <p className="text-amber-100/60 text-sm">Order ID</p>
                                        <p className="text-amber-50 font-mono text-sm">{order._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-amber-100/60 text-sm">Buyer</p>
                                        <p className="text-amber-50">{order.buyer?.name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-amber-100/60 text-sm">Date</p>
                                        <p className="text-amber-50">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-amber-100/60 text-sm">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'pending' ? 'bg-yellow-600' :
                                            order.status === 'confirmed' ? 'bg-blue-600' :
                                                order.status === 'shipped' ? 'bg-purple-600' :
                                                    order.status === 'delivered' ? 'bg-green-600' :
                                                        'bg-red-600'
                                            } text-white`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                    <div className="mb-4 p-3 bg-white/5 rounded-lg">
                                        <p className="text-amber-100/60 text-sm mb-1">Ship To:</p>
                                        <p className="text-amber-50">
                                            {order.shippingAddress.fullName}, {order.shippingAddress.phone}
                                        </p>
                                        <p className="text-amber-100/80 text-sm">
                                            {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}
                                        </p>
                                    </div>
                                )}

                                {/* Items */}
                                <div className="border-t border-[#3a241a] pt-4 mb-4">
                                    <p className="text-amber-100/60 text-sm mb-2">Items (your products)</p>
                                    {order.items
                                        .filter(item => item.seller?.toString() === user._id || item.seller === user._id)
                                        .map((item, idx) => (
                                            <div key={idx} className="flex justify-between py-2 text-amber-50">
                                                <span>{item.name} x{item.quantity}</span>
                                                <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleConfirm(order._id)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg"
                                        >
                                            ✓ Confirm Order
                                        </button>
                                    )}
                                    {order.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleDispatch(order._id)}
                                            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg"
                                        >
                                            🚚 Dispatch
                                        </button>
                                    )}
                                    {order.status === 'shipped' && (
                                        <span className="text-purple-400 font-semibold py-2">📦 Dispatched - In Transit</span>
                                    )}
                                    {order.status === 'delivered' && (
                                        <span className="text-green-400 font-semibold py-2">✓ Delivered</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
