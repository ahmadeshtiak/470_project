import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

export default function TransactionHistory() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchTransactions();
    }, [user, navigate]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/transactions/my');
            setTransactions(res.data.data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err.response?.data?.message || 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async (transactionId) => {
        const reason = window.prompt('Please enter refund reason:');
        if (!reason) return;

        try {
            const res = await axiosInstance.post(`/transactions/${transactionId}/refund`, { reason });
            if (res.data.success) {
                alert('Refund processed successfully!');
                fetchTransactions();
                setSelectedTransaction(null);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to process refund');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'failed':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'refunded':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            default:
                return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return '✓';
            case 'pending':
                return '⏳';
            case 'failed':
                return '✕';
            case 'refunded':
                return '↩';
            default:
                return '?';
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.status === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-amber-50 text-lg">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-amber-50 mb-2">💳 Transaction History</h1>
                    <p className="text-amber-100/70">Track all your payments and transactions</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {filteredTransactions.length === 0 ? (
                    <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-12 text-center">
                        <p className="text-amber-100/70 text-lg">No transactions found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'completed', 'pending', 'refunded', 'failed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        filter === status
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-[#23150f] border border-[#3a241a] text-amber-100 hover:bg-[#2b1a15]'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Transactions List */}
                        <div className="space-y-3">
                            {filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction._id}
                                    onClick={() => setSelectedTransaction(transaction)}
                                    className="bg-[#23150f] border border-[#3a241a] rounded-xl p-4 cursor-pointer hover:border-amber-500 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-full border ${getStatusColor(transaction.status)}`}>
                                                    {getStatusIcon(transaction.status)}
                                                </span>
                                                <div>
                                                    <p className="text-amber-50 font-semibold">
                                                        Order #{transaction.orderId._id.toString().slice(-6).toUpperCase()}
                                                    </p>
                                                    <p className="text-amber-100/60 text-sm">
                                                        {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-amber-50">
                                                ৳{transaction.amount.toLocaleString()}
                                            </p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {transaction.paymentMethod === 'mastercard' && (
                                        <div className="mt-2 pt-2 border-t border-[#3a241a] text-amber-100/60 text-sm">
                                            💳 MasterCard •••• {transaction.mastercardDetails.lastFourDigits}
                                        </div>
                                    )}
                                    {transaction.paymentMethod === 'cod' && (
                                        <div className="mt-2 pt-2 border-t border-[#3a241a] text-amber-100/60 text-sm">
                                            🏪 Cash on Delivery
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transaction Details Modal */}
                {selectedTransaction && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                        <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-amber-50">Transaction Details</h2>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="text-amber-100 hover:text-amber-50"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Basic Info */}
                                <div className="bg-[#2b1a15] rounded-lg p-4">
                                    <h3 className="text-amber-50 font-semibold mb-3">📋 Basic Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-amber-100/60">Order ID</p>
                                            <p className="text-amber-50 font-mono">#{selectedTransaction.orderId._id.toString().slice(-6).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-amber-100/60">Transaction ID</p>
                                            <p className="text-amber-50 font-mono text-xs">{selectedTransaction._id}</p>
                                        </div>
                                        <div>
                                            <p className="text-amber-100/60">Amount</p>
                                            <p className="text-amber-50 font-bold text-lg">৳{selectedTransaction.amount.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-amber-100/60">Status</p>
                                            <p className={`font-semibold ${selectedTransaction.status === 'completed' ? 'text-emerald-300' : selectedTransaction.status === 'failed' ? 'text-red-300' : 'text-yellow-300'}`}>
                                                {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="bg-[#2b1a15] rounded-lg p-4">
                                    <h3 className="text-amber-50 font-semibold mb-3">💳 Payment Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-amber-100/60">Payment Method</span>
                                            <span className="text-amber-50">
                                                {selectedTransaction.paymentMethod === 'mastercard' ? '💳 MasterCard' : '🏪 Cash on Delivery'}
                                            </span>
                                        </div>
                                        {selectedTransaction.paymentMethod === 'mastercard' && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-amber-100/60">Card Holder</span>
                                                    <span className="text-amber-50">{selectedTransaction.mastercardDetails.cardholderName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-amber-100/60">Card Number</span>
                                                    <span className="text-amber-50 font-mono">•••• {selectedTransaction.mastercardDetails.lastFourDigits}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-amber-100/60">Transaction ID</span>
                                                    <span className="text-amber-50 font-mono text-xs">{selectedTransaction.mastercardDetails.transactionId}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="bg-[#2b1a15] rounded-lg p-4">
                                    <h3 className="text-amber-50 font-semibold mb-3">📅 Timeline</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-amber-100/60">Created</span>
                                            <span className="text-amber-50">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                                        </div>
                                        {selectedTransaction.processingTime && (
                                            <div className="flex justify-between">
                                                <span className="text-amber-100/60">Processed</span>
                                                <span className="text-amber-50">{new Date(selectedTransaction.processingTime).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {selectedTransaction.refundDate && (
                                            <div className="flex justify-between">
                                                <span className="text-amber-100/60">Refunded</span>
                                                <span className="text-amber-50">{new Date(selectedTransaction.refundDate).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-[#2b1a15] rounded-lg p-4">
                                    <h3 className="text-amber-50 font-semibold mb-3">📦 Order Items</h3>
                                    <div className="space-y-2 text-sm">
                                        {selectedTransaction.orderId.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between border-b border-[#3a241a] pb-2 last:border-0">
                                                <span className="text-amber-100/60">{item.name}</span>
                                                <span className="text-amber-50">
                                                    x{item.quantity} = ৳{(item.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {selectedTransaction.status === 'completed' && (
                                        <button
                                            onClick={() => handleRefund(selectedTransaction._id)}
                                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-lg transition"
                                        >
                                            Request Refund
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedTransaction(null)}
                                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 rounded-lg transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
