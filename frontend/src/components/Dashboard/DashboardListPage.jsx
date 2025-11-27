import { useState, useMemo, useEffect } from 'react';
import apiClient from '../../services/api';
import EscrowCard from './EscrowCard';

export default function DashboardListPage({ setActivePage, setSelectedEscrowId }) {
  const [activeTab, setActiveTab] = useState('active');
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load escrows from API
  useEffect(() => {
    loadEscrows();
  }, []);

  const loadEscrows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.listEscrows();
      console.log('Loaded escrows:', data);
      setEscrows(data);
    } catch (err) {
      console.error('Failed to load escrows:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalEscrows = escrows.length;
    const activeEscrows = escrows.filter(e => e.status === 'HELD' || e.status === 'INITIATED').length;
    const completedEscrows = escrows.filter(e => e.status === 'RELEASED').length;
    const disputedEscrows = escrows.filter(e => e.status === 'DISPUTED').length;
    const totalValue = escrows.reduce((sum, e) => sum + (e.amount / 100), 0); // Convert paise to rupees
    const activeValue = escrows.filter(e => e.status === 'HELD' || e.status === 'INITIATED').reduce((sum, e) => sum + (e.amount / 100), 0);
    
    return {
      totalEscrows,
      activeEscrows,
      completedEscrows,
      disputedEscrows,
      totalValue,
      activeValue
    };
  }, [escrows]);

  const filteredEscrows = escrows.filter(escrow => {
    if (activeTab === 'active') {
      return escrow.status === 'HELD' || escrow.status === 'DISPUTED' || escrow.status === 'INITIATED';
    }
    return escrow.status === 'RELEASED';
  });

  const handleEscrowClick = (id) => {
    setSelectedEscrowId(id);
    setActivePage('detail');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading escrows...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
        Error loading escrows: {error}
        <button onClick={loadEscrows} className="ml-4 underline">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Overview</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={loadEscrows}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            🔄 Refresh
          </button>
          <div className="text-neutral-500 text-sm">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Escrows */}
        <div className="bg-[#242424] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#333333] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[#888888]">Total Escrows</h3>
            <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{metrics.totalEscrows}</div>
          <div className="text-xs text-[#666666]">All time</div>
        </div>

        {/* Active Escrows */}
        <div className="bg-[#242424] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#333333] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[#888888]">Active Escrows</h3>
            <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{metrics.activeEscrows}</div>
          <div className="text-xs text-[#666666]">Currently held</div>
        </div>

        {/* Total Value */}
        <div className="bg-[#242424] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#333333] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[#888888]">Total Value</h3>
            <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-4xl font-bold text-white mb-2">₹{metrics.totalValue.toLocaleString('en-IN')}</div>
          <div className="text-xs text-[#666666]">All escrows</div>
        </div>

        {/* Completed */}
        <div className="bg-[#242424] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#333333] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[#888888]">Completed</h3>
            <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{metrics.completedEscrows}</div>
          <div className="text-xs text-[#666666]">Successfully released</div>
        </div>
      </div>

      {/* Escrows Section */}
      <div className="bg-[#242424] border border-[#2a2a2a] rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Your Escrows</h2>

        <div className="flex space-x-4 mb-6 border-b border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'active'
                ? 'text-white border-b-2 border-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Active ({metrics.activeEscrows + metrics.disputedEscrows})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'completed'
                ? 'text-white border-b-2 border-white'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Completed ({metrics.completedEscrows})
          </button>
        </div>

        {filteredEscrows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEscrows.map(escrow => (
              <EscrowCard 
                key={escrow.id} 
                escrow={{
                  ...escrow,
                  amount: escrow.amount / 100, // Convert paise to rupees for display
                  payee: escrow.payee_vpa,
                  payer: 'You',
                  description: escrow.description || 'No description'
                }} 
                onClick={() => handleEscrowClick(escrow.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#888888]">
            <p>No escrows found in this category.</p>
            <button
              onClick={() => setActivePage('create')}
              className="mt-4 px-6 py-2 bg-white hover:bg-[#e0e0e0] text-black rounded-lg transition-all font-medium"
            >
              Create Your First Escrow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
