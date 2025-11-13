import { useState } from 'react';
import apiClient from '../../services/api';
import { UserIcon, IndianRupeeIcon, FileTextIcon } from '../Icons';

export default function CreateEscrowFormPage({ setActivePage }) {
  const [formData, setFormData] = useState({
    payeeVpa: '',
    amount: '',
    description: '',
    orderId: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      const escrow = await apiClient.createEscrow({
        payee_vpa: formData.payeeVpa,
        amount: Math.round(parseFloat(formData.amount) * 100), // Convert to paise
        description: formData.description,
        order_id: formData.orderId || undefined,
        currency: 'INR',
        condition: 'manual_confirm'
      });

      console.log('Escrow created:', escrow);
      setMessage({ 
        type: 'success', 
        text: `Escrow created successfully! ID: ${escrow.id.substring(0, 8)}...` 
      });
      
      // Reset form
      setFormData({ payeeVpa: '', amount: '', description: '', orderId: '' });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        if (setActivePage) {
          setActivePage('dashboard');
        }
      }, 2000);
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

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Let's get you to the right place</h1>
        <p className="text-xl text-gray-400">We just need a few quick details.</p>
      </div>

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
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="UI design milestone 1"
              className="w-full pl-11 pr-4 py-4 border-0 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none text-base"
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
              className="w-full px-4 py-4 border-0 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-base"
            />
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold text-base hover:shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Creating...' : 'Create Escrow'}
            {!loading && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
