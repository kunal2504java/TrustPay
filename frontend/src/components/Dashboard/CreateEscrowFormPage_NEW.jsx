import { useState } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../services/api';
import { UserIcon, IndianRupeeIcon, FileTextIcon } from '../Icons';
import PaymentModal from './PaymentModal';

export default function CreateEscrowFormPage({ setActivePage }) {
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
  const [paymentData, setPaymentData] = useState(null);
  const [joinedEscrow, setJoinedEscrow] = useState(null);

  const handleCreateSubmit = async (e) => {
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
      
      // Store payment data and show payment modal
      setPaymentData({
        escrowId: response.escrow.id,
        paymentOrder: response.payment_order,
        amount: response.escrow.amount,
        escrowCode: response.escrow.escrow_code,
        escrowName: response.escrow.escrow_name
      });
      setShowPaymentModal(true);
      
      setMessage({ 
        type: 'success', 
        text: `Escrow "${response.escrow.escrow_name}" created! Code: ${response.escrow.escrow_code}` 
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

  const handleJoinSubmit = async (e) => {
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
        text: `Successfully joined escrow "${response.escrow_name}"!` 
      });
      
      // Redirect to escrow detail page after 2 seconds
      setTimeout(() => {
        if (setActivePage) {
          setActivePage('detail');
        }
      }, 2000);
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

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="mb-12">
        <h1 className="text-4xl text-white mb-4" style={{ fontFamily: 'Clash Grotesk', fontWeight: 500 }}>
          Let's get you to the right place
        </h1>
        <p className="text-xl text-gray-400" style={{ fontFamily: 'Clash Grotesk', fontWeight: 200 }}>
          Create a new escrow or join an existing one.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'create'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Create New Escrow
        </button>
        <button
          onClick={() => setActiveTab('join')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'join'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Join by Code
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
            message.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Create Escrow Form */}
      {activeTab === 'create' && (
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleCreateSubmit}
          className="space-y-8"
        >
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
                className="w-full pl-11 pr-4 py-4 border-0 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-base"
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
                className="w-full pl-11 pr-4 py-4 border-0 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-base"
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Website development project"
                rows="4"
                className="w-full pl-11 pr-4 py-4 border-0 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-base resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Escrow'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Join by Code Form */}
      {activeTab === 'join' && (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleJoinSubmit}
          className="space-y-8"
        >
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">How it works</h3>
            <p className="text-gray-400">
              Enter the 6-character escrow code shared by the other party to join their escrow transaction.
              Both parties must have the same code to create an escrow together.
            </p>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-6 items-start">
            <label className="text-lg font-semibold text-white pt-3">
              Escrow Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={escrowCode}
                onChange={(e) => setEscrowCode(e.target.value.toUpperCase())}
                placeholder="67A9G2"
                maxLength={6}
                className="w-full px-4 py-4 border-0 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-2xl font-mono tracking-widest text-center uppercase"
              />
              <p className="text-sm text-gray-500 mt-2">Enter the 6-character code (letters and numbers)</p>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading || escrowCode.length !== 6}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Escrow'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentData && (
        <PaymentModal
          escrowId={paymentData.escrowId}
          orderId={paymentData.paymentOrder.id}
          amount={paymentData.amount}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
          escrowCode={paymentData.escrowCode}
          escrowName={paymentData.escrowName}
        />
      )}
    </div>
  );
}
