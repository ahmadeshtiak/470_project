import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

export default function Invoice() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const invoiceRef = useRef();

    const params = useParams();
    const routeOrderId = params.orderId;

    // State for fetched order
    const [fetchedOrder, setFetchedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Determines source of data (state vs fetched)
    const orderData = location.state || fetchedOrder;

    useEffect(() => {
        if (!location.state && routeOrderId) {
            fetchOrderDetails();
        }
    }, [routeOrderId, location.state]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/orders/my');
            // Optimally we should have a text endpoint for getting single order.
            // But checking 'orders/my' is a workaround if we don't have get-one endpoint.
            // Wait, I should check if there is a get-one endpoint. The plan assumes I might need to make one or filter.
            // Actually, usually /orders/:id exists. Let's try /orders/:id. But I need to be sure.
            // Looking at routes/orders.js in previous turns... I didn't see a get-one route.
            // I only saw /my and /seller.
            // I will assume I need to fetch all and find, OR implement get-one.
            // Implementing get-one is better but requires backend change.
            // Fetching all 'my' orders and filtering is safer without backend access right now.
            // Let's inspect routes/orders.js first to be sure.

            // Wait, I can't inspect inside replace_file_content.
            // I will implement a safe fallback: fetch /orders/my and find the order. 
            // If the list is long it's bad, but for MVP it works.

            const myOrders = res.data.data;
            const found = myOrders.find(o => o._id === routeOrderId);
            if (found) {
                setFetchedOrder({
                    items: found.items,
                    total: found.total,
                    type: 'invoice',
                    orderId: found._id,
                    shippingAddress: found.shippingAddress,
                    paymentMethod: found.paymentMethod,
                    orderDate: found.createdAt
                });
            } else {
                setError('Order not found');
            }
        } catch (err) {
            setError('Failed to load invoice');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Loading invoice...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    const { items, total, type, orderId, shippingAddress, paymentMethod, orderDate } = orderData || {};

    if (!items || items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1f1410] to-[#2b1a1f] py-8 px-4">
                <div className="max-w-lg mx-auto text-center">
                    <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-amber-50 mb-4">No Invoice Data</h2>
                        <p className="text-amber-100/70 mb-4">Please go back to cart or orders.</p>
                        <button onClick={() => navigate('/orders')} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-full">
                            Go to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isQuote = type === 'quote';
    const invoiceNumber = isQuote
        ? `QT-${Date.now().toString().slice(-8)}`
        : `INV-${orderId?.slice(-8) || Date.now().toString().slice(-8)}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1f1410] to-[#2b1a1f] py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Print Button */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-amber-400 hover:text-amber-300"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2"
                    >
                        🖨️ Print Invoice
                    </button>
                </div>

                {/* Invoice Document */}
                <div
                    ref={invoiceRef}
                    className="bg-white text-gray-900 rounded-2xl p-8 shadow-xl print:shadow-none print:rounded-none"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">🚗 AutoForge</h1>
                            <p className="text-gray-600 mt-1">An Innovation with Cars</p>
                            <p className="text-gray-500 text-sm mt-2">Dhaka, Bangladesh</p>
                            <p className="text-gray-500 text-sm">contact@autoforge.com</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold" style={{ color: isQuote ? '#2563eb' : '#059669' }}>
                                {isQuote ? 'QUOTATION' : 'INVOICE'}
                            </h2>
                            <p className="text-gray-600 mt-2">#{invoiceNumber}</p>
                            <p className="text-gray-500 text-sm mt-1">
                                Date: {orderDate ? new Date(orderDate).toLocaleDateString() : new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">Bill To:</h3>
                            <p className="text-gray-900 font-semibold">{shippingAddress?.fullName || user?.name || 'Customer'}</p>
                            {shippingAddress && (
                                <>
                                    <p className="text-gray-600">{shippingAddress.address}</p>
                                    <p className="text-gray-600">{shippingAddress.city}, {shippingAddress.postalCode}</p>
                                    <p className="text-gray-600">Phone: {shippingAddress.phone}</p>
                                </>
                            )}
                            {!shippingAddress && user?.email && (
                                <p className="text-gray-600">{user.email}</p>
                            )}
                        </div>
                        <div className="text-right">
                            {!isQuote && (
                                <>
                                    <h3 className="font-bold text-gray-700 mb-2">Order Details:</h3>
                                    {orderId && <p className="text-gray-600">Order ID: {orderId}</p>}
                                    <p className="text-gray-600">Payment: {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
                                </>
                            )}
                            {isQuote && (
                                <>
                                    <h3 className="font-bold text-gray-700 mb-2">Quote Valid For:</h3>
                                    <p className="text-gray-600">7 Days</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left py-3 px-4 font-bold text-gray-700">Item</th>
                                <th className="text-center py-3 px-4 font-bold text-gray-700">Qty</th>
                                <th className="text-right py-3 px-4 font-bold text-gray-700">Price</th>
                                <th className="text-right py-3 px-4 font-bold text-gray-700">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const basePrice = item.basePrice || item.price; // Use basePrice if available, else price
                                const getOptionName = (opt) => (!opt ? '' : (typeof opt === 'object' ? (opt.name || '') : opt));
                                const getOptionPrice = (opt) => (!opt ? 0 : (typeof opt === 'object' ? (opt.price || 0) : 0));

                                return (
                                    <React.Fragment key={index}>
                                        {/* Main Item Row */}
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 px-4 font-semibold text-gray-900">
                                                {item.type === 'car' ? `${item.brand} ${item.model} (Base Price)` : item.name}
                                            </td>
                                            <td className="py-2 px-4 text-center text-gray-700">{item.quantity}</td>
                                            <td className="py-2 px-4 text-right text-gray-700">৳{basePrice?.toLocaleString()}</td>
                                            <td className="py-2 px-4 text-right text-gray-900">
                                                ৳{(basePrice * item.quantity).toLocaleString()}
                                            </td>
                                        </tr>

                                        {/* Customizations Breakdown */}
                                        {item.customizations && (
                                            <>
                                                {['color', 'rims', 'tyres', 'interior'].map(cat => {
                                                    const opt = item.customizations[cat];
                                                    if (!opt) return null;
                                                    const price = getOptionPrice(opt);
                                                    return (
                                                        <tr key={`${index}-${cat}`} className="text-sm text-gray-600 border-b border-gray-50">
                                                            <td className="py-1 px-8 italic">
                                                                + {cat.charAt(0).toUpperCase() + cat.slice(1)}: {getOptionName(opt)}
                                                            </td>
                                                            <td className="py-1 px-4 text-center">-</td>
                                                            <td className="py-1 px-4 text-right">{price > 0 ? `৳${price.toLocaleString()}` : '-'}</td>
                                                            <td className="py-1 px-4 text-right">{price > 0 ? `৳${price.toLocaleString()}` : '-'}</td>
                                                        </tr>
                                                    );
                                                })}
                                                {item.customizations.accessories && item.customizations.accessories.map((acc, accIdx) => {
                                                    const price = getOptionPrice(acc);
                                                    return (
                                                        <tr key={`${index}-acc-${accIdx}`} className="text-sm text-gray-600 border-b border-gray-50">
                                                            <td className="py-1 px-8 italic">
                                                                + Accessory: {getOptionName(acc)}
                                                            </td>
                                                            <td className="py-1 px-4 text-center">-</td>
                                                            <td className="py-1 px-4 text-right">{price > 0 ? `৳${price.toLocaleString()}` : '-'}</td>
                                                            <td className="py-1 px-4 text-right">{price > 0 ? `৳${price.toLocaleString()}` : '-'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {/* Item Total Sub-row */}
                                        <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                                            <td className="py-2 px-4 font-bold text-gray-800 text-right" colSpan="3">Item Total</td>
                                            <td className="py-2 px-4 text-right font-bold text-gray-900">
                                                ৳{(item.price * item.quantity).toLocaleString()}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold">৳{total?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">VAT (0%):</span>
                                <span className="font-semibold">৳0</span>
                            </div>
                            <div className="flex justify-between py-3 text-lg">
                                <span className="font-bold text-gray-900">Grand Total:</span>
                                <span className="font-bold text-emerald-600">৳{total?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t border-gray-200 text-center">
                        {isQuote ? (
                            <p className="text-gray-500 text-sm">
                                This is a quotation, not a confirmed order. Prices are subject to change.
                            </p>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                Thank you for your business! For any queries, contact us at support@autoforge.com
                            </p>
                        )}
                        <p className="text-gray-400 text-xs mt-2">
                            Generated on {new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    [ref="invoiceRef"], [ref="invoiceRef"] * {
                        visibility: visible;
                    }
                    .max-w-3xl {
                        max-width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
