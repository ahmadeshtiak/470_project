import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

export default function MyDesigns() {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDesigns();
    }, [user, navigate]);

    const fetchDesigns = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/designs/my-designs');
            setDesigns(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching designs:', err);
            setError(err.response?.data?.message || 'Failed to load designs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (designId) => {
        if (!window.confirm('Are you sure you want to delete this design?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/designs/${designId}`);
            // Remove from local state
            setDesigns(designs.filter(design => design._id !== designId));
        } catch (err) {
            console.error('Error deleting design:', err);
            alert(err.response?.data?.message || 'Failed to delete design');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        if (imagePath.startsWith('/uploads')) {
            return `http://localhost:5000${imagePath}`;
        }
        return `http://localhost:5000/uploads/designs/${imagePath}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3C2414' }}>
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto" style={{ borderColor: '#5D4037', borderTopColor: '#8D6E63' }}></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderRightColor: '#6D4C41', animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="mt-6 font-semibold text-lg" style={{ color: '#D7CCC8' }}>Loading your designs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#3C2414' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="rounded-lg shadow-lg p-4 text-white relative overflow-hidden" style={{ backgroundColor: '#5D4037' }}>
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-black tracking-tight">My Designs</h1>
                                <p className="text-sm" style={{ color: '#D7CCC8' }}>Your creative automotive customizations</p>
                            </div>
                            <button
                                onClick={() => navigate('/customization')}
                                className="px-6 py-2 bg-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
                                style={{ color: '#5D4037' }}
                            >
                                Create New Design
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg mb-6 font-semibold border-l-4 border-red-800">
                        {error}
                    </div>
                )}

                {designs.length === 0 ? (
                    <div className="backdrop-blur-sm rounded-2xl shadow-2xl p-16 text-center border" style={{ backgroundColor: 'rgba(93, 64, 55, 0.9)', borderColor: '#6D4C41' }}>
                        <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #6D4C41, #5D4037)' }}>
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">No Designs Yet</h2>
                        <p className="mb-8 text-lg" style={{ color: '#D7CCC8' }}>
                            Start customizing cars and upload your designs to see them here.
                        </p>
                        <button
                            onClick={() => navigate('/customization')}
                            className="px-8 py-4 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                            style={{ background: 'linear-gradient(to right, #6D4C41, #5D4037)' }}
                        >
                            Go to Customization Studio
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {designs.map((design) => (
                            <div
                                key={design._id}
                                className="group backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 relative"
                                style={{ backgroundColor: 'rgba(93, 64, 55, 0.9)', borderColor: '#6D4C41', borderWidth: '1px' }}
                            >
                                {/* Delete Icon Button */}
                                <button
                                    onClick={() => handleDelete(design._id)}
                                    className="absolute top-3 right-3 z-10 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-110"
                                    title="Delete design"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>

                                {/* Image */}
                                <div className="aspect-video overflow-hidden relative" style={{ backgroundColor: '#3C2414' }}>
                                    <img
                                        src={getImageUrl(design.image)}
                                        alt="Custom design"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {design.carInfo && (
                                        <div className="mb-4">
                                            <div className="inline-block px-3 py-1 rounded-full mb-2" style={{ background: 'linear-gradient(to right, #6D4C41, #5D4037)' }}>
                                                <h3 className="text-lg font-bold text-white">
                                                    {design.carInfo.brand} {design.carInfo.model}
                                                </h3>
                                            </div>
                                        </div>
                                    )}

                                    {design.description && (
                                        <p className="mb-4 line-clamp-3 leading-relaxed" style={{ color: '#D7CCC8' }}>
                                            {design.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 text-sm" style={{ color: '#BCAAA4' }}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Created: {new Date(design.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
