import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CarVisualizer from '../components/CarVisualizer';
import { getColorHex, RIM_COLORS } from '../utils/colorMap';
import { dummyCars } from '../utils/customizationData';

export default function CustomizationStudio() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [activeCar, setActiveCar] = useState(null);
    const [customTexture, setCustomTexture] = useState(null);
    const [rimColorName, setRimColorName] = useState('Chrome');
    
    // Tab State for organization
    const [activeTab, setActiveTab] = useState('colors');

    const [selections, setSelections] = useState({
        color: '', rims: '', tyres: '', interior: '', accessories: []
    });
    const [showSaveModal, setShowSaveModal] = useState(false);

    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const visualizerRef = useRef();

    useEffect(() => {
        setCars(dummyCars);
        setLoading(false);
    }, []);

    const brands = [...new Set(cars.map(c => c.brand))].sort();
    const models = selectedBrand ? [...new Set(cars.filter(c => c.brand === selectedBrand).map(c => c.model))].sort() : [];

    const handleBrandChange = (brand) => {
        setSelectedBrand(brand);
        setSelectedModel('');
        setActiveCar(null);
        setCustomTexture(null);
        setSelections({ color: '', rims: '', accessories: [] });
    };

    const handleModelChange = (model) => {
        setSelectedModel(model);
        const car = cars.find(c => c.brand === selectedBrand && c.model === model);
        setActiveCar(car);
        setCustomTexture(null);
        if (car?.customizationOptions) {
            setSelections({
                color: car.customizationOptions.colors?.[0] || '',
                rims: car.customizationOptions.rims?.[0] || '',
                accessories: []
            });
        }
    };

    const handleTextureUpload = (e) => {
        const file = e.target.files[0];
        if (file) setCustomTexture(URL.createObjectURL(file));
    };

    const handleDownload = () => {
        if (visualizerRef.current) visualizerRef.current.downloadSnapshot();
        setShowSaveModal(false);
    };

    const handleSaveImageClick = () => {
        setShowSaveModal(true);
    };

    const handleUploadToDashboard = () => {
        // Capture the canvas image
        const canvas = document.querySelector("canvas");
        if (canvas) {
            const imageData = canvas.toDataURL("image/png");
            // Store image data in sessionStorage to pass to upload page
            sessionStorage.setItem('customizationImage', imageData);
            // Store car info for context
            sessionStorage.setItem('customizationCarInfo', JSON.stringify({
                brand: selectedBrand,
                model: selectedModel,
                selections: selections
            }));
            setShowSaveModal(false);
            navigate('/upload-design');
        }
    };

    const handleSelectionChange = (category, option) => {
        setSelections(prev => {
            if (category === 'accessories') {
                const current = prev.accessories || [];
                const name = getOptionName(option);
                const exists = current.find(i => getOptionName(i) === name);
                return exists 
                    ? { ...prev, accessories: current.filter(i => getOptionName(i) !== name) }
                    : { ...prev, accessories: [...current, option] };
            }
            if (category === 'color') setCustomTexture(null);
            return { ...prev, [category]: option };
        });
    };

    // Helper functions
    const getOptionName = (option) => {
        return typeof option === 'string' ? option : option?.name || '';
    };

    const getOptionPrice = (option) => {
        return typeof option === 'string' ? 0 : option?.price || 0;
    };

    const calculateTotalPrice = () => {
        if (!activeCar) return 0;
        let total = activeCar.price || 0;
        ['color', 'rims', 'tyres', 'interior'].forEach(cat => {
            total += getOptionPrice(selections[cat]);
        });
        selections.accessories.forEach(acc => {
            total += getOptionPrice(acc);
        });
        return total;
    };

    const handleAddToCart = () => {
        if (!activeCar) return;
        addToCart({
            ...activeCar,
            price: calculateTotalPrice(),
            basePrice: activeCar.price,
            type: 'car',
            quantity: 1,
            customizations: { ...selections, rimColor: rimColorName },
            customWrap: customTexture
        });
        alert('Added to cart!');
        navigate('/cart');
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="container mx-auto p-8 max-w-7xl">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-100">🎨 Customization Studio</h1>

            {/* Step 1: Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Step 1: Select Your Car</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-medium text-gray-600">Brand</label>
                        <select 
                            value={selectedBrand} 
                            onChange={(e) => handleBrandChange(e.target.value)}
                            className="block mb-2 font-regular text-gray-900 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">-- Select Brand --</option>
                            {brands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-gray-600">Model</label>
                        <select 
                            value={selectedModel} 
                            onChange={(e) => handleModelChange(e.target.value)} 
                            disabled={!selectedBrand}
                            className="block mb-2 font-regular text-gray-900 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                        >
                            <option value="">-- Select Model --</option>
                            {models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Step 2: Customization Grid */}
            {activeCar && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    
                    {/* LEFT COLUMN: Visualizer (Span 8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 h-[600px] sticky top-4 relative overflow-hidden">
                            <CarVisualizer 
                                ref={visualizerRef}
                                selectedColor={getColorHex(getOptionName(selections.color))} 
                                selectedRimColor={getColorHex(rimColorName)}
                                uploadedTexture={customTexture} 
                                modelPath={activeCar.modelPath}
                                config={activeCar.visualConfig} 
                            />
                            
                            {/* Floating Toolbar for Tools */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-xl flex gap-4 border border-gray-200">
                                {/* Wrap Upload Button */}
                                {!customTexture ? (
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full hover:bg-blue-50 text-blue-600 font-bold transition text-sm">
                                        <span>📸</span> Upload Wrap
                                        <input type="file" accept="image/*" onChange={handleTextureUpload} className="hidden" />
                                    </label>
                                ) : (
                                    <button onClick={() => setCustomTexture(null)} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 text-red-500 font-bold transition text-sm">
                                        <span>❌</span> Remove Wrap
                                    </button>
                                )}
                                
                                <div className="w-px bg-gray-300 mx-1"></div>

                                {/* Download Button */}
                                <button onClick={handleSaveImageClick} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 text-gray-700 font-bold transition text-sm">
                                    <span>💾</span> Save Image
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Controls (Span 4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* TAB NAVIGATION */}
                        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex justify-between">
                            {['colors', 'rims', 'interior', 'accessories'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 text-xs sm:text-sm font-bold capitalize rounded-lg transition-all ${
                                        activeTab === tab 
                                            ? 'bg-gray-900 text-white shadow-md' 
                                            : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* TAB CONTENT PANEL */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 min-h-[400px]">
                            
                            {/* 1. COLORS TAB */}
                            {activeTab === 'colors' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4 text-gray-800">Exterior Paint</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        {activeCar.customizationOptions.colors.map(opt => {
                                            const name = getOptionName(opt);
                                            const isSelected = getOptionName(selections.color) === name;
                                            return (
                                                <button
                                                    key={name}
                                                    onClick={() => handleSelectionChange('color', opt)}
                                                    className={`group relative w-full aspect-square rounded-full border-2 transition-all shadow-sm ${
                                                        isSelected ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-gray-200 hover:scale-105'
                                                    }`}
                                                    style={{backgroundColor: getColorHex(name)}}
                                                    title={name}
                                                >
                                                    {isSelected && <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md font-bold">✓</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-4 text-sm text-gray-500 text-center font-medium bg-gray-50 py-2 rounded-lg">
                                        {getOptionName(selections.color) || "Select a color"}
                                    </p>
                                </div>
                            )}

                            {/* 2. RIMS TAB */}
                            {activeTab === 'rims' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 text-gray-800">Rim Style</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {activeCar.customizationOptions.rims.map(opt => {
                                                const name = getOptionName(opt);
                                                const price = getOptionPrice(opt);
                                                const isSelected = getOptionName(selections.rims) === name;
                                                return (
                                                    <button
                                                        key={name}
                                                        onClick={() => handleSelectionChange('rims', opt)}
                                                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex justify-between items-center ${
                                                            isSelected ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                                        }`}
                                                    >
                                                        <span>{name}</span>
                                                        {price > 0 && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">+৳{price/1000}k</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold mb-3 text-gray-800">Rim Color</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {RIM_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setRimColorName(color)}
                                                    className={`group relative w-10 h-10 rounded-full border-2 transition-all shadow-sm ${
                                                        rimColorName === color ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-gray-200 hover:scale-105'
                                                    }`}
                                                    style={{backgroundColor: getColorHex(color)}}
                                                    title={color}
                                                >
                                                    {rimColorName === color && <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md font-bold text-xs">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500 font-medium">Selected: {rimColorName}</p>
                                    </div>
                                </div>
                            )}

                            {/* 3. INTERIOR TAB */}
                            {activeTab === 'interior' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4 text-gray-800">Interior Style</h3>
                                    <div className="space-y-2">
                                        {activeCar.customizationOptions.interior?.map(opt => {
                                            const name = getOptionName(opt);
                                            const isSelected = getOptionName(selections.interior) === name;
                                            return (
                                                <button
                                                    key={name}
                                                    onClick={() => handleSelectionChange('interior', opt)}
                                                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                                        isSelected ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                                    }`}
                                                >
                                                    {name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 4. ACCESSORIES TAB */}
                            {activeTab === 'accessories' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4 text-gray-800">Add-ons</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {activeCar.customizationOptions.accessories?.map(acc => {
                                            const name = getOptionName(acc);
                                            const price = getOptionPrice(acc);
                                            const isSelected = selections.accessories.some(item => getOptionName(item) === name);
                                            return (
                                                <label key={name} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                                    isSelected ? 'border-green-500 bg-green-50 ring-1 ring-green-200' : 'border-gray-200 hover:bg-gray-50'
                                                }`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectionChange('accessories', acc)}
                                                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                                    />
                                                    <span className="ml-3 flex-1 font-medium text-gray-700">{name}</span>
                                                    {price > 0 && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">+৳{price/1000}k</span>}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* PRICE & CART */}
                        <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg mt-auto border border-gray-800">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Price</span>
                                <span className="text-3xl font-bold text-emerald-400">৳{calculateTotalPrice().toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={handleAddToCart}
                                className="w-full py-4 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition shadow-md text-lg"
                            >
                                Add to Cart 🛒
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Save Image Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                            Save Your Design
                        </h2>
                        <p className="text-gray-600 mb-6 text-center">
                            What would you like to do with this image?
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleDownload}
                                className="w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
                            >
                                💾 Just Save Image
                            </button>
                            <button
                                onClick={handleUploadToDashboard}
                                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                            >
                                📤 Upload to Dashboard
                            </button>
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="w-full py-2 px-6 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}