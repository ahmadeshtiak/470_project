import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CarImage from './CarImage';

export default function Cart() {
    const { cartItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-3 sm:px-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="relative overflow-hidden rounded-3xl border border-[#3a241a] bg-gradient-to-br from-[#23150f] via-[#2c1b15] to-[#1c0f0d] p-5 sm:p-7 shadow-2xl">
                        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,#b87333,transparent_45%)]" />

                        <div className="relative">
                            <h1 className="text-3xl font-bold text-amber-50 mb-8">Shopping Cart</h1>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-amber-50">
                                <p className="text-lg font-semibold mb-4">Your cart is empty</p>
                                <p className="text-amber-100/70 mb-6">Start shopping by browsing our cars and parts!</p>
                                <div className="flex gap-4 justify-center flex-wrap">
                                    <button
                                        onClick={() => navigate('/cars')}
                                        className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-full transition duration-200"
                                    >
                                        Browse Cars
                                    </button>
                                    <button
                                        onClick={() => navigate('/parts')}
                                        className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-full transition duration-200"
                                    >
                                        Browse Parts
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-3 sm:px-6">
            <div className="max-w-[1200px] mx-auto">
                <div className="relative overflow-hidden rounded-3xl border border-[#3a241a] bg-gradient-to-br from-[#23150f] via-[#2c1b15] to-[#1c0f0d] p-5 sm:p-7 shadow-2xl">
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,#b87333,transparent_45%)]" />

                    <div className="relative">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-amber-50">Shopping Cart</h1>
                            <button
                                onClick={() => navigate('/')}
                                className="text-amber-400 hover:text-amber-300 font-semibold"
                            >
                                ← Continue Shopping
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {cartItems.map((item) => (
                                    <div
                                        key={`${item._id}-${item.type}`}
                                        className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#2c1b15] via-[#2a1b14] to-[#23150f] shadow-lg p-4"
                                    >
                                        <div className="flex gap-4">
                                            {/* Image */}
                                            <div className="w-32 h-32 rounded-xl overflow-hidden bg-[#3a241a] flex-shrink-0">
                                                {item.images && item.images.length > 0 ? (
                                                    <CarImage
                                                        images={item.images}
                                                        alt={item.brand || item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.brand || item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-amber-100/50">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 text-amber-50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-bold">
                                                            {item.type === 'car'
                                                                ? `${item.brand} ${item.model}`
                                                                : item.name}
                                                        </h3>
                                                        <p className="text-sm text-amber-100/70">
                                                            {item.type === 'car' ? `Year: ${item.year}` : `Category: ${item.category}`}
                                                        </p>
                                                    </div>
                                                    {item.condition && (
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${item.condition === 'new'
                                                                ? 'bg-emerald-500 text-white'
                                                                : 'bg-amber-600 text-white'
                                                                }`}
                                                        >
                                                            {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Customizations Display */}
                                                {item.customizations && (
                                                    <div className="mb-3 text-sm text-amber-100/80 space-y-1">
                                                        {item.customizations.color && (
                                                            <p><span className="text-amber-400">Color:</span> {typeof item.customizations.color === 'object' ? (item.customizations.color.name || '') : item.customizations.color}</p>
                                                        )}
                                                        {item.customizations.rims && (
                                                            <p><span className="text-amber-400">Rims:</span> {typeof item.customizations.rims === 'object' ? (item.customizations.rims.name || '') : item.customizations.rims}</p>
                                                        )}
                                                        {item.customizations.interior && (
                                                            <p><span className="text-amber-400">Interior:</span> {typeof item.customizations.interior === 'object' ? (item.customizations.interior.name || '') : item.customizations.interior}</p>
                                                        )}
                                                        {item.customizations.accessories && item.customizations.accessories.length > 0 && (
                                                            <p><span className="text-amber-400">Accessories:</span> {item.customizations.accessories.map(acc => typeof acc === 'object' ? (acc.name || '') : acc).join(', ')}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Price and Quantity */}
                                                <div className="flex justify-between items-center mt-4">
                                                    <p className="text-xl font-extrabold text-amber-200">
                                                        ৳{item.price.toLocaleString()}
                                                    </p>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item._id,
                                                                    item.type,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2 py-1 rounded"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-amber-50 font-semibold w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item._id,
                                                                    item.type,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2 py-1 rounded"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <p className="text-lg font-bold text-amber-100">
                                                        ৳{(item.price * item.quantity).toLocaleString()}
                                                    </p>

                                                    <button
                                                        onClick={() => removeFromCart(item._id, item.type)}
                                                        className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1 rounded"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cart Summary */}
                            <div className="lg:col-span-1">
                                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#2c1b15] via-[#2a1b14] to-[#23150f] shadow-lg p-6 sticky top-20">
                                    <h2 className="text-xl font-bold text-amber-50 mb-4">Order Summary</h2>

                                    <div className="space-y-3 border-b border-white/10 pb-4 mb-4">
                                        <div className="flex justify-between text-amber-100">
                                            <span>Subtotal:</span>
                                            <span>৳{totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-amber-100">
                                            <span>Shipping:</span>
                                            <span className="text-amber-400">TBD</span>
                                        </div>
                                        <div className="flex justify-between text-amber-100">
                                            <span>Tax:</span>
                                            <span className="text-amber-400">TBD</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-xl font-bold text-amber-50">Total:</span>
                                        <span className="text-2xl font-extrabold text-amber-200">
                                            ৳{totalPrice.toLocaleString()}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition duration-200 mb-3"
                                    >
                                        Proceed to Checkout
                                    </button>

                                    <button
                                        onClick={() => navigate('/invoice', {
                                            state: {
                                                items: cartItems,
                                                total: totalPrice,
                                                type: 'quote'
                                            }
                                        })}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition duration-200 mb-3"
                                    >
                                        📄 Generate Quote
                                    </button>

                                    <button
                                        onClick={clearCart}
                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-lg transition duration-200"
                                    >
                                        Clear Cart
                                    </button>

                                    <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                                        <p className="text-xs text-amber-100/70">
                                            Items in cart: <span className="font-bold text-amber-100">{cartItems.length}</span>
                                        </p>
                                        <p className="text-xs text-amber-100/70">
                                            Total quantity: <span className="font-bold text-amber-100">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
