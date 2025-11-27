import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function AuditRecordsPage() {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, blockchain, payment

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const response = await api.get('/escrows/');
      setEscrows(response.data);
    } catch (error) {
      console.error('Failed to fetch escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'INITIATED': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'HELD': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'RELEASED': 'bg-green-500/20 text-green-300 border-green-500/30',
      'REFUNDED': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'DISPUTED': 'bg-red-500/20 text-red-300 border-red-500/30',
      'COMPLETED': 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const filteredEscrows = escrows.filter(escrow => {
    if (filter === 'blockchain') return escrow.blockchain_tx_hash;
    if (filter === 'payment') return escrow.razorpay_payment_id;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading audit records...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Audit Records</h1>
        <p className="text-gray-400">Complete transaction history and blockchain logs</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'all'
              ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          All Records ({escrows.length})
        </button>
        <button
          onClick={() => setFilter('blockchain')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'blockchain'
              ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Blockchain Logs ({escrows.filter(e => e.blockchain_tx_hash).length})
        </button>
        <button
          onClick={() => setFilter('payment')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'payment'
              ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Payment Logs ({escrows.filter(e => e.razorpay_payment_id).length})
        </button>
      </div>

      {/* Audit Records Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Escrow ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Payee UPI</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Blockchain TX</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Payment ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEscrows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    No audit records found
                  </td>
                </tr>
              ) : (
                filteredEscrows.map((escrow, index) => (
                  <motion.tr
                    key={escrow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="text-white font-mono text-sm">
                        {escrow.id.slice(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500">{escrow.order_id || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{formatAmount(escrow.amount)}</div>
                      <div className="text-xs text-gray-500">{escrow.currency}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(escrow.status)}`}>
                        {escrow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white text-sm">{escrow.payee_vpa}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white text-sm">{formatDate(escrow.created_at)}</div>
                      {escrow.payment_completed_at && (
                        <div className="text-xs text-gray-500">
                          Paid: {formatDate(escrow.payment_completed_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {escrow.blockchain_tx_hash ? (
                        <a
                          href={`https://amoy.polygonscan.com/tx/${escrow.blockchain_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm font-mono flex items-center gap-1"
                        >
                          {escrow.blockchain_tx_hash.slice(0, 6)}...
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">Not logged</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {escrow.razorpay_payment_id ? (
                        <div className="text-white text-sm font-mono">
                          {escrow.razorpay_payment_id.slice(0, 10)}...
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Pending</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="text-gray-400 text-sm mb-2">Total Escrows</div>
          <div className="text-3xl font-bold text-white">{escrows.length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="text-gray-400 text-sm mb-2">Blockchain Logged</div>
          <div className="text-3xl font-bold text-blue-400">
            {escrows.filter(e => e.blockchain_tx_hash).length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="text-gray-400 text-sm mb-2">Completed Payments</div>
          <div className="text-3xl font-bold text-green-400">
            {escrows.filter(e => e.razorpay_payment_id).length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="text-gray-400 text-sm mb-2">Total Volume</div>
          <div className="text-3xl font-bold text-white">
            {formatAmount(escrows.reduce((sum, e) => sum + e.amount, 0))}
          </div>
        </div>
      </div>
    </div>
  );
}
