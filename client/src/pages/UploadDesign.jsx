import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

export default function UploadDesign() {
    const [imageData, setImageData] = useState(null);
    const [description, setDescription] = useState('');
    const [carInfo, setCarInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get image data from sessionStorage
        const storedImage = sessionStorage.getItem('customizationImage');
        const storedCarInfo = sessionStorage.getItem('customizationCarInfo');

        if (!storedImage) {
            // No image found, redirect back
            navigate('/customization');
            return;
        }

        setImageData(storedImage);
        if (storedCarInfo) {
            setCarInfo(JSON.parse(storedCarInfo));
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!imageData) {
            setError('No image found');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Convert data URL to blob
            const response = await fetch(imageData);
            const blob = await response.blob();
            
            // Create a File object from blob with proper name
            const file = new File([blob], `customization-${Date.now()}.png`, { type: 'image/png' });
            
            // Create FormData
            const formData = new FormData();
            formData.append('image', file);
            formData.append('description', description || '');
            if (carInfo) {
                formData.append('carInfo', JSON.stringify(carInfo));
            }

            // Upload to backend - don't set Content-Type header, let axios set it automatically for FormData
            await axiosInstance.post('/designs', formData);

            // Clear sessionStorage
            sessionStorage.removeItem('customizationImage');
            sessionStorage.removeItem('customizationCarInfo');

            // Redirect to My Designs page
            navigate('/my-designs');
        } catch (err) {
            console.error('Error uploading design:', err);
            console.error('Error response:', err.response);
            console.error('Error details:', err.response?.data);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to upload design. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        sessionStorage.removeItem('customizationImage');
        sessionStorage.removeItem('customizationCarInfo');
        navigate('/customization');
    };

    if (!imageData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-indigo-700 font-semibold text-lg">No image found. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-block mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                        Upload Your Design
                    </h1>
                    <p className="text-indigo-600 text-lg font-medium">Share your creative vision with the world</p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-indigo-100 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-200/30 to-indigo-200/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl -ml-32 -mb-32"></div>
                    
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {/* Image Preview */}
                        <div className="mb-8">
                            <label className="block text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Your Customized Design
                            </label>
                            <div className="border-4 border-dashed border-indigo-200 rounded-2xl p-6 bg-gradient-to-br from-cyan-50 to-indigo-50 hover:border-indigo-400 transition-colors duration-300">
                                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                                    <img
                                        src={imageData}
                                        alt="Customized design"
                                        className="max-w-full h-auto rounded-xl mx-auto"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                                </div>
                            </div>
                            {carInfo && (
                                <div className="mt-4 text-center">
                                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold rounded-full shadow-lg">
                                        {carInfo.brand} {carInfo.model}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Description Input */}
                        <div>
                            <label
                                htmlFor="description"
                                className="block text-lg font-bold text-indigo-800 mb-3 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Description (Optional)
                            </label>
                            <textarea
                                id="description"
                                rows={5}
                                value={description}
                                onChange={(e) => {
                                    if (e.target.value.length <= 500) {
                                        setDescription(e.target.value);
                                    }
                                }}
                                placeholder="Tell us about your design... What inspired you? What customizations did you make?"
                                className="w-full px-5 py-4 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 outline-none resize-none text-gray-900 bg-white shadow-inner transition-all duration-300"
                                maxLength={500}
                            />
                            <div className="mt-2 flex justify-between items-center">
                                <p className="text-sm text-indigo-600 font-medium">
                                    Share your creative process and inspiration
                                </p>
                                <p className="text-sm font-bold text-indigo-600">
                                    {description.length} / 500
                                </p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg font-semibold border-l-4 border-red-700">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 py-4 px-6 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Upload Design
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

