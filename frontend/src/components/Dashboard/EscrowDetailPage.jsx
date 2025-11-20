import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '../Icons';
import PaymentStatus from './PaymentStatus';

export default function EscrowDetailPage({ escrowId, setActivePage }) {
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEscrow();
  }, [escrowId]);

  const fetchEscrow = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEscrow(escrowId);
      setEscrow(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch escrow:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-xl">Loading escrow details...</div>
      </div>
    );
  }

  if (error || !escrow) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Escrow not found'}</p>
        <button
          onClick={() => setActivePage('dashboard')}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleConfirmRelease = async () => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await apiClient.confirmEscrow(escrowId);
      setMessage({ type: 'success', text: result.message || 'Confirmation recorded successfully!' });
      await fetchEscrow(); // Refresh escrow data
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to confirm escrow' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRaiseDispute = async () => {
    const reason = prompt('Please provide a reason for the dispute:');
    if (!reason) return;

    setActionLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await apiClient.raiseDispute(escrowId, reason);
      setMessage({ type: 'success', text: result.message || 'Dispute raised successfully!' });
      await fetchEscrow(); // Refresh escrow data
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to raise dispute' });
    } finally {
      setActionLoading(false);
    }
  };

  const statusColors = {
    HELD: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    RELEASED: 'bg-green-500/20 text-green-300 border-green-500/30',
    DISPUTED: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setActivePage('dashboard')}
        className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 font-semibold mb-6"
      >
        <ArrowLeftIcon />
        <span>Back to Dashboard</span>
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">Escrow Details</h1>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{escrow.description}</h2>
            <p className="text-gray-400 text-sm">ID: {escrow.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[escrow.status]}`}>
            {escrow.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Payee UPI</p>
            <p className="font-semibold text-white font-mono">{escrow.payee_vpa}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Description</p>
            <p className="font-semibold text-white">{escrow.description || 'No description'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Amount</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ₹{(escrow.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Created</p>
            <p className="font-semibold text-white">
              {new Date(escrow.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg border mb-6 ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        {escrow.status === 'HELD' && (
          <div className="flex space-x-4 pt-6 border-t border-white/10">
            <button
              onClick={handleConfirmRelease}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon />
              <span>{actionLoading ? 'Processing...' : 'Confirm Release'}</span>
            </button>
            <button
              onClick={handleRaiseDispute}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center space-x-2 border-2 border-red-500 text-red-400 hover:bg-red-500/10 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircleIcon />
              <span>{actionLoading ? 'Processing...' : 'Raise Dispute'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Payment Status */}
      <PaymentStatus escrowId={escrowId} />
    </div>
  );
}
