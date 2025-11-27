import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [statsData, historyData, distributionData] = await Promise.all([
                apiClient.getAnalyticsStats(),
                apiClient.getAnalyticsHistory(days),
                apiClient.getAnalyticsDistribution()
            ]);

            setStats(statsData);
            setHistory(historyData);
            setDistribution(distributionData);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-white text-xl">Loading analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-400">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Analytics Dashboard</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-sm">Total Volume</p>
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-white">₹{((stats?.total_volume || 0) / 100).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">Across all escrows</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-sm">Active Escrows</p>
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.active_count || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">In progress</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-sm">Completed</p>
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.completed_count || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Successfully released</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-sm">Success Rate</p>
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.success_rate || 0}%</p>
                    <p className="text-xs text-gray-500 mt-1">Completion rate</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Transaction Volume Chart */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Transaction Volume</h2>
                        <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1 text-sm"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    </div>

                    {history.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" tickFormatter={(value) => `₹${value / 100}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e5e7eb' }}
                                    formatter={(value) => [`₹${(value / 100).toFixed(2)}`, 'Volume']}
                                />
                                <Legend />
                                <Bar dataKey="volume" fill="#6366f1" name="Volume" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-gray-500">
                            No transaction data available
                        </div>
                    )}
                </div>

                {/* Status Distribution Chart */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Status Distribution</h2>

                    {distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e5e7eb' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-gray-500">
                            No status data available
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
                        <p className="text-2xl font-bold text-white">{stats?.total_count || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-400 text-sm mb-1">Avg Transaction</p>
                        <p className="text-2xl font-bold text-white">
                            ₹{stats?.total_count > 0 ? ((stats?.total_volume / stats?.total_count) / 100).toFixed(2) : '0'}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-400 text-sm mb-1">Pending</p>
                        <p className="text-2xl font-bold text-yellow-400">{stats?.active_count || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-400 text-sm mb-1">Completed</p>
                        <p className="text-2xl font-bold text-green-400">{stats?.completed_count || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
