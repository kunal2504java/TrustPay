import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import PaymentStatus from '../components/Dashboard/PaymentStatus';

export default function EscrowDetailPage() {
  const { escrowId } = useParams();
  const navigate = useNavigate();
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

  const handleConfirm = async () => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await apiClient.confirmEscrow(escrowId);
      setMessage({ type: 'success', text: result.message || 'Confirmation recorded' });
      await fetchEscrow(); // Refresh escrow data
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to confirm escrow' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    setActionLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await apiClient.cancelEscrow(escrowId, reason);
      setMessage({ type: 'success', text: result.message || 'Escrow cancelled' });
      await fetchEscrow(); // Refresh escrow data
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to cancel escrow' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (!escrow) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Escrow Details</h1>
              <p className="text-gray-400 font-mono text-sm">{escrow.id}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              escrow.status === 'HELD' ? 'bg-green-500/20 text-green-400' :
              escrow.status === 'RELEASED' ? 'bg-blue-500/20 text-blue-400' :
              escrow.status === 'REFUNDED' ? 'bg-purple-500/20 text-purple-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {escrow.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-gray-400 text-sm">Amount</label>
              <p className="text-white text-2xl font-bold">₹{(escrow.amount / 100).toFixed(2)}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Payee UPI</label>
              <p className="text-white font-mono">{escrow.payee_vpa}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Description</label>
              <p className="text-white">{escrow.description || 'N/A'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Created</label>
              <p className="text-white">{new Date(escrow.created_at).toLocaleString()}</p>
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

          <div className="flex gap-4">
            {escrow.status === 'HELD' && (
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-xl transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Delivery'}
              </button>
            )}
            {(escrow.status === 'INITIATED' || escrow.status === 'HELD') && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl border border-red-500 text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Cancel Escrow'}
              </button>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <PaymentStatus escrowId={escrowId} />
      </div>
    </div>
  );
}
