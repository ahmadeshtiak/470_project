import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ChatBox from '../components/ChatBox';

const SwapRequestsManager = () => {
    const { user } = useAuth();
    const { startChat, activeChat, closeChat } = useChat();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const getId = (entity) => {
        if (!entity) return undefined;
        if (typeof entity === 'string') return entity;
        if (entity._id) return entity._id.toString();
        if (entity.id) return entity.id.toString();
        return undefined;
    };
    const currentUserId = getId(user);
    const [filter, setFilter] = useState('all'); // all, sent, received, pending
    const [showChatBox, setShowChatBox] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/swap-requests/my-requests');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching swap requests:', error);
            setError('Failed to load swap requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId, status) => {
        try {
            await axiosInstance.put(`/swap-requests/${requestId}/status`, { status });
            // Update the local state
            setRequests(requests.map(req =>
                req._id === requestId ? { ...req, status } : req
            ));
            alert(`Request ${status} successfully!`);
        } catch (error) {
            console.error('Error updating request:', error);
            alert('Failed to update request status');
        }
    };

    const handleContactSeller = async (request) => {
        setChatLoading(true);
        try {
            const sellerId = getId(request.initiator);
            const initiatorItemId = getId(request.initiatorItem);
            const receiverItemId = getId(request.receiverItem);
            const carId = request.initiatorItemType === 'car'
                ? initiatorItemId || receiverItemId
                : receiverItemId || initiatorItemId;
            if (!sellerId || !carId) {
                throw new Error('Unable to locate conversation participant or item');
            }
            console.log('Starting chat for swap request', {
                requestId: getId(request._id),
                sellerId,
                carId,
                initiatorItemType: request.initiatorItemType,
                receiverItemType: request.receiverItemType,
            });
            await startChat(sellerId, carId);
            setSelectedRequest(request);
            setShowChatBox(true);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
            console.error('Error opening chat:', error, { errorMessage });
            alert(`Failed to open chat with the offerer. Please try again. ${errorMessage}`);
        } finally {
            setChatLoading(false);
        }
    };

    const filteredRequests = requests.filter(request => {
        if (filter === 'all') return true;
        if (filter === 'sent') return getId(request.initiator) === currentUserId;
        if (filter === 'received') return getId(request.receiver) === currentUserId;
        if (filter === 'pending') return request.status === 'pending' && getId(request.receiver) === currentUserId;
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className={`max-w-6xl mx-auto p-6 ${showChatBox ? 'mr-96' : ''} transition-all duration-300`}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Swap Requests</h1>

            {/* Filter Buttons */}
            <div className="flex space-x-2 mb-6">
                {['all', 'sent', 'received', 'pending'].map(filterType => (
                    <button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        className={`px-4 py-2 rounded-lg capitalize ${filter === filterType
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {filterType}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Requests List */}
            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No swap requests found</p>
                    </div>
                ) : (
                    filteredRequests.map(request => (
                        <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {getId(request.initiator) === currentUserId ? 'You offered' : `${request.initiator.username} offered`}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                    {request.status}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                {/* Offered Item */}
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Offering:</h4>
                                    <div className="flex items-center space-x-3">
                                        {request.initiatorItem?.images?.[0] && (
                                            <img
                                                src={`http://localhost:5000${request.initiatorItem.images[0]}`}
                                                alt={request.initiatorItem.name || request.initiatorItem.title}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        )}
                                        <div className="text-sm">
                                            <p className="font-medium">{request.initiatorItem?.name || request.initiatorItem?.title || `${request.initiatorItem?.brand} ${request.initiatorItem?.model} ${request.initiatorItem?.year}` || 'Unknown Item'}</p>
                                            <p className="text-gray-600">${request.initiatorItem?.price || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Requested Item */}
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Requesting:</h4>
                                    <div className="flex items-center space-x-3">
                                        {request.receiverItem?.images?.[0] && (
                                            <img
                                                src={`http://localhost:5000${request.receiverItem.images[0]}`}
                                                alt={request.receiverItem.name || request.receiverItem.title}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        )}
                                        <div className="text-sm">
                                            <p className="font-medium">{request.receiverItem?.name || request.receiverItem?.title || `${request.receiverItem?.brand} ${request.receiverItem?.model} ${request.receiverItem?.year}` || 'Unknown Item'}</p>
                                            <p className="text-gray-600">${request.receiverItem?.price || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {request.message && (
                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-700 mb-1">Message:</h4>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{request.message}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                {(getId(request.receiver) === currentUserId) && request.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(request._id, 'accepted')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(request._id, 'rejected')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                                {getId(request.initiator) !== currentUserId && (
                                    <button
                                        onClick={() => handleContactSeller(request)}
                                        disabled={chatLoading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                                    >
                                        {chatLoading && selectedRequest?._id === request._id ? 'Opening Chat...' : 'Contact Offerer'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showChatBox && selectedRequest && activeChat && (
                <div className="fixed right-0 top-0 h-full w-96 z-50">
                    <ChatBox
                        sellerName={selectedRequest.initiator.name || selectedRequest.initiator.username || 'Offerer'}
                        sellerId={selectedRequest.initiator._id || selectedRequest.initiator.id}
                        carId={selectedRequest.initiatorItem?._id || selectedRequest.receiverItem?._id}
                        onClose={() => {
                            closeChat();
                            setShowChatBox(false);
                            setSelectedRequest(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default SwapRequestsManager;