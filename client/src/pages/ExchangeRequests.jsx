import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

export default function ExchangeRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchExchanges();
  }, [activeTab]);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/exchanges?type=${activeTab}`);
      setExchanges(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch exchange requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (exchangeId, status) => {
    if (!user) {
      alert('Please login first');
      return;
    }

    setResponding(true);
    try {
      await axiosInstance.put(`/exchanges/${exchangeId}`, {
        status,
        responseMessage: responseMessage || '',
      });

      setRespondingTo(null);
      setResponseMessage("");
      await fetchExchanges();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond to exchange request');
    } finally {
      setResponding(false);
    }
  };

  const handleWithdraw = async (exchangeId) => {
    if (!window.confirm('Are you sure you want to withdraw this exchange request?')) return;

    try {
      await axiosInstance.put(`/exchanges/${exchangeId}`, {
        status: 'withdrawn',
      });
      await fetchExchanges();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to withdraw request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Exchange Requests</h1>
          <p className="text-gray-600">Manage your car and part exchange proposals</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition ${
              activeTab === 'received'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Received Requests
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition ${
              activeTab === 'sent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Sent Requests
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exchange requests...</p>
          </div>
        ) : exchanges.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg">No exchange requests {activeTab === 'received' ? 'received' : 'sent'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {exchanges.map((exchange) => (
              <div key={exchange._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Header with Status */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Exchange Request</h3>
                      <p className="text-sm text-gray-600">
                        {activeTab === 'received' ? 'From' : 'To'}: <span className="font-semibold">
                          {activeTab === 'received' ? exchange.requestedBy.name : exchange.requestedFrom.name}
                        </span>
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full border font-semibold text-sm ${getStatusColor(exchange.status)}`}>
                      {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                    </span>
                  </div>

                  {/* Items Exchange */}
                  <div className="grid md:grid-cols-2 gap-8 mb-6">
                    {/* Offered Item */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-3 font-semibold uppercase">Offering</p>
                      <div className="flex gap-4">
                        {exchange.itemOffered.itemImage && (
                          <img
                            src={
                              exchange.itemOffered.itemImage.startsWith('http')
                                ? exchange.itemOffered.itemImage
                                : `http://localhost:5000${exchange.itemOffered.itemImage}`
                            }
                            alt={exchange.itemOffered.itemName}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{exchange.itemOffered.itemName}</p>
                          <p className="text-sm text-gray-600 capitalize">{exchange.itemOffered.itemType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Requested Item */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-3 font-semibold uppercase">Requesting</p>
                      <div className="flex gap-4">
                        {exchange.itemRequested.itemImage && (
                          <img
                            src={
                              exchange.itemRequested.itemImage.startsWith('http')
                                ? exchange.itemRequested.itemImage
                                : `http://localhost:5000${exchange.itemRequested.itemImage}`
                            }
                            alt={exchange.itemRequested.itemName}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{exchange.itemRequested.itemName}</p>
                          <p className="text-sm text-gray-600 capitalize">{exchange.itemRequested.itemType}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {exchange.message && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Message:</p>
                      <p className="text-gray-700">{exchange.message}</p>
                    </div>
                  )}

                  {/* Response Message */}
                  {exchange.responseMessage && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Response:</p>
                      <p className="text-gray-700">{exchange.responseMessage}</p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="text-sm text-gray-600 mb-6">
                    <p>Requested: {new Date(exchange.createdAt).toLocaleDateString()}</p>
                    {exchange.respondedAt && <p>Responded: {new Date(exchange.respondedAt).toLocaleDateString()}</p>}
                    <p>Expires: {new Date(exchange.expiresAt).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    {/* For Received Requests - Show response buttons */}
                    {activeTab === 'received' && exchange.status === 'pending' && respondingTo !== exchange._id && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setRespondingTo(exchange._id)}
                          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                        >
                          Respond
                        </button>
                      </div>
                    )}

                    {/* Response Form */}
                    {activeTab === 'received' && exchange.status === 'pending' && respondingTo === exchange._id && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                        <textarea
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          placeholder="Add a response message (optional)"
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleRespond(exchange._id, 'accepted')}
                            disabled={responding}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                          >
                            {responding ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleRespond(exchange._id, 'rejected')}
                            disabled={responding}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                          >
                            {responding ? 'Processing...' : 'Decline'}
                          </button>
                          <button
                            onClick={() => setRespondingTo(null)}
                            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* For Sent Requests - Show withdraw button */}
                    {activeTab === 'sent' && exchange.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(exchange._id)}
                        className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                      >
                        Withdraw Request
                      </button>
                    )}
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
