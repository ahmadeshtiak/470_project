import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

export default function AdminTransactions() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transRes, statsRes] = await Promise.all([
                axiosInstance.get('/transactions/admin/all'),
                axiosInstance.get('/transactions/admin/stats')
            ]);
            setTransactions(transRes.data.data || []);
            setStats(statsRes.data.data || {});
            setError('');
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
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

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.status === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-amber-50 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-amber-50 mb-2">💳 Transaction Management</h1>
                    <p className="text-amber-100/70">Monitor all system transactions and payments</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* Statistics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[#23150f] border border-emerald-500/30 rounded-lg p-4">
                            <p className="text-amber-100/60 text-sm">Total Transactions</p>
                            <p className="text-3xl font-bold text-emerald-300">{stats.overall?.totalTransactions || 0}</p>
                        </div>
                        <div className="bg-[#23150f] border border-amber-500/30 rounded-lg p-4">
                            <p className="text-amber-100/60 text-sm">Total Revenue</p>
                            <p className="text-3xl font-bold text-amber-300">৳{(stats.overall?.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-[#23150f] border border-blue-500/30 rounded-lg p-4">
                            <p className="text-amber-100/60 text-sm">Completed</p>
                            <p className="text-3xl font-bold text-blue-300">{stats.overall?.totalCompleted || 0}</p>
                        </div>
                        <div className="bg-[#23150f] border border-red-500/30 rounded-lg p-4">
                            <p className="text-amber-100/60 text-sm">Refunded</p>
                            <p className="text-3xl font-bold text-red-300">{stats.overall?.totalRefunded || 0}</p>
                        </div>
                    </div>
                )}

                {/* Filters and List */}
                <div className="bg-[#23150f] border border-[#3a241a] rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-amber-50">All Transactions</h2>
                        <button
                            onClick={fetchData}
                            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition"
                        >
                            Refresh
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap mb-6">
                        {['all', 'completed', 'pending', 'refunded', 'failed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filter === status
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-[#2b1a15] border border-[#3a241a] text-amber-100 hover:bg-[#351f19]'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#3a241a]">
                                    <th className="text-left py-3 px-4 text-amber-100/60">Transaction ID</th>
                                    <th className="text-left py-3 px-4 text-amber-100/60">Customer</th>
                                    <th className="text-left py-3 px-4 text-amber-100/60">Amount</th>
                                    <th className="text-left py-3 px-4 text-amber-100/60">Method</th>
                                    <th className="text-left py-3 px-4 text-amber-100/60">Status</th>
                                    <th className="text-left py-3 px-4 text-amber-100/60">Date</th>
                                    <th className="text-left py-3 px-4 text-amber-100/60">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6 text-amber-100/60">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <tr
                                            key={transaction._id}
                                            className="border-b border-[#3a241a] hover:bg-[#2b1a15] transition cursor-pointer"
                                            onClick={() => setSelectedTransaction(transaction)}
                                        >
                                            <td className="py-3 px-4 text-amber-50 font-mono text-xs">
                                                {transaction._id.toString().slice(-6).toUpperCase()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-amber-50">{transaction.buyer.name}</p>
                                                <p className="text-amber-100/60 text-xs">{transaction.buyer.email}</p>
                                            </td>
                                            <td className="py-3 px-4 text-amber-50 font-semibold">
                                                ৳{transaction.amount.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                {transaction.paymentMethod === 'mastercard' ? (
                                                    <span className="text-amber-50">💳 MasterCard</span>
                                                ) : (
                                                    <span className="text-amber-50">🏪 COD</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-amber-100/60">
                                                {new Date(transaction.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTransaction(transaction);
                                                    }}
                                                    className="text-amber-500 hover:text-amber-300 transition"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

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
                                {/* Customer Info */}
                                <div className="bg-[#2b1a15] rounded-lg p-4">
                                    <h3 className="text-amber-50 font-semibold mb-3">👤 Customer Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-amber-100/60">Name</p>
                                            <p className="text-amber-50">{selectedTransaction.buyer.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-amber-100/60">Email</p>
                                            <p className="text-amber-50">{selectedTransaction.buyer.email}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-amber-100/60">Phone</p>
                                            <p className="text-amber-50">{selectedTransaction.buyer.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Info */}
                                <div className="bg-[#2b1a15] rounded-lg p-4">
                                    <h3 className="text-amber-50 font-semibold mb-3">💳 Transaction Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-amber-100/60">Transaction ID</span>
                                            <span className="text-amber-50 font-mono">{selectedTransaction._id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-100/60">Amount</span>
                                            <span className="text-amber-50 font-bold text-lg">৳{selectedTransaction.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-100/60">Method</span>
                                            <span className="text-amber-50">
                                                {selectedTransaction.paymentMethod === 'mastercard' ? '💳 MasterCard' : '🏪 Cash on Delivery'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-100/60">Status</span>
                                            <span className={selectedTransaction.status === 'completed' ? 'text-emerald-300' : selectedTransaction.status === 'failed' ? 'text-red-300' : 'text-yellow-300'}>
                                                {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* MasterCard Details */}
                                {selectedTransaction.paymentMethod === 'mastercard' && (
                                    <div className="bg-[#2b1a15] rounded-lg p-4">
                                        <h3 className="text-amber-50 font-semibold mb-3">💳 MasterCard Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-amber-100/60">Cardholder</span>
                                                <span className="text-amber-50">{selectedTransaction.mastercardDetails.cardholderName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-amber-100/60">Card Number</span>
                                                <span className="text-amber-50 font-mono">•••• {selectedTransaction.mastercardDetails.lastFourDigits}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-amber-100/60">Gateway ID</span>
                                                <span className="text-amber-50 font-mono text-xs">{selectedTransaction.mastercardDetails.transactionId}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

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

                                {/* Order Details */}
                                <div className="bg-[#2b1a15] rounded-lg p-4">
                                    <h3 className="text-amber-50 font-semibold mb-3">📦 Order Details</h3>
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

                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 rounded-lg transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
