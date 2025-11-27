import { useState } from 'react';
import apiClient from '../../services/api';
import { UserIcon, IndianRupeeIcon, FileTextIcon } from '../Icons';
import PaymentModal from './PaymentModal';
import EscrowWaitingRoom from './EscrowWaitingRoom';

export default function CreateEscrowFormPage({ setActivePage, setSelectedEscrowId }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  const [formData, setFormData] = useState({
    payeeVpa: '',
    amount: '',
    description: '',
    orderId: ''
  });
  const [escrowCode, setEscrowCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [createdEscrow, setCreatedEscrow] = useState(null);
  const [joinedEscrow, setJoinedEscrow] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.payeeVpa || !formData.amount || !formData.description) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setMessage({ type: 'error', text: 'Amount must be greater than 0.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await apiClient.createEscrow({
        payee_vpa: formData.payeeVpa,
        amount: Math.round(parseFloat(formData.amount) * 100), // Convert to paise
        description: formData.description,
        order_id: formData.orderId || undefined,
        currency: 'INR',
        condition: 'manual_confirm'
      });

      console.log('Escrow created:', response);

      // Store escrow data and show waiting room
      setCreatedEscrow(response.escrow);
      setPaymentData({
        escrowId: response.escrow.id,
        paymentOrder: response.payment_order,
        amount: response.escrow.amount
      });
      setShowWaitingRoom(true);

      setMessage({
        type: 'success',
        text: 'Escrow created! Share the code with the other party.'
      });
    } catch (error) {
      console.error('Failed to create escrow:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create escrow. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (razorpayResponse) => {
    console.log('Payment completed:', razorpayResponse);
    setShowPaymentModal(false);
    setMessage({
      type: 'success',
      text: 'Payment successful! Your escrow is now active.'
    });

    // Reset form
    setFormData({ payeeVpa: '', amount: '', description: '', orderId: '' });

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      if (setActivePage) {
        setActivePage('dashboard');
      }
    }, 2000);
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setMessage({
      type: 'info',
      text: 'Payment cancelled. You can complete the payment later from your dashboard.'
    });
  };

  const handleParticipantJoined = () => {
    // Close waiting room and show payment modal
    setShowWaitingRoom(false);
    setShowPaymentModal(true);
    setMessage({
      type: 'success',
      text: 'Participant joined! Please complete the payment to activate the escrow.'
    });
  };

  const handleWaitingRoomClose = () => {
    setShowWaitingRoom(false);
    setMessage({
      type: 'info',
      text: 'Escrow created but waiting for participant. You can share the code later from your dashboard.'
    });
    // Redirect to dashboard
    setTimeout(() => {
      if (setActivePage) {
        setActivePage('dashboard');
      }
    }, 2000);
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();

    if (!escrowCode || escrowCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-character escrow code.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await apiClient.joinEscrowByCode(escrowCode.toUpperCase());
      console.log('Joined escrow:', response);

      setJoinedEscrow(response);
      setMessage({
        type: 'success',
        text: `Successfully joined escrow "${response.escrow_name}" (${response.escrow_code})!`
      });

      // Navigate to escrow detail page to show the room
      if (setSelectedEscrowId) {
        setSelectedEscrowId(response.id);
      }

      setTimeout(() => {
        if (setActivePage) {
          setActivePage('detail');
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to join escrow:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to join escrow. Please check the code and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="mb-12">
        <h1 className="text-4xl text-white mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Let's get you to the right place</h1>
        <p className="text-xl text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>We just need a few quick details.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-neutral-800">
        <button
          type="button"
          onClick={() => {
            setActiveTab('create');
            setMessage({ type: '', text: '' });
          }}
          className={`px-6 py-3 text-lg font-semibold transition-all ${activeTab === 'create'
              ? 'text-white border-b-2 border-white'
              : 'text-neutral-500 hover:text-neutral-300'
            }`}
        >
          Create New Escrow
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('join');
            setMessage({ type: '', text: '' });
          }}
          className={`px-6 py-3 text-lg font-semibold transition-all ${activeTab === 'join'
              ? 'text-white border-b-2 border-white'
              : 'text-neutral-500 hover:text-neutral-300'
            }`}
        >
          Join by Code
        </button>
      </div>

      {/* Create Escrow Form */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-[180px_1fr] gap-6 items-start">
            <label className="text-lg font-semibold text-white pt-3">
              Payee's UPI ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.payeeVpa}
                onChange={(e) => setFormData({ ...formData, payeeVpa: e.target.value })}
                placeholder="freelancer@okbank"
                className="w-full pl-11 pr-4 py-4 border border-neutral-800 rounded-lg bg-black text-white placeholder-neutral-600 focus:border-neutral-600 outline-none transition text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-6 items-start">
            <label className="text-lg font-semibold text-white pt-3">
              Amount (INR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <IndianRupeeIcon className="w-4 h-4" />
              </div>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="5,000"
                className="w-full pl-11 pr-4 py-4 border border-neutral-800 rounded-lg bg-black text-white placeholder-neutral-600 focus:border-neutral-600 outline-none transition text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-6 items-start">
            <label className="text-lg font-semibold text-white pt-3">
              Purpose
            </label>
            <div className="relative">
              <div className="absolute top-4 left-0 pl-4 pointer-events-none text-gray-500">
                <FileTextIcon className="w-4 h-4" />
              </div>
              <textarea
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="UI design milestone 1"
                className="w-full pl-11 pr-4 py-4 border border-neutral-800 rounded-lg bg-black text-white placeholder-neutral-600 focus:border-neutral-600 outline-none transition resize-none text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-6 items-start">
            <label className="text-lg font-semibold text-white pt-3">
              Order ID
              <span className="text-sm text-gray-500 font-normal block mt-1">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                placeholder="ORD-12345"
                className="w-full px-4 py-4 border border-neutral-800 rounded-lg bg-black text-white placeholder-neutral-600 focus:border-neutral-600 outline-none transition text-base"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-white hover:bg-neutral-200 text-black px-12 py-4 rounded-lg font-semibold text-base transition-all transform hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Creating...' : 'Create Escrow'}
              {!loading && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

        </form>
      )}

      {/* Join by Code Form */}
      {activeTab === 'join' && (
        <form onSubmit={handleJoinByCode} className="space-y-8">
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-8">
            <div className="mb-6">
              <h3 className="text-2xl text-white mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Join an Existing Escrow
              </h3>
              <p className="text-neutral-400">
                Enter the 6-character code shared by the escrow creator
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-lg font-semibold text-white block mb-3">
                  Escrow Code
                </label>
                <input
                  type="text"
                  value={escrowCode}
                  onChange={(e) => setEscrowCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-6 py-4 border border-neutral-700 rounded-lg bg-black text-white text-2xl font-mono tracking-widest placeholder-neutral-600 focus:border-neutral-600 outline-none transition text-center uppercase"
                />
                <p className="text-sm text-neutral-600 mt-2">
                  Example: 67A9G2, XYZ789
                </p>
              </div>

              {joinedEscrow && (
                <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Escrow Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Name:</span>
                      <span className="text-white font-semibold">{joinedEscrow.escrow_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Amount:</span>
                      <span className="text-white font-semibold">₹{(joinedEscrow.amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Status:</span>
                      <span className="text-white font-semibold">{joinedEscrow.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Description:</span>
                      <span className="text-neutral-300">{joinedEscrow.description}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading || !escrowCode || escrowCode.length !== 6}
              className="bg-white hover:bg-neutral-200 text-black px-12 py-4 rounded-lg font-semibold text-base transition-all transform hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Joining...' : 'Join Escrow'}
              {!loading && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Message Display */}
      {message.text && (
        <div
          className={`mt-6 p-4 rounded-lg border ${message.type === 'success'
              ? 'bg-neutral-900 text-white border-neutral-700'
              : message.type === 'info'
                ? 'bg-neutral-900 text-neutral-300 border-neutral-700'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Waiting Room Modal */}
      {showWaitingRoom && createdEscrow && (
        <EscrowWaitingRoom
          escrow={createdEscrow}
          onParticipantJoined={handleParticipantJoined}
          onClose={handleWaitingRoomClose}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentData && (
        <PaymentModal
          escrowId={paymentData.escrowId}
          paymentOrder={paymentData.paymentOrder}
          amount={paymentData.amount}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
}
