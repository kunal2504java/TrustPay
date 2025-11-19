import { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function PaymentStatus({ escrowId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentStatus();
    // Poll every 5 seconds for status updates
    const interval = setInterval(fetchPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [escrowId]);

  const fetchPaymentStatus = async () => {
    try {
      const data = await apiClient.getPaymentStatus(escrowId);
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch payment status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (!status) return null;

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'INITIATED':
        return 'text-yellow-400';
      case 'HELD':
        return 'text-green-400';
      case 'RELEASED':
        return 'text-blue-400';
      case 'REFUNDED':
        return 'text-purple-400';
      case 'DISPUTED':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Payment Status</h3>
        <span className={`font-bold ${getStatusColor(status.status)}`}>
          {status.status}
        </span>
      </div>

      {/* Payment Info */}
      {status.payment && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Payment</h4>
          <div className="space-y-2 text-sm">
            {status.payment.razorpay_order_id && (
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID:</span>
                <span className="text-white font-mono text-xs">
                  {status.payment.razorpay_order_id}
                </span>
              </div>
            )}
            {status.payment.razorpay_payment_id && (
              <div className="flex justify-between">
                <span className="text-gray-400">Payment ID:</span>
                <span className="text-white font-mono text-xs">
                  {status.payment.razorpay_payment_id}
                </span>
              </div>
            )}
            {status.payment.completed_at && (
              <div className="flex justify-between">
                <span className="text-gray-400">Completed:</span>
                <span className="text-white">
                  {new Date(status.payment.completed_at).toLocaleString()}
                </span>
              </div>
            )}
            {status.payment.error && (
              <div className="bg-red-500/20 rounded p-2 mt-2">
                <p className="text-red-300 text-xs">{status.payment.error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payout Info */}
      {status.payout && status.payout.razorpay_payout_id && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Payout</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Payout ID:</span>
              <span className="text-white font-mono text-xs">
                {status.payout.razorpay_payout_id}
              </span>
            </div>
            {status.payout.completed_at && (
              <div className="flex justify-between">
                <span className="text-gray-400">Completed:</span>
                <span className="text-white">
                  {new Date(status.payout.completed_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refund Info */}
      {status.refund && status.refund.razorpay_refund_id && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Refund</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Refund ID:</span>
              <span className="text-white font-mono text-xs">
                {status.refund.razorpay_refund_id}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
