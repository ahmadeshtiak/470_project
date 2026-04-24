import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const ExchangeRequestPortal = () => {
    const { itemId, itemType } = useParams();
    const { user } = useAuth();
    const [targetItem, setTargetItem] = useState(null);
    const [targetItemType, setTargetItemType] = useState(itemType);
    const [userItems, setUserItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemType, setSelectedItemType] = useState('car');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingTarget, setLoadingTarget] = useState(true);

    useEffect(() => {
        fetchTargetItem();
        fetchUserItems();
    }, [itemId, itemType, selectedItemType]);

    const fetchTargetItem = async () => {
        try {
            setLoadingTarget(true);
            const endpoint = itemType === 'car' ? `/cars/${itemId}` : `/parts/${itemId}`;
            const response = await axiosInstance.get(endpoint);
            setTargetItem(response.data.data);
        } catch (error) {
            console.error('Error fetching target item:', error);
            setError('Failed to load target item');
        } finally {
            setLoadingTarget(false);
        }
    };

    const fetchUserItems = async () => {
        try {
            let endpoint = '';
            if (selectedItemType === 'car') {
                endpoint = '/cars/my-listings';
            } else {
                endpoint = '/parts/my-listings';
            }

            const response = await axiosInstance.get(endpoint);
            setUserItems(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching user items:', error);
            setError('Failed to load your items');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedItem) {
            setError('Please select an item to offer');
            return;
        }

        if (!targetItem) {
            setError('No target item selected');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const receiverId = targetItem.seller?._id || targetItem.seller;
            const requestData = {
                receiver: receiverId,
                initiatorItem: selectedItem._id,
                initiatorItemType: selectedItemType,
                receiverItem: targetItem._id,
                receiverItemType: targetItemType,
                message: message.trim()
            };

            await axiosInstance.post('/swap-requests/create', requestData);

            alert('Swap request sent successfully!');
            // Redirect or something, since no onClose
            window.history.back();
        } catch (error) {
            console.error('Error creating swap request:', error);
            setError(error.response?.data?.message || 'Failed to send swap request');
        } finally {
            setLoading(false);
        }
    };

    if (loadingTarget) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center">Loading target item...</div>
            </div>
        );
    }

    if (!targetItem) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center text-red-600">Target item not found</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create Exchange Request</h2>
            </div>

            {/* Target Item Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Item You Want to Trade For:</h3>
                <div className="flex items-center space-x-4">
                    {targetItem?.images?.[0] && (
                        <img
                            src={`http://localhost:5000${targetItem.images[0]}`}
                            alt={targetItem.name || targetItem.title}
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                    )}
                    <div>
                        <p className="font-medium text-gray-900">{targetItem?.name || targetItem?.title || `${targetItem?.brand} ${targetItem?.model}` || 'Unknown Item'}</p>
                        <p className="text-sm text-gray-700 capitalize">{targetItemType}</p>
                        {targetItem?.price && (
                            <p className="text-sm text-gray-700 font-semibold">${targetItem.price}</p>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Item Type Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        What would you like to offer?
                    </label>
                    <div className="flex text-gray-700 mb-2 space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="car"
                                checked={selectedItemType === 'car'}
                                onChange={(e) => setSelectedItemType(e.target.value)}
                                className="mr-2"
                            />
                            Car
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="part"
                                checked={selectedItemType === 'part'}
                                onChange={(e) => setSelectedItemType(e.target.value)}
                                className="mr-2"
                            />
                            Part
                        </label>
                    </div>
                </div>

                {/* User's Items Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select your {selectedItemType}:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                        {userItems.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => setSelectedItem(item)}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedItem?._id === item._id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    {item.images?.[0] && (
                                        <img
                                            src={`http://localhost:5000${item.images[0]}`}
                                            alt={item.name || item.title}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900">{item.name || item.title || `${item.brand} ${item.model}` || 'Unknown Item'}</p>
                                        {item.price && (
                                            <p className="text-xs text-gray-700 font-semibold">${item.price}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {userItems.length === 0 && (
                        <p className="text-gray-500 text-sm mt-2">
                            No {selectedItemType}s found. Add some to your listings first.
                        </p>
                    )}
                </div>

                {/* Message */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message (optional):
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message to the swap request..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                    />
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !selectedItem}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send Swap Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExchangeRequestPortal;