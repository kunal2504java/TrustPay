import { useState, useEffect } from 'react';

export default function PaymentModal({ escrowId, paymentOrder, amount, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      console.error('Razorpay script not loaded');
      setError('Payment system not available. Please refresh the page.');
    }
  }, []);

  const handlePayment = () => {
    if (!window.Razorpay) {
      setError('Payment system not available');
      return;
    }

    if (!paymentOrder || paymentOrder.error) {
      setError(paymentOrder?.message || 'Payment order not available');
      return;
    }

    setLoading(true);
    setError(null);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key', // Replace with your key
      amount: paymentOrder.amount,
      currency: paymentOrder.currency || 'INR',
      name: 'TrustPay',
      description: `Escrow Payment - ${escrowId.substring(0, 8)}`,
      order_id: paymentOrder.id,
      handler: function (response) {
        console.log('Payment successful:', response);
        setLoading(false);
        if (onSuccess) {
          onSuccess(response);
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#6366f1'
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
          console.log('Payment cancelled by user');
        }
      }
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(response.error.description || 'Payment failed');
        setLoading(false);
      });
      razorpay.open();
    } catch (err) {
      console.error('Error opening Razorpay:', err);
      setError('Failed to open payment window');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">Complete Payment</h2>
        
        <div className="mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Escrow ID</span>
              <span className="text-white font-mono text-sm">{escrowId.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount</span>
              <span className="text-white font-bold text-xl">₹{(amount / 100).toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <p className="text-gray-400 text-sm mb-4">
            Click the button below to complete your payment securely through Razorpay.
            Your funds will be held in escrow until both parties confirm.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !paymentOrder || paymentOrder.error}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:shadow-indigo-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
