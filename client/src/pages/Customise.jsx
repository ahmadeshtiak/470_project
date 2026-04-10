import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axiosInstance from "../utils/axios";
import ImageCarousel from "../components/ImageCarousel";

export default function Customise() {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToCart } = useCart();

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
            const carData = response.data.data;
            setCar(carData);

            // Initialize default selections
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

    const handleAddToCart = () => {
        addToCart({
            ...car,
            type: 'car',
            quantity: 1,
            customizations: selections
        });
        alert(`${car.brand} ${car.model} with customizations added to cart!`);
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading customisation studio...</p>
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
                        Back to Showroom
                    </button>
                </div>
            </div>
        );
    }

    const carImages = car.images && car.images.length > 0 ? car.images : (car.image ? [car.image] : []);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Main Visualizer */}
                    <div className="lg:w-2/3 space-y-8">
                        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                            <ImageCarousel images={carImages} alt={`${car.brand} ${car.model}`} />
                        </div>
                        <div>
                            <h1 className="text-5xl font-extrabold tracking-tight mb-2">{car.brand} {car.model}</h1>
                            <p className="text-2xl text-gray-400">Base Price: ৳{car.price.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Configurator Panel */}
                    <div className="lg:w-1/3 space-y-8 bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 h-fit">
                        <h2 className="text-3xl font-bold mb-6 border-b border-gray-600 pb-4">Customise</h2>

                        {/* Color Selection */}
                        {car.customizationOptions?.colors?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-300 mb-3">Exterior Color</h3>
                                <div className="flex flex-wrap gap-3">
                                    {car.customizationOptions.colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => handleSelectionChange('color', color)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selections.color === color
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-400 transform scale-105'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rims Selection */}
                        {car.customizationOptions?.rims?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-300 mb-3">Wheels & Rims</h3>
                                <div className="flex flex-wrap gap-3">
                                    {car.customizationOptions.rims.map(rim => (
                                        <button
                                            key={rim}
                                            onClick={() => handleSelectionChange('rims', rim)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selections.rims === rim
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-400 transform scale-105'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {rim}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Accessories Selection */}
                        {car.customizationOptions?.accessories?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-300 mb-3">Accessories</h3>
                                <div className="space-y-3">
                                    {car.customizationOptions.accessories.map(acc => (
                                        <label key={acc} className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all duration-200 ${selections.accessories.includes(acc)
                                            ? 'border-blue-500 bg-blue-900/30'
                                            : 'border-gray-600 hover:bg-gray-700'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                checked={selections.accessories.includes(acc)}
                                                onChange={() => handleSelectionChange('accessories', acc)}
                                                className="h-5 w-5 text-blue-600 rounded border-gray-500 focus:ring-blue-500 bg-gray-700"
                                            />
                                            <span className="text-gray-200">{acc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="pt-8 mt-8 border-t border-gray-600 gap-4 flex flex-col">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:-translate-y-1"
                            >
                                Add Custom Configuration to Cart
                            </button>
                            <button
                                onClick={() => navigate(`/cars/${id}`)}
                                className="w-full bg-transparent hover:bg-gray-700 text-gray-400 font-semibold py-3 px-6 rounded-xl transition duration-200"
                            >
                                Cancel & Return to Details
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
