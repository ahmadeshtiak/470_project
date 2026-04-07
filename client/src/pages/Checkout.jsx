import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

export default function Checkout() {
    const { cartItems, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        paymentMethod: 'cod',
        // MasterCard details
        cardNumber: '',
        cardholderName: user?.name || '',
        expiryDate: '',
        cvv: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Redirect if cart is empty
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
                <div className="max-w-lg mx-auto text-center">
                    <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-amber-50 mb-4">Your cart is empty</h2>
                        <p className="text-amber-100/70 mb-6">Add items to your cart before checkout.</p>
                        <button
                            onClick={() => navigate('/cars')}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-full"
                        >
                            Browse Cars
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect if not logged in
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
                <div className="max-w-lg mx-auto text-center">
                    <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-amber-50 mb-4">Please log in</h2>
                        <p className="text-amber-100/70 mb-6">You need to be logged in to checkout.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-full"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^01[3-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Enter a valid Bangladesh phone number';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

        // MasterCard validation
        if (formData.paymentMethod === 'mastercard') {
            if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
            else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
                newErrors.cardNumber = 'Invalid card number';
            }
            if (!formData.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
            if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
            else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
                newErrors.expiryDate = 'Use MM/YY format';
            }
            if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
            else if (!/^\d{3,4}$/.test(formData.cvv)) {
                newErrors.cvv = 'CVV must be 3-4 digits';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const orderItems = cartItems.map(item => ({
                _id: item._id, // Backend expects _id or partId
                type: item.type, // Backend expects 'car' or 'part'
                product: item._id, // Keep strictly for compatibility if needed elsewhere, but backend mainly uses _id
                productType: item.type === 'car' ? 'Car' : 'Part',
                price: item.price,
                basePrice: item.basePrice,
                quantity: item.quantity,
                customizations: item.customizations || {}
            }));

            const orderData = {
                items: orderItems,
                total: totalPrice,
                shippingAddress: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode
                },
                paymentMethod: formData.paymentMethod
            };

            // Create order first
            const orderRes = await axiosInstance.post('/orders', orderData);
            const orderId = orderRes.data._id || orderRes.data.data?._id;

            if (!orderId) {
                throw new Error('Failed to create order');
            }

            // If MasterCard payment, process payment
            if (formData.paymentMethod === 'mastercard') {
                const paymentRes = await axiosInstance.post('/transactions/process-mastercard', {
                    orderId: orderId,
                    cardNumber: formData.cardNumber.replace(/\s/g, ''),
                    cardholderName: formData.cardholderName,
                    expiryDate: formData.expiryDate,
                    cvv: formData.cvv,
                    amount: totalPrice
                });

                if (!paymentRes.data.success) {
                    throw new Error(paymentRes.data.message || 'Payment failed');
                }

                // Fetch updated order with transaction
                const updatedOrderRes = await axiosInstance.get(`/orders/${orderId}`);
                const updatedOrder = updatedOrderRes.data.data;

                clearCart();
                navigate('/invoice', {
                    state: {
                        success: true,
                        orderId: orderId,
                        type: 'invoice',
                        items: orderItems,
                        total: totalPrice,
                        shippingAddress: orderData.shippingAddress,
                        paymentMethod: orderData.paymentMethod,
                        orderDate: new Date().toISOString(),
                        transactionId: paymentRes.data.data.transactionId,
                        paymentStatus: 'paid'
                    }
                });
            } else {
                // COD payment
                clearCart();
                navigate('/invoice', {
                    state: {
                        success: true,
                        orderId: orderId,
                        type: 'invoice',
                        items: orderItems,
                        total: totalPrice,
                        shippingAddress: orderData.shippingAddress,
                        paymentMethod: orderData.paymentMethod,
                        orderDate: new Date().toISOString(),
                        paymentStatus: 'pending'
                    }
                });
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-amber-50 mb-8 text-center">Secure Checkout</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Shipping Address */}
                        <div className="lg:col-span-2">
                            <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-6 mb-6">
                                <h2 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                                    <span>📦</span> Shipping Address
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-amber-100 text-sm mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-lg bg-[#2c1b15] border ${errors.fullName ? 'border-red-500' : 'border-[#3a241a]'} text-amber-50 focus:outline-none focus:border-amber-500`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-amber-100 text-sm mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-lg bg-[#2c1b15] border ${errors.phone ? 'border-red-500' : 'border-[#3a241a]'} text-amber-50 focus:outline-none focus:border-amber-500`}
                                            placeholder="01XXXXXXXXX"
                                        />
                                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-amber-100 text-sm mb-1">Address *</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-lg bg-[#2c1b15] border ${errors.address ? 'border-red-500' : 'border-[#3a241a]'} text-amber-50 focus:outline-none focus:border-amber-500`}
                                            placeholder="House/Street/Area"
                                        />
                                        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-amber-100 text-sm mb-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-lg bg-[#2c1b15] border ${errors.city ? 'border-red-500' : 'border-[#3a241a]'} text-amber-50 focus:outline-none focus:border-amber-500`}
                                            placeholder="City"
                                        />
                                        {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-amber-100 text-sm mb-1">Postal Code *</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-lg bg-[#2c1b15] border ${errors.postalCode ? 'border-red-500' : 'border-[#3a241a]'} text-amber-50 focus:outline-none focus:border-amber-500`}
                                            placeholder="Postal Code"
                                        />
                                        {errors.postalCode && <p className="text-red-400 text-xs mt-1">{errors.postalCode}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-6">
                                <h2 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                                    <span>💳</span> Payment Method
                                </h2>

                                <div className="space-y-3">
                                    <label className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border ${formData.paymentMethod === 'cod' ? 'border-amber-500 bg-amber-500/10' : 'border-[#3a241a]'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-amber-500"
                                        />
                                        <div>
                                            <p className="text-amber-50 font-semibold">Cash on Delivery</p>
                                            <p className="text-amber-100/60 text-sm">Pay when you receive</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border ${formData.paymentMethod === 'mastercard' ? 'border-amber-500 bg-amber-500/10' : 'border-[#3a241a]'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="mastercard"
                                            checked={formData.paymentMethod === 'mastercard'}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-amber-500"
                                        />
                                        <div>
                                            <p className="text-amber-50 font-semibold">💳 MasterCard</p>
                                            <p className="text-amber-100/60 text-sm">Secure online payment</p>
                                        </div>
                                    </label>
                                </div>

                                {formData.paymentMethod === 'mastercard' && (
                                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                        <h3 className="text-emerald-300 font-semibold mb-4">💳 MasterCard Details</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-amber-100 text-sm mb-1">Card Number *</label>
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    value={formData.cardNumber}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        setFormData(prev => ({ ...prev, cardNumber: value }));
                                                        if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
                                                    }}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                    className={`w-full p-3 rounded-lg bg-[#2c1b15] border ${errors.cardNumber ? 'border-red-500' : 'border-emerald-500/50'} text-amber-50 focus:outline-none focus:border-emerald-400`}
                                                />
                                                {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-amber-100 text-sm mb-1">Cardholder Name *</label>
                                                <input
                                                    type="text"
                                                    name="cardholderName"
                                                    value={formData.cardholderName}
                                                    onChange={handleChange}
                                                    placeholder="Name on card"
                                                    className={`w-full p-3 rounded-lg bg-[#2c1b15] border ${errors.cardholderName ? 'border-red-500' : 'border-emerald-500/50'} text-amber-50 focus:outline-none focus:border-emerald-400`}
                                                />
                                                {errors.cardholderName && <p className="text-red-400 text-xs mt-1">{errors.cardholderName}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-amber-100 text-sm mb-1">Expiry Date (MM/YY) *</label>
                                                    <input
                                                        type="text"
                                                        name="expiryDate"
                                                        value={formData.expiryDate}
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(/\D/g, '');
                                                            if (value.length >= 2) {
                                                                value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                                            }
                                                            setFormData(prev => ({ ...prev, expiryDate: value }));
                                                            if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: '' }));
                                                        }}
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                        className={`w-full p-3 rounded-lg bg-[#2c1b15] border ${errors.expiryDate ? 'border-red-500' : 'border-emerald-500/50'} text-amber-50 focus:outline-none focus:border-emerald-400`}
                                                    />
                                                    {errors.expiryDate && <p className="text-red-400 text-xs mt-1">{errors.expiryDate}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-amber-100 text-sm mb-1">CVV *</label>
                                                    <input
                                                        type="password"
                                                        name="cvv"
                                                        value={formData.cvv}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '');
                                                            setFormData(prev => ({ ...prev, cvv: value }));
                                                            if (errors.cvv) setErrors(prev => ({ ...prev, cvv: '' }));
                                                        }}
                                                        placeholder="123"
                                                        maxLength="4"
                                                        className={`w-full p-3 rounded-lg bg-[#2c1b15] border ${errors.cvv ? 'border-red-500' : 'border-emerald-500/50'} text-amber-50 focus:outline-none focus:border-emerald-400`}
                                                    />
                                                    {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
                                                </div>
                                            </div>

                                            <p className="text-emerald-300/70 text-xs mt-2">
                                                🔒 Your card details are encrypted and secure
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-6 sticky top-20">
                                <h2 className="text-xl font-bold text-amber-50 mb-4">Order Summary</h2>

                                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-amber-100 text-sm border-b border-[#3a241a] pb-2">
                                            <span className="truncate pr-2">
                                                {item.type === 'car' ? `${item.brand} ${item.model}` : item.name}
                                                <span className="text-amber-100/50"> x{item.quantity}</span>
                                            </span>
                                            <span className="whitespace-nowrap">৳{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-[#3a241a] pt-4 space-y-2">
                                    <div className="flex justify-between text-amber-100">
                                        <span>Subtotal</span>
                                        <span>৳{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-amber-100">
                                        <span>Shipping</span>
                                        <span className="text-emerald-400">Free</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-amber-50 pt-2">
                                        <span>Total</span>
                                        <span>৳{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-500 text-white font-bold py-4 rounded-xl transition duration-200"
                                >
                                    {loading ? 'Placing Order...' : '🔒 Place Order'}
                                </button>

                                <p className="text-amber-100/50 text-xs text-center mt-3">
                                    Your information is secure and encrypted
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
