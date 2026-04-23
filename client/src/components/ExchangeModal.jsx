import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

export default function ExchangeModal({ isOpen, onClose, itemToReceive, userOwnedItems, onSuccess }) {
  const [selectedItem, setSelectedItem, ] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedItem) {
      setError("Please select an item to offer");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosInstance.post('/exchanges', {
        itemOffered: {
          itemType: selectedItem.type,
          itemId: selectedItem._id,
        },
        itemRequested: {
          itemType: itemToReceive.type,
          itemId: itemToReceive._id,
        },
        message: message || "",
      });

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exchange request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    setMessage("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Propose an Exchange</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Item to Receive */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item You're Requesting</label>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-gray-900">{itemToReceive.name}</p>
                <p className="text-sm text-gray-600 capitalize">{itemToReceive.type}</p>
              </div>
            </div>

            {/* Item to Offer */}
            <div>
              <label htmlFor="itemSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select Item to Offer *
              </label>
              {userOwnedItems.length === 0 ? (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-700">
                  You don't have any cars or parts listed yet. List some items first.
                </div>
              ) : (
                <select
                  id="itemSelect"
                  value={selectedItem ? selectedItem._id : ""}
                  onChange={(e) => {
                    const item = userOwnedItems.find(i => i._id === e.target.value);
                    setSelectedItem(item);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select an item --</option>
                  {userOwnedItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message to explain your exchange proposal..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading || !selectedItem}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
              >
                {loading ? 'Sending...' : 'Send Proposal'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
